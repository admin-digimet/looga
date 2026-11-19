'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket as TicketIcon } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useAuthStore } from '@/lib/store/authStore';
import { useTickets } from '@/hooks/useTickets';
import type { Ticket } from '@/types';

type Tab = 'upcoming' | 'pending' | 'past';
type PastFilter = 'all' | 'used' | 'unused' | 'cancelled';

function isUpcoming(ticket: Ticket): boolean {
  if (!ticket.eventDate) return true; // pas de date connue → on suppose à venir
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
  const allVisible = tab === 'upcoming' ? upcoming : tab === 'pending' ? pending : filteredPast;
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
          Présente ton QR à l&apos;entrée. Tu peux l&apos;agrandir d&apos;un clic.
        </p>

        {/* Tabs */}
        {!ticketsLoading && (upcoming.length > 0 || pending.length > 0 || past.length > 0) && (
          <div className="flex items-center gap-1 mb-6 border-b border-white/15">
            <button
              type="button"
              onClick={() => { setTab('upcoming'); setUpcomingPage(1) }}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'upcoming' ? 'text-[#FF791F]' : 'text-[#BEB3CA] hover:text-white'
              }`}
            >
              À venir
              {upcoming.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[11px] px-1.5 py-0.5 rounded-full bg-orange/15 text-[#FF791F] font-bold">
                  {upcoming.length}
                </span>
              )}
              {tab === 'upcoming' && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-orange rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => { setTab('pending'); setPendingPage(1) }}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'pending' ? 'text-[#FF791F]' : 'text-[#BEB3CA] hover:text-white'
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
                tab === 'past' ? 'text-[#FF791F]' : 'text-[#BEB3CA] hover:text-white'
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
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${pastFilter === item.value ? 'border-[#FF791F] bg-[#FF791F]/15 text-[#FF9B59]' : 'border-white/15 text-[#BEB3CA] hover:text-white'}`}>
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
            <EmptyState />
          ) : (
            <div className="text-center py-16 text-[#BEB3CA] text-sm">
              {tab === 'upcoming'
                ? 'Aucun billet à venir.'
                : tab === 'pending'
                ? 'Aucun paiement en attente.'
                : 'Aucun billet dans cette catégorie.'}
            </div>
          )
        ) : (
          <>
            <div className="space-y-5">
              {visible.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange/40 hover:text-[#FF791F] transition-colors"
                >
                  ‹ Précédent
                </button>
                <span className="text-sm text-[#BEB3CA]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange/40 hover:text-[#FF791F] transition-colors"
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

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#FF791F]/10 mx-auto flex items-center justify-center mb-5">
        <TicketIcon className="w-8 h-8 text-[#FF791F]" />
      </div>
      <h2 className="font-heading text-xl font-extrabold text-white mb-2">Aucun billet pour le moment</h2>
      <p className="text-sm text-[#BEB3CA] mb-8">
        Découvre les événements à Abidjan et réserve ta place en quelques clics.
      </p>
      <Link
        href="/search"
        className="inline-block bg-orange text-white font-bold px-7 py-3 rounded-xl hover:opacity-90 transition-colors"
      >
        Découvrir les événements
      </Link>
    </div>
  );
}
