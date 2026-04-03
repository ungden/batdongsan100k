import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Property } from '../../lib/types';
import { getPropertyById } from '../../lib/data';
import { mapSupabaseListingToProperty } from '../(tabs)/index';
import { COLORS } from '../../lib/colors';
import { isPropertySaved, toggleSavedProperty } from '../../lib/saved-properties';
import { invokeMobileApi } from '../../lib/mobile-api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AMENITY_ICONS: Record<string, string> = {
  'hồ bơi': 'water-outline',
  'ho boi': 'water-outline',
  'phòng gym': 'barbell-outline',
  'phong gym': 'barbell-outline',
  'bảo vệ 24/7': 'shield-checkmark-outline',
  'bao ve 24/7': 'shield-checkmark-outline',
  'bãi đỗ xe': 'car-outline',
  'bai do xe': 'car-outline',
  'thang máy': 'arrow-up-outline',
  'thang may': 'arrow-up-outline',
  'ban công': 'sunny-outline',
  'ban cong': 'sunny-outline',
  'sân vườn': 'leaf-outline',
  'san vuon': 'leaf-outline',
  'gara ô tô': 'car-sport-outline',
  'gara o to': 'car-sport-outline',
  'điều hòa': 'snow-outline',
  'dieu hoa': 'snow-outline',
  'nội thất cao cấp': 'diamond-outline',
  'noi that cao cap': 'diamond-outline',
  'view sông': 'boat-outline',
  'view song': 'boat-outline',
  'gần trường học': 'school-outline',
  'gan truong hoc': 'school-outline',
};

