import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.md * 2;

const DEMO_BANNERS = [
  { id: '1', title: 'Get Special Discount', subtitle: 'Up to 40%', badge: 'Limited time!', color: '#2A2A2A' },
  { id: '2', title: 'First Booking Offer', subtitle: '20% OFF', badge: 'New Users!', color: '#1A3A4A' },
  { id: '3', title: 'Weekend Special', subtitle: 'Up to 30%', badge: 'This Weekend!', color: '#3A1A2A' },
];

export default function BannerCarousel({ banners }) {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const items = banners?.length ? banners : DEMO_BANNERS;

  return (
    <View>
      <FlatList
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING.sm}
        decelerationRate="fast"
        keyExtractor={(item) => item.id || item._id}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING.sm));
          setActiveIndex(idx);
        }}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} style={[styles.banner, { backgroundColor: item.color || '#2A2A2A' }]}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.bannerImg} resizeMode="cover" />
            )}
            <View style={styles.bannerOverlay}>
              <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              <TouchableOpacity style={[styles.claimBtn, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.claimText}>Claim</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === activeIndex ? COLORS.primary : '#D1D5DB' }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: CARD_WIDTH,
    height: 160,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.sm,
    position: 'relative',
  },
  bannerImg: { ...StyleSheet.absoluteFillObject },
  bannerOverlay: { flex: 1, padding: SPACING.md, justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginBottom: 6 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  bannerTitle: { color: '#FFF', fontSize: FONT_SIZE.xl, fontWeight: '800', marginBottom: 4 },
  bannerSubtitle: { color: '#FFF', fontSize: FONT_SIZE.xxxl, fontWeight: '900' },
  claimBtn: {
    position: 'absolute', right: SPACING.md, bottom: SPACING.md,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  claimText: { color: '#FFF', fontSize: FONT_SIZE.sm, fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 3 },
});
