import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/colors';
import { getSavedPropertyIds } from '../../lib/saved-properties';
import { invokeMobileApi } from '../../lib/mobile-api';

interface MenuItem {
  icon: string;
  label: string;
  subtitle?: string;
  badge?: string;
  action?: () => void;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'document-text-outline', label: 'Tin đăng của tôi', subtitle: '0 tin đăng' },
  { icon: 'time-outline', label: 'Lịch sử xem', subtitle: 'Xem gần đây' },
  { icon: 'card-outline', label: 'Gói dịch vụ', badge: 'Mới' },
  { icon: 'notifications-outline', label: 'Thông báo', badge: '3' },
  { icon: 'shield-checkmark-outline', label: 'Xác minh tài khoản' },
  { icon: 'settings-outline', label: 'Cài đặt' },
  { icon: 'help-circle-outline', label: 'Trung tâm hỗ trợ' },
  { icon: 'information-circle-outline', label: 'Về chúng tôi' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listingCount, setListingCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const loadState = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const saved = await getSavedPropertyIds();
      setFavoriteCount(saved.length);

      if (user) {
        try {
          const stats = await invokeMobileApi<{ listingCount: number; favoriteCount: number }>('get_profile_stats');
          setListingCount(stats.listingCount);
          setFavoriteCount(stats.favoriteCount);
        } catch {
          const { count } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', user.id);
          setListingCount(count || 0);
        }
      } else {
        setListingCount(0);
      }
    };

    loadState();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadState();
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleMenuPress = (label: string) => {
    if (label === 'Tin đăng của tôi') {
      if (!user) router.push('/auth');
      else router.push('/my-listings');
      return;
    }
    if (label === 'Gói dịch vụ') {
      if (!user) router.push('/auth');
      else router.push('/my-listings');
      return;
    }
    if (label === 'Cài đặt' && !user) {
      router.push('/auth');
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
          <Text style={styles.pageTitle}>Cá nhân</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user ? 'https://i.pravatar.cc/150?img=11' : 'https://i.pravatar.cc/150?img=33' }}
              style={styles.avatar}
            />
            <View style={[styles.onlineDot, { backgroundColor: user ? COLORS.secondary : COLORS.outline }]} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user ? user.email : 'Khách'}</Text>
            <Text style={styles.profileSubtitle}>
              {user ? 'Tài khoản thành viên' : 'Đăng nhập để sử dụng đầy đủ tính năng'}
            </Text>
          </View>
          {!user && (
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{listingCount}</Text>
            <Text style={styles.statLabel}>Tin đăng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Liên hệ</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={() => {
                if (item.action) item.action();
                else handleMenuPress(item.label);
              }}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.label === 'Đăng xuất' ? COLORS.error : COLORS.primary}
                />
              </View>
              <View style={styles.menuContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, item.label === 'Đăng xuất' && { color: COLORS.error }]}>{item.label}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                {item.label !== 'Đăng xuất' && (
                  <Ionicons name="chevron-forward" size={18} color={COLORS.outlineVariant} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>TitanHome v1.0.0</Text>
      </ScrollView>
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
  profileCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  profileSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(195, 198, 209, 0.3)',
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 30, 64, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195, 198, 209, 0.15)',
    paddingBottom: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    color: COLORS.outlineVariant,
    fontSize: 12,
    marginVertical: 24,
  },
});
