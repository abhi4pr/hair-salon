import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { authApi } from '../../src/api/auth';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPassword() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your email' });
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      setSent(true);
      Toast.show({ type: 'success', text1: 'Email Sent', text2: 'Check your inbox for reset instructions' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to send' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top + SPACING.md }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconBg, { backgroundColor: COLORS.primaryBg }]}>
          <Ionicons name={sent ? 'checkmark-circle-outline' : 'key-outline'} size={48} color={COLORS.primary} />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('forgotPasswordTitle')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {sent ? 'Password reset link has been sent to your email. Please check your inbox.' : t('forgotPasswordSubtitle')}
        </Text>

        {!sent && (
          <>
            <Input
              placeholder={t('emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={18} color={theme.icon} />}
              containerStyle={styles.input}
            />
            <Button
              title={loading ? t('sending') : t('sendResetLink')}
              onPress={handleSend}
              loading={loading}
              style={styles.btn}
            />
          </>
        )}

        {sent && (
          <Button title="Back to Login" onPress={() => router.push('/(auth)/login')} style={styles.btn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.md },
  back: { marginBottom: SPACING.xl, padding: 4, alignSelf: 'flex-start' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -100 },
  iconBg: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: SPACING.sm, textAlign: 'center' },
  subtitle: { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl, paddingHorizontal: SPACING.md },
  input: { width: '100%', marginBottom: SPACING.sm },
  btn: { width: '100%' },
});
