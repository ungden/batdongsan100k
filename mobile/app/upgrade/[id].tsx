import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/colors';
import { invokeMobileApi } from '../../lib/mobile-api';

export default function UpgradeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const listings = await invokeMobileApi<any[]>('get_my_listings');
      const listingData = listings.find((item) => item.id === id) || null;
      setListing(listingData);
      const packageData = await invokeMobileApi<any[]>('get_packages');
      setPackages(packageData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (pkg: any) => {
    setSubmitting(true);
    try {
      const order = await invokeMobileApi<any>('create_payment_order', { listingId: id, packageId: pkg.id });
      router.push(`/checkout/${order.id}` as any);

    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Đã xảy ra lỗi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Nâng Cấp Tin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.listingCard}>
          <Text style={styles.listingTitle} numberOfLines={2}>{listing?.title}</Text>
          <Text style={styles.statusText}>
            Trạng thái hiện tại: {listing?.priority_level > 0 ? `Tin VIP cấp ${listing.priority_level}` : listing?.is_vip ? 'Tin VIP' : 'Tin thường (Cơ bản)'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Chọn Gói Dịch Vụ</Text>

        {packages.map((pkg) => {
          const currentPriority = listing?.priority_level || 0;
          const isCurrent = currentPriority >= pkg.priority && pkg.priority > 0;
          return (
            <View key={pkg.id} style={[styles.pkgCard, pkg.priority > 0 && styles.pkgCardVip]}>
              {pkg.priority === 20 && (
                <View style={styles.badgePopular}>
                  <Text style={styles.badgePopularText}>ĐƯỢC ƯA CHUỘNG NHẤT</Text>
                </View>
              )}
              
              <Text style={styles.pkgName}>{pkg.name}</Text>
              <Text style={styles.pkgPrice}>
                {pkg.price > 0 ? (pkg.price / 1000).toLocaleString('vi-VN') + 'k' : 'Miễn phí'}
                <Text style={styles.pkgDuration}> / {pkg.duration_days} ngày</Text>
              </Text>
              
              <View style={styles.features}>
                {(pkg.features || []).map((feature: string, idx: number) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
                {pkg.push_interval_hours > 0 && (
                  <View style={styles.featureRow}>
                    <Ionicons name="rocket" size={16} color={COLORS.primary} />
                    <Text style={[styles.featureText, { color: COLORS.primary, fontWeight: 'bold' }]}>
                      Tự động đẩy tin mỗi {pkg.push_interval_hours} giờ
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.btn, isCurrent ? styles.btnDisabled : styles.btnActive]}
                disabled={isCurrent || submitting}
                onPress={() => handleUpgrade(pkg)}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>{isCurrent ? 'Đang sử dụng' : 'Chọn gói này'}</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.onSurface },
  content: { padding: 16, paddingBottom: 40 },
  listingCard: { backgroundColor: COLORS.surfaceContainerLow, padding: 16, borderRadius: 12, marginBottom: 24 },
  listingTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.onSurface, marginBottom: 8 },
  statusText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.onSurface, marginBottom: 16 },
  pkgCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.outlineVariant, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, position: 'relative' },
  pkgCardVip: { borderColor: COLORS.primary, borderWidth: 2 },
  badgePopular: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgePopularText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  pkgName: { fontSize: 20, fontWeight: 'bold', color: COLORS.onSurface, marginBottom: 8 },
  pkgPrice: { fontSize: 32, fontWeight: '900', color: COLORS.onSurface, marginBottom: 16 },
  pkgDuration: { fontSize: 16, fontWeight: '400', color: COLORS.onSurfaceVariant },
  features: { marginBottom: 24, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingRight: 16 },
  featureText: { fontSize: 14, color: COLORS.onSurfaceVariant, flex: 1, lineHeight: 20 },
  btn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  btnActive: { backgroundColor: COLORS.primary },
  btnDisabled: { backgroundColor: COLORS.surfaceContainerHigh },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
