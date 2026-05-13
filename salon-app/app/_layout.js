import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { LangProvider } from '../src/context/LangContext';
import useAuthStore from '../src/store/authStore';

function AppContent() {
  const { theme, isDark } = useTheme();
  const init = useAuthStore(s => s.init);

  useEffect(() => { init(); }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
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
        <Stack.Screen name="help/index" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
      <Toast />
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
