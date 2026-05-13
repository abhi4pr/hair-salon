import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { paymentApi } from '../../src/api/payment';
import Header from '../../src/components/common/Header';
import { PageLoader } from '../../src/components/common/Loader';
import EmptyState from '../../src/components/common/EmptyState';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

export default function Transactions() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentApi.getHistory().then(res => setTransactions(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('transactions')} />
      <FlatList
        data={transactions}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.status === 'completed' ? '#E8FAF0' : '#FFF0F0' }]}>
              <Ionicons name={item.status === 'completed' ? 'checkmark-circle-outline' : 'close-circle-outline'} size={24} color={item.status === 'completed' ? '#22C55E' : theme.error} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.salonName, { color: theme.textPrimary }]}>{item.salon?.name || 'Salon'}</Text>
              <Text style={[styles.date, { color: theme.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
              <Text style={[styles.method, { color: theme.textSecondary }]}>{item.method || 'Cash'}</Text>
            </View>
            <View style={styles.amountWrap}>
              <Text style={[styles.amount, { color: item.status === 'completed' ? theme.textPrimary : theme.error }]}>₹{item.amount}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#E8FAF0' : '#FFF0F0' }]}>
                <Text style={[styles.statusText, { color: item.status === 'completed' ? '#22C55E' : theme.error }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No transactions yet" />}
        contentContainerStyle={{ flexGrow: 1, padding: SPACING.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  iconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  info: { flex: 1 },
  salonName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  date: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  method: { fontSize: FONT_SIZE.xs },
  amountWrap: { alignItems: 'flex-end' },
  amount: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  statusBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
