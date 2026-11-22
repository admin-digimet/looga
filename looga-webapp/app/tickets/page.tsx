'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket as TicketIcon, Clock3, CalendarX2 } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useAuthStore } from '@/lib/store/authStore';
import { useTickets } from '@/hooks/useTickets';
import type { Ticket } from '@/types';

type Tab = 'upcoming' | 'pending' | 'past';
type PastFilter = 'all' | 'used' | 'unused' | 'cancelled';

type TicketGroup = { id: string; tickets: Ticket[] };

// Une référence de paiement commune est le seul indice de réservation disponible.
// Sans référence, on conserve des cartes distinctes plutôt que de fusionner deux achats.
function groupTickets(tickets: Ticket[]): TicketGroup[] {
  const groups = new Map<string, TicketGroup>();
  for (const ticket of tickets) {
    const ref = ticket.paymentRef?.trim();
    const key = ref ? `payment:${ref}:event:${ticket.eventId}` : `ticket:${ticket.id}`;
    const existing = groups.get(key);
    if (existing) existing.tickets.push(ticket);
    else groups.set(key, { id: key, tickets: [ticket] });
  }
  return [...groups.values()];
}


function isUpcoming(ticket: Ticket): boolean {
  if (!ticket.eventDate) return false; // date inconnue : ne pas présumer à venir
  const eventTs = new Date(ticket.eventDate).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventTs >= today.getTime();
}

