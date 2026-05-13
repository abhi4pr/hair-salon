import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { userApi } from '../../src/api/user';
import Header from '../../src/components/common/Header';
import SalonCard from '../../src/components/home/SalonCard';
import { PageLoader } from '../../src/components/common/Loader';
import EmptyState from '../../src/components/common/EmptyState';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const FILTERS = ['All', 'Haircuts', 'Make Up', 'Massage', 'Shaving'];

export default function Favorites() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    userApi.getFavorites().then(res => setSalons(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleFavorite = async (salonId) => {
    await userApi.toggleFavorite(salonId);
    setSalons(prev => prev.filter(s => s._id !== salonId));
  };

  if (loading) return <PageLoader />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('saved')} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, { backgroundColor: activeFilter === f ? COLORS.primary : theme.surface, borderColor: activeFilter === f ? COLORS.primary : theme.border }]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.chipText, { color: activeFilter === f ? '#FFF' : theme.textSecondary }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={salons}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <SalonCard salon={item} compact isFavorite onFavoriteToggle={toggleFavorite} />
        )}
        ListEmptyComponent={
          <EmptyState icon="heart-outline" title="No saved salons" subtitle="Tap the heart icon on any salon to save it here" />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { maxHeight: 60 },
  filtersContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1.5 },
  chipText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
});
