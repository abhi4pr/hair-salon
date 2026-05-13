import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONT_SIZE, RADIUS, SPACING } from '../../theme/colors';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary | outline | ghost
  size = 'md', // sm | md | lg
  style,
  textStyle,
  icon,
}) {
  const { theme } = useTheme();

  const heights = { sm: 40, md: 50, lg: 56 };
  const fontSizes = { sm: FONT_SIZE.sm, md: FONT_SIZE.md, lg: FONT_SIZE.lg };

  const bgColor = variant === 'primary'
    ? (disabled || loading ? theme.primaryLight : theme.primary)
    : 'transparent';

  const borderColor = variant === 'outline' ? theme.primary : 'transparent';
  const textColor = variant === 'primary' ? '#FFFFFF' : theme.primary;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          height: heights[size],
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          opacity: disabled && !loading ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : theme.primary} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, { color: textColor, fontSize: fontSizes[size] }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: SPACING.sm },
  text: { fontWeight: '700', letterSpacing: 0.3 },
});
