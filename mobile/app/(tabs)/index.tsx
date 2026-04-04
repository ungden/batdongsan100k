import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import PropertyCard from '../../components/PropertyCard';
import { PROPERTY_TYPES, Property } from '../../lib/types';
import { COLORS } from '../../lib/colors';
import { invokeMobileApi } from '../../lib/mobile-api';

const CATEGORY_ICONS: Record<string, string> = {
  'chung-cu': 'business-outline',
  'nha-pho': 'home-outline',
  'biet-thu': 'leaf-outline',
  'dat-nen': 'map-outline',
  'phong-tro': 'bed-outline',
};

function normalizePriceUnit(unit?: string): 'tỷ' | 'triệu' | 'triệu/tháng' {
  const normalized = (unit || '').trim().toLowerCase();
  if (normalized === 'ty' || normalized === 'tỷ') return 'tỷ';
  if (normalized === 'trieu' || normalized === 'triệu') return 'triệu';
  if (normalized === 'trieu/thang' || normalized === 'triệu/tháng') return 'triệu/tháng';
  return 'tỷ';
}

function normalizeFeatureLabel(feature: string): string {
  const key = feature.trim().toLowerCase();
  const map: Record<string, string> = {
    'ho boi': 'Hồ bơi',
    'phong gym': 'Phòng gym',
    'bao ve 24/7': 'Bảo vệ 24/7',
    'bai do xe': 'Bãi đỗ xe',
    'thang may': 'Thang máy',
    'ban cong': 'Ban công',
    'san vuon': 'Sân vườn',
    'gara o to': 'Gara ô tô',
    'dieu hoa': 'Điều hòa',
    'noi that cao cap': 'Nội thất cao cấp',
    'view song': 'View sông',
    'gan truong hoc': 'Gần trường học',
  };
  return map[key] || feature;
}

function formatListingPrice(price: number, unit?: string) {
  const normalizedUnit = normalizePriceUnit(unit);
  if (unit) return { priceFormatted: price ? String(price) : '', priceUnit: normalizedUnit };

  if (price >= 1000000000) {
    return {
      priceFormatted: (price / 1000000000).toFixed(1).replace(/\.0$/, ''),
      priceUnit: 'tỷ' as const,
    };
  }
  if (price >= 1000000) {
    return {
      priceFormatted: (price / 1000000).toFixed(0),
      priceUnit: 'triệu' as const,
    };
  }
  return { priceFormatted: String(price || ''), priceUnit: 'tỷ' as const };
}

