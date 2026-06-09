import { useQuery } from '@tanstack/react-query';

import { eventsApi } from '@/lib/api/events';

export function useEvents() {
  return useQuery({
    queryKey: ['scan-events'],
    queryFn: () => eventsApi.getAll(),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
}
