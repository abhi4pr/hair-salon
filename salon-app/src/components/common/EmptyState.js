import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';
import { SPACING, FONT_SIZE } from '../../theme/colors';

export default function EmptyState({ icon = 'calendar-outline', title, subtitle, actionLabel, onAction }) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: theme.primaryBg }]}>
        <Ionicons name={icon} size={48} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      {actionLabel && (
        <Button title={actionLabel} onPress={onAction} style={styles.btn} size="md" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  iconBg: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.lg, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.lg },
  btn: { marginTop: SPACING.md, minWidth: 180 },
});
