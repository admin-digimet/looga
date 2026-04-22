import { Platform } from 'react-native';
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import { storage } from './mmkv';
import type { User } from '@/types/user';

const TOKEN_KEY = 'looga_auth_token';
const REFRESH_KEY = 'looga_auth_refresh';
const USER_KEY = 'looga_auth_user';

// expo-secure-store ne fonctionne pas sur web — fallback en mémoire
const webStore: Record<string, string> = {};

async function storeSet(key: string, value: string) {
  if (Platform.OS === 'web') { webStore[key] = value; return; }
  await SecureStore.setItemAsync(key, value);
}

async function storeGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return webStore[key] ?? null;
  return SecureStore.getItemAsync(key);
}

async function storeDelete(key: string) {
  if (Platform.OS === 'web') { delete webStore[key]; return; }
  await SecureStore.deleteItemAsync(key);
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token, user, refreshToken) => {
    await storeSet(TOKEN_KEY, token);
    if (refreshToken) {
      await storeSet(REFRESH_KEY, refreshToken);
    }
    storage.set(USER_KEY, JSON.stringify(user));
    set({ token, refreshToken: refreshToken ?? null, user, isAuthenticated: true });
  },

  logout: async () => {
    await storeDelete(TOKEN_KEY);
    await storeDelete(REFRESH_KEY);
    storage.delete(USER_KEY);
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  loadToken: async () => {
    try {
      const token = await storeGet(TOKEN_KEY);
      const refreshToken = await storeGet(REFRESH_KEY);
      if (token) {
        // Restaurer le user depuis MMKV (pas de call réseau au démarrage)
        const userRaw = storage.getString(USER_KEY);
        const restoredUser = userRaw ? (JSON.parse(userRaw) as User) : null;
        set({ token, refreshToken, user: restoredUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
