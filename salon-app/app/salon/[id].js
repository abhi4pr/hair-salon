import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, FlatList, Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { salonsApi } from '../../src/api/salons';
import { userApi } from '../../src/api/user';
import { reviewsApi } from '../../src/api/reviews';
import StarRating from '../../src/components/common/StarRating';
import { PageLoader } from '../../src/components/common/Loader';
import Button from '../../src/components/common/Button';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DETAIL_TABS = ['services', 'specialists', 'packages', 'gallery', 'reviews'];

export default function SalonDetail() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      salonsApi.getById(id),
      reviewsApi.getSalonReviews(id, { limit: 5 }),
      userApi.getFavorites(),
    ]).then(([salonRes, reviewRes, favRes]) => {
      setSalon(salonRes.data.data);
      setReviews(reviewRes.data.data || []);
      const favIds = (favRes.data.data || []).map(s => s._id);
      setIsFavorite(favIds.includes(id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    try {
      await userApi.toggleFavorite(id);
      setIsFavorite(p => !p);
      Toast.show({ type: 'success', text1: isFavorite ? 'Removed from favorites' : 'Added to favorites' });
    } catch {}
  };

  const isOpenNow = () => {
    if (!salon?.businessHours?.length) return null;
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = salon.businessHours.find(h => h.day === day);
    if (!todayHours || todayHours.isClosed) return false;
    return true;
  };

  if (loading) return <PageLoader />;
  if (!salon) return null;

  const images = salon.images?.length ? salon.images : [{ url: 'https://via.placeholder.com/400x250' }];
  const open = isOpenNow();

  const renderTab = () => {
    switch (activeTab) {
      case 'services':
        return (
          <View style={styles.tabContent}>
            {salon.services?.map((svc, i) => (
              <View key={i} style={[styles.serviceRow, { borderBottomColor: theme.border }]}>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: theme.textPrimary }]}>{svc.name}</Text>
                  <Text style={[styles.serviceDuration, { color: theme.textSecondary }]}>{svc.duration} min</Text>
                </View>
                <Text style={[styles.servicePrice, { color: COLORS.primary }]}>₹{svc.price}</Text>
              </View>
            ))}
          </View>
        );
      case 'specialists':
        return (
          <View style={styles.tabContent}>
            <FlatList
              data={salon.staff || []}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={[styles.staffCard, { backgroundColor: theme.surface }]}>
                  <Image
                    source={{ uri: item.avatar || 'https://via.placeholder.com/80' }}
                    style={styles.staffAvatar}
                  />
                  <View style={[styles.staffRating, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Ionicons name="star" size={10} color="#F59E0B" />
                    <Text style={styles.staffRatingText}>{(item.rating || 4.5).toFixed(1)}</Text>
                  </View>
                  <Text style={[styles.staffName, { color: theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.staffRole, { color: theme.textSecondary }]} numberOfLines={1}>{item.role}</Text>
                </View>
              )}
            />
          </View>
        );
      case 'gallery':
        return (
          <View style={[styles.tabContent, styles.galleryGrid]}>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img.url }} style={styles.galleryImg} resizeMode="cover" />
            ))}
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            {reviews.map((rev, i) => (
              <View key={i} style={[styles.reviewCard, { borderBottomColor: theme.border }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewAvatar, { backgroundColor: COLORS.primaryBg }]}>
                    <Text style={[styles.reviewInitial, { color: COLORS.primary }]}>
                      {rev.customer?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={[styles.reviewName, { color: theme.textPrimary }]}>{rev.customer?.name}</Text>
                    <StarRating rating={rev.salonRating} size={12} />
                  </View>
                  <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Text style={[styles.reviewText, { color: theme.textSecondary }]}>{rev.comment}</Text>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Slider */}
        <View style={styles.imgWrap}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img.url }} style={styles.heroImg} resizeMode="cover" />
            ))}
          </ScrollView>

          {/* Overlay Header */}
          <View style={[styles.imgHeader, { paddingTop: insets.top + SPACING.sm }]}>
            <TouchableOpacity style={styles.overlayBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.overlayRight}>
              <TouchableOpacity style={styles.overlayBtn}>
                <Ionicons name="share-social-outline" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.overlayBtn} onPress={toggleFavorite}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? COLORS.primary : '#FFF'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image dots */}
          <View style={styles.imgDots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i === imgIndex ? '#FFF' : 'rgba(255,255,255,0.5)' }]} />
            ))}
          </View>

          {/* Rating badge */}
          <View style={[styles.ratingBadge, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="star" size={12} color="#FFF" />
            <Text style={styles.ratingBadgeText}>
              {(salon.averageRating || 0).toFixed(1)} ({salon.totalReviews || 0}+ Review)
            </Text>
          </View>
        </View>

        {/* Salon Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.background }]}>
          <Text style={[styles.salonName, { color: theme.textPrimary }]}>{salon.name}</Text>
          <Text style={[styles.salonServices, { color: theme.textSecondary }]}>
            {salon.services?.slice(0, 4).map(s => s.name).join(', ')}
          </Text>

          <View style={styles.metaRows}>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.primary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {[salon.location?.address, salon.location?.city, salon.location?.state].filter(Boolean).join(', ')}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={theme.icon} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {open === null ? 'Hours N/A' : open ? (
                  <Text style={{ color: '#22C55E' }}>{t('open')} </Text>
                ) : (
                  <Text style={{ color: theme.error }}>{t('closed')} </Text>
                )}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionBtns}>
            {[
              { icon: 'chatbubble-outline', label: t('message'), onPress: () => router.push(`/chat/${id}`) },
              { icon: 'call-outline', label: t('call'), onPress: () => salon.phone && Linking.openURL(`tel:${salon.phone}`) },
              { icon: 'navigate-outline', label: t('direction'), onPress: () => {} },
            ].map(btn => (
              <TouchableOpacity key={btn.label} style={styles.actionBtn} onPress={btn.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryBg }]}>
                  <Ionicons name={btn.icon} size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Detail Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            {DETAIL_TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && { borderBottomColor: COLORS.primary, borderBottomWidth: 2 }]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, { color: activeTab === tab ? COLORS.primary : theme.textSecondary }]}>
                  {t(tab)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {renderTab()}
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: insets.bottom + SPACING.sm }]}>
        <Button
          title={t('bookAppointment')}
          onPress={() => router.push(`/booking/${id}`)}
          style={styles.bookBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imgWrap: { position: 'relative', height: 260 },
  heroImg: { width, height: 260 },
  imgHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.md },
  overlayBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.sm },
  overlayRight: { flexDirection: 'row' },
  imgDots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  ratingBadge: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  ratingBadgeText: { color: '#FFF', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  infoCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: SPACING.lg, paddingBottom: 100 },
  salonName: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: 4 },
  salonServices: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },
  metaRows: { gap: SPACING.xs, marginBottom: SPACING.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: FONT_SIZE.sm, flex: 1 },
  actionBtns: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md, paddingVertical: SPACING.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E8E8E8' },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  tabs: { marginBottom: SPACING.md },
  tab: { paddingVertical: 10, paddingHorizontal: SPACING.md, marginRight: 4 },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  tabContent: { marginTop: SPACING.sm },
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  serviceDuration: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  servicePrice: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  staffCard: { flex: 1, margin: 6, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center' },
  staffAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: SPACING.sm, position: 'relative' },
  staffRating: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginBottom: 6 },
  staffRatingText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  staffName: { fontSize: FONT_SIZE.sm, fontWeight: '700', textAlign: 'center' },
  staffRole: { fontSize: FONT_SIZE.xs, textAlign: 'center' },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  galleryImg: { width: (width - 64) / 3, height: (width - 64) / 3, borderRadius: RADIUS.sm },
  reviewCard: { paddingVertical: SPACING.md, borderBottomWidth: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  reviewInitial: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  reviewInfo: { flex: 1 },
  reviewName: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  reviewDate: { fontSize: FONT_SIZE.xs },
  reviewText: { fontSize: FONT_SIZE.sm, lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.md, borderTopWidth: 1 },
  bookBtn: {},
});
