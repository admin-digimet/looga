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

// « Autres événements » (page détail) — même catégorie en priorité, exclut l'event courant.
export function useSimilarEvents(excludeId: string, category?: EventCategory) {
  return useQuery({
    queryKey: ['similarEvents', excludeId, category],
    queryFn: () => eventsApi.getSimilarEvents({ excludeId, category, limit: 6 }),
    staleTime: STALE_TIME,
    enabled: !!excludeId,
  });
}

// Recherche serveur hybride (explore) — q déjà debouncé côté écran.
export function useSearchEvents(params: eventsApi.SearchEventsParams) {
  return useInfiniteQuery({
    queryKey: ['searchEvents', params.q ?? '', params.category ?? 'tout', params.price ?? 'all', params.period ?? 'all'],
    queryFn: ({ pageParam = 1 }) =>
      eventsApi.searchEvents({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: STALE_TIME,
    refetchOnMount: true,
    retry: 1,
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
