import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../src/context/ThemeContext';
import { ownerApi } from '../../src/api/owner';
import { PageLoader } from '../../src/components/common/Loader';
import EmptyState from '../../src/components/common/EmptyState';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const TABS = [
  { key: 'all', label: 'All', statuses: '' },
  { key: 'pending', label: 'Pending', statuses: 'pending' },
  { key: 'confirmed', label: 'Confirmed', statuses: 'confirmed' },
  { key: 'completed', label: 'Completed', statuses: 'completed' },
  { key: 'cancelled', label: 'Cancelled', statuses: 'cancelled' },
];

const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#22C55E',
  completed: '#6B7280',
  cancelled: '#EF4444',
};

export default function OwnerAppointments() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const tab = TABS.find(t => t.key === activeTab);
      const params = tab?.statuses ? { status: tab.statuses } : {};
      const res = await ownerApi.getSalonAppointments(params);
      setAppointments(res.data.data || []);
    } catch {}
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await ownerApi.updateAppointmentStatus(id, status);
      Toast.show({ type: 'success', text1: `Appointment ${status}` });
      fetchAppointments();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    } finally {
      setUpdating(null);
    }
  };

  const renderItem = ({ item }) => {
    const statusColor = STATUS_COLORS[item.status] || theme.textSecondary;
    const scheduledDate = item.scheduledAt ? new Date(item.scheduledAt) : null;
    const isValidDate = scheduledDate && !isNaN(scheduledDate.getTime());

    return (
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
        <View style={styles.cardHeader}>
          <View style={styles.customerRow}>
            {item.user?.avatar ? (
              <Image source={{ uri: item.user.avatar }} style={styles.customerAvatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primaryBg }]}>
                <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                  {item.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.customerName, { color: theme.textPrimary }]}>
                {item.user?.name || 'Customer'}
              </Text>
              <Text style={[styles.customerPhone, { color: theme.textSecondary }]}>
                {item.user?.phone || ''}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="cut-outline" size={14} color={theme.icon} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.services?.map(s => s.service?.name).join(', ') || '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.icon} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {isValidDate
                ? `${scheduledDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}  ${scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Date not set'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={14} color={theme.icon} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              ₹{item.totalAmount || 0}
            </Text>
          </View>
        </View>

        {(item.status === 'pending' || item.status === 'confirmed') && (
          <View style={styles.actions}>
            {item.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                onPress={() => updateStatus(item._id, 'confirmed')}
                disabled={updating === item._id}
              >
                <Ionicons name="checkmark-outline" size={14} color="#FFF" />
                <Text style={styles.actionBtnText}>Confirm</Text>
              </TouchableOpacity>
            )}
            {item.status === 'confirmed' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#22C55E' }]}
                onPress={() => updateStatus(item._id, 'completed')}
                disabled={updating === item._id}
              >
                <Ionicons name="checkmark-done-outline" size={14} color="#FFF" />
                <Text style={styles.actionBtnText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surface, borderWidth: 1, borderColor: '#EF4444' }]}
              onPress={() => updateStatus(item._id, 'cancelled')}
              disabled={updating === item._id}
            >
              <Ionicons name="close-outline" size={14} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Appointments</Text>
      </View>

      <View style={styles.tabsWrapper}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => t.key}
          contentContainerStyle={styles.tabsRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === item.key && { backgroundColor: COLORS.primary },
                { borderColor: activeTab === item.key ? COLORS.primary : theme.border },
              ]}
              onPress={() => setActiveTab(item.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: activeTab === item.key ? '#FFF' : theme.textSecondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <PageLoader />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { flexGrow: 1 }]}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No appointments"
              subtitle="No appointments found for this filter"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  tabsWrapper: { borderBottomWidth: 1 },
  tabsRow: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs },
  tab: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1 },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  list: { padding: SPACING.md, gap: SPACING.md },
  card: { borderRadius: RADIUS.xl, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  cardHeader: { padding: SPACING.md },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  customerAvatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  customerName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  customerPhone: { fontSize: FONT_SIZE.sm, marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  divider: { height: 1 },
  details: { padding: SPACING.md, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  detailText: { fontSize: FONT_SIZE.sm, flex: 1 },
  actions: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, paddingTop: 0 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: RADIUS.full },
  actionBtnText: { color: '#FFF', fontSize: FONT_SIZE.sm, fontWeight: '600' },
});
