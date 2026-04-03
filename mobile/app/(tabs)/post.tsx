import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../lib/colors';
import { supabase } from '../../lib/supabase';
import { invokeMobileApi } from '../../lib/mobile-api';

const PROPERTY_TYPE_OPTIONS = [
  { label: 'Căn hộ', value: 'chung-cu', icon: 'business-outline' },
  { label: 'Nhà phố', value: 'nha-pho', icon: 'home-outline' },
  { label: 'Biệt thự', value: 'biet-thu', icon: 'leaf-outline' },
  { label: 'Đất nền', value: 'dat-nen', icon: 'map-outline' },
];

const AMENITY_OPTIONS = [
  { label: 'Hồ bơi', icon: 'water-outline' },
  { label: 'Gara ô tô', icon: 'car-outline' },
  { label: 'Sân vườn', icon: 'leaf-outline' },
  { label: 'Bảo vệ 24/7', icon: 'shield-checkmark-outline' },
  { label: 'Phòng gym', icon: 'barbell-outline' },
  { label: 'Ban công', icon: 'sunny-outline' },
];

export default function PostScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 3;
  const progress = currentStep / totalSteps;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const toggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label)
        ? prev.filter((a) => a !== label)
        : [...prev, label]
    );
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      // Basic validation per step
      if (currentStep === 1) {
        if (!selectedPropertyType || !title || !price || !area) {
          Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin cơ bản');
          return;
        }
      }
      if (currentStep === 2) {
        if (!description.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập mô tả chi tiết');
          return;
        }
      }
      setCurrentStep(currentStep + 1);
    } else {
      submitPost();
    }
  };

  const submitPost = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để đăng tin', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => router.push('/auth') },
      ]);
      return;
    }

    if (!address) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return;
    }

    setSubmitting(true);
    try {
      const typeOption = PROPERTY_TYPE_OPTIONS.find(t => t.label === selectedPropertyType);
      
      await invokeMobileApi('create_listing', {
        title,
        description: description.trim(),
        price: parseFloat(price) * 1000000000,
        area: parseFloat(area),
        address,
        type: typeOption?.value || 'nha-pho',
        features: selectedAmenities,
      });

      Alert.alert('Thành công', 'Tin của bạn đã được đăng và đang chờ duyệt!', [
        { text: 'OK', onPress: () => {
          // Reset form
          setCurrentStep(1);
          setTitle('');
          setPrice('');
          setArea('');
          setDescription('');
          setAddress('');
          setSelectedAmenities([]);
          setSelectedPropertyType(null);
          router.push('/profile');
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra khi đăng tin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {currentStep > 1 ? (
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerIconBtn} />
          )}
          <Text style={styles.logo}>TitanHome</Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              Step {currentStep} of {totalSteps}
            </Text>
            <Text style={styles.progressSubtitle}>
              {currentStep === 1
                ? 'Thông tin cơ bản'
                : currentStep === 2
                ? 'Hình ảnh & Chi tiết'
                : 'Vị trí'}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>

        {/* Step 1: Basic Info + Property Type */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Thông tin cơ bản</Text>
            <Text style={styles.stepSubtitle}>
              Hãy bắt đầu với thông tin cơ bản về bất động sản của bạn.
            </Text>

            {/* Property Type Chips */}
            <Text style={styles.fieldLabel}>Loại hình bất động sản</Text>
            <View style={styles.typeChipsWrap}>
              {PROPERTY_TYPE_OPTIONS.map((type) => {
                const isActive = selectedPropertyType === type.label;
                return (
                  <TouchableOpacity
                    key={type.label}
                    style={[styles.typeChip, isActive && styles.typeChipActive]}
                    onPress={() => setSelectedPropertyType(type.label)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={18}
                      color={isActive ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        isActive && styles.typeChipTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Tiêu đề tin đăng</Text>
              <TextInput
                style={styles.textInput}
                placeholder="VD: Biệt thự sân vườn Quận 2"
                placeholderTextColor={COLORS.outline}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Price + Area row */}
            <View style={styles.fieldRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Giá (Tỷ VND)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="12.5"
                  placeholderTextColor={COLORS.outline}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Diện tích (m²)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="450"
                  placeholderTextColor={COLORS.outline}
                  keyboardType="numeric"
                  value={area}
                  onChangeText={setArea}
                />
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Photos & Details */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Hình ảnh & Chi tiết</Text>
            <Text style={styles.stepSubtitle}>
              Hình ảnh chất lượng cao thu hút gấp 3 lần người mua tiềm năng.
            </Text>

            {/* Upload Area */}
            <TouchableOpacity style={styles.uploadArea}>
              <View style={styles.uploadIconWrap}>
                <Ionicons name="camera-outline" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.uploadTitle}>Tải ảnh lên</Text>
              <Text style={styles.uploadSubtitle}>
                Hỗ trợ JPG, PNG tối đa 10MB
              </Text>
            </TouchableOpacity>

            {/* Photo preview grid placeholder */}
            <View style={styles.photoGrid}>
              <TouchableOpacity style={styles.addPhotoBtn}>
                <Ionicons name="add" size={32} color={COLORS.outline} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addPhotoBtn}>
                <Ionicons name="add" size={32} color={COLORS.outline} />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mô tả chi tiết</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Mô tả phong cách sống, kiến trúc, và khu vực lân cận..."
                placeholderTextColor={COLORS.outline}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Amenities */}
            <Text style={styles.fieldLabel}>Tiện ích</Text>
            <View style={styles.amenitiesWrap}>
              {AMENITY_OPTIONS.map((amenity) => {
                const isActive = selectedAmenities.includes(amenity.label);
                return (
                  <TouchableOpacity
                    key={amenity.label}
                    style={[
                      styles.amenityChip,
                      isActive && styles.amenityChipActive,
                    ]}
                    onPress={() => toggleAmenity(amenity.label)}
                  >
                    <Ionicons
                      name={amenity.icon as any}
                      size={16}
                      color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.amenityChipText,
                        isActive && styles.amenityChipTextActive,
                      ]}
                    >
                      {amenity.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Vị trí bất động sản</Text>
            <Text style={styles.stepSubtitle}>
              Ghim vị trí bất động sản trên bản đồ.
            </Text>

            {/* Address input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Số nhà, đường, phường, quận..."
                placeholderTextColor={COLORS.outline}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            {/* Map placeholder */}
            <View style={styles.mapPlaceholder}>
              <Ionicons name="location" size={40} color={COLORS.primary} />
              <Text style={styles.mapText}>
                Nhấn để chọn vị trí trên bản đồ
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 1 && { flex: 1 },
          ]}
          onPress={handleNext}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === totalSteps ? 'Đăng tin ngay' : 'Tiếp tục'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    padding: 8,
    width: 40,
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
  },
  stepContent: {
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  typeChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  typeChipTextActive: {
    color: COLORS.onPrimary,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(195, 198, 209, 0.4)',
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(195, 198, 209, 0.4)',
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  amenityChipActive: {
    backgroundColor: COLORS.secondaryContainer,
    borderColor: COLORS.secondaryContainer,
  },
  amenityChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  amenityChipTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(195, 198, 209, 0.2)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    flex: 0.3,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  nextButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
