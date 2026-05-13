import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FONT_SIZE, RADIUS, SPACING } from '../../theme/colors';

export default function Input({
  label,
  error,
  secureTextEntry,
  rightIcon,
  leftIcon,
  containerStyle,
  inputStyle,
  ...props
}) {
  const { theme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      )}
      <View style={[
        styles.inputRow,
        {
          backgroundColor: theme.inputBg,
          borderColor: error ? theme.error : theme.border,
        },
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: theme.textPrimary, flex: 1 },
            inputStyle,
          ]}
          placeholderTextColor={theme.placeholder}
          secureTextEntry={isPassword ? !showPass : false}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.icon}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <View style={styles.eyeBtn}>{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: SPACING.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
  },
  input: { fontSize: FONT_SIZE.md, paddingVertical: SPACING.sm },
  leftIcon: { marginRight: SPACING.sm },
  eyeBtn: { padding: SPACING.xs },
  error: { fontSize: FONT_SIZE.xs, marginTop: 4 },
});
