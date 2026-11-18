'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, SlidersHorizontal, UserRound, Menu } from 'lucide-react';
import Link from 'next/link';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useAuthStore } from '@/lib/store/authStore';
import { SearchFilters, CATEGORY_GROUPS } from '@/components/search/SearchFilters';
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
  const [searchInput, setSearchInput] = useState(q);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#14091f]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="font-heading text-3xl font-extrabold tracking-tight text-[#ff791f]">looga.</Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <Link href="/search" className="hover:text-[#ff791f]">Explorer</Link>
            <Link href="/search" className="hover:text-[#ff791f]">Événements</Link>
            <Link href="/organisateur" className="hover:text-[#ff791f]">Organisateurs</Link>
          </nav>
          <div className="flex items-center gap-3">
            {authLoading ? <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" /> : isAuthenticated ? <ProfileMenu /> : <Link href="/auth/login" aria-label="Se connecter" className="rounded-full bg-white/10 p-2.5 hover:bg-white/20"><UserRound className="h-5 w-5" /></Link>}
            <button type="button" className="rounded-full p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}><Menu className="h-6 w-6" /></button>
          </div>
        </div>
        {menuOpen && <nav className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 text-sm md:hidden"><Link href="/" onClick={() => setMenuOpen(false)}>Accueil</Link><Link href="/search" onClick={() => setMenuOpen(false)}>Explorer les événements</Link><Link href="/organisateur" onClick={() => setMenuOpen(false)}>Créer un événement</Link></nav>}
      </header>
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-20 pt-10 md:px-8 md:pt-14">
        <div className="mb-9">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-[#ff791f]">Découvre Abidjan</p>
          <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            {q ? <>Résultats pour <span className="text-[#ff791f]">« {q} »</span></> : <>Trouve ta prochaine <span className="text-[#ff791f]">sortie.</span></>}
          </h1>
          <p className="mt-3 text-sm text-white/60 md:text-base">Soirées, concerts et expériences : découvre ce qui t'attend.</p>
          <form onSubmit={(e) => { e.preventDefault(); updateUrl({ q: searchInput.trim() }); }} className="mt-7 flex h-14 max-w-2xl items-center gap-3 rounded-2xl bg-white px-4 text-[#24162e] shadow-lg md:h-16">
            <Search className="h-5 w-5 shrink-0 text-[#81748b]" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Rechercher un événement, un artiste, un lieu..." aria-label="Rechercher des événements" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#81748b] md:text-base" />
            <button type="submit" className="rounded-xl bg-[#ff791f] p-3 text-[#14091f] hover:bg-[#ff9347]" aria-label="Lancer la recherche"><Search className="h-5 w-5" /></button>
          </form>
          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0" aria-label="Filtres rapides">
            {quickFilters.map((filter) => <button key={filter.label} type="button" onClick={filter.action} aria-pressed={filter.active} className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${filter.active ? 'border-[#ff791f] bg-[#ff791f] text-[#14091f]' : 'border-white/10 bg-[#382044] text-white hover:border-[#ff791f]/70'}`}>{filter.label}</button>)}
          </div>
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-extrabold md:text-3xl">Tous les <span className="text-[#ff791f]">événements</span></h2>
          <button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}</button>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="hidden lg:block"><SearchFilters categories={categories} cities={cities} period={period} price={price} onChange={updateUrl} onReset={handleReset} /></div>
          <SearchResults events={events} total={total} isLoading={isLoading} isError={isError} hasNextPage={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} sort={sort} onSortChange={(s) => updateUrl({ sort: s })} onLoadMore={fetchNextPage} onResetFilters={handleReset} activeFiltersCount={activeFiltersCount} />
        </div>
      </main>
      {drawerOpen && <div className="fixed inset-0 z-50 bg-black/75" onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}><div className="absolute bottom-0 right-0 top-0 w-[90%] max-w-sm overflow-y-auto bg-[#21132b] shadow-2xl"><SearchFilters categories={categories} cities={cities} period={period} price={price} onChange={updateUrl} onReset={handleReset} onClose={() => setDrawerOpen(false)} /></div></div>}
      <footer className="mx-auto max-w-[1400px] px-4 pb-5 md:px-9 md:pb-9" aria-label="Pied de page Looga">
        <div className="rounded-[22px] bg-[#0e0e10] px-5 py-6 text-white md:px-8 md:py-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#39363e] pb-7">
            <Link href="/" className="font-heading text-[30px] font-extrabold tracking-[-1px] text-[#ff791f]">looga.</Link>
            <span className="text-sm text-[#bcb8c0]">La ville est à toi.</span>
          </div>
          <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-3 sm:gap-9 sm:py-8 md:gap-12">
            <div>
              <h2 className="mb-3 text-base font-bold">Découvrir</h2>
              <ul className="space-y-2 sm:space-y-3 text-sm text-[#c6c1c9]">
                <li><Link href="/search" className="hover:text-[#ff791f]">Tous les événements</Link></li>
                <li><Link href="/search?categories=soirees" className="hover:text-[#ff791f]">Soirées &amp; Clubs</Link></li>
                <li><Link href={`/search?categories=${CATEGORY_GROUPS[1].keys.join(',')}`} className="hover:text-[#ff791f]">Concerts &amp; Live</Link></li>
                <li><Link href={`/search?categories=${CATEGORY_GROUPS[2].keys.join(',')}`} className="hover:text-[#ff791f]">Festivals &amp; Open Air</Link></li>
                <li><Link href={`/search?categories=${CATEGORY_GROUPS[3].keys.join(',')}`} className="hover:text-[#ff791f]">Lifestyle &amp; Expériences</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-base font-bold">Looga</h2>
              <ul className="space-y-2 sm:space-y-3 text-sm text-[#c6c1c9]">
                <li><Link href="/a-propos" className="hover:text-[#ff791f]">À propos</Link></li>
                <li><Link href="/organisateur" className="hover:text-[#ff791f]">Créer un événement</Link></li>
                <li><Link href="/aide" className="hover:text-[#ff791f]">Centre d&apos;aide</Link></li>
                <li><Link href="/contact" className="hover:text-[#ff791f]">Contact</Link></li>
                <li><Link href="/mobile" className="hover:text-[#ff791f]">Application mobile</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-base font-bold">Informations</h2>
              <ul className="space-y-2 sm:space-y-3 text-sm text-[#c6c1c9]">
                <li><Link href="/cgu" className="hover:text-[#ff791f]">Conditions générales d&apos;utilisation</Link></li>
                <li><Link href="/confidentialite" className="hover:text-[#ff791f]">Politique de confidentialité</Link></li>
                <li><Link href="/securite" className="hover:text-[#ff791f]">Sécurité</Link></li>
                <li><Link href="/communaute" className="hover:text-[#ff791f]">Règles d&apos;utilisation</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-[#39363e] pt-5 sm:pt-7 text-sm text-[#a8a3ad] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Looga</span>
            <div className="flex items-center gap-5">
              <span aria-label="Instagram" title="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/></svg></span>
              <span aria-label="Facebook" title="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-9h3l.5-4h-3.5V6.5c0-1.1.4-1.5 1.5-1.5H17V1.4A23 23 0 0 0 14.2 1C11.3 1 9.5 2.8 9.5 6v3H7v4h2.5v9z"/></svg></span>
              <span>Côte d&apos;Ivoire</span>
            </div>
          </div>
        </div>
      </footer>
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
