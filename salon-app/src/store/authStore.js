import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  init: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userStr = await SecureStore.getItemAsync('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, refreshToken, user, isAuthenticated: true });
      }
    } catch {}
    set({ isLoading: false });
  },

  setAuth: async ({ token, refreshToken, user }) => {
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('refreshToken', refreshToken || '');
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ token, refreshToken, user, isAuthenticated: true });
  },

  updateUser: async (user) => {
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {}
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
