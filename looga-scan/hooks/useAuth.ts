import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async (data) => {
      // getState() évite le conflit zustand v5 + react-query v5 sur useCallback
      await useAuthStore.getState().login(data.token, data.user);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await useAuthStore.getState().logout();
      router.replace('/(auth)/login');
    },
  });
}
