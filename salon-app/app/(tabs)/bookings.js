import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { appointmentsApi } from '../../src/api/appointments';
import { PageLoader, InlineLoader } from '../../src/components/common/Loader';
import EmptyState from '../../src/components/common/EmptyState';
import Button from '../../src/components/common/Button';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const TABS = ['upcoming', 'completed', 'cancelled'];

const CANCEL_REASONS = [
  'scheduleChange', 'weatherConditions', 'parkingAvailability',
  'lackOfAmenities', 'haveAlternative', 'other',
];

export default function Bookings() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const statusMap = { upcoming: 'pending,confirmed', completed: 'completed', cancelled: 'cancelled' };
      const res = await appointmentsApi.getMy({ status: statusMap[activeTab] });
      setBookings(res.data.data || []);
    } catch {}
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async () => {
    if (!cancelReason) {
      Toast.show({ type: 'error', text1: 'Please select a reason' });
      return;
    }
    setCancelling(true);
    try {
      await appointmentsApi.cancel(cancelModal._id, {
        reason: cancelReason === 'other' ? customReason : t(cancelReason),
      });
      Toast.show({ type: 'success', text1: 'Booking Cancelled' });
      setCancelModal(null);
      fetchBookings();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to cancel' });
    } finally {
      setCancelling(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'confirmed') return '#22C55E';
    if (status === 'pending') return '#F59E0B';
    if (status === 'cancelled') return theme.error;
    if (status === 'completed') return theme.textSecondary;
    return theme.textSecondary;
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
      onPress={() => {}}
      activeOpacity={0.9}
    >
      <View style={styles.cardTop}>
        <Image
          source={{ uri: item.salon?.images?.[0]?.url || 'https://via.placeholder.com/60' }}
          style={styles.salonImg}
        />
        <View style={styles.cardInfo}>
          <Text style={[styles.salonName, { color: theme.textPrimary }]}>{item.salon?.name}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.salon?.location?.address || item.salon?.location?.city}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="receipt-outline" size={12} color={theme.icon} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Service ID: #{item._id?.slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={theme.icon} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={theme.icon} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.startTime}</Text>
        </View>
        <Text style={[styles.amount, { color: COLORS.primary }]}>₹{item.totalAmount}</Text>
      </View>

      {activeTab === 'upcoming' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: theme.border }]}
            onPress={() => setCancelModal(item)}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>{t('cancelBooking')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rescheduleBtn, { backgroundColor: COLORS.primaryBg }]}
            onPress={() => router.push({ pathname: `/booking/${item.salon?._id}`, params: { rescheduleId: item._id } })}
          >
            <Text style={[styles.rescheduleBtnText, { color: COLORS.primary }]}>{t('reschedule')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'cancelled' && (
        <TouchableOpacity
          style={[styles.reBookBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => router.push(`/booking/${item.salon?._id}`)}
        >
          <Text style={styles.reBookText}>{t('reBook')}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('bookings')}</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? COLORS.primary : theme.textSecondary }]}>
              {t(tab)}
            </Text>
            {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: COLORS.primary }]} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <PageLoader />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title={t('noBookings')}
              subtitle="Your bookings will appear here"
              actionLabel={t('bookNow')}
              onAction={() => router.push('/(tabs)/explore')}
            />
          }
          contentContainerStyle={{ flexGrow: 1, padding: SPACING.md }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Cancel Modal */}
      <Modal visible={!!cancelModal} animationType="slide" transparent onRequestClose={() => setCancelModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.cancelSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.cancelTitle, { color: theme.textPrimary }]}>{t('cancelBooking')}</Text>
            <Text style={[styles.cancelSubtitle, { color: theme.textSecondary }]}>
              {t('cancelReason')}:
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {CANCEL_REASONS.map(reason => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonRow}
                  onPress={() => setCancelReason(reason)}
                >
                  <View style={[styles.radio, { borderColor: cancelReason === reason ? COLORS.primary : theme.border }]}>
                    {cancelReason === reason && <View style={[styles.radioDot, { backgroundColor: COLORS.primary }]} />}
                  </View>
                  <Text style={[styles.reasonText, { color: theme.textPrimary }]}>{t(reason)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.cancelActions}>
              <Button title={t('cancel')} variant="outline" onPress={() => setCancelModal(null)} style={styles.cancelActionBtn} />
              <Button title={t('cancelBooking')} onPress={handleCancel} loading={cancelling} style={styles.cancelActionBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  activeTab: {},
  tabIndicator: { position: 'absolute', bottom: 0, height: 2.5, width: '60%', borderRadius: 2 },
  card: { borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  salonImg: { width: 60, height: 60, borderRadius: RADIUS.md, marginRight: SPACING.sm },
  cardInfo: { flex: 1 },
  salonName: { fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  infoText: { fontSize: FONT_SIZE.xs },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  cardDivider: { height: 1, marginVertical: SPACING.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONT_SIZE.xs },
  amount: { marginLeft: 'auto', fontSize: FONT_SIZE.md, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  cancelBtn: { flex: 1, height: 38, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  rescheduleBtn: { flex: 1, height: 38, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  rescheduleBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  reBookBtn: { marginTop: SPACING.sm, height: 40, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  reBookText: { color: '#FFF', fontSize: FONT_SIZE.sm, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  cancelSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, paddingBottom: 40, maxHeight: '70%' },
  cancelTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: SPACING.xs },
  cancelSubtitle: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },
  reasonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: SPACING.md },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  reasonText: { fontSize: FONT_SIZE.md },
  cancelActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  cancelActionBtn: { flex: 1 },
});
