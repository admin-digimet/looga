import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/lib/store/authStore';

const TOKEN_KEY = 'looga_scan_token';

const webStore: Record<string, string> = {};

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') return webStore[TOKEN_KEY] ?? null;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout();
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  }
);
