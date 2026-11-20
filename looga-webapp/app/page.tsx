'use client';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, MapPin, CalendarDays, Tag, ArrowRight, Ticket, RotateCcw } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { EventCardSkeleton } from '@/components/EventCardSkeleton';
import * as eventsApi from '@/lib/api/events';
import type { EventCategory } from '@/types';
import { CATEGORY_GROUPS } from '@/components/search/SearchFilters';

const EVENTS_SECTION_ID = 'events-section';
const INITIAL_PAGE_SIZE = 8;
const LOAD_MORE_SIZE = 8;
const TABS = ['Tous', 'Concerts', 'Soirées', 'Ce week-end'];
// Source unique : mêmes identifiants historiques que les filtres Explorer.
const CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1744313930610-1649242d1fcd?w=700&q=80', // Soirées & Clubs : photographie provisoire, Unsplash / Artem Polezhaev
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=700&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=700&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=700&q=80',
];
const CATEGORIES = CATEGORY_GROUPS.map((group, index) => ({
  label: group.label,
  slugs: group.keys,
  image: CATEGORY_IMAGES[index],
}));
function tabParams(tab: string): { categories?: EventCategory[]; period?: 'weekend' } {
  if (tab === 'Concerts') return { categories: CATEGORY_GROUPS[1].keys };
  if (tab === 'Soirées') return { categories: CATEGORY_GROUPS[0].keys };
  if (tab === 'Ce week-end') return { period: 'weekend' };
  return {};
}
export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Tous');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home-events', activeTab, visibleCount],
    queryFn: () => eventsApi.searchEvents({ ...tabParams(activeTab), page: 1, pageSize: visibleCount }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const events = data?.data ?? [];
  const total = data?.total ?? 0;


  function changeTab(tab: string) {
    setActiveTab(tab);
    setVisibleCount(INITIAL_PAGE_SIZE);
  }

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(search.trim() ? `/search?q=${encodeURIComponent(search.trim())}` : '/search');
  }
  return (
    <div className="min-h-screen bg-[#13091e] text-white font-sans">
      <PublicHeader />
      <main>
        <section className="relative isolate overflow-hidden min-h-[430px] md:min-h-[610px]">
          <div className="absolute inset-0 bg-cover bg-center scale-[1.02]" style={{backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=85')"}} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#13091e]/95 via-[#13091e]/70 to-[#13091e]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13091e] via-transparent to-transparent" />
          <div className="relative mx-auto max-w-[1400px] px-5 md:px-9 pt-9 sm:pt-16 md:pt-28 pb-9 sm:pb-14 md:pb-20">
            <h1 className="font-heading text-[clamp(2.2rem,9vw,4.75rem)] leading-[0.98] sm:text-[76px] md:text-[96px] font-black italic tracking-tight"><span className="block">ABIDJAN NE</span><span className="block text-[#FF5C1A]">DORT PAS.</span></h1>
            <p className="mt-5 md:mt-7 max-w-[490px] text-base md:text-xl leading-relaxed text-white/85">Les soirées, concerts et expériences<br className="hidden sm:block"/> à ne pas manquer à Abidjan.</p>
            <form onSubmit={submitSearch} className="mt-6 md:mt-9 flex items-center gap-3 max-w-[550px] h-[56px] sm:h-[60px] rounded-2xl bg-[#fff]/95 text-[#23152c] border border-white/50 px-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] focus-within:ring-2 focus-within:ring-[#FF5C1A]">
              <Search size={21} className="shrink-0"/><input aria-label="Rechercher un événement" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tu sors où ?" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#776d7e]"/><button type="submit" aria-label="Lancer la recherche" className="rounded-xl bg-[#FF5C1A] p-2.5 text-white hover:bg-[#FF7438]"><ArrowRight size={20}/></button>
            </form>
            <div className="relative mt-4 md:mt-6 flex gap-2 md:gap-3 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:none] [&>a]:snap-start">
              <Link href="/search?period=tonight" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#FF5C1A] px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold text-white"><CalendarDays size={17}/> Ce soir</Link>
              <Link href="/search?period=weekend" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold"><CalendarDays size={17}/> Ce week-end</Link>
              <Link href="/search?price=free" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold"><Tag size={17}/> Gratuit</Link>
              <Link href="/search?cities=Abidjan" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold"><MapPin size={17}/> À Abidjan</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1400px] px-5 md:px-9 pt-10 md:pt-14 pb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-6">C’EST QUOI TON MOOD ?</h2>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:pb-0">
            {CATEGORIES.map(category => <Link key={category.label} href={`/search?categories=${category.slugs.join(',')}`} className="group relative aspect-[1.25/1] w-[78%] max-w-[300px] shrink-0 snap-start md:aspect-[1.45/1] md:w-auto md:max-w-none overflow-hidden rounded-[22px] border border-white/10 bg-[#382044] shadow-[0_14px_35px_rgba(0,0,0,0.2)]">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{backgroundImage: `url('${category.image}')`}} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16091f]/95 via-[#16091f]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 md:p-5"><span className="font-extrabold text-sm md:text-lg leading-tight">{category.label}</span><ArrowRight size={20} className="shrink-0 text-[#FF5C1A]"/></div>
            </Link>)}
          </div>
        </section>
        <section id={EVENTS_SECTION_ID} className="scroll-mt-20 mx-auto max-w-[1400px] px-5 md:px-9 pb-8 md:pb-20">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold">ÇA SE PASSE <span className="text-[#FF5C1A]">ICI.</span></h2>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map(tab => <button key={tab} onClick={() => changeTab(tab)} aria-pressed={activeTab === tab} className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab ? 'border-[#FF5C1A] bg-[#FF5C1A] text-white' : 'border-white/15 bg-white/5 text-white/75 hover:border-[#FF5C1A]/60 hover:text-white'}`}>{tab}</button>)}
            </div>
          </div>
          {isError ? <div className="rounded-2xl border border-white/15 bg-white/5 py-14 text-center"><p className="mb-4">Impossible de charger les événements.</p><button onClick={() => refetch()} className="rounded-full bg-[#FF5C1A] px-6 py-3 font-bold text-white">Réessayer</button></div> : <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoading ? Array.from({length: 8}).map((_,i)=><EventCardSkeleton key={i}/>) : events.length === 0 ? <div className="col-span-full rounded-[22px] border border-white/10 bg-[#251331]/70 px-5 py-12 text-center sm:py-16"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5C1A]/15 text-[#FF5C1A]"><Ticket size={27}/></div><h3 className="text-xl font-extrabold">Aucun événement pour le moment</h3><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/65">Aucun événement ne correspond à cette sélection. Explore les autres catégories ou retrouve tous les événements.</p><button type="button" onClick={() => { if (activeTab === 'Tous') router.push('/search'); else changeTab('Tous'); }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5C1A] px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#FF7438]"><RotateCcw size={16}/> Voir tous les événements</button></div> : events.map(event => <article key={event.id} className="group flex h-full flex-col rounded-[22px] border border-white/10 bg-[#251331] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-colors duration-300 hover:border-[#FF5C1A]/45 [&_h3]:text-white [&_h3]:font-bold [&_h3]:text-[18px] [&_h3]:leading-snug [&_p]:text-white/70 [&_p]:mb-0.5 [&_h3]:mb-1 [&_a:hover_h3]:text-[#FF5C1A] [&_img]:rounded-xl [&_p.text-orange]:text-[#FF5C1A] [&_p.text-gray-700]:text-white [&_a>div:first-child]:aspect-[16/10] [&_a>div:first-child]:bg-[#392349] [&_a>div:first-child>div]:bg-[#392349] [&_p.mt-auto]:hidden [&_a>div:first-child>button]:opacity-100 [&_a>div:first-child>button]:shadow-md max-md:[&>div>div>div:first-child]:!aspect-[16/9]"><div className="md:flex-1"><EventCard event={event} compactTime highlightFreePrice/></div><Link href={`/events/${event.id}`} className="mt-2 md:mt-3 ml-auto inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[#FF5C1A] px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#FF7438] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5C1A]" aria-label={`Voir ${event.name}`}><span>{event.isSoldOut ? 'Voir l’événement' : 'Réserver'}</span><ArrowRight size={16} aria-hidden="true"/></Link></article>)}
            </div>
            {!isLoading && total > 0 && <div className="mt-7 md:mt-12 flex flex-col items-center gap-3">{events.length < total && <button type="button" onClick={() => setVisibleCount(count => count + LOAD_MORE_SIZE)} className="inline-flex items-center gap-3 rounded-xl border border-[#FF5C1A] px-6 py-3 text-sm font-bold text-[#FF5C1A] transition-colors hover:bg-[#FF5C1A] hover:text-white">Voir plus d’événements <ArrowRight size={17}/></button>}<p className="text-xs text-white/55">{Math.min(events.length, total)} sur {total} événements</p></div>}
          </>}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
