import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LangContext';
import useAuthStore from '../../src/store/authStore';
import { userApi } from '../../src/api/user';
import Header from '../../src/components/common/Header';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

export default function EditProfile() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
      if (avatar) {
        data.append('avatar', { uri: avatar, type: 'image/jpeg', name: 'avatar.jpg' });
      }
      const res = await userApi.updateMe(data);
      await updateUser(res.data.data);
      Toast.show({ type: 'success', text1: 'Profile updated successfully' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const avatarUri = avatar || user?.avatar;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('yourProfile')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primaryBg }]}>
                <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.form, { backgroundColor: theme.card }]}>
          <Input label={t('fullName')} value={form.name} onChangeText={v => set('name', v)}
            leftIcon={<Ionicons name="person-outline" size={16} color={theme.icon} />} />
          <Input label={t('phoneNumber')} value={form.phone} onChangeText={v => set('phone', v)}
            keyboardType="phone-pad" leftIcon={<Ionicons name="call-outline" size={16} color={theme.icon} />} />
          <Input label="Email" value={form.email} onChangeText={v => set('email', v)}
            keyboardType="email-address" autoCapitalize="none" editable={false}
            leftIcon={<Ionicons name="mail-outline" size={16} color={theme.icon} />} />
          <Input label="Date of Birth" value={form.dob} onChangeText={v => set('dob', v)}
            placeholder="DD/MM/YYYY" leftIcon={<Ionicons name="calendar-outline" size={16} color={theme.icon} />} />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, { borderColor: form.gender === g ? COLORS.primary : theme.border, backgroundColor: form.gender === g ? COLORS.primaryBg : 'transparent' }]}
                onPress={() => set('gender', g)}
              >
                <Text style={[styles.genderText, { color: form.gender === g ? COLORS.primary : theme.textSecondary }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button title={loading ? 'Updating...' : t('updateProfile')} onPress={handleUpdate} loading={loading} style={styles.btn} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.lg },
  avatarWrap: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: FONT_SIZE.xxxl, fontWeight: '800' },
  editBadge: { position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  form: { borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: SPACING.sm },
  genderRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  genderBtn: { flex: 1, height: 40, borderRadius: RADIUS.full, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  genderText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  btn: { marginTop: SPACING.sm },
});
