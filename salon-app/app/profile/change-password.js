import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import { userApi } from '../../src/api/user';
import Header from '../../src/components/common/Header';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { SPACING, RADIUS } from '../../src/theme/colors';

export default function ChangePassword() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleChange = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    if (form.newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    try {
      await userApi.changePassword({ oldPassword: form.currentPassword, newPassword: form.newPassword });
      Toast.show({ type: 'success', text1: 'Password changed successfully' });
      router.back();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('changePassword')} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.form, { backgroundColor: theme.card }]}>
          <Input
            label="Current Password"
            value={form.currentPassword}
            onChangeText={v => set('currentPassword', v)}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={16} color={theme.icon} />}
          />
          <Input
            label="New Password"
            value={form.newPassword}
            onChangeText={v => set('newPassword', v)}
            secureTextEntry
            leftIcon={<Ionicons name="lock-open-outline" size={16} color={theme.icon} />}
          />
          <Input
            label="Confirm New Password"
            value={form.confirmPassword}
            onChangeText={v => set('confirmPassword', v)}
            secureTextEntry
            leftIcon={<Ionicons name="lock-open-outline" size={16} color={theme.icon} />}
          />
        </View>
        <Button title={loading ? 'Changing...' : 'Change Password'} onPress={handleChange} loading={loading} style={styles.btn} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md },
  form: { borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md },
  btn: {},
});
