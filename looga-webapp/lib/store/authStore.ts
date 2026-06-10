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
  refreshSession: () => Promise<boolean>;
  getFreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

  refreshSession: async () => {
    const refreshToken = lsGet(REFRESH_KEY);
    if (!refreshToken) return false;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      lsSet(TOKEN_KEY, data.access_token);
      if (data.refresh_token) lsSet(REFRESH_KEY, data.refresh_token);
      set({ token: data.access_token, refreshToken: data.refresh_token ?? refreshToken });
      return true;
    } catch {
      return false;
    }
  },

  getFreshToken: async () => {
    const { token, refreshSession } = get();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp < Math.floor(Date.now() / 1000);
      if (!isExpired) return token;
      const ok = await refreshSession();
      return ok ? get().token : null;
    } catch {
      return token;
    }
  },
}));