// Helper function to map Supabase database listing to our app's Property interface
export function mapSupabaseListingToProperty(dbItem: any): Property {
  let parsedImages = ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'];
  if (typeof dbItem.images === 'string') {
    try {
      const parsed = JSON.parse(dbItem.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedImages = parsed;
      }
    } catch (e) {
      console.error('Error parsing images:', e, dbItem.images);
    }
  } else if (Array.isArray(dbItem.images) && dbItem.images.length > 0) {
    parsedImages = dbItem.images;
  }

  let parsedFeatures = [];
  if (typeof dbItem.features === 'string') {
    try {
      parsedFeatures = JSON.parse(dbItem.features) || [];
    } catch (e) {
      console.error('Error parsing features:', e, dbItem.features);
    }
  } else if (Array.isArray(dbItem.features)) {
    parsedFeatures = dbItem.features;
  }

  parsedFeatures = parsedFeatures
    .filter((item: unknown) => typeof item === 'string')
    .map((item: string) => normalizeFeatureLabel(item));

  const formattedPrice = formatListingPrice(dbItem.price || 0, dbItem.price_unit);
  // properties table uses type (chung-cu, nha-pho, etc.) and category (sale, rent) directly
  const normalizedType = dbItem.type || 'nha-pho';
  const normalizedCategory = dbItem.category === 'rent' ? 'rent' : 'sale';

  return {
    id: dbItem.id,
    title: dbItem.title || '',
    slug: dbItem.slug || dbItem.id,
    price: dbItem.price || 0,
    priceFormatted: dbItem.price_formatted || formattedPrice.priceFormatted,
    priceUnit: normalizePriceUnit(dbItem.price_unit || formattedPrice.priceUnit),
    type: normalizedType,
    category: normalizedCategory,
    address: dbItem.address || '',
    district: dbItem.district || '',
    city: dbItem.city || '',
    bedrooms: dbItem.bedrooms || 0,
    bathrooms: dbItem.bathrooms || 0,
    area: dbItem.area || 0,
    description: dbItem.description || '',
    images: parsedImages,
    features: parsedFeatures,
    agent: {
      id: dbItem.agent_id || dbItem.created_by || 'system',
      name: dbItem.agent?.name || 'TitanHome',
      phone: dbItem.agent?.phone || '',
      email: 'contact@titanhome.vn',
      avatar: dbItem.agent?.avatar || 'https://i.pravatar.cc/150?u=system',
    },
    status: dbItem.status || 'published',
    authorId: dbItem.created_by || '',
    createdAt: dbItem.created_at || new Date().toISOString(),
    updatedAt: dbItem.updated_at || new Date().toISOString(),
    isFeatured: dbItem.is_featured || dbItem.is_vip || false,
    priorityLevel: dbItem.is_priority ? 1 : 0,
    sortDate: dbItem.created_at || new Date().toISOString(),
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featured, setFeatured] = useState<Property[]>([]);
  const [nearby, setNearby] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const visibleFeatured = selectedCategory
    ? featured.filter((item) => item.type === selectedCategory)
    : featured;
  const visibleNearby = selectedCategory
    ? nearby.filter((item) => item.type === selectedCategory)
    : nearby;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const feed = await invokeMobileApi<{ featured: any[]; nearby: any[] }>('get_home_feed');
        const featuredData = feed.featured || [];
        const nearbyData = feed.nearby || [];

        if (featuredData) {
          setFeatured(featuredData.map(mapSupabaseListingToProperty));
        }
        if (nearbyData) {
          setNearby(nearbyData.map(mapSupabaseListingToProperty));
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="menu" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.logo}>TitanHome</Text>
        </View>
        <TouchableOpacity style={styles.headerIconButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Hero Text */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          {'Tìm '}
          <Text style={styles.heroTitleAccent}>Tổ Ấm</Text>
          {' Lý Tưởng Tại Việt Nam.'}
        </Text>
        <Text style={styles.heroSubtitle}>
          Kiến trúc đẳng cấp cho phong cách sống hiện đại.
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khu vực, dự án..."
            placeholderTextColor={COLORS.outline}
            onFocus={() => router.push('/search' as any)}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color={COLORS.outline} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Icons */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {PROPERTY_TYPES.map((type) => {
            const isActive = selectedCategory === type.value;
            return (
              <TouchableOpacity
                key={type.value}
                style={styles.categoryItem}
                onPress={() =>
                  setSelectedCategory(isActive ? null : type.value)
                }
              >
                <View
                  style={[
                    styles.categoryIconWrap,
                    isActive && styles.categoryIconWrapActive,
                  ]}
                >
                  <Ionicons
                    name={(CATEGORY_ICONS[type.value] || 'home-outline') as any}
                    size={24}
                    color={isActive ? COLORS.onPrimary : COLORS.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    isActive && styles.categoryLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.projectsBanner} onPress={() => router.push('/projects' as any)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.projectsBannerEyebrow}>Dự án</Text>
          <Text style={styles.projectsBannerTitle}>Khám phá dự án nổi bật</Text>
          <Text style={styles.projectsBannerSubtitle}>Xem nhanh các dự án đang được TitanHome tuyển chọn.</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Featured Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Bất động sản mới nhất</Text>
          <View style={styles.sectionAccent} />
        </View>
        <TouchableOpacity onPress={() => router.push('/search' as any)}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal FlashList for Featured */}
      <View style={{ height: 350, width: '100%' }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlashList
            horizontal
            data={visibleFeatured}
            renderItem={({ item }) => <PropertyCard property={item as Property} variant="featured" />}
            // @ts-expect-error TS missing type
            estimatedItemSize={280}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            keyExtractor={(item: any) => item.id}
          />
        )}
      </View>

      {/* Recommended - Vertical List Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
          <View style={styles.sectionAccent} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlashList
        data={visibleNearby}
        renderItem={({ item }) => (
          <View style={styles.recommendedListItem}>
            <PropertyCard property={item as Property} variant="horizontal" />
          </View>
        )}
        keyExtractor={(item: any) => item.id}
        // @ts-expect-error TS missing type
        estimatedItemSize={180}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerContainer: {
    paddingBottom: 0,
  },
  scrollContent: {
    paddingBottom: 24,
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
  headerIconButton: {
    padding: 8,
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.4,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  heroTitleAccent: {
    color: COLORS.secondary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(195, 198, 209, 0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  categorySection: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingVertical: 20,
  },
  projectsBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  projectsBannerEyebrow: {
    color: '#9af2cb',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  projectsBannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  projectsBannerSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  categoryItem: {
    alignItems: 'center',
    minWidth: 64,
    gap: 8,
  },
  categoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  categoryIconWrapActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryLabelActive: {
    color: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  sectionAccent: {
    height: 4,
    width: 48,
    backgroundColor: COLORS.secondary,
    marginTop: 4,
    borderRadius: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recommendedListItem: {
    paddingHorizontal: 16,
  },
});
