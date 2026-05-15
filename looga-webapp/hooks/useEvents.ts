'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import * as eventsApi from '@/lib/api/events';
import type { EventCategory } from '@/types';

interface UseEventsParams {
  category?: EventCategory;
  search?: string;
  city?: string;
}

export function useEvents(params: UseEventsParams = {}) {
  const { category, search, city } = params;
  return useInfiniteQuery({
    queryKey: ['events', category ?? 'tout', search ?? '', city ?? ''],
    queryFn: ({ pageParam = 1 }) =>
      eventsApi.getEvents({ page: pageParam as number, category, search, city }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 30_000,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEventById(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useSimilarEvents(params: { category?: string; excludeId: string; limit?: number }) {
  return useQuery({
    queryKey: ['events', 'similar', params.category ?? '', params.excludeId, params.limit ?? 4],
    queryFn: () => eventsApi.getSimilarEvents(params),
    staleTime: 60_000,
    enabled: !!params.excludeId,
  });
}
