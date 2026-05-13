import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LangContext';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../theme/colors';

const CATEGORIES = [
  { key: 'haircuts', icon: 'cut-outline', color: '#FFE4E4' },
  { key: 'makeup', icon: 'color-palette-outline', color: '#FFE8F0' },
  { key: 'shaving', icon: 'man-outline', color: '#E4F0FF' },
  { key: 'massage', icon: 'hand-left-outline', color: '#E4FFE8' },
  { key: 'nails', icon: 'finger-print-outline', color: '#FFF4E4' },
  { key: 'facial', icon: 'happy-outline', color: '#F0E4FF' },
  { key: 'waxing', icon: 'sparkles-outline', color: '#FFEDE4' },
  { key: 'coloring', icon: 'brush-outline', color: '#E4FAFF' },
];

export default function ServiceCategories({ onSelect }) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.key}
          style={styles.item}
          onPress={() => onSelect?.(cat.key)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBg, { backgroundColor: cat.color }]}>
            <Ionicons name={cat.icon} size={26} color={COLORS.primary} />
          </View>
          <Text style={[styles.label, { color: theme.textPrimary }]}>{t(cat.key)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.md },
  item: { alignItems: 'center', marginRight: SPACING.md, width: 68 },
  iconBg: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  label: { fontSize: FONT_SIZE.xs, fontWeight: '600', textAlign: 'center' },
});
