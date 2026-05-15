import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { salonsApi } from '../../src/api/salons';
import SalonCard from '../../src/components/home/SalonCard';
import { userApi } from '../../src/api/user';
import { PageLoader, InlineLoader } from '../../src/components/common/Loader';
import EmptyState from '../../src/components/common/EmptyState';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const SORT_OPTIONS = [
  { key: 'nearest', label: 'Nearest' },
  { key: 'rating', label: 'Highest Rated' },
  { key: 'price_asc', label: 'Lowest Price' },
];

const RATING_OPTIONS = [5, 4, 3];

export default function Explore() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { service } = useLocalSearchParams();

  const [query, setQuery] = useState('');
  const [salons, setSalons] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ sort: 'nearest', minRating: null, service: service || null });

  const fetchSalons = useCallback(async (reset = false) => {
    if (loading && !reset) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const res = await salonsApi.search({
        q: query,
        sort: filters.sort,
        minRating: filters.minRating,
        service: filters.service,
        page: currentPage,
        limit: 15,
      });
      const newSalons = res.data.data || [];
      setSalons(reset ? newSalons : prev => [...prev, ...newSalons]);
      setHasMore(newSalons.length === 15);
      if (!reset) setPage(p => p + 1);
      else setPage(2);
    } catch {}
    setLoading(false);
  }, [query, filters, page]);

  useEffect(() => {
    const t = setTimeout(() => { fetchSalons(true); }, 400);
    return () => clearTimeout(t);
  }, [query, filters]);

  useEffect(() => {
    userApi.getFavorites().then(res => {
      setFavorites((res.data.data || []).map(s => s._id));
    }).catch(() => {});
  }, []);

  const toggleFavorite = async (salonId) => {
    try {
      await userApi.toggleFavorite(salonId);
      setFavorites(prev =>
        prev.includes(salonId) ? prev.filter(id => id !== salonId) : [...prev, salonId]
      );
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.icon} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t('searchSalons')}
            placeholderTextColor={theme.placeholder}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.icon} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={salons}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SalonCard
            salon={item}
            compact
            isFavorite={favorites.includes(item._id)}
            onFavoriteToggle={toggleFavorite}
          />
        )}
        onEndReached={() => hasMore && fetchSalons()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loading ? <InlineLoader /> : null}
        ListEmptyComponent={!loading ? (
          <EmptyState icon="search-outline" title={t('noResults')} subtitle="Try different keywords or filters" />
        ) : null}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.filterSheet, { backgroundColor: theme.card }]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: theme.textPrimary }]}>{t('filters')}</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>{t('sortBy')}</Text>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.chip, { borderColor: filters.sort === opt.key ? COLORS.primary : theme.border, backgroundColor: filters.sort === opt.key ? COLORS.primaryBg : 'transparent' }]}
                  onPress={() => setFilters(f => ({ ...f, sort: opt.key }))}
                >
                  <Text style={[styles.chipText, { color: filters.sort === opt.key ? COLORS.primary : theme.textSecondary }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>{t('rating')}</Text>
            <View style={styles.chipRow}>
              {RATING_OPTIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, { borderColor: filters.minRating === r ? COLORS.primary : theme.border, backgroundColor: filters.minRating === r ? COLORS.primaryBg : 'transparent' }]}
                  onPress={() => setFilters(f => ({ ...f, minRating: f.minRating === r ? null : r }))}
                >
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={[styles.chipText, { color: filters.minRating === r ? COLORS.primary : theme.textSecondary }]}>{r}+</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity style={[styles.clearBtn, { borderColor: theme.border }]} onPress={() => setFilters({ sort: 'nearest', minRating: null, service: null })}>
                <Text style={[styles.clearText, { color: theme.textSecondary }]}>{t('clearFilters')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyBtn, { backgroundColor: COLORS.primary }]} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyText}>{t('applyFilters')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, gap: SPACING.sm },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: SPACING.md, height: 44, gap: SPACING.sm },
  searchInput: { flex: 1, fontSize: FONT_SIZE.md },
  filterBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, paddingBottom: 40 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  filterTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  filterLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: SPACING.sm, marginTop: SPACING.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1.5 },
  chipText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  filterActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl },
  clearBtn: { flex: 1, height: 50, borderRadius: RADIUS.full, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  applyBtn: { flex: 2, height: 50, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  applyText: { color: '#FFF', fontSize: FONT_SIZE.md, fontWeight: '700' },
});
