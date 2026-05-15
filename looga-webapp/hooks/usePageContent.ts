'use client';

import { useQuery } from '@tanstack/react-query';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

export interface PageSection {
  heading: string;
  body: string;
}

export interface PageContent {
  key: string;
  title: string;
  intro: string | null;
  sections: PageSection[];
  updated_at: string;
}

async function fetchPageContent(key: string): Promise<PageContent | null> {
  const url = `${SUPABASE_URL}/rest/v1/page_contents?key=eq.${key}&select=*`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) return null;
  const arr = await res.json();
  return Array.isArray(arr) && arr.length > 0 ? (arr[0] as PageContent) : null;
}

export function usePageContent(key: string) {
  return useQuery({
    queryKey: ['page_content', key],
    queryFn: () => fetchPageContent(key),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
