import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FONT_SIZE, SPACING } from '../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ title, showBack = true, rightComponent, transparent }) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top + SPACING.sm,
        backgroundColor: transparent ? 'transparent' : theme.background,
        borderBottomColor: transparent ? 'transparent' : theme.border,
        borderBottomWidth: transparent ? 0 : 1,
      },
    ]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: SPACING.sm, paddingHorizontal: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 8, marginRight: 4 },
  title: { flex: 1, fontSize: FONT_SIZE.lg, fontWeight: '700', textAlign: 'center' },
  right: { minWidth: 40, alignItems: 'flex-end' },
  placeholder: { width: 40 },
});
