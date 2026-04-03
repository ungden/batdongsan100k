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
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropertyCard from '../../components/PropertyCard';
import { Property } from '../../lib/types';
import { COLORS } from '../../lib/colors';
import { invokeMobileApi } from '../../lib/mobile-api';
import { mapSupabaseListingToProperty } from './index';

const QUICK_FILTERS = [
  { label: 'Tất cả', value: null },
  { label: 'Căn hộ', value: 'chung-cu' },
  { label: 'Nhà phố', value: 'nha-pho' },
  { label: 'Biệt thự', value: 'biet-thu' },
  { label: 'Đất nền', value: 'dat-nen' },
];

export default function SearchScreen() {
  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await invokeMobileApi<any[]>('search_listings', {
          keyword,
          typeFilter: selectedType,
        });
        
        if (data) {
          setResults(data.map(mapSupabaseListingToProperty));
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [keyword, selectedType]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="menu" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.logo}>TitanHome</Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm khu vực, dự án..."
              placeholderTextColor={COLORS.outline}
              value={keyword}
              onChangeText={setKeyword}
            />
            {keyword.length > 0 && (
              <TouchableOpacity onPress={() => setKeyword('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.outline} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {QUICK_FILTERS.map((filter) => {
            const isActive = selectedType === filter.value;
            return (
              <TouchableOpacity
                key={filter.label}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedType(filter.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Listing Header */}
      <View style={styles.listingHeader}>
        <View>
          <Text style={styles.listingSubtitle}>Kết quả tìm kiếm</Text>
          <Text style={styles.listingCount}>
            {loading ? 'Đang tải...' : `${results.length} Bất Động Sản`}
          </Text>
        </View>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Mới nhất</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlashList
            data={results}
            keyExtractor={(item: any) => item.id}
            // @ts-expect-error TS missing type
            estimatedItemSize={180}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }: { item: any }) => (
              <PropertyCard property={item} variant="horizontal" />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={COLORS.outlineVariant} />
                <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
                <Text style={styles.emptySubtitle}>
                  Thử thay đổi bộ lọc để tìm bất động sản phù hợp
                </Text>
              </View>
            }
          />
        )}
      </View>
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
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.4,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  filterButton: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  chipsRow: {
    paddingVertical: 14,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  chipTextActive: {
    color: COLORS.onPrimary,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listingSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  listingCount: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.outline,
    marginTop: 8,
    textAlign: 'center',
  },
});
