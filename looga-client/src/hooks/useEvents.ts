import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import * as eventsApi from '@/lib/api/events';
import type { EventCategory } from '@/types/event';

// 30s — assez court pour voir les nouveaux events rapidement
const STALE_TIME = 1000 * 30;

export function useEvents(category?: EventCategory) {
  return useInfiniteQuery({
    queryKey: ['events', category],
    queryFn: ({ pageParam = 1 }) =>
      eventsApi.getEvents({ page: pageParam as number, category }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: STALE_TIME,
    refetchInterval: 60_000,
    refetchOnMount: true,
    retry: 2,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEventById(id),
    staleTime: STALE_TIME,
    refetchInterval: 60_000,
    refetchOnMount: true,
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['eventCategories'],
    queryFn: () => eventsApi.getCategories(),
    staleTime: 1000 * 60 * 10,
  });
}
