'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, MapPin, CalendarDays, Tag, ArrowRight, UserRound, Menu } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { EventCardSkeleton } from '@/components/EventCardSkeleton';
import { Pagination } from '@/components/Pagination';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useAuthStore } from '@/lib/store/authStore';
import * as eventsApi from '@/lib/api/events';
import type { EventCategory } from '@/types';

const EVENTS_SECTION_ID = 'events-section';
const PAGE_SIZE = 24;
const TABS = ['Tous', 'Concerts', 'Soirées', 'Ce week-end'];
const CATEGORIES: { label: string; slugs: EventCategory[]; image: string }[] = [
  { label: 'Soirées & Clubs', slugs: ['soirees'], image: 'https://images.unsplash.com/photo-1571266028243-d220c9b3b157?w=700&q=80' },
  { label: 'Concerts & Live', slugs: ['concerts'], image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=700&q=80' },
  { label: 'Festivals & Open Air', slugs: ['festival'], image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=700&q=80' },
  { label: 'Lifestyle & Expériences', slugs: ['gastronomie', 'bien_etre', 'mode', 'workshops'], image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=700&q=80' },
];
function tabParams(tab: string): { categories?: EventCategory[]; period?: 'weekend' } {
  if (tab === 'Concerts') return { categories: ['concerts'] };
  if (tab === 'Soirées') return { categories: ['soirees'] };
  if (tab === 'Ce week-end') return { period: 'weekend' };
  return {};
}
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Tous');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home-events', activeTab, page],
    queryFn: () => eventsApi.searchEvents({ ...tabParams(activeTab), page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const events = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  function changeTab(tab: string) {
    setActiveTab(tab);
    setPage(1);
  }

  function goToPage(p: number) {
    setPage(p);
    document.getElementById(EVENTS_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(search.trim() ? `/search?q=${encodeURIComponent(search.trim())}` : '/search');
  }
  return (
    <div className="min-h-screen bg-[#13091e] text-white font-sans">
      <header className="relative z-30 border-b border-white/10 bg-[#13091e]">
        <div className="mx-auto max-w-[1400px] px-5 md:px-9 h-[76px] flex items-center justify-between gap-5">
          <Link href="/" className="font-heading font-extrabold text-[30px] tracking-[-2px] text-[#ff791f]">looga.</Link>
          <nav className="hidden md:flex items-center gap-9 text-sm font-semibold">
            <Link href="/search" className="text-white hover:text-[#ff791f]">Explorer</Link>
            <Link href="#events-section" className="text-white/75 hover:text-white">Événements</Link>
            <Link href="/organisateur" className="text-white/75 hover:text-white">Organisateurs</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Rechercher" className="hover:text-[#ff791f]"><Search size={23}/></Link>
            <Link href="/search?cities=Abidjan" className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">Abidjan <MapPin size={15}/></Link>
            {authLoading ? <span className="h-9 w-9 rounded-full bg-white/10 animate-pulse" /> : isAuthenticated ? <ProfileMenu /> : <Link href="/auth/login" aria-label="Se connecter" className="rounded-full bg-white/10 p-2"><UserRound size={22}/></Link>}
            <button className="md:hidden" aria-label="Ouvrir le menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={25}/></button>
          </div>
        </div>
        {mobileMenuOpen && <nav className="md:hidden flex flex-col gap-4 border-t border-white/10 px-6 py-5 text-sm"><Link href="/search">Explorer</Link><Link href="#events-section" onClick={() => setMobileMenuOpen(false)}>Événements</Link><Link href="/organisateur">Organisateurs</Link></nav>}
      </header>
      <main>
        <section className="relative isolate overflow-hidden min-h-[460px] md:min-h-[510px]">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=85')"}} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#13091e] via-[#13091e]/80 to-[#13091e]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13091e] via-transparent to-transparent" />
          <div className="relative mx-auto max-w-[1400px] px-5 md:px-9 pt-14 md:pt-20 pb-12">
            <p className="font-extrabold italic tracking-[0.15em] text-[#ff791f] text-sm md:text-lg">ABIDJAN</p>
            <h1 className="mt-2 font-heading text-[45px] leading-[0.99] sm:text-6xl md:text-[78px] font-black italic tracking-tight">LA VILLE<br/><span className="text-[#ff791f]">EST À TOI.</span></h1>
            <p className="mt-5 max-w-[370px] text-base md:text-lg leading-snug">Les soirées, concerts et expériences<br className="hidden sm:block"/> à ne pas manquer à Abidjan.</p>
            <form onSubmit={submitSearch} className="mt-7 flex items-center gap-3 max-w-[480px] h-[54px] rounded-full bg-[#42294f]/95 border border-white/15 px-5 focus-within:ring-2 focus-within:ring-[#ff791f]">
              <Search size={21} className="shrink-0"/><input aria-label="Rechercher un événement" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une soirée, un artiste, un lieu..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/70"/><button type="submit" aria-label="Lancer la recherche"><ArrowRight size={20}/></button>
            </form>
            <div className="mt-7 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
              <Link href="/search?period=today" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#ff791f] px-5 py-3 text-sm font-bold text-[#180c21]"><CalendarDays size={17}/> Ce soir</Link>
              <Link href="/search?period=weekend" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-5 py-3 text-sm font-bold"><CalendarDays size={17}/> Ce week-end</Link>
              <Link href="/search?price=free" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-5 py-3 text-sm font-bold"><Tag size={17}/> Gratuit</Link>
              <Link href="/search?cities=Abidjan" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-5 py-3 text-sm font-bold"><MapPin size={17}/> À Abidjan</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1400px] px-5 md:px-9 pt-3 pb-10">
          <h2 className="font-heading text-2xl font-extrabold mb-5">Explorer par catégorie</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {CATEGORIES.map(category => <Link key={category.label} href={`/search?categories=${category.slugs.join(',')}`} className="group relative aspect-[1.5/1] sm:aspect-[1.8/1] overflow-hidden rounded-2xl border border-white/10 bg-[#382044]">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{backgroundImage: `url('${category.image}')`}} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16091f] via-[#16091f]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 md:p-5"><span className="font-bold text-sm md:text-base leading-tight">{category.label}</span><ArrowRight size={20} className="shrink-0 text-[#ff791f]"/></div>
            </Link>)}
          </div>
        </section>
        <section id={EVENTS_SECTION_ID} className="scroll-mt-20 mx-auto max-w-[1400px] px-5 md:px-9 pb-20">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold">À la une <span className="text-[#ff791f]">à Abidjan</span></h2>
            <div className="flex gap-5 overflow-x-auto border-b border-white/15">
              {TABS.map(tab => <button key={tab} onClick={() => changeTab(tab)} className={`shrink-0 pb-3 text-sm font-semibold border-b-2 ${activeTab === tab ? 'border-[#ff791f] text-[#ff791f]' : 'border-transparent text-white/65 hover:text-white'}`}>{tab}</button>)}
            </div>
          </div>
          {isError ? <div className="rounded-2xl border border-white/15 bg-white/5 py-14 text-center"><p className="mb-4">Impossible de charger les événements.</p><button onClick={() => refetch()} className="rounded-full bg-[#ff791f] px-6 py-3 font-bold text-[#180c21]">Réessayer</button></div> : <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {isLoading ? Array.from({length: 8}).map((_,i)=><EventCardSkeleton key={i}/>) : events.length === 0 ? <p className="col-span-full py-12 text-white/70">Aucun événement trouvé pour cette sélection.</p> : events.map(event => <div key={event.id} className="rounded-2xl border border-white/10 bg-[#251331] p-3 [&_p]:text-white/70 [&_h3]:text-white [&_h3]:font-bold [&_a:hover_h3]:text-[#ff791f]"><EventCard event={event}/></div>)}
            </div>
            {!isLoading && total > 0 && <div className="mt-12 flex flex-col items-center gap-4"><div className="rounded-xl bg-white p-2 text-[#180c21]"><Pagination page={page} totalPages={totalPages} onPageChange={goToPage}/></div><p className="text-sm text-white/60">Affichage de {from} à {to} sur {total} résultat{total > 1 ? 's' : ''}.</p></div>}
          </>}
        </section>
      </main>
      <footer className="border-t border-white/10 px-5 md:px-9 py-8 text-center text-sm text-white/55">© Looga · <Link href="/search" className="hover:text-white">Explorer les événements</Link> · <Link href="/organisateur" className="hover:text-white">Organisateurs</Link></footer>
    </div>
  );
}
