import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import Header from '../../src/components/common/Header';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const FAQ_ITEMS = [
  { q: 'What is SalonApp?', a: 'SalonApp is a platform that connects you with top salons in your city. Book appointments, discover new services, and manage your beauty routine all in one place.' },
  { q: 'How to cancel Appointment Booking?', a: 'Go to Bookings tab → Select the booking → Tap "Cancel Booking" → Select a reason and confirm.' },
  { q: 'How to see Saved Salons?', a: 'Go to Profile tab → Tap "Saved" to see all your favorited salons.' },
  { q: 'How to Checked Pre-Booked Appointment?', a: 'Go to Bookings tab → Under "Upcoming" section you\'ll find all your pre-booked appointments.' },
  { q: 'How to check Transaction?', a: 'Go to Profile tab → Tap "Transactions" to see your complete payment history.' },
  { q: 'How to add nearby Salon?', a: 'Enable location permissions and visit the Explore tab. Nearby salons will automatically appear sorted by distance.' },
  { q: 'How to add review?', a: 'After a completed appointment, go to the salon page → Reviews tab → Tap "Add Review".' },
];

const CONTACT_ITEMS = [
  { label: 'Customer Service', icon: 'headset-outline', action: () => {} },
  { label: 'WhatsApp', icon: 'logo-whatsapp', action: () => Linking.openURL('https://wa.me/1234567890'), detail: '(480) 555-0103' },
  { label: 'Website', icon: 'globe-outline', action: () => {} },
  { label: 'Facebook', icon: 'logo-facebook', action: () => {} },
  { label: 'Instagram', icon: 'logo-instagram', action: () => {} },
];

export default function HelpCenter() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('faq');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = FAQ_ITEMS.filter(item =>
    item.q.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFaq = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('helpCenter')} />

      <View style={[styles.searchBar, { backgroundColor: theme.inputBg, margin: SPACING.md }]}>
        <Ionicons name="search-outline" size={16} color={theme.icon} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search help articles..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {['faq', 'contactUs'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: COLORS.primary, borderBottomWidth: 2.5 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? COLORS.primary : theme.textSecondary }]}>
              {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {activeTab === 'faq' ? (
          <View>
            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              {['All', 'Services', 'General', 'Account', 'Payment'].map(cat => (
                <TouchableOpacity key={cat} style={[styles.catChip, { backgroundColor: cat === 'All' ? COLORS.primary : theme.surface }]}>
                  <Text style={[styles.catText, { color: cat === 'All' ? '#FFF' : theme.textSecondary }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filtered.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.faqItem, { backgroundColor: theme.card, borderColor: expanded === index ? COLORS.primary : 'transparent' }]}
                onPress={() => toggleFaq(index)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQ, { color: theme.textPrimary }]}>{item.q}</Text>
                  <Ionicons name={expanded === index ? 'chevron-up' : 'chevron-down'} size={18} color={theme.icon} />
                </View>
                {expanded === index && (
                  <Text style={[styles.faqA, { color: theme.textSecondary }]}>{item.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.contactList}>
            {CONTACT_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.contactItem, { backgroundColor: theme.card }]}
                onPress={item.action}
              >
                <View style={[styles.contactIcon, { backgroundColor: COLORS.primaryBg }]}>
                  <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                  {item.detail && <Text style={[styles.contactDetail, { color: theme.textSecondary }]}>{item.detail}</Text>}
                </View>
                <Ionicons name="chevron-down" size={18} color={theme.icon} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, height: 44 },
  searchInput: { flex: 1, fontSize: FONT_SIZE.sm },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  scroll: { padding: SPACING.md },
  categories: { gap: SPACING.sm, marginBottom: SPACING.md },
  catChip: { paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.full },
  catText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  faqItem: { borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQ: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600', marginRight: SPACING.sm },
  faqA: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: SPACING.sm },
  contactList: { gap: SPACING.sm },
  contactItem: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md },
  contactIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  contactDetail: { fontSize: FONT_SIZE.xs, marginTop: 2 },
});
