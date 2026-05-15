import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import StarRating from '../common/StarRating';
import { FONT_SIZE, RADIUS, SPACING, COLORS } from '../../theme/colors';

export default function SalonCard({ salon, onFavoriteToggle, isFavorite, compact = false }) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        compact ? styles.compact : styles.full,
        { backgroundColor: theme.card, shadowColor: theme.shadow },
      ]}
      onPress={() => router.push(`/salon/${salon._id}`)}
      activeOpacity={0.9}
    >
      <View style={compact ? styles.compactImgWrap : styles.imgWrap}>
        <Image
          source={{ uri: salon.images?.[0]?.url || 'https://via.placeholder.com/300x180' }}
          style={compact ? styles.compactImg : styles.img}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={styles.ratingText}>{(salon.averageRating || 0).toFixed(1)}</Text>
        </View>
        {onFavoriteToggle && (
          <TouchableOpacity
            style={[styles.favBtn, { backgroundColor: theme.card }]}
            onPress={() => onFavoriteToggle(salon._id)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? COLORS.primary : theme.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
          {salon.name}
        </Text>
        <Text style={[styles.services, { color: theme.textSecondary }]} numberOfLines={1}>
          {salon.services?.slice(0, 3).map(s => s.name || s).join(', ')}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={COLORS.primary} />
          <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>
            {salon.location?.address || salon.location?.city}
          </Text>
          {!compact && salon.distance != null && (
            <Text style={[styles.dist, { color: theme.textSecondary }]}>
              · {salon.distance < 1 ? `${Math.round(salon.distance * 1000)}m` : `${salon.distance.toFixed(1)}km`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, overflow: 'hidden', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  full: { width: 210, marginRight: SPACING.md },
  compact: { flexDirection: 'row', marginBottom: SPACING.md, marginHorizontal: SPACING.md },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 130 },
  compactImgWrap: { position: 'relative' },
  compactImg: { width: 90, height: 90, borderRadius: RADIUS.md },
  ratingBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2,
  },
  ratingText: { color: '#FFF', fontSize: 10, fontWeight: '700', marginLeft: 2 },
  favBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  info: { padding: SPACING.sm, flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: 2 },
  services: { fontSize: FONT_SIZE.xs, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: FONT_SIZE.xs, marginLeft: 2, flex: 1 },
  dist: { fontSize: FONT_SIZE.xs },
});
