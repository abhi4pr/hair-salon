import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';

export function FullScreenLoader({ visible, text }) {
  const { theme } = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {text && <Text style={[styles.text, { color: theme.textSecondary }]}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
}

export function InlineLoader({ size = 'small', color }) {
  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={color || COLORS.primary} />
    </View>
  );
}

export function PageLoader() {
  return (
    <View style={styles.page}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 120,
    gap: 12,
  },
  text: { fontSize: 14, marginTop: 8 },
  inline: { padding: 16, alignItems: 'center' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
