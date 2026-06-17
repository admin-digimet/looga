'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearchEvents } from '@/hooks/useEvents';
import type { EventCategory } from '@/types';
import type { PeriodPreset, PricePreset, SortPreset } from '@/lib/api/events';

function parseList<T extends string>(v: string | null): T[] {
  if (!v) return [];
  return v.split(',').filter(Boolean) as T[];
}

function stringifyList(v: string[]): string | null {
  return v.length > 0 ? v.join(',') : null;
}

function SearchPageContent() {
  const router = useRouter();
  const params = useSearchParams();

  // État dérivé des query params
  const q = params.get('q') ?? '';
  const categories = parseList<EventCategory>(params.get('categories'));
  const cities = parseList<string>(params.get('cities'));
  const period = (params.get('period') as PeriodPreset) ?? 'all';
  const price = (params.get('price') as PricePreset) ?? 'all';
  const sort = (params.get('sort') as SortPreset) ?? 'date_asc';

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll quand drawer mobile ouvert
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  const updateUrl = useCallback((next: {
    q?: string;
    categories?: EventCategory[];
    cities?: string[];
    period?: PeriodPreset;
    price?: PricePreset;
    sort?: SortPreset;
  }) => {
    const merged = new URLSearchParams(params.toString());
    if (next.q !== undefined) next.q ? merged.set('q', next.q) : merged.delete('q');
    if (next.categories !== undefined) {
      const v = stringifyList(next.categories);
      v ? merged.set('categories', v) : merged.delete('categories');
    }
    if (next.cities !== undefined) {
      const v = stringifyList(next.cities);
      v ? merged.set('cities', v) : merged.delete('cities');
    }
    if (next.period !== undefined) {
      next.period === 'all' ? merged.delete('period') : merged.set('period', next.period);
    }
    if (next.price !== undefined) {
      next.price === 'all' ? merged.delete('price') : merged.set('price', next.price);
    }
    if (next.sort !== undefined) {
      next.sort === 'date_asc' ? merged.delete('sort') : merged.set('sort', next.sort);
    }
    const qs = merged.toString();
    router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
  }, [params, router]);

  const handleReset = useCallback(() => {
    router.replace('/search', { scroll: false });
  }, [router]);

  const searchParams = useMemo(() => ({
    q, categories, cities, period, price, sort,
  }), [q, categories, cities, period, price, sort]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchEvents(searchParams);

  const events = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const activeFiltersCount =
    categories.length + cities.length + (period !== 'all' ? 1 : 0) + (price !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-ink mb-2 wrap-anywhere">
            {q ? <>Résultats pour <span className="text-orange">«&nbsp;{q}&nbsp;»</span></> : 'Tous les événements'}
          </h1>
          {cities.length > 0 && (
            <p className="text-sm text-ink-muted">
              Filtré sur : <span className="font-semibold text-ink">{cities.join(', ')}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtres — sidebar desktop / drawer mobile */}
          <div className="hidden lg:block">
            <SearchFilters
              categories={categories}
              cities={cities}
              period={period}
              price={price}
              onChange={updateUrl}
              onReset={handleReset}
            />
          </div>

          {/* Résultats */}
          <SearchResults
            events={events}
            total={total}
            isLoading={isLoading}
            isError={isError}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            sort={sort}
            onSortChange={(s) => updateUrl({ sort: s })}
            onLoadMore={fetchNextPage}
            onResetFilters={handleReset}
            onOpenFilters={() => setDrawerOpen(true)}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </main>

      {/* Drawer filtres mobile */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-white shadow-2xl overflow-y-auto">
            <SearchFilters
              categories={categories}
              cities={cities}
              period={period}
              price={price}
              onChange={updateUrl}
              onReset={handleReset}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
