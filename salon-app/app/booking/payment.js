import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { salonsApi } from '../../src/api/salons';
import { appointmentsApi } from '../../src/api/appointments';
import { offersApi } from '../../src/api/offers';
import useAuthStore from '../../src/store/authStore';
import Header from '../../src/components/common/Header';
import Button from '../../src/components/common/Button';
import { FullScreenLoader } from '../../src/components/common/Loader';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Pay on Cash', icon: 'cash-outline', group: 'Pay on Cash' },
  { key: 'wallet', label: 'Wallet Balance', icon: 'wallet-outline', group: 'Wallet' },
];

export default function Payment() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const [salon, setSalon] = useState(null);
  const [payMethod, setPayMethod] = useState('cash');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState(0);

  const serviceIds = params.serviceIds?.split(',') || [];
  const subtotal = Number(params.totalAmount) || 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax - discount + tip;

  useEffect(() => {
    salonsApi.getById(params.salonId).then(res => setSalon(res.data.data)).catch(() => {});
  }, [params.salonId]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await offersApi.applyCoupon({ code: coupon, salonId: params.salonId, amount: subtotal });
      const disc = res.data.data?.discountAmount || 0;
      setDiscount(disc);
      setCouponApplied(true);
      Toast.show({ type: 'success', text1: 'Coupon Applied', text2: `You saved ₹${disc}` });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Invalid Coupon', text2: err.response?.data?.message || 'Coupon not valid' });
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await appointmentsApi.create({
        salonId: params.salonId,
        serviceIds,
        staffId: params.staffId || undefined,
        appointmentDate: new Date(params.date).toISOString().split('T')[0],
        startTime: params.time,
        paymentMethod: payMethod,
        couponCode: couponApplied ? coupon : undefined,
        tip,
      });
      const appointmentId = res.data.data?._id;
      router.replace({ pathname: '/booking/confirmation', params: { appointmentId, total } });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Booking Failed', text2: err.response?.data?.message || 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  const TIP_OPTIONS = [0, 20, 50, 100];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('reviewSummary')} />
      <FullScreenLoader visible={loading} text="Confirming booking..." />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Booking Summary */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Row label="Barber/Salon" value={salon?.name} theme={theme} />
          <Row label="Address" value={[salon?.address?.area, salon?.address?.city].filter(Boolean).join(', ')} theme={theme} />
          <Row label="Name" value={user?.name} theme={theme} />
          <Row label="Phone" value={user?.phone} theme={theme} />
          <Row label="Booking Date" value={new Date(params.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} theme={theme} />
          <Row label="Booking Time" value={params.time} theme={theme} />
        </View>

        {/* Payment Method */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('paymentMethod')}</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity
              key={method.key}
              style={[styles.methodRow, { borderBottomColor: theme.border }]}
              onPress={() => setPayMethod(method.key)}
            >
              <View style={[styles.methodIcon, { backgroundColor: theme.surface }]}>
                <Ionicons name={method.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={[styles.methodLabel, { color: theme.textPrimary }]}>{method.label}</Text>
              <View style={[styles.radio, { borderColor: payMethod === method.key ? COLORS.primary : theme.border }]}>
                {payMethod === method.key && <View style={[styles.radioDot, { backgroundColor: COLORS.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* QR for cash */}
          {payMethod === 'cash' && salon?.qrImage && (
            <View style={styles.qrWrap}>
              <Text style={[styles.qrLabel, { color: theme.textSecondary }]}>Scan to pay at salon</Text>
              <Image source={{ uri: salon.qrImage }} style={styles.qrImg} resizeMode="contain" />
            </View>
          )}
        </View>

        {/* Coupon */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('couponCode')}</Text>
        <View style={[styles.couponRow, { backgroundColor: theme.card }]}>
          <TextInput
            style={[styles.couponInput, { color: theme.textPrimary }]}
            placeholder="Enter coupon code"
            placeholderTextColor={theme.placeholder}
            value={coupon}
            onChangeText={setCoupon}
            editable={!couponApplied}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: couponApplied ? '#22C55E' : COLORS.primary }]}
            onPress={couponApplied ? () => { setCouponApplied(false); setDiscount(0); setCoupon(''); } : applyCoupon}
          >
            <Text style={styles.applyText}>{couponApplied ? 'Remove' : t('applyCoupon')}</Text>
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('tip')}</Text>
        <View style={styles.tipRow}>
          {TIP_OPTIONS.map(amount => (
            <TouchableOpacity
              key={amount}
              style={[styles.tipBtn, { backgroundColor: tip === amount ? COLORS.primary : theme.card, borderColor: tip === amount ? COLORS.primary : theme.border }]}
              onPress={() => setTip(amount)}
            >
              <Text style={[styles.tipText, { color: tip === amount ? '#FFF' : theme.textPrimary }]}>
                {amount === 0 ? 'No Tip' : `₹${amount}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={[styles.card, { backgroundColor: theme.card, marginBottom: 100 }]}>
          <PriceRow label={t('subtotal')} value={`₹${subtotal}`} theme={theme} />
          <PriceRow label={`${t('tax')} (5%)`} value={`₹${tax}`} theme={theme} />
          {discount > 0 && <PriceRow label={t('discount')} value={`-₹${discount}`} valueColor="#22C55E" theme={theme} />}
          {tip > 0 && <PriceRow label={t('tip')} value={`₹${tip}`} theme={theme} />}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <PriceRow label={t('total')} value={`₹${total}`} bold theme={theme} />
          <TouchableOpacity style={styles.changeMethodRow}>
            <View style={[styles.methodChip, { backgroundColor: COLORS.primaryBg }]}>
              <Ionicons name={payMethod === 'cash' ? 'cash-outline' : 'wallet-outline'} size={14} color={COLORS.primary} />
              <Text style={[styles.methodChipText, { color: COLORS.primary }]}>
                {payMethod === 'cash' ? 'Cash' : 'Wallet'}
              </Text>
            </View>
            <Text style={[styles.changeText, { color: COLORS.primary }]}>Change</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <Button title={`${t('confirmPayment')} · ₹${total}`} onPress={handleConfirm} loading={loading} />
      </View>
    </View>
  );
}

function Row({ label, value, theme }) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.textPrimary }]}>{value || '—'}</Text>
    </View>
  );
}

function PriceRow({ label, value, bold, valueColor, theme }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, { color: theme.textSecondary, fontWeight: bold ? '700' : '400' }]}>{label}</Text>
      <Text style={[styles.priceValue, { color: valueColor || (bold ? theme.textPrimary : theme.textSecondary), fontWeight: bold ? '800' : '600', fontSize: bold ? FONT_SIZE.lg : FONT_SIZE.sm }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md },
  card: { borderRadius: RADIUS.xl, marginBottom: SPACING.md, overflow: 'hidden' },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderBottomWidth: 1 },
  rowLabel: { fontSize: FONT_SIZE.sm },
  rowValue: { fontSize: FONT_SIZE.sm, fontWeight: '600', flex: 1, textAlign: 'right' },
  methodRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1 },
  methodIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  methodLabel: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '500' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  qrWrap: { alignItems: 'center', padding: SPACING.md },
  qrLabel: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm },
  qrImg: { width: 150, height: 150 },
  couponRow: { flexDirection: 'row', borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.md },
  couponInput: { flex: 1, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.md, height: 50 },
  applyBtn: { paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  applyText: { color: '#FFF', fontSize: FONT_SIZE.sm, fontWeight: '700' },
  tipRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tipBtn: { flex: 1, height: 40, borderRadius: RADIUS.full, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  tipText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  divider: { height: 1, marginVertical: SPACING.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  priceLabel: { fontSize: FONT_SIZE.sm },
  priceValue: { fontSize: FONT_SIZE.sm },
  changeMethodRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, justifyContent: 'space-between' },
  methodChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  methodChipText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  changeText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.md, borderTopWidth: 1 },
});
