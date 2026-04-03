import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../lib/colors';
import { Property } from '../../lib/types';
import { mapSupabaseListingToProperty } from '../(tabs)/index';
import PropertyCard from '../../components/PropertyCard';
import { buildProjectSummaries, getProjectProperties } from '../../../shared/projects';
import { invokeMobileApi } from '../../lib/mobile-api';

export default function ProjectDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await invokeMobileApi<any[]>('get_project_detail', { slug });
        if (data) setProperties(data.map((item: any) => mapSupabaseListingToProperty(item)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const projectListings = useMemo(() => getProjectProperties(properties, slug || ''), [properties, slug]);
  const projectSummary = useMemo(() => buildProjectSummaries(properties).find((item) => item.slug === slug), [properties, slug]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{projectSummary?.name || 'Dự án'}</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.centerState}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlashList
          data={projectListings}
          renderItem={({ item }: { item: Property }) => <PropertyCard property={item} variant="horizontal" />}
          keyExtractor={(item: Property) => item.id}
          // @ts-expect-error FlashList typing mismatch in current package version
          estimatedItemSize={180}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>{projectSummary?.name || 'Dự án'}</Text>
              <Text style={styles.heroSubtitle}>{projectSummary ? `${projectSummary.propertyCount} tin đăng • ${projectSummary.district}, ${projectSummary.city}` : 'Danh sách sản phẩm trong dự án'}</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.emptyTitle}>Chưa có bất động sản trong dự án này</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: COLORS.primary },
  heroCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.primary, borderRadius: 18, padding: 20 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', marginTop: 8, lineHeight: 20 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  centerState: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.onSurface },
});
