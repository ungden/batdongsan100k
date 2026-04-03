import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PropertyCard from '../../components/PropertyCard';
import { COLORS } from '../../lib/colors';
import { supabase } from '../../lib/supabase';
import { mapSupabaseListingToProperty } from './index';
import { Property } from '../../lib/types';
import { getSavedPropertyIds } from '../../lib/saved-properties';
import { invokeMobileApi } from '../../lib/mobile-api';

export default function FavoritesScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchFavorites(user.id);
      else setLoading(false);
    });

    // Listen for changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchFavorites(session.user.id);
      } else {
        setFavorites([]);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchFavorites = async (userId: string) => {
    setLoading(true);
    try {
      let ids = await getSavedPropertyIds();
      try {
        ids = await invokeMobileApi<string[]>('get_favorites');
      } catch (error) {
        console.error('Fallback to local favorites:', error);
      }

      if (ids.length === 0) {
        setFavorites([]);
        return;
      }

      const rows = await Promise.all(
        ids.map(async (favoriteId) => {
          try {
            return await invokeMobileApi<any>('get_listing_detail', { listingId: favoriteId });
          } catch {
            return null;
          }
        }),
      );

      const validRows = rows.filter(Boolean);
      setFavorites(validRows.map((item: any) => mapSupabaseListingToProperty(item)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

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

      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Yêu thích</Text>
      </View>

      {!user ? (
        <View style={styles.emptyState}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={COLORS.outlineVariant} />
          </View>
          <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Đăng nhập để xem và lưu các bất động sản yêu thích của bạn
          </Text>
          <TouchableOpacity 
            style={{ marginTop: 24, backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 999 }}
            onPress={() => router.push('/auth')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : favorites.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <FlashList
            data={favorites}
            renderItem={({ item }) => <PropertyCard property={item} variant="horizontal" />}
            // @ts-expect-error TS missing type
            estimatedItemSize={180}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyExtractor={(item: any) => item.id}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart-outline" size={64} color={COLORS.outlineVariant} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có bất động sản yêu thích</Text>
          <Text style={styles.emptySubtitle}>
            Nhấn vào biểu tượng trái tim trên các tin đăng để lưu lại những bất động sản bạn quan tâm
          </Text>
        </View>
      )}
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
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 30, 64, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 22,
  },
});
