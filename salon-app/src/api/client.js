import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://hair-salon-opal.vercel.app/api"; // Android emulator localhost

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        const newToken = res.data.data?.token;
        if (newToken) {
          await SecureStore.setItemAsync("token", newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original);
        }
      } catch {}
    }
    return Promise.reject(error);
  },
);

export default client;
