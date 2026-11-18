'use client';
import { PublicHeader } from '@/components/PublicHeader';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, MapPin, CalendarDays, Tag, ArrowRight, UserRound, Menu, Ticket, Sparkles, RotateCcw } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { EventCardSkeleton } from '@/components/EventCardSkeleton';
import { Pagination } from '@/components/Pagination';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useAuthStore } from '@/lib/store/authStore';
import * as eventsApi from '@/lib/api/events';
import type { EventCategory } from '@/types';
import { CATEGORY_GROUPS } from '@/components/search/SearchFilters';

const EVENTS_SECTION_ID = 'events-section';
const PAGE_SIZE = 24;
const TABS = ['Tous', 'Concerts', 'Soirées', 'Ce week-end'];
// Source unique : mêmes identifiants historiques que les filtres Explorer.
const CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1571266028243-d220c9b3b157?w=700&q=80',
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
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [search, setSearch] = useState('');
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
      <PublicHeader />
      <main>
        <section className="relative isolate overflow-hidden min-h-[430px] md:min-h-[610px]">
          <div className="absolute inset-0 bg-cover bg-center scale-[1.02]" style={{backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=85')"}} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#13091e]/95 via-[#13091e]/70 to-[#13091e]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13091e] via-transparent to-transparent" />
          <div className="relative mx-auto max-w-[1400px] px-5 md:px-9 pt-9 sm:pt-16 md:pt-28 pb-9 sm:pb-14 md:pb-20">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ff791f]/40 bg-[#1a0b26]/65 px-4 py-2 font-extrabold tracking-[0.18em] text-[#ff791f] text-xs md:text-sm"><Sparkles size={15}/> ABIDJAN, CÔTE D’IVOIRE</p>
            <h1 className="mt-2 font-heading text-[clamp(2.55rem,10.3vw,4.75rem)] leading-[0.98] sm:text-[76px] md:text-[96px] font-black italic tracking-tight">LA VILLE<br/><span className="text-[#ff791f]">EST À TOI.</span></h1>
            <p className="mt-5 md:mt-7 max-w-[490px] text-base md:text-xl leading-relaxed text-white/85">Les soirées, concerts et expériences<br className="hidden sm:block"/> à ne pas manquer à Abidjan.</p>
            <form onSubmit={submitSearch} className="mt-6 md:mt-9 flex items-center gap-3 max-w-[550px] h-[56px] sm:h-[60px] rounded-2xl bg-[#fff]/95 text-[#23152c] border border-white/50 px-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] focus-within:ring-2 focus-within:ring-[#ff791f]">
              <Search size={21} className="shrink-0"/><input aria-label="Rechercher un événement" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une soirée, un artiste, un lieu..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#776d7e]"/><button type="submit" aria-label="Lancer la recherche" className="rounded-xl bg-[#ff791f] p-2.5 text-[#180c21] hover:bg-[#ff944b]"><ArrowRight size={20}/></button>
            </form>
            <div className="relative mt-4 md:mt-6 flex gap-2 md:gap-3 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:none] [&>a]:snap-start">
              <Link href="/search?period=tonight" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#ff791f] px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold text-[#180c21]"><CalendarDays size={17}/> Ce soir</Link>
              <Link href="/search?period=weekend" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold"><CalendarDays size={17}/> Ce week-end</Link>
              <Link href="/search?price=free" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold"><Tag size={17}/> Gratuit</Link>
              <Link href="/search?cities=Abidjan" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#3b2149]/95 px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold"><MapPin size={17}/> À Abidjan</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1400px] px-5 md:px-9 pt-10 md:pt-14 pb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-6">Explorer par catégorie</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {CATEGORIES.map(category => <Link key={category.label} href={`/search?categories=${category.slugs.join(',')}`} className="group relative aspect-[1.1/1] sm:aspect-[1.45/1] overflow-hidden rounded-[22px] border border-white/10 bg-[#382044] shadow-[0_14px_35px_rgba(0,0,0,0.2)]">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{backgroundImage: `url('${category.image}')`}} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16091f]/95 via-[#16091f]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 md:p-5"><span className="font-extrabold text-sm md:text-lg leading-tight">{category.label}</span><ArrowRight size={20} className="shrink-0 text-[#ff791f]"/></div>
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
            <div className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoading ? Array.from({length: 8}).map((_,i)=><EventCardSkeleton key={i}/>) : events.length === 0 ? <div className="col-span-full rounded-[22px] border border-white/10 bg-[#251331]/70 px-5 py-12 text-center sm:py-16"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff791f]/15 text-[#ff791f]"><Ticket size={27}/></div><h3 className="text-xl font-extrabold">Aucun événement pour le moment</h3><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/65">Aucun événement ne correspond à cette sélection. Explore les autres catégories ou retrouve tous les événements.</p><button type="button" onClick={() => { if (activeTab === 'Tous') router.push('/search'); else changeTab('Tous'); }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ff791f] px-3.5 py-2.5 md:px-5 md:py-3 text-xs sm:text-sm font-bold text-[#180c21] hover:bg-[#ff944b]"><RotateCcw size={16}/> Voir tous les événements</button></div> : events.map(event => <article key={event.id} className="group flex h-full flex-col rounded-[22px] border border-white/10 bg-[#251331] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff791f]/45 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] [&_h3]:text-white [&_h3]:font-bold [&_h3]:text-[18px] [&_h3]:leading-snug [&_p]:text-white/70 [&_p]:mb-0.5 [&_h3]:mb-1 [&_a:hover_h3]:text-[#ff791f] [&_img]:rounded-xl [&_p.text-orange]:text-[#ff791f] [&_p.text-gray-700]:text-white [&_a>div:first-child]:aspect-[16/10] [&_a>div:first-child]:bg-[#392349] [&_a>div:first-child>div]:bg-[#392349] [&_a>div:first-child>button]:opacity-100 [&_a>div:first-child>button]:shadow-md"><div className="flex-1"><EventCard event={event} compactTime/></div><Link href={`/events/${event.id}`} className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#ff791f] px-4 py-2.5 text-sm font-extrabold text-[#180c21] transition-colors hover:bg-[#ff944b]" aria-label={`Voir les billets pour ${event.name}`}><Ticket size={17}/> {event.isSoldOut ? 'Voir l’événement' : 'Réserver'} <ArrowRight size={16}/></Link></article>)}
            </div>
            {!isLoading && total > 0 && <div className="mt-12 flex flex-col items-center gap-4">{totalPages > 1 && <div className="rounded-xl bg-white p-2 text-[#180c21]"><Pagination page={page} totalPages={totalPages} onPageChange={goToPage}/></div>}<p className="text-sm text-white/60">Affichage de {from} à {to} sur {total} résultat{total > 1 ? 's' : ''}.</p></div>}
          </>}
        </section>
      </main>
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
                {CATEGORIES.map((category) => (
                  <li key={category.label}>
                    <Link href={`/search?categories=${category.slugs.join(',')}`} className="hover:text-[#ff791f]">
                      {category.label}
                    </Link>
                  </li>
                ))}
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
