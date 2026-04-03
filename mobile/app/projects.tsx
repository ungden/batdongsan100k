import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PropertyCard from '../components/PropertyCard';
import { COLORS } from '../lib/colors';
import { Property } from '../lib/types';
import { mapSupabaseListingToProperty } from './(tabs)/index';
import { buildProjectSummaries } from '../../shared/projects';
import { invokeMobileApi } from '../lib/mobile-api';

export default function ProjectsScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await invokeMobileApi<any[]>('get_projects');

        if (data) {
          setProperties(data.map((item: any) => mapSupabaseListingToProperty(item)));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const projects = buildProjectSummaries(properties);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dự án</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>TitanHome Projects</Text>
        <Text style={styles.heroTitle}>Khám phá dự án nổi bật</Text>
        <Text style={styles.heroSubtitle}>Danh sách các dự án đang được quan tâm và mở bán trên TitanHome.</Text>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlashList
          data={projects}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.projectCard} onPress={() => router.push(`/project/${item.slug}` as any)}>
              <View style={styles.projectCardBody}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.projectName}>{item.name}</Text>
                  <Text style={styles.projectMeta}>{item.propertyCount} sản phẩm • {item.district}, {item.city}</Text>
                  <Text style={styles.projectPrice}>Từ {item.minPriceFormatted}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={24} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.slug}
          // @ts-expect-error FlashList typing mismatch in current package version
          estimatedItemSize={180}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons name="business-outline" size={52} color={COLORS.outlineVariant} />
              <Text style={styles.emptyTitle}>Chưa có dự án nào</Text>
              <Text style={styles.emptyText}>Khi có thêm dự án nổi bật, chúng sẽ xuất hiện tại đây.</Text>
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
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  heroCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.primary, borderRadius: 20, padding: 20 },
  heroEyebrow: { color: '#9af2cb', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 22, marginTop: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  projectCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  projectCardBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  projectName: { fontSize: 18, fontWeight: '800', color: COLORS.onSurface },
  projectMeta: { marginTop: 6, fontSize: 13, color: COLORS.onSurfaceVariant },
  projectPrice: { marginTop: 10, fontSize: 14, fontWeight: '800', color: COLORS.primary },
  centerState: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '800', color: COLORS.onSurface },
  emptyText: { marginTop: 8, fontSize: 14, color: COLORS.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
});
