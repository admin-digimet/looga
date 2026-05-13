'use client';

import { create } from 'zustand';
import { TOKEN_KEY, REFRESH_KEY, USER_KEY } from '@/lib/constants';
import type { User } from '@/types';

function lsGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function lsSet(key: string, value: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

function lsDel(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
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
    lsSet(TOKEN_KEY, token);
    if (refreshToken) lsSet(REFRESH_KEY, refreshToken);
    lsSet(USER_KEY, JSON.stringify(user));
    set({ token, refreshToken: refreshToken ?? null, user, isAuthenticated: true });
  },

  logout: async () => {
    lsDel(TOKEN_KEY);
    lsDel(REFRESH_KEY);
    lsDel(USER_KEY);
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  loadToken: async () => {
    try {
      const token = lsGet(TOKEN_KEY);
      const refreshToken = lsGet(REFRESH_KEY);
      if (token) {
        const userRaw = lsGet(USER_KEY);
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
