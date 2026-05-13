import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import Button from '../../src/components/common/Button';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingConfirmation() {
  const { appointmentId, total } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={[styles.successCircle, { backgroundColor: '#E8FAF0' }]}>
          <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('bookingConfirmed')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your appointment has been confirmed. We'll send you a reminder before your appointment.
        </Text>

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Booking ID</Text>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>#{appointmentId?.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Amount Paid</Text>
            <Text style={[styles.infoValue, { color: COLORS.primary }]}>₹{total}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          title="View Booking"
          onPress={() => router.replace('/(tabs)/bookings')}
          style={styles.btn}
        />
        <Button
          title="Back to Home"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  successCircle: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.md },
  subtitle: { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  infoCard: { width: '100%', borderRadius: RADIUS.xl, padding: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  infoLabel: { flex: 1, fontSize: FONT_SIZE.sm },
  infoValue: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  divider: { height: 1 },
  footer: { padding: SPACING.md, gap: SPACING.sm },
  btn: {},
});
