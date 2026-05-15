import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, LayoutAnimation, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import Header from '../../src/components/common/Header';
import Button from '../../src/components/common/Button';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const FAQ_ITEMS = [
  { q: 'What is SalonApp?', a: 'SalonApp is a platform that connects you with top salons in your city. Book appointments, discover new services, and manage your beauty routine all in one place.' },
  { q: 'How to cancel Appointment Booking?', a: 'Go to Bookings tab → Select the booking → Tap "Cancel Booking" → Select a reason and confirm.' },
  { q: 'How to see Saved Salons?', a: 'Go to Profile tab → Tap "Saved" to see all your favorited salons.' },
  { q: 'How to Checked Pre-Booked Appointment?', a: "Go to Bookings tab → Under \"Upcoming\" section you'll find all your pre-booked appointments." },
  { q: 'How to check Transaction?', a: 'Go to Profile tab → Tap "Transactions" to see your complete payment history.' },
  { q: 'How to add nearby Salon?', a: 'Enable location permissions and visit the Explore tab. Nearby salons will automatically appear sorted by distance.' },
  { q: 'How to add review?', a: 'After a completed appointment, go to the salon page → Reviews tab → Tap "Add Review".' },
];

export default function HelpCenter() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('faq');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const [queryForm, setQueryForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const filtered = FAQ_ITEMS.filter(item =>
    item.q.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFaq = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === index ? null : index);
  };

  const handleSendQuery = async () => {
    if (!queryForm.name.trim() || !queryForm.email.trim() || !queryForm.message.trim()) {
      Alert.alert('Missing Info', 'Please fill in name, email and message.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(queryForm.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setSending(true);
    const subject = encodeURIComponent(queryForm.subject || 'SalonApp Support Query');
    const body = encodeURIComponent(
      `Name: ${queryForm.name}\nEmail: ${queryForm.email}\n\n${queryForm.message}`
    );
    const mailto = `mailto:support@salonapp.com?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(mailto);
      setQueryForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      Alert.alert('Error', 'Could not open email client.');
    }
    setSending(false);
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
          <View>
            <View style={[styles.queryCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.queryTitle, { color: theme.textPrimary }]}>Send us a message</Text>
              <Text style={[styles.querySubtitle, { color: theme.textSecondary }]}>
                We typically respond within 24 hours
              </Text>

              <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={16} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Your Name"
                  placeholderTextColor={theme.placeholder}
                  value={queryForm.name}
                  onChangeText={v => setQueryForm(f => ({ ...f, name: v }))}
                />
              </View>

              <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="mail-outline" size={16} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Your Email"
                  placeholderTextColor={theme.placeholder}
                  value={queryForm.email}
                  onChangeText={v => setQueryForm(f => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name="help-circle-outline" size={16} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Subject (optional)"
                  placeholderTextColor={theme.placeholder}
                  value={queryForm.subject}
                  onChangeText={v => setQueryForm(f => ({ ...f, subject: v }))}
                />
              </View>

              <View style={[styles.textAreaWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.textArea, { color: theme.textPrimary }]}
                  placeholder="Describe your query or issue..."
                  placeholderTextColor={theme.placeholder}
                  value={queryForm.message}
                  onChangeText={v => setQueryForm(f => ({ ...f, message: v }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <Button
                title={sending ? 'Opening email...' : 'Send Message'}
                onPress={handleSendQuery}
                loading={sending}
                style={{ marginTop: SPACING.sm }}
              />
            </View>

            <View style={[styles.contactCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.queryTitle, { color: theme.textPrimary }]}>Other ways to reach us</Text>
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL('https://wa.me/1234567890')}
              >
                <View style={[styles.contactIcon, { backgroundColor: COLORS.primaryBg }]}>
                  <Ionicons name="logo-whatsapp" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>WhatsApp</Text>
                  <Text style={[styles.contactDetail, { color: theme.textSecondary }]}>(480) 555-0103</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.icon} />
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL('mailto:support@salonapp.com')}
              >
                <View style={[styles.contactIcon, { backgroundColor: COLORS.primaryBg }]}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>Email Support</Text>
                  <Text style={[styles.contactDetail, { color: theme.textSecondary }]}>support@salonapp.com</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.icon} />
              </TouchableOpacity>
            </View>
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
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  categories: { gap: SPACING.sm, marginBottom: SPACING.md },
  catChip: { paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.full },
  catText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  faqItem: { borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQ: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600', marginRight: SPACING.sm },
  faqA: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: SPACING.sm },
  queryCard: { borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, elevation: 2, shadowOpacity: 0.06, shadowRadius: 8 },
  queryTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 4 },
  querySubtitle: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, height: 48, marginBottom: SPACING.sm },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontSize: FONT_SIZE.md },
  textAreaWrap: { borderWidth: 1.5, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, minHeight: 100 },
  textArea: { flex: 1, fontSize: FONT_SIZE.md },
  contactCard: { borderRadius: RADIUS.xl, padding: SPACING.lg, elevation: 2, shadowOpacity: 0.06, shadowRadius: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  contactIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  contactDetail: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  divider: { height: 1, marginVertical: 4 },
});
