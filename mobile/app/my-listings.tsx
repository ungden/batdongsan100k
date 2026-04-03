import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PropertyCard from '../components/PropertyCard';
import { COLORS } from '../lib/colors';
import { supabase } from '../lib/supabase';
import { mapSupabaseListingToProperty } from './(tabs)/index';
import { Property } from '../lib/types';
import { invokeMobileApi } from '../lib/mobile-api';

export default function MyListingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchMyListings(user.id);
      else setLoading(false);
    });

    // Listen for changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMyListings(session.user.id);
      } else {
        setMyListings([]);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchMyListings = async (userId: string) => {
    setLoading(true);
    try {
      const data = await invokeMobileApi<any[]>('get_my_listings');
      setMyListings(data.map((item: any) => mapSupabaseListingToProperty(item)));
    } catch (error) {
      console.error('Error fetching my listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tin đăng của tôi</Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/post' as any)}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {!user ? (
        <View style={styles.emptyState}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={COLORS.outlineVariant} />
          </View>
          <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Đăng nhập để xem và quản lý các tin đăng bất động sản của bạn
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
      ) : myListings.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          <FlashList
            data={myListings}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 16 }}>
                <PropertyCard property={item} variant="horizontal" />
                {item.status === 'published' && (
                  <TouchableOpacity 
                    style={{ backgroundColor: COLORS.primary + '15', padding: 12, borderRadius: 8, marginTop: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                    onPress={() => router.push(`/upgrade/${item.id}` as any)}
                  >
                    <Ionicons name="rocket" size={16} color={COLORS.primary} />
                    <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Nâng cấp VIP / Đẩy tin</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
            <Ionicons name="document-text-outline" size={64} color={COLORS.outlineVariant} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có tin đăng nào</Text>
          <Text style={styles.emptySubtitle}>
            Bạn chưa đăng bất kỳ bất động sản nào. Hãy bắt đầu đăng tin ngay!
          </Text>
          <TouchableOpacity 
            style={{ marginTop: 24, backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 999 }}
            onPress={() => router.push('/post' as any)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đăng tin ngay</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
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
