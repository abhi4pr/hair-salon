import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { LangProvider } from '../src/context/LangContext';
import useAuthStore from '../src/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { theme, isDark } = useTheme();
  const init = useAuthStore(s => s.init);
  const isLoading = useAuthStore(s => s.isLoading);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(owner-tabs)" />
        <Stack.Screen name="salon/[id]" />
        <Stack.Screen name="booking/[salonId]" />
        <Stack.Screen name="booking/payment" />
        <Stack.Screen name="booking/confirmation" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/addresses" />
        <Stack.Screen name="profile/favorites" />
        <Stack.Screen name="profile/transactions" />
        <Stack.Screen name="profile/loyalty" />
        <Stack.Screen name="profile/settings" />
        <Stack.Screen name="profile/change-password" />
        <Stack.Screen name="help" />
        <Stack.Screen name="help/privacy" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
      <Toast position="bottom" bottomOffset={70} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LangProvider>
            <AppContent />
          </LangProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
