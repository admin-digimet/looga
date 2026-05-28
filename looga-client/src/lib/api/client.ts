import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/lib/store/authStore';

const TOKEN_KEY   = 'looga_auth_token';
const REFRESH_KEY = 'looga_auth_refresh';
const ANON_KEY    = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    apikey: ANON_KEY,
  },
  timeout: 15000,
});

// Intercepteur request → ajoute le Bearer token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  config.headers.Authorization = `Bearer ${token ?? ANON_KEY}`;
  return config;
});

// --- Refresh token silencieux ---
// Évite plusieurs appels refresh simultanés : le premier rafraîchit,
// les autres attendent et relancent avec le nouveau token.
let isRefreshing = false;
let waitingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, newToken: string | null) {
  waitingQueue.forEach(({ resolve, reject }) => {
    if (newToken) resolve(newToken);
    else reject(error);
  });
  waitingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshToken) throw new Error('No refresh token');

  // Appel direct à Supabase (pas via apiClient pour éviter les boucles infinies)
  const { data } = await axios.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    { refresh_token: refreshToken },
    { headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' } }
  );

  const newToken: string = data.access_token;
  const newRefresh: string = data.refresh_token;

  // Sauvegarder les nouveaux tokens
  await SecureStore.setItemAsync(TOKEN_KEY, newToken);
  await SecureStore.setItemAsync(REFRESH_KEY, newRefresh);

  // Mettre à jour le store Zustand
  useAuthStore.setState({ token: newToken, refreshToken: newRefresh });

  return newToken;
}

// Intercepteur response → refresh automatique sur 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest?.url ?? '';
    const status: number = error.response?.status;

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/v1/token');

    // 401 sur une vraie route → tenter le refresh
    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // D'autres requêtes attendent déjà — les mettre en file
        return new Promise((resolve, reject) => {
          waitingQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh échoué → déconnexion (token expiré et non renouvelable)
        processQueue(refreshError, null);
        if (__DEV__) console.warn('[API] Refresh échoué — déconnexion');
        await useAuthStore.getState().logout();
        router.replace('/(tabs)');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (__DEV__ && status >= 500) {
      console.error('[API] Erreur serveur', status, url);
    } else if (__DEV__ && !error.response) {
      console.error('[API] Erreur réseau', error.message, url);
    }

    return Promise.reject(error);
  }
);
