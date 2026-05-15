import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { salonsApi } from '../../src/api/salons';
import { appointmentsApi } from '../../src/api/appointments';
import Header from '../../src/components/common/Header';
import Button from '../../src/components/common/Button';
import { PageLoader } from '../../src/components/common/Loader';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BookAppointment() {
  const { salonId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [salon, setSalon] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  const dates = generateDates();

  useEffect(() => {
    salonsApi.getById(salonId).then(res => setSalon(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [salonId]);

  useEffect(() => {
    if (!salon) return;
    setSlotsLoading(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    if (!selectedServices.length) { setSlots([]); setSlotsLoading(false); return; }
    appointmentsApi.getSlots(salonId, {
      date: dateStr,
      staffId: selectedStaff?._id,
      services: selectedServices.map(s => s._id).join(','),
    }).then(res => {
      setSlots(res.data.data?.slots || []);
      setSelectedTime(null);
    }).catch(() => setSlots([])).finally(() => setSlotsLoading(false));
  }, [selectedDate, selectedStaff, selectedServices]);

  const toggleService = (svc) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s._id === svc._id);
      return exists ? prev.filter(s => s._id !== svc._id) : [...prev, svc];
    });
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const handleContinue = () => {
    if (!selectedTime) {
      Toast.show({ type: 'error', text1: 'Please select a time slot' });
      return;
    }
    if (!selectedServices.length) {
      Toast.show({ type: 'error', text1: 'Please select at least one service' });
      return;
    }
    router.push({
      pathname: '/booking/payment',
      params: {
        salonId,
        date: selectedDate.toISOString(),
        time: selectedTime,
        staffId: selectedStaff?._id || '',
        serviceIds: selectedServices.map(s => s._id).join(','),
        totalAmount,
      },
    });
  };

  if (loading) return <PageLoader />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('bookAppointment')} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Salon Brief */}
        {salon && (
          <View style={[styles.salonBrief, { backgroundColor: theme.card }]}>
            <Image source={{ uri: salon.images?.[0]?.url || 'https://via.placeholder.com/60' }} style={styles.salonImg} />
            <View>
              <Text style={[styles.salonName, { color: theme.textPrimary }]}>{salon.name}</Text>
              <Text style={[styles.salonAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                {[salon.location?.address, salon.location?.city].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
        )}

        {/* Select Services */}
        <SectionTitle title={t('multipleServices')} theme={theme} />
        <View style={styles.servicesList}>
          {salon?.services?.map(svc => {
            const selected = selectedServices.find(s => s._id === svc._id);
            return (
              <TouchableOpacity
                key={svc._id}
                style={[styles.serviceItem, { backgroundColor: theme.card, borderColor: selected ? COLORS.primary : theme.border }]}
                onPress={() => toggleService(svc)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: theme.textPrimary }]}>{svc.name}</Text>
                  <Text style={[styles.serviceDur, { color: theme.textSecondary }]}>{svc.duration} min</Text>
                </View>
                <View style={styles.serviceRight}>
                  <Text style={[styles.servicePrice, { color: COLORS.primary }]}>₹{svc.price}</Text>
                  <View style={[styles.checkbox, { borderColor: selected ? COLORS.primary : theme.border, backgroundColor: selected ? COLORS.primary : 'transparent' }]}>
                    {selected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date Picker */}
        <SectionTitle title={t('day')} theme={theme} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {dates.map((date, i) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = i === 0;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.dateItem, { backgroundColor: isSelected ? COLORS.primary : theme.card, borderColor: isSelected ? COLORS.primary : theme.border }]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateDay, { color: isSelected ? '#FFF' : theme.textSecondary }]}>
                  {isToday ? 'Today' : DAYS[date.getDay()]}
                </Text>
                <Text style={[styles.dateNum, { color: isSelected ? '#FFF' : theme.textPrimary }]}>{date.getDate()}</Text>
                <Text style={[styles.dateMonth, { color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                  {MONTHS[date.getMonth()]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slots */}
        <SectionTitle title={t('time')} theme={theme} />
        {slotsLoading ? (
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading slots...</Text>
        ) : slots.length ? (
          <View style={styles.slotsGrid}>
            {slots.map((slot, i) => {
              const isSelected = selectedTime === slot.startTime;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.slot,
                    {
                      backgroundColor: isSelected ? COLORS.primary : theme.card,
                      borderColor: isSelected ? COLORS.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedTime(slot.startTime)}
                >
                  <Text style={[styles.slotText, { color: isSelected ? '#FFF' : theme.textPrimary }]}>
                    {slot.startTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.noSlots, { color: theme.textSecondary }]}>No slots available for this date</Text>
        )}

        {/* Specialist */}
        <SectionTitle title={t('specialist')} theme={theme} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.staffScroll}>
          {/* Any option */}
          <TouchableOpacity
            style={[styles.staffItem, { backgroundColor: !selectedStaff ? COLORS.primaryBg : theme.card, borderColor: !selectedStaff ? COLORS.primary : theme.border }]}
            onPress={() => setSelectedStaff(null)}
          >
            <View style={[styles.staffAvatarWrap, { backgroundColor: COLORS.primaryBg }]}>
              <Ionicons name="person-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.staffName, { color: !selectedStaff ? COLORS.primary : theme.textPrimary }]}>Any</Text>
          </TouchableOpacity>
          {salon?.staff?.map(staff => (
            <TouchableOpacity
              key={staff._id}
              style={[styles.staffItem, { backgroundColor: selectedStaff?._id === staff._id ? COLORS.primaryBg : theme.card, borderColor: selectedStaff?._id === staff._id ? COLORS.primary : theme.border }]}
              onPress={() => setSelectedStaff(staff)}
            >
              <Image source={{ uri: staff.avatar || 'https://via.placeholder.com/60' }} style={styles.staffAvatar} />
              <Text style={[styles.staffName, { color: selectedStaff?._id === staff._id ? COLORS.primary : theme.textPrimary }]} numberOfLines={1}>
                {staff.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        {selectedServices.length > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}
            </Text>
            <Text style={[styles.totalAmount, { color: COLORS.primary }]}>₹{totalAmount}</Text>
          </View>
        )}
        <Button title={t('confirmBooking')} onPress={handleContinue} />
      </View>
    </View>
  );
}

function SectionTitle({ title, theme }) {
  return (
    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  salonBrief: { flexDirection: 'row', alignItems: 'center', margin: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.md },
  salonImg: { width: 56, height: 56, borderRadius: RADIUS.md },
  salonName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  salonAddress: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', marginHorizontal: SPACING.md, marginTop: SPACING.md, marginBottom: SPACING.sm },
  servicesList: { paddingHorizontal: SPACING.md },
  serviceItem: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1.5, padding: SPACING.md, marginBottom: SPACING.sm },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  serviceDur: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  serviceRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  servicePrice: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dateScroll: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  dateItem: { alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, minWidth: 60 },
  dateDay: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  dateNum: { fontSize: FONT_SIZE.xl, fontWeight: '800', marginVertical: 2 },
  dateMonth: { fontSize: FONT_SIZE.xs },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.md, gap: SPACING.sm },
  slot: { paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1.5 },
  slotText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  noSlots: { textAlign: 'center', paddingVertical: SPACING.lg, fontSize: FONT_SIZE.sm },
  loadingText: { textAlign: 'center', paddingVertical: SPACING.md, fontSize: FONT_SIZE.sm },
  staffScroll: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  staffItem: { alignItems: 'center', padding: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1.5, width: 80 },
  staffAvatarWrap: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  staffAvatar: { width: 54, height: 54, borderRadius: 27, marginBottom: 4 },
  staffName: { fontSize: FONT_SIZE.xs, fontWeight: '600', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.md, borderTopWidth: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  totalLabel: { fontSize: FONT_SIZE.sm },
  totalAmount: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
});
