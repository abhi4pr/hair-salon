import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import useAuthStore from '../../src/store/authStore';
import { authApi } from '../../src/api/auth';
import Button from '../../src/components/common/Button';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VerifyOTP() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const setAuth = useAuthStore(s => s.setAuth);
  const insets = useSafeAreaInsets();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const refs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyPress = ({ nativeEvent }, idx) => {
    if (nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter complete OTP' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOTP({ email, otp: code });
      const { token, refreshToken, user } = res.data.data;
      await setAuth({ token, refreshToken, user });
      Toast.show({ type: 'success', text1: 'Verified!', text2: 'Welcome to SalonApp' });
      router.replace('/(tabs)');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Invalid OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await authApi.resendOTP({ email });
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      Toast.show({ type: 'success', text1: 'OTP Sent', text2: 'New OTP sent to your email' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to resend' });
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top + SPACING.md }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconBg, { backgroundColor: COLORS.primaryBg }]}>
          <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.primary} />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('otpVerification')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('otpSentTo')}
        </Text>
        <Text style={[styles.email, { color: theme.textPrimary }]}>{email}</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => (refs.current[idx] = r)}
              style={[
                styles.otpBox,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: digit ? COLORS.primary : theme.border,
                  color: theme.textPrimary,
                },
              ]}
              value={digit}
              onChangeText={v => handleChange(v, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <Button title={loading ? t('verifying') : t('verify')} onPress={handleVerify} loading={loading} style={styles.btn} />

        <View style={styles.resendRow}>
          <Text style={[styles.resendText, { color: theme.textSecondary }]}>
            Didn't receive code?{' '}
          </Text>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resending}>
            <Text style={[styles.resendLink, { color: timer > 0 ? theme.textSecondary : COLORS.primary }]}>
              {timer > 0 ? `Resend in ${timer}s` : t('resendOtp')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.md },
  back: { marginBottom: SPACING.xl, padding: 4, alignSelf: 'flex-start' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -80 },
  iconBg: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZE.md, textAlign: 'center' },
  email: { fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: SPACING.xl },
  otpRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  otpBox: { width: 48, height: 56, borderRadius: RADIUS.md, borderWidth: 1.5, fontSize: FONT_SIZE.xl, fontWeight: '700' },
  btn: { width: '100%', marginBottom: SPACING.lg },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontSize: FONT_SIZE.sm },
  resendLink: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
});
