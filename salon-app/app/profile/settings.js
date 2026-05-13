import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import Header from '../../src/components/common/Header';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

export default function Settings() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, lang, changeLanguage } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('settings')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Appearance */}
        <SectionTitle title="Appearance" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{t('darkMode')}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: COLORS.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Language */}
        <SectionTitle title={t('language')} theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {[{ key: 'en', label: t('english'), native: 'English' }, { key: 'hi', label: t('hindi'), native: 'हिंदी' }].map((lng, i) => (
            <TouchableOpacity
              key={lng.key}
              style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: theme.border }]}
              onPress={() => changeLanguage(lng.key)}
            >
              <View>
                <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{lng.label}</Text>
                <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{lng.native}</Text>
              </View>
              <View style={[styles.radio, { borderColor: lang === lng.key ? COLORS.primary : theme.border }]}>
                {lang === lng.key && <View style={[styles.radioDot, { backgroundColor: COLORS.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <SectionTitle title={t('notifications')} theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{t('pushNotifications')}</Text>
            <Switch value={true} trackColor={{ false: theme.border, true: COLORS.primary }} thumbColor="#FFF" />
          </View>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.border }]}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{t('emailNotifications')}</Text>
            <Switch value={true} trackColor={{ false: theme.border, true: COLORS.primary }} thumbColor="#FFF" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, theme }) {
  return <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.md },
  card: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  rowLabel: { fontSize: FONT_SIZE.md, fontWeight: '500' },
  rowSub: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
});