function getAmenityIcon(feature: string): string {
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (
      feature.toLowerCase().replace(/[^a-z0-9]/g, '') ===
      key.toLowerCase().replace(/[^a-z0-9]/g, '')
    ) {
      return icon;
    }
  }
  return 'checkmark-circle-outline';
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      if (!id) return;
      
      // If it's a mock ID (e.g. '1', '2'), use mock data
      if (!id.includes('-')) {
        const mockData = getPropertyById(id);
        if (mockData) {
          setProperty(mockData);
        }
        setIsSaved(await isPropertySaved(id));
        setLoading(false);
        return;
      }

      // Otherwise fetch from mobile api
      try {
        const data = await invokeMobileApi<any>('get_listing_detail', { listingId: id });
        if (data) {
          setProperty(mapSupabaseListingToProperty(data));
        }
        try {
          const ids = await invokeMobileApi<string[]>('get_favorites');
          setIsSaved(ids.includes(id));
        } catch {
          setIsSaved(await isPropertySaved(id));
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.notFoundText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Không tìm thấy bất động sản</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.goBackText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${property.agent.phone}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${property.agent.phone}`);
  };

  const handleToggleSave = async () => {
    try {
      const result = await invokeMobileApi<{ saved: boolean }>('toggle_favorite', { listingId: property.id });
      setIsSaved(result.saved);
    } catch {
      const next = await toggleSavedProperty(property.id);
      setIsSaved(next);
    }
  };

  const pricePerSqm = property.area > 0 ? (property.price * 1000) / property.area : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {property.images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={styles.carouselImage}
              />
            ))}
          </ScrollView>

          {/* Top Navigation */}
          <SafeAreaView style={styles.topNav} edges={['top']}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.topNavTitle}>TitanHome</Text>
            <View style={styles.topNavRight}>
              <TouchableOpacity style={styles.navButton}>
                <Ionicons name="share-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={handleToggleSave}>
                <Ionicons name={isSaved ? "heart" : "heart-outline"} size={22} color={isSaved ? COLORS.error : COLORS.primary} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>MỚI RA MẮT</Text>
          </View>

          {/* Photo Counter */}
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>
              {activeImageIndex + 1} / {property.images.length} ảnh
            </Text>
          </View>
        </View>

        {/* Primary Info Section */}
        <View style={styles.primaryInfo}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={COLORS.secondary} />
            <Text style={styles.locationText}>{property.address}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              {property.priceFormatted}{' '}
              {property.priceUnit === 'tỷ' ? 'tỷ VND' : property.priceUnit}
            </Text>
            {property.priceUnit === 'tỷ' && pricePerSqm > 0 && (
              <Text style={styles.pricePerSqm}>
                ~ {pricePerSqm.toFixed(1)} Tr/m²
              </Text>
            )}
          </View>
        </View>

        {/* Specs Grid - 2x2 */}
        <View style={styles.specsSection}>
          <View style={styles.specsGrid}>
            {property.area > 0 && (
              <View style={styles.specCard}>
                <Text style={styles.specLabel}>Diện tích</Text>
                <View style={styles.specValueRow}>
                  <Ionicons name="resize-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.specValue}>{property.area} m²</Text>
                </View>
              </View>
            )}
            {property.direction && (
              <View style={styles.specCard}>
                <Text style={styles.specLabel}>Hướng</Text>
                <View style={styles.specValueRow}>
                  <Ionicons name="compass-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.specValue}>{property.direction}</Text>
                </View>
              </View>
            )}
            {property.bedrooms > 0 && (
              <View style={styles.specCard}>
                <Text style={styles.specLabel}>Phòng ngủ</Text>
                <View style={styles.specValueRow}>
                  <Ionicons name="bed-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.specValue}>
                    {String(property.bedrooms).padStart(2, '0')} phòng
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>Phòng tắm</Text>
              <View style={styles.specValueRow}>
                <Ionicons name="water-outline" size={20} color={COLORS.primary} />
                <Text style={styles.specValue}>
                  {String(property.bathrooms).padStart(2, '0')} WC
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÔ TẢ CHI TIẾT</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={showFullDescription ? undefined : 4}
          >
            {property.description?.trim()}
          </Text>
          <TouchableOpacity
            onPress={() => setShowFullDescription(!showFullDescription)}
            style={styles.readMoreBtn}
          >
            <Text style={styles.readMore}>
              {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
            </Text>
            <Ionicons
              name={showFullDescription ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Key Features / Amenities - Bento grid */}
        <View style={styles.sectionAlt}>
          <Text style={styles.sectionTitle}>TIỆN ÍCH NỔI BẬT</Text>
          <View style={styles.amenitiesGrid}>
            {property.features.slice(0, 6).map((feature, i) => (
              <View key={i} style={styles.amenityItem}>
                <Ionicons
                  name={getAmenityIcon(feature) as any}
                  size={22}
                  color={COLORS.primary}
                />
                <Text style={styles.amenityText}>{feature}</Text>
              </View>
            ))}
            {property.features.length > 6 && (
              <View style={styles.amenityMore}>
                <Text style={styles.amenityMoreText}>
                  +{property.features.length - 6} Thêm
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>VỊ TRÍ</Text>
            <TouchableOpacity>
              <Text style={styles.mapLink}>Mở Google Maps</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapPin}>
              <Ionicons name="location" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.mapAddress}>{property.address}</Text>
          </View>
        </View>

        {/* Agent Card */}
        <View style={styles.section}>
          <View style={styles.agentCard}>
            <Image
              source={{ uri: property.agent.avatar }}
              style={styles.agentAvatar}
            />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{property.agent.name}</Text>
              <Text style={styles.agentRole}>Chuyên viên tư vấn</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.onSurfaceVariant} />
          <Text style={styles.messageButtonText}>Nhắn tin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callButtonText}>Gọi ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zaloButton}>
          <Text style={styles.zaloText}>Zalo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  goBackText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
  },

  // Carousel
  carouselContainer: {
    position: 'relative',
    aspectRatio: 4 / 3,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: '100%',
    resizeMode: 'cover',
  },
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  topNavTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.4,
  },
  topNavRight: {
    flexDirection: 'row',
    gap: 4,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
  },
  statusBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  photoCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 30, 64, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  photoCounterText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Primary Info
  primaryInfo: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  propertyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.4,
    lineHeight: 34,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  pricePerSqm: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },

  // Specs
  specsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  sectionAlt: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },

  // Description
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.onSurfaceVariant,
    lineHeight: 24,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Amenities bento grid
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
  },
  amenityText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 14,
  },
  amenityMore: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Map
  mapLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mapPlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 12,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  mapPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 30, 64, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapAddress: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },

  // Agent
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(167, 200, 255, 0.3)',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  agentRole: {
    fontSize: 12,
    color: 'rgba(167, 200, 255, 0.8)',
    marginTop: 2,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 0 : 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(195, 198, 209, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  messageButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 8,
  },
  messageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  callButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  zaloButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zaloText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