export default function TicketsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();

  const [tab, setTab] = useState<Tab>('upcoming')
  const [pastFilter, setPastFilter] = useState<PastFilter>('all')
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [pastPage, setPastPage] = useState(1)
  const [pendingPage, setPendingPage] = useState(1)
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const { upcoming, pending, past } = useMemo(() => {
    const list = tickets ?? [];
    const u: Ticket[] = [];
    const waiting: Ticket[] = [];
    const p: Ticket[] = [];

    for (const t of list) {
      // Les paiements non finalisés ont leur propre onglet.
      // Les billets annulés, expirés ou utilisés restent dans l'historique.
      if (t.status === 'pending') waiting.push(t);
      else if (t.status === 'cancelled' || t.status === 'expired' || t.status === 'used') p.push(t);
      else if (isUpcoming(t)) u.push(t);
      else p.push(t);
    }

    const eventTime = (t: Ticket) => {
      const ts = new Date(t.eventDate).getTime();
      return Number.isFinite(ts) ? ts : 0;
    };
    u.sort((a, b) => eventTime(a) - eventTime(b));
    waiting.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
    p.sort((a, b) => eventTime(b) - eventTime(a));
    return { upcoming: u, pending: waiting, past: p };
  }, [tickets]);

  const filteredPast = past.filter((ticket) => {
    if (pastFilter === 'used') return ticket.status === 'used';
    if (pastFilter === 'cancelled') return ticket.status === 'cancelled';
    if (pastFilter === 'unused') return ticket.status === 'expired' || (ticket.status === 'valid' && !isUpcoming(ticket));
    return true;
  });
  const allVisible = groupTickets(tab === 'upcoming' ? upcoming : tab === 'pending' ? pending : filteredPast);
  const currentPage = tab === 'upcoming' ? upcomingPage : tab === 'pending' ? pendingPage : pastPage;
  const setCurrentPage = tab === 'upcoming' ? setUpcomingPage : tab === 'pending' ? setPendingPage : setPastPage;
  const totalPages = Math.max(1, Math.ceil(allVisible.length / PAGE_SIZE));
  const visible = allVisible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (authLoading || (!isAuthenticated && !authLoading)) return null;

  return (
    <div className="min-h-screen bg-[#160F20] text-white flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-[820px] w-full mx-auto px-4 md:px-8 py-10">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-2">Mes billets</h1>
        <p className="text-sm text-[#BEB3CA] mb-8">
          Retrouve tes réservations et présente tes billets à l’entrée.
        </p>

        {/* Tabs */}
        {!ticketsLoading && (upcoming.length > 0 || pending.length > 0 || past.length > 0) && (
          <div className="flex items-center gap-1 mb-6 border-b border-white/15">
            <button
              type="button"
              onClick={() => { setTab('upcoming'); setUpcomingPage(1) }}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'upcoming' ? 'text-[#FF5C1A]' : 'text-[#BEB3CA] hover:text-white'
              }`}
            >
              À venir
              {upcoming.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[11px] px-1.5 py-0.5 rounded-full bg-orange/15 text-[#FF5C1A] font-bold">
                  {upcoming.length}
                </span>
              )}
              {tab === 'upcoming' && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-orange rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => { setTab('pending'); setPendingPage(1) }}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'pending' ? 'text-[#FF5C1A]' : 'text-[#BEB3CA] hover:text-white'
              }`}
            >
              En attente
              {pending.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[11px] px-1.5 py-0.5 rounded-full bg-white/10 text-[#CFC4DA] font-bold">
                  {pending.length}
                </span>
              )}
              {tab === 'pending' && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-orange rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => { setTab('past'); setPastPage(1) }}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'past' ? 'text-[#FF5C1A]' : 'text-[#BEB3CA] hover:text-white'
              }`}
            >
              Passés
              {past.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[11px] px-1.5 py-0.5 rounded-full bg-white/10 text-[#CFC4DA] font-bold">
                  {past.length}
                </span>
              )}
              {tab === 'past' && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-orange rounded-full" />}
            </button>
          </div>
        )}

        {tab === 'past' && !ticketsLoading && past.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2" aria-label="Filtrer les billets passés">
            {([{ value: 'all', label: 'Tous' }, { value: 'used', label: 'Utilisés' }, { value: 'unused', label: 'Non utilisés' }, { value: 'cancelled', label: 'Annulés' }] as const).map((item) => (
              <button key={item.value} type="button" onClick={() => { setPastFilter(item.value); setPastPage(1); }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${pastFilter === item.value ? 'border-[#FF5C1A] bg-[#FF5C1A]/15 text-[#FF9B59]' : 'border-white/15 text-[#BEB3CA] hover:text-white'}`}>
                {item.label}
              </button>
            ))}
          </div>
        )}
        {/* Content */}
        {ticketsLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-[#251A30] rounded-2xl h-[175px]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          upcoming.length === 0 && pending.length === 0 && past.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <EmptyState tab={tab} />
          )
        ) : (
          <>
            <div className="space-y-7">
              {Object.entries(visible.reduce<Record<string, TicketGroup[]>>((acc, group) => {
                const anchor = group.tickets[0];
                const rawDate = tab === 'pending' ? anchor.purchasedAt : anchor.eventDate;
                const date = rawDate ? new Date(rawDate) : null;
                const month = date && !isNaN(date.getTime()) ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date) : 'Date non renseignée';
                (acc[month] ||= []).push(group);
                return acc;
              }, {})).map(([month, groups]) => <section key={month}>
                <div className="mb-4 flex items-center gap-4"><h2 className="font-heading font-extrabold uppercase text-[#FF5C1A] text-sm">{month}</h2><div className="h-px flex-1 bg-white/15"/></div>
                <div className="space-y-5">{groups.map(group => <TicketCard key={group.id} ticket={group.tickets[0]} tickets={group.tickets}/>)}</div>
              </section>)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange/40 hover:text-[#FF5C1A] transition-colors"
                >
                  ‹ Précédent
                </button>
                <span className="text-sm text-[#BEB3CA]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange/40 hover:text-[#FF5C1A] transition-colors"
                >
                  Suivant ›
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const configs = {
    upcoming: { title: 'Ton prochain bon plan t’attend !', detail: 'Découvre les sorties à venir et prépare ton prochain moment.', icon: TicketIcon },
    pending: { title: 'Aucune réservation en attente.', detail: 'Tes paiements en cours apparaîtront ici.', icon: Clock3 },
    past: { title: 'Pas encore de souvenirs ici !', detail: 'Tu retrouveras tes anciennes réservations dans cet onglet.', icon: CalendarX2 },
  };
  const info = configs[tab]; const Icon = info.icon;
  return <div className="text-center py-16">
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF5C1A]/10"><Icon className="h-8 w-8 text-[#FF5C1A]"/></div>
    <h2 className="font-heading text-xl font-extrabold mb-2">{info.title}</h2><p className="text-sm text-[#BEB3CA] mb-7">{info.detail}</p>
    {tab !== 'pending' && <Link href="/search" className="inline-block rounded-xl bg-[#FF5C1A] px-6 py-3 text-sm font-bold text-white">Découvrir les événements</Link>}
  </div>;
}
