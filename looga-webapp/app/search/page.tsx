'use client';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { SearchFilters, CATEGORY_GROUPS } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { MobileSearchFilters } from '@/components/search/MobileSearchFilters';
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
  const [draft, setDraft] = useState<{ categories: EventCategory[]; cities: string[]; period: PeriodPreset; price: PricePreset }>({categories: [], cities: [], period: 'all', price: 'all'});
  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => setSearchInput(q), [q]);

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

  const openFilters = () => {
    setDraft({ categories: [...categories], cities: [...cities], period, price });
    setDrawerOpen(true);
  };
  const applyFilters = () => {
    updateUrl(draft);
    setDrawerOpen(false);
  };
  const handleReset = useCallback(() => {
    router.replace('/search', { scroll: false });
  }, [router]);

  const searchParams = useMemo(() => ({
    q, categories, cities, period, price, sort,
  }), [q, categories, cities, period, price, sort]);

  const { data, isLoading, isError, isFetchNextPageError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchEvents(searchParams);

  const events = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const activeFiltersCount =
    categories.length + cities.length + (period !== 'all' ? 1 : 0) + (price !== 'all' ? 1 : 0);

  const concertKeys = CATEGORY_GROUPS[1].keys;
  const partyKeys = CATEGORY_GROUPS[0].keys;
  const matchesGroup = (keys: EventCategory[]) =>
    categories.length === keys.length && keys.every((key) => categories.includes(key));
  const quickFilters = [
    { label: 'Tous', active: period === 'all' && price === 'all' && categories.length === 0 && cities.length === 0 && !q, action: handleReset },
    { label: 'Ce soir', active: period === 'tonight', action: () => updateUrl({ period: period === 'tonight' ? 'all' : 'tonight' }) },
    { label: 'Ce week-end', active: period === 'weekend', action: () => updateUrl({ period: period === 'weekend' ? 'all' : 'weekend' }) },
    { label: 'Gratuit', active: price === 'free', action: () => updateUrl({ price: price === 'free' ? 'all' : 'free' }) },
    { label: 'Concerts', active: matchesGroup(concertKeys), action: () => updateUrl({ categories: matchesGroup(concertKeys) ? [] : concertKeys }) },
    { label: 'Soirées', active: matchesGroup(partyKeys), action: () => updateUrl({ categories: matchesGroup(partyKeys) ? [] : partyKeys }) },
  ];

  return (
    <div className="min-h-screen bg-[#14091f] text-white flex flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-10 pt-10 md:px-8 md:pb-16 md:pt-14">
        <div className="mb-7">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#FF5C1A]">Vis tes meilleurs moments</p>
          <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            <>LA VILLE <span className="block text-[#FF5C1A]">T’ATTEND.</span></>
          </h1>
          <p className="mt-3 text-sm text-white/60 md:text-base">Concerts, soirées, festivals… trouve ce qui te fait vibrer.</p>
          <form onSubmit={(e) => { e.preventDefault(); updateUrl({ q: searchInput.trim() }); }} className="mt-7 flex h-14 max-w-2xl items-center gap-3 rounded-2xl bg-white px-4 text-[#24162e] shadow-lg focus-within:ring-2 focus-within:ring-[#FF5C1A] md:h-16">
            <Search className="h-5 w-5 shrink-0 text-[#81748b]" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tu sors où ?" aria-label="Rechercher des événements" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#81748b] md:text-base" />
            <button type="submit" className="rounded-xl bg-[#FF5C1A] p-3 text-white hover:bg-[#FF7438]" aria-label="Lancer la recherche"><Search className="h-5 w-5" /></button>
          </form>
          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0" aria-label="Filtres rapides">
            {quickFilters.map((filter) => <button key={filter.label} type="button" onClick={filter.action} aria-pressed={filter.active} className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${filter.active ? 'border-[#FF5C1A] bg-[#FF5C1A] text-white' : 'border-white/10 bg-[#382044] text-white hover:border-[#FF5C1A]/70'}`}>{filter.label}</button>)}
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-extrabold md:text-3xl">Tous les <span className="text-[#FF5C1A]">événements</span></h2>
          <button type="button" onClick={openFilters} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}</button>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="hidden lg:block"><SearchFilters categories={categories} cities={cities} period={period} price={price} onChange={updateUrl} onReset={handleReset} /></div>
          <SearchResults events={events} total={total} isLoading={isLoading} isError={isError} isFetchNextPageError={isFetchNextPageError} hasNextPage={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} sort={sort} onSortChange={(s) => updateUrl({ sort: s })} onLoadMore={fetchNextPage} onResetFilters={handleReset} activeFiltersCount={activeFiltersCount} />
        </div>
      </main>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 lg:hidden" onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-label="Filtres des événements" className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-[24px] border-t border-white/15 bg-[#21132b] shadow-2xl">
            <MobileSearchFilters
              categories={draft.categories} cities={draft.cities} period={draft.period} price={draft.price}
              onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
              onReset={() => setDraft({ categories: [], cities: [], period: 'all', price: 'all' })}
              onClose={() => setDrawerOpen(false)} onApply={applyFilters}
            />
          </div>
        </div>
      )}
      <PublicFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#14091f] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
