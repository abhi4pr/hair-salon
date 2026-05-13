import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import useAuthStore from '../../src/store/authStore';
import { salonsApi } from '../../src/api/salons';
import { userApi } from '../../src/api/user';
import BannerCarousel from '../../src/components/home/BannerCarousel';
import ServiceCategories from '../../src/components/home/ServiceCategories';
import SalonCard from '../../src/components/home/SalonCard';
import { PageLoader } from '../../src/components/common/Loader';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const insets = useSafeAreaInsets();

  const [salons, setSalons] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [nearbRes, topRes, favRes] = await Promise.all([
        salonsApi.search({ limit: 10, page: 1 }),
        salonsApi.search({ sort: 'rating', limit: 10 }),
        userApi.getFavorites(),
      ]);
      setSalons(nearbRes.data.data?.salons || []);
      setTopRated(topRes.data.data?.salons || []);
      const favIds = (favRes.data.data || []).map(s => s._id);
      setFavorites(favIds);
    } catch (err) {
      // silently fail on home load
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const toggleFavorite = async (salonId) => {
    try {
      await userApi.toggleFavorite(salonId);
      setFavorites(prev =>
        prev.includes(salonId) ? prev.filter(id => id !== salonId) : [...prev, salonId]
      );
    } catch {}
  };

  if (loading) return <PageLoader />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm, backgroundColor: theme.background }]}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>{t('location')}</Text>
        </View>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.locationBtn}>
            <Text style={[styles.locationText, { color: theme.textPrimary }]} numberOfLines={1}>
              {user?.addresses?.[0]?.city || 'Select Location'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: theme.surface }]}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push('/(tabs)/explore')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color={theme.icon} />
          <Text style={[styles.searchPlaceholder, { color: theme.placeholder }]}>{t('searchSalons')}</Text>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="options-outline" size={16} color="#FFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Banners */}
        <SectionHeader title={t('specialForYou')} onSeeAll={() => router.push('/offers')} t={t} theme={theme} />
        <BannerCarousel />

        {/* Services */}
        <SectionHeader title={t('services')} onSeeAll={() => router.push('/(tabs)/explore')} t={t} theme={theme} />
        <ServiceCategories onSelect={(key) => router.push({ pathname: '/(tabs)/explore', params: { service: key } })} />

        {/* Top Rated */}
        <SectionHeader title={t('topRatedSalons')} onSeeAll={() => router.push('/(tabs)/explore')} t={t} theme={theme} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {topRated.map(salon => (
            <SalonCard
              key={salon._id}
              salon={salon}
              isFavorite={favorites.includes(salon._id)}
              onFavoriteToggle={toggleFavorite}
            />
          ))}
        </ScrollView>

        {/* Nearby */}
        <SectionHeader title={t('nearbySalons')} onSeeAll={() => router.push('/(tabs)/explore')} t={t} theme={theme} />
        <View style={styles.verticalList}>
          {salons.map(salon => (
            <SalonCard
              key={salon._id}
              salon={salon}
              compact
              isFavorite={favorites.includes(salon._id)}
              onFavoriteToggle={toggleFavorite}
            />
          ))}
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, onSeeAll, t, theme }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={[styles.seeAll, { color: COLORS.primary }]}>{t('seeAll')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  locationLabel: { fontSize: FONT_SIZE.xs, marginLeft: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchPlaceholder: { flex: 1, fontSize: FONT_SIZE.md, marginLeft: SPACING.sm },
  filterBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, marginTop: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  seeAll: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  hList: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  verticalList: { paddingBottom: SPACING.sm },
});
