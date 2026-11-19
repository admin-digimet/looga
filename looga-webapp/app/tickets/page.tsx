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

type Tab = 'upcoming' | 'past' | 'cancelled';

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
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [pastPage, setPastPage] = useState(1)
  const [cancelledPage, setCancelledPage] = useState(1)
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const { upcoming, past, cancelled } = useMemo(() => {
    const list = tickets ?? [];
    const u: Ticket[] = [];
    const p: Ticket[] = [];
    const c: Ticket[] = [];
    for (const t of list) {
      // Les annulés (paiement abandonné/échoué) sont isolés dans leur onglet
      // pour la traçabilité, sans polluer "À venir" / "Passés".
      if (t.status === 'cancelled') c.push(t);
      else if (isUpcoming(t)) u.push(t);
      else p.push(t);
    }
    // Tri : à venir = plus proche en premier, passés/annulés = plus récent en premier
    u.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    p.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    c.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return { upcoming: u, past: p, cancelled: c };
  }, [tickets]);

  const allVisible = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;
  const currentPage = tab === 'upcoming' ? upcomingPage : tab === 'past' ? pastPage : cancelledPage;
  const setCurrentPage = tab === 'upcoming' ? setUpcomingPage : tab === 'past' ? setPastPage : setCancelledPage;
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
        {!ticketsLoading && (upcoming.length > 0 || past.length > 0 || cancelled.length > 0) && (
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
            {cancelled.length > 0 && (
              <button
                type="button"
                onClick={() => { setTab('cancelled'); setCancelledPage(1) }}
                className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === 'cancelled' ? 'text-[#FF791F]' : 'text-[#BEB3CA] hover:text-white'
                }`}
              >
                Annulé
                <span className="ml-1.5 inline-flex items-center justify-center text-[11px] px-1.5 py-0.5 rounded-full bg-white/10 text-[#CFC4DA] font-bold">
                  {cancelled.length}
                </span>
                {tab === 'cancelled' && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-orange rounded-full" />}
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {ticketsLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-[#251A30] rounded-2xl h-[360px] sm:h-[260px]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          upcoming.length === 0 && past.length === 0 && cancelled.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="text-center py-16 text-[#BEB3CA] text-sm">
              {tab === 'upcoming'
                ? 'Aucun billet à venir.'
                : tab === 'past'
                ? 'Aucun billet passé.'
                : 'Aucun billet annulé.'}
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
        href="/"
        className="inline-block bg-orange text-white font-bold px-7 py-3 rounded-xl hover:opacity-90 transition-colors"
      >
        Explorer les événements
      </Link>
    </div>
  );
}
