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

function StatCard({ icon, label, value, color, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function AppointmentRow({ item, theme, onConfirm, onComplete }) {
  const statusColor = {
    pending: '#F59E0B',
    confirmed: '#22C55E',
    completed: theme.textSecondary,
    cancelled: theme.error,
  }[item.status] || theme.textSecondary;

  return (
    <View style={[styles.apptRow, { borderBottomColor: theme.border }]}>
      <View style={styles.apptInfo}>
        <Text style={[styles.apptCustomer, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.user?.name || 'Customer'}
        </Text>
        <Text style={[styles.apptService, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.services?.map(s => s.service?.name).join(', ') || '—'}
        </Text>
        <Text style={[styles.apptTime, { color: theme.textSecondary }]}>
          {new Date(item.scheduledAt).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </View>
      <View style={styles.apptRight}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          </Text>
        </View>
        {item.status === 'pending' && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={() => onConfirm(item._id)}>
            <Text style={styles.actionBtnText}>Confirm</Text>
          </TouchableOpacity>
        )}
        {item.status === 'confirmed' && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#22C55E' }]} onPress={() => onComplete(item._id)}>
            <Text style={styles.actionBtnText}>Complete</Text>
          </TouchableOpacity>
        )}
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

  const handleConfirm = async (id) => {
    try {
      await ownerApi.updateAppointmentStatus(id, 'confirmed');
      fetchData();
    } catch {}
  };

  const handleComplete = async (id) => {
    try {
      await ownerApi.updateAppointmentStatus(id, 'completed');
      fetchData();
    } catch {}
  };

  if (loading) return <PageLoader />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting},</Text>
          <Text style={[styles.ownerName, { color: theme.textPrimary }]}>{user?.name || 'Owner'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile/edit')}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primaryBg }]}>
              <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                {user?.name?.charAt(0)?.toUpperCase() || 'O'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
      >
        {/* Stats */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="cash-outline" label="Revenue" value={`₹${stats.revenue}`} color={COLORS.primary} theme={theme} />
          <StatCard icon="calendar-outline" label="Total" value={stats.total} color="#6366F1" theme={theme} />
          <StatCard icon="time-outline" label="Pending" value={stats.pending} color="#F59E0B" theme={theme} />
          <StatCard icon="checkmark-circle-outline" label="Completed" value={stats.completed} color="#22C55E" theme={theme} />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.primary }]}
            onPress={() => router.push('/(owner-tabs)/services')}
          >
            <Ionicons name="cut-outline" size={24} color="#FFF" />
            <Text style={styles.actionCardText}>Manage{'\n'}Services</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#6366F1' }]}
            onPress={() => router.push('/(owner-tabs)/appointments')}
          >
            <Ionicons name="calendar-outline" size={24} color="#FFF" />
            <Text style={styles.actionCardText}>View All{'\n'}Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#22C55E' }]}
            onPress={() => router.push('/(owner-tabs)/chat')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="#FFF" />
            <Text style={styles.actionCardText}>Customer{'\n'}Messages</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Appointments */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Appointments</Text>
        <View style={[styles.apptCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          {recentAppointments.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={40} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No appointments yet</Text>
            </View>
          ) : (
            recentAppointments.map(item => (
              <AppointmentRow
                key={item._id}
                item={item}
                theme={theme}
                onConfirm={handleConfirm}
                onComplete={handleComplete}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1,
  },
  greeting: { fontSize: FONT_SIZE.sm },
  ownerName: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.sm },
  statCard: {
    width: '46%', margin: '2%', borderRadius: RADIUS.xl, padding: SPACING.md,
    alignItems: 'center', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  actionsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm },
  actionCard: {
    flex: 1, borderRadius: RADIUS.xl, padding: SPACING.md,
    alignItems: 'center', gap: SPACING.xs,
  },
  actionCardText: { color: '#FFF', fontSize: FONT_SIZE.xs, fontWeight: '600', textAlign: 'center' },
  apptCard: { marginHorizontal: SPACING.md, borderRadius: RADIUS.xl, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  apptRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1 },
  apptInfo: { flex: 1 },
  apptCustomer: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  apptService: { fontSize: FONT_SIZE.sm, marginTop: 2 },
  apptTime: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  apptRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  actionBtnText: { color: '#FFF', fontSize: FONT_SIZE.xs, fontWeight: '600' },
  empty: { alignItems: 'center', padding: SPACING.xl },
  emptyText: { marginTop: SPACING.sm, fontSize: FONT_SIZE.sm },
});
