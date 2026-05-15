import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import Header from '../../src/components/common/Header';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../src/theme/colors';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly to us, such as when you create an account, book an appointment, or contact us for support. This includes your name, email address, phone number, and location data.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use the information we collect to provide, maintain, and improve our services, process bookings and transactions, send you notifications and updates, and personalize your experience.',
  },
  {
    title: '3. Information Sharing',
    body: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as necessary to provide our services (e.g., sharing booking details with the relevant salon).',
  },
  {
    title: '4. Data Security',
    body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
  },
  {
    title: '5. Location Data',
    body: 'With your permission, we collect your location to show nearby salons and provide relevant recommendations. You can disable location access in your device settings at any time.',
  },
  {
    title: '6. Cookies and Tracking',
    body: 'We may use analytics tools to understand how users interact with the app. This data is aggregated and anonymized and is used solely to improve our services.',
  },
  {
    title: '7. Your Rights',
    body: 'You have the right to access, update, or delete your personal data at any time. You can do this through your profile settings or by contacting our support team.',
  },
  {
    title: '8. Children\'s Privacy',
    body: 'Our service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the date at the top of this page or sending an in-app notification.',
  },
  {
    title: '10. Contact Us',
    body: 'If you have any questions about this Privacy Policy or our data practices, please contact us at support@salonapp.com.',
  },
];

export default function PrivacyPolicy() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Privacy Policy" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.updated, { color: theme.textSecondary }]}>Last updated: May 2025</Text>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          At SalonApp, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, and protect your personal information when you use our app.
        </Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            By using SalonApp, you agree to the collection and use of information in accordance with this policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  updated: { fontSize: FONT_SIZE.xs, marginBottom: SPACING.sm },
  intro: { fontSize: FONT_SIZE.sm, lineHeight: 22, marginBottom: SPACING.md },
  section: { borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, elevation: 1, shadowOpacity: 0.04, shadowRadius: 4 },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: SPACING.xs },
  sectionBody: { fontSize: FONT_SIZE.sm, lineHeight: 22 },
  footer: { marginTop: SPACING.md, padding: SPACING.md },
  footerText: { fontSize: FONT_SIZE.xs, lineHeight: 18, textAlign: 'center' },
});
