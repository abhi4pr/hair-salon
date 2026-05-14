import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { useLanguage } from "../../src/context/LangContext";
import { authApi } from "../../src/api/auth";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import { COLORS, FONT_SIZE, RADIUS, SPACING } from "../../src/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Register() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(form.phone)) e.phone = "Enter 10-digit phone";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      });
      Toast.show({
        type: "success",
        text1: "Registration successful",
        text2: "Please verify your email",
      });
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: form.email.trim().toLowerCase() },
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
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
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + SPACING.md },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, shadowColor: theme.shadow },
          ]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {t("createAccount")}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join thousands of happy customers
          </Text>

          <Input
            placeholder={t("fullName")}
            value={form.name}
            onChangeText={(v) => set("name", v)}
            error={errors.name}
            leftIcon={
              <Ionicons name="person-outline" size={18} color={theme.icon} />
            }
          />
          <Input
            placeholder={t("emailPlaceholder")}
            value={form.email}
            onChangeText={(v) => set("email", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={
              <Ionicons name="mail-outline" size={18} color={theme.icon} />
            }
          />
          <Input
            placeholder={t("phoneNumber")}
            value={form.phone}
            onChangeText={(v) => set("phone", v)}
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon={
              <Ionicons name="call-outline" size={18} color={theme.icon} />
            }
          />

          <View
            style={[
              styles.pickerWrapper,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBg || theme.background,
              },
            ]}
          >
            <Ionicons
              name="chevron-down-outline"
              size={16}
              color={theme.textSecondary}
              style={styles.pickerIcon}
            />
            <Picker
              selectedValue={form.role}
              onValueChange={(v) => set("role", v)}
              style={[styles.picker, { color: theme.textPrimary }]}
              dropdownIconColor="transparent"
            >
              <Picker.Item label="Customer" value="customer" />
              <Picker.Item label="Salon Owner" value="salon_owner" />
            </Picker>
          </View>

          <Input
            placeholder={t("passwordPlaceholder")}
            value={form.password}
            onChangeText={(v) => set("password", v)}
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
          <Input
            placeholder={t("confirmPasswordPlaceholder")}
            value={form.confirmPassword}
            onChangeText={(v) => set("confirmPassword", v)}
            secureTextEntry
            error={errors.confirmPassword}
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={theme.icon}
              />
            }
          />

          <Button
            title={loading ? t("creatingAccount") : t("createAccount")}
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
          />
        </View>

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: theme.textSecondary }]}>
            {t("alreadyHaveAccount")}{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={[styles.loginLink, { color: COLORS.primary }]}>
              {t("signIn")}
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
  back: { marginBottom: SPACING.md, padding: 4, alignSelf: "flex-start" },
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
  roleLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    marginTop: SPACING.sm,
    marginBottom: 8,
  },
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
    overflow: "hidden",
  },
  pickerIcon: {
    position: "absolute",
    right: SPACING.sm,
    zIndex: 1,
    pointerEvents: "none",
  },
  picker: { flex: 1, height: 50 },
  btn: { marginTop: SPACING.sm },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  loginText: { fontSize: FONT_SIZE.md },
  loginLink: { fontSize: FONT_SIZE.md, fontWeight: "700" },
});
