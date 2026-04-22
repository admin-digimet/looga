import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import * as authApi from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';

export function useLogin(redirectTo?: string) {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async ({ token, user, refresh_token }) => {
      console.log('[Auth] Login OK →', user.email ?? user.phone);
      await login(token, user, refresh_token);
      router.replace((redirectTo ?? '/(tabs)') as any);
    },
    onError: (error) => {
      console.warn('[Auth] Login échoué →', error.message);
    },
  });
}

export function useRegister(redirectTo?: string) {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async ({ token, user, refresh_token }) => {
      console.log('[Auth] Register OK →', user.email ?? user.phone);
      await login(token, user, refresh_token);
      router.replace((redirectTo ?? '/(tabs)') as any);
    },
    onError: (error) => {
      console.warn('[Auth] Register échoué →', error.message);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      console.log('[Auth] Logout → /(tabs)');
      await logout();
      router.replace('/(tabs)');
    },
  });
}
