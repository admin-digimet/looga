'use client';

import { useQuery } from '@tanstack/react-query';
import * as ticketsApi from '@/lib/api/tickets';
import { useAuthStore } from '@/lib/store/authStore';

export function useTickets() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.getTickets(),
    staleTime: 1000 * 60 * 2,
    enabled: isAuthenticated,
  });
}
