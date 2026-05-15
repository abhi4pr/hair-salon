import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import useAuthStore from '../../src/store/authStore';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/theme/colors';

const OWNER_MENU = [
  { label: 'Edit Profile', icon: 'person-outline', route: '/profile/edit' },
  { label: 'My Salon', icon: 'storefront-outline', route: '/profile/my-salon' },
  { label: 'Language', icon: 'language-outline', route: '/profile/settings' },
  { label: 'Settings', icon: 'settings-outline', route: '/profile/settings' },
  { label: 'Change Password', icon: 'lock-closed-outline', route: '/profile/change-password' },
  { label: 'Help Center', icon: 'help-circle-outline', route: '/help/index' },
  { label: 'Privacy Policy', icon: 'shield-checkmark-outline', route: '/help/privacy' },
];

export default function OwnerProfile() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
        <View style={[styles.ownerBadge, { backgroundColor: COLORS.primaryBg }]}>
          <Ionicons name="storefront-outline" size={12} color={COLORS.primary} />
          <Text style={[styles.ownerBadgeText, { color: COLORS.primary }]}>Salon Owner</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <TouchableOpacity
          style={[styles.userCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.9}
        >
          <View style={styles.avatarWrap}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primaryBg }]}>
                <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                </Text>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="pencil" size={10} color="#FFF" />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name}</Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]} numberOfLines={1}>{user?.email}</Text>
            <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{user?.phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          {OWNER_MENU.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < OWNER_MENU.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: theme.surface }]}>
                <Ionicons name={item.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.icon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.menuCard, { backgroundColor: theme.card, shadowColor: theme.shadow, marginTop: SPACING.sm }]}>
          <TouchableOpacity style={styles.menuItem} onPress={toggleTheme} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: theme.surface }]}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={COLORS.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
            <View style={[styles.toggle, { backgroundColor: isDark ? COLORS.primary : theme.border }]}>
              <View style={[styles.toggleKnob, { transform: [{ translateX: isDark ? 20 : 2 }] }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#FFF0F0' }]}>
            <Ionicons name="log-out-outline" size={18} color={theme.error} />
          </View>
          <Text style={[styles.menuLabel, { color: theme.error }]}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  ownerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  ownerBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  userCard: { flexDirection: 'row', alignItems: 'center', margin: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.md, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatarWrap: { position: 'relative', marginRight: SPACING.md },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  userName: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  userEmail: { fontSize: FONT_SIZE.sm, marginTop: 2 },
  userPhone: { fontSize: FONT_SIZE.sm, marginTop: 1 },
  menuCard: { margin: SPACING.md, marginTop: SPACING.md, borderRadius: RADIUS.xl, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  menuLabel: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '500' },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', margin: SPACING.md, marginTop: 0, borderRadius: RADIUS.xl, padding: SPACING.md, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
});
