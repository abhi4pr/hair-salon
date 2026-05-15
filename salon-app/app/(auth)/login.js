import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { useLanguage } from "../../src/context/LangContext";
import useAuthStore from "../../src/store/authStore";
import { authApi } from "../../src/api/auth";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import { COLORS, FONT_SIZE, RADIUS, SPACING } from "../../src/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const setAuth = useAuthStore((s) => s.setAuth);
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });
      const { token, refreshToken, user } = res.data.data;
      await setAuth({ token, refreshToken, user });
      Toast.show({
        type: "success",
        text1: "Loggedin successful",
      });
      router.replace(
        user?.role === "salon_owner" ? "/(owner-tabs)" : "/(tabs)",
      );
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      Toast.show({ type: "error", text1: "Error", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <View
            style={[styles.logoCircle, { backgroundColor: COLORS.primaryBg }]}
          >
            <Ionicons name="cut" size={44} color={COLORS.primary} />
          </View>
          <Text style={[styles.appName, { color: COLORS.primary }]}>
            SalonApp
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, shadowColor: theme.shadow },
          ]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {t("welcomeBack")}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t("signInToContinue")}
          </Text>

          <Input
            placeholder={t("emailPlaceholder")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            leftIcon={
              <Ionicons name="mail-outline" size={18} color={theme.icon} />
            }
            containerStyle={styles.inputGap}
          />

          <Input
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={theme.icon}
              />
            }
          />

          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={[styles.forgotText, { color: COLORS.primary }]}>
              {t("forgotPassword")}?
            </Text>
          </TouchableOpacity>

          <Button
            title={loading ? t("signingIn") : t("signIn")}
            onPress={handleLogin}
            loading={loading}
            style={styles.btn}
          />
        </View>

        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: theme.textSecondary }]}>
            {t("dontHaveAccount")}{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.signupLink, { color: COLORS.primary }]}>
              {t("signUp")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  logoWrap: { alignItems: "center", marginBottom: SPACING.xl },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  appName: { fontSize: FONT_SIZE.xxl, fontWeight: "800", letterSpacing: 1 },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: FONT_SIZE.md, marginBottom: SPACING.lg },
  inputGap: { marginTop: SPACING.xs },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: SPACING.lg,
    marginTop: -SPACING.sm,
  },
  forgotText: { fontSize: FONT_SIZE.sm, fontWeight: "600" },
  btn: { marginTop: SPACING.xs },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  signupText: { fontSize: FONT_SIZE.md },
  signupLink: { fontSize: FONT_SIZE.md, fontWeight: "700" },
});
