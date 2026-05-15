import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import useAuthStore from '../../src/store/authStore';
import { ownerApi } from '../../src/api/owner';
import { PageLoader } from '../../src/components/common/Loader';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const STAT_CARDS = [
  { key: 'revenue', label: 'Revenue', icon: 'wallet-outline', color: COLORS.primary, prefix: '₹' },
  { key: 'total', label: 'Total', icon: 'calendar-outline', color: '#6366F1', prefix: '' },
  { key: 'pending', label: 'Pending', icon: 'time-outline', color: '#F59E0B', prefix: '' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-circle-outline', color: '#22C55E', prefix: '' },
];

const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#22C55E',
  completed: '#6B7280',
  cancelled: '#EF4444',
};

function StatCard({ stat, value, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      <View style={[styles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
        <Ionicons name={stat.icon} size={20} color={stat.color} />
      </View>
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>
        {stat.prefix}{value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: color + '15' }]} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#FFF" />
      </View>
      <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RecentRow({ item, theme }) {
  const statusColor = STATUS_COLORS[item.status] || theme.textSecondary;
  const d = item.date ? new Date(item.date) : null;
  const isValid = d && !isNaN(d.getTime());
  const dateStr = isValid
    ? `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}  ${item.startTime || ''}`
    : 'Date not set';
  const customer = item.customer;

  return (
    <View style={[styles.recentRow, { borderBottomColor: theme.border }]}>
      <View style={[styles.recentAvatar, { backgroundColor: COLORS.primaryBg }]}>
        {customer?.avatar
          ? <Image source={{ uri: customer.avatar }} style={styles.recentAvatarImg} />
          : <Text style={[styles.recentAvatarText, { color: COLORS.primary }]}>
              {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
            </Text>
        }
      </View>
      <View style={styles.recentInfo}>
        <Text style={[styles.recentName, { color: theme.textPrimary }]} numberOfLines={1}>
          {customer?.name || 'Customer'}
        </Text>
        <Text style={[styles.recentService, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.services?.map(s => s.name).join(', ') || '—'}
        </Text>
        <View style={styles.recentMeta}>
          <Ionicons name="time-outline" size={11} color={theme.icon} />
          <Text style={[styles.recentTime, { color: theme.textSecondary }]}>{dateStr}</Text>
        </View>
      </View>
      <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
        <Text style={[styles.statusPillText, { color: statusColor }]}>
          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
        </Text>
      </View>
    </View>
  );
}

export default function OwnerDashboard() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, total: 0, pending: 0, completed: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [apptRes, statsRes] = await Promise.allSettled([
        ownerApi.getSalonAppointments({ limit: 10, page: 1 }),
        ownerApi.getBookingStats(),
      ]);

      if (apptRes.status === 'fulfilled') {
        const appts = apptRes.value.data.data || [];
        setRecentAppointments(appts.slice(0, 5));
        const pending = appts.filter(a => a.status === 'pending').length;
        const completed = appts.filter(a => a.status === 'completed').length;
        setStats(prev => ({ ...prev, total: appts.length, pending, completed }));
      }

      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value.data.data || {};
        setStats(prev => ({ ...prev, revenue: data.totalRevenue || 0 }));
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <PageLoader />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting}</Text>
          <Text style={[styles.ownerName, { color: theme.textPrimary }]} numberOfLines={1}>
            {user?.name || 'Owner'}
          </Text>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>{today}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile/edit')} style={styles.avatarBtn}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primaryBg }]}>
              <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                {user?.name?.charAt(0)?.toUpperCase() || 'O'}
              </Text>
            </View>
          )}
          <View style={[styles.onlineDot, { borderColor: theme.background }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
      >
        {/* Stats */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Overview</Text>
        <View style={styles.statsGrid}>
          {STAT_CARDS.map(stat => (
            <StatCard key={stat.key} stat={stat} value={stats[stat.key]} theme={theme} />
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
        <View style={[styles.quickActionsCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <QuickAction
            icon="cut-outline"
            label="Services"
            color={COLORS.primary}
            onPress={() => router.push('/(owner-tabs)/services')}
          />
          <View style={[styles.actionDivider, { backgroundColor: theme.border }]} />
          <QuickAction
            icon="calendar-outline"
            label="Appointments"
            color="#6366F1"
            onPress={() => router.push('/(owner-tabs)/appointments')}
          />
          <View style={[styles.actionDivider, { backgroundColor: theme.border }]} />
          <QuickAction
            icon="chatbubbles-outline"
            label="Messages"
            color="#22C55E"
            onPress={() => router.push('/(owner-tabs)/chat')}
          />
        </View>

        {/* Recent Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 0, marginBottom: 0 }]}>
            Recent Appointments
          </Text>
          <TouchableOpacity onPress={() => router.push('/(owner-tabs)/appointments')} activeOpacity={0.7}>
            <Text style={[styles.viewAll, { color: COLORS.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.recentCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          {recentAppointments.length === 0 ? (
            <View style={styles.emptyBlock}>
              <View style={[styles.emptyIconWrap, { backgroundColor: COLORS.primaryBg }]}>
                <Ionicons name="calendar-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No appointments yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Appointments will appear here once customers book
              </Text>
            </View>
          ) : (
            recentAppointments.map((item, i) => (
              <RecentRow
                key={item._id}
                item={item}
                theme={theme}
                isLast={i === recentAppointments.length - 1}
              />
            ))
          )}
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderBottomWidth: 1, gap: SPACING.sm,
  },
  greeting: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  ownerName: { fontSize: FONT_SIZE.xl, fontWeight: '800', marginTop: 1 },
  dateText: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  avatarBtn: { position: 'relative' },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarPlaceholder: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2 },

  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  viewAll: { fontSize: FONT_SIZE.sm, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.sm, gap: 0 },
  statCard: {
    width: '46%', margin: '2%', borderRadius: RADIUS.xl, padding: SPACING.md,
    alignItems: 'flex-start', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZE.xs, marginTop: 2, fontWeight: '500' },

  quickActionsCard: {
    flexDirection: 'row', marginHorizontal: SPACING.md, borderRadius: RADIUS.xl,
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden',
  },
  quickAction: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.xs },
  quickActionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  actionDivider: { width: 1, marginVertical: SPACING.md },

  recentCard: { marginHorizontal: SPACING.md, borderRadius: RADIUS.xl, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, gap: SPACING.sm },
  recentAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  recentAvatarImg: { width: 42, height: 42, borderRadius: 21 },
  recentAvatarText: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  recentService: { fontSize: FONT_SIZE.xs, marginTop: 1 },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  recentTime: { fontSize: FONT_SIZE.xs },
  statusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: RADIUS.full },
  statusPillText: { fontSize: 10, fontWeight: '700' },

  emptyBlock: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.sm },
  emptyIconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', marginTop: SPACING.xs },
  emptySubtitle: { fontSize: FONT_SIZE.sm, textAlign: 'center' },
});
