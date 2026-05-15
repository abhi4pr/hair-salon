import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "../../src/context/ThemeContext";
import { useLanguage } from "../../src/context/LangContext";
import useAuthStore from "../../src/store/authStore";
import { COLORS, FONT_SIZE, RADIUS, SPACING } from "../../src/theme/colors";

const MENU_ITEMS = [
  { key: "yourProfile", icon: "person-outline", route: "/profile/edit" },
  {
    key: "paymentMethods",
    icon: "card-outline",
    route: "/profile/payment-methods",
  },
  { key: "saved", icon: "heart-outline", route: "/profile/favorites" },
  {
    key: "loyaltyPointsTitle",
    icon: "gift-outline",
    route: "/profile/loyalty",
  },
  { key: "settings", icon: "settings-outline", route: "/profile/settings" },
  {
    key: "transactions",
    icon: "receipt-outline",
    route: "/profile/transactions",
  },
  { key: "helpCenter", icon: "help-circle-outline", route: "/help/index" },
  {
    key: "privacyPolicy",
    icon: "shield-checkmark-outline",
    route: "/help/privacy",
  },
];

export default function Profile() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t("profile")}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <TouchableOpacity
          style={[
            styles.userCard,
            { backgroundColor: theme.card, shadowColor: theme.shadow },
          ]}
          onPress={() => router.push("/profile/edit")}
          activeOpacity={0.9}
        >
          <View style={styles.avatarWrap}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: COLORS.primaryBg },
                ]}
              >
                <Text style={[styles.avatarInitial, { color: COLORS.primary }]}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <View
              style={[styles.editBadge, { backgroundColor: COLORS.primary }]}
            >
              <Ionicons name="pencil" size={10} color="#FFF" />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              {user?.name}
            </Text>
            <Text
              style={[styles.userEmail, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {user?.email}
            </Text>
            <Text style={[styles.userPhone, { color: theme.textSecondary }]}>
              {user?.phone}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>

        {/* Quick Stats */}
        <View
          style={[
            styles.statsRow,
            { backgroundColor: theme.card, shadowColor: theme.shadow },
          ]}
        >
          <StatItem
            label="Points"
            value={user?.loyaltyPoints || 0}
            theme={theme}
          />
          <View
            style={[styles.statDivider, { backgroundColor: theme.border }]}
          />
          <StatItem
            label="Wallet"
            value={`₹${user?.walletBalance || 0}`}
            theme={theme}
          />
          <View
            style={[styles.statDivider, { backgroundColor: theme.border }]}
          />
          <StatItem
            label="Saved"
            value={user?.favoriteSalons?.length || 0}
            theme={theme}
          />
        </View>

        {/* Menu */}
        <View
          style={[
            styles.menuCard,
            { backgroundColor: theme.card, shadowColor: theme.shadow },
          ]}
        >
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.menuIcon, { backgroundColor: theme.surface }]}
              >
                <Ionicons name={item.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t(item.key)}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.icon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme Toggle */}
        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: theme.card,
              shadowColor: theme.shadow,
              marginTop: SPACING.sm,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.surface }]}>
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={18}
                color={COLORS.primary}
              />
            </View>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
              {t("darkMode")}
            </Text>
            <View
              style={[
                styles.toggle,
                { backgroundColor: isDark ? COLORS.primary : theme.border },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  { transform: [{ translateX: isDark ? 20 : 2 }] },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            { backgroundColor: theme.card, shadowColor: theme.shadow },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#FFF0F0" }]}>
            <Ionicons name="log-out-outline" size={18} color={theme.error} />
          </View>
          <Text style={[styles.menuLabel, { color: theme.error }]}>
            {t("logout")}
          </Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, theme }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: COLORS.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: "800" },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: { position: "relative", marginRight: SPACING.md },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: FONT_SIZE.xxl, fontWeight: "800" },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: { flex: 1 },
  userName: { fontSize: FONT_SIZE.lg, fontWeight: "700" },
  userEmail: { fontSize: FONT_SIZE.sm, marginTop: 2 },
  userPhone: { fontSize: FONT_SIZE.sm, marginTop: 1 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: "800" },
  statLabel: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  statDivider: { width: 1, marginVertical: 4 },
  menuCard: {
    margin: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  menuItem: { flexDirection: "row", alignItems: "center", padding: SPACING.md },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  menuLabel: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: "500" },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: "center" },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
