'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';

export function useLogin(options?: { onSuccess?: () => void }) {
  const { login } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async ({ token, user, refresh_token }) => {
      await login(token, user, refresh_token);
      if (options?.onSuccess) {
        options.onSuccess();
      } else {
        router.push('/');
      }
    },
  });
}

export function useRegister(options?: { onSuccess?: () => void }) {
  const { login } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async ({ token, user, refresh_token }) => {
      await login(token, user, refresh_token);
      if (options?.onSuccess) {
        options.onSuccess();
      } else {
        router.push('/');
      }
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      try { await authApi.logout(); } catch { /* ignore */ }
    },
    onSettled: async () => {
      await logout();
      router.push('/');
    },
  });
}
