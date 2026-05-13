'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const { loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
