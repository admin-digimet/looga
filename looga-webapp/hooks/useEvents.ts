'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import * as eventsApi from '@/lib/api/events';
import type { SearchEventsParams } from '@/lib/api/events';
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
    refetchInterval: 60_000,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEventById(id),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: !!id,
  });
}

export function useSearchEvents(params: SearchEventsParams) {
  const key = [
    'search-events',
    params.q ?? '',
    (params.cities ?? []).join(','),
    (params.categories ?? []).join(','),
    params.price ?? 'all',
    params.period ?? 'all',
    params.sort ?? 'date_asc',
  ];
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) =>
      eventsApi.searchEvents({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSimilarEvents(params: { category?: string; excludeId: string; limit?: number }) {
  return useQuery({
    queryKey: ['events', 'similar', params.category ?? '', params.excludeId, params.limit ?? 4],
    queryFn: () => eventsApi.getSimilarEvents(params),
    staleTime: 60_000,
    refetchInterval: 120_000,
    enabled: !!params.excludeId,
  });
}
