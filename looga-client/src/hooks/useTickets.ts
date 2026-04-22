import { useQuery } from '@tanstack/react-query';

import * as ticketsApi from '@/lib/api/tickets';
import { useAuthStore } from '@/lib/store/authStore';

const STALE_TIME = 1000 * 60 * 2;

export function useTickets() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.getTickets(),
    staleTime: STALE_TIME,
    enabled: isAuthenticated,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getTicketById(id),
    staleTime: STALE_TIME,
    enabled: !!id,
  });
}
