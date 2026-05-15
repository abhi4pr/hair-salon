import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { loyaltyApi } from '../../src/api/loyalty';
import Header from '../../src/components/common/Header';
import { PageLoader } from '../../src/components/common/Loader';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

export default function Loyalty() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('points');

  useEffect(() => {
    Promise.all([
      loyaltyApi.getMyPoints(),
      loyaltyApi.getHistory(),
      loyaltyApi.getMembershipPlans(),
    ]).then(([pointsRes, histRes, plansRes]) => {
      setData(pointsRes.data.data);
      setHistory(histRes.data.data || []);
      setPlans(plansRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('loyaltyPointsTitle')} />

      {/* Points Card */}
      <View style={[styles.pointsCard, { backgroundColor: COLORS.primary }]}>
        <Text style={styles.pointsLabel}>{t('yourPoints')}</Text>
        <Text style={styles.pointsValue}>{data?.loyaltyPoints || 0}</Text>
        <Text style={styles.pointsSub}>1 point = ₹1 discount on your next booking</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {['points', 'membership'].map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && { borderBottomColor: COLORS.primary, borderBottomWidth: 2.5 }]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, { color: activeTab === tab ? COLORS.primary : theme.textSecondary }]}>
              {tab === 'points' ? t('pointsHistory') : t('membershipPlans')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'points' ? (
        <FlatList
          data={history}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            (() => {
              const isCredit = item.points > 0;
              return (
                <View style={[styles.historyItem, { borderBottomColor: theme.border }]}>
                  <View style={[styles.historyIcon, { backgroundColor: isCredit ? '#E8FAF0' : '#FFF0F0' }]}>
                    <Ionicons name={isCredit ? 'add-circle-outline' : 'remove-circle-outline'} size={20} color={isCredit ? '#22C55E' : theme.error} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={[styles.historyLabel, { color: theme.textPrimary }]}>{item.description}</Text>
                    <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={[styles.historyPoints, { color: isCredit ? '#22C55E' : theme.error }]}>
                    {isCredit ? '+' : ''}{item.points}
                  </Text>
                </View>
              );
            })()
          )}
          contentContainerStyle={{ flexGrow: 1, padding: SPACING.md }}
        />
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={[styles.planCard, { backgroundColor: theme.card }]}>
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: theme.textPrimary }]}>{item.name}</Text>
                <View style={[styles.planBadge, { backgroundColor: COLORS.primaryBg }]}>
                  <Text style={[styles.planBadgeText, { color: COLORS.primary }]}>{item.durationDays} days</Text>
                </View>
              </View>
              <Text style={[styles.planPrice, { color: COLORS.primary }]}>₹{item.price}</Text>
              <Text style={[styles.planDesc, { color: theme.textSecondary }]}>{item.description}</Text>
              <TouchableOpacity style={[styles.subscribeBtn, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.subscribeBtnText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ padding: SPACING.md }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pointsCard: { margin: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center' },
  pointsLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.sm, fontWeight: '600' },
  pointsValue: { color: '#FFF', fontSize: 56, fontWeight: '900', marginVertical: SPACING.sm },
  pointsSub: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZE.xs, textAlign: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  historyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  historyInfo: { flex: 1 },
  historyLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  historyDate: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  historyPoints: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  planCard: { borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  planName: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  planBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  planPrice: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: SPACING.sm },
  planDesc: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginBottom: SPACING.md },
  subscribeBtn: { height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  subscribeBtnText: { color: '#FFF', fontSize: FONT_SIZE.md, fontWeight: '700' },
});
