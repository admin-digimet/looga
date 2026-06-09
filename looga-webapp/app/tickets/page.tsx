'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket as TicketIcon } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useAuthStore } from '@/lib/store/authStore';
import { useTickets } from '@/hooks/useTickets';
import type { Ticket } from '@/types';

type Tab = 'upcoming' | 'past';

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
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const { upcoming, past } = useMemo(() => {
    const list = tickets ?? [];
    const u: Ticket[] = [];
    const p: Ticket[] = [];
    for (const t of list) {
      if (isUpcoming(t)) u.push(t);
      else p.push(t);
    }
    // Tri : à venir = plus proche en premier, passés = plus récent en premier
    u.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    p.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return { upcoming: u, past: p };
  }, [tickets]);

  const allVisible = tab === 'upcoming' ? upcoming : past;
  const currentPage = tab === 'upcoming' ? upcomingPage : pastPage;
  const setCurrentPage = tab === 'upcoming' ? setUpcomingPage : setPastPage;
  const totalPages = Math.max(1, Math.ceil(allVisible.length / PAGE_SIZE));
  const visible = allVisible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (authLoading || (!isAuthenticated && !authLoading)) return null;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[820px] w-full mx-auto px-4 md:px-8 py-10">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-ink mb-2">Mes billets</h1>
        <p className="text-sm text-ink-muted mb-8">
          Présente ton QR à l&apos;entrée. Tu peux l&apos;agrandir d&apos;un clic.
        </p>

        {/* Tabs */}
        {!ticketsLoading && (upcoming.length > 0 || past.length > 0) && (
          <div className="flex items-center gap-1 mb-6 border-b border-black/10">
            <button
              type="button"
              onClick={() => { setTab('upcoming'); setUpcomingPage(1) }}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'upcoming' ? 'text-orange' : 'text-ink-muted hover:text-ink'
              }`}
            >
              À venir
              {upcoming.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[11px] px-1.5 py-0.5 rounded-full bg-orange/15 text-orange font-bold">
                  {upcoming.length}
                </span>
              )}
              {tab === 'upcoming' && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-orange rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => { setTab('past'); setPastPage(1) }}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'past' ? 'text-orange' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Passés
              {past.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[11px] px-1.5 py-0.5 rounded-full bg-black/8 text-ink-muted font-bold">
                  {past.length}
                </span>
              )}
              {tab === 'past' && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-orange rounded-full" />}
            </button>
          </div>
        )}

        {/* Content */}
        {ticketsLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/60 rounded-2xl h-[360px] sm:h-[260px]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          tab === 'upcoming' && past.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="text-center py-16 text-ink-muted text-sm">
              {tab === 'upcoming' ? 'Aucun billet à venir.' : 'Aucun billet passé.'}
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
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-black/10 disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange/40 transition-colors"
                >
                  ‹ Précédent
                </button>
                <span className="text-sm text-ink-muted">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-black/10 disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange/40 transition-colors"
                >
                  Suivant ›
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-orange/10 mx-auto flex items-center justify-center mb-5">
        <TicketIcon className="w-8 h-8 text-orange" />
      </div>
      <h2 className="font-heading text-xl font-extrabold text-ink mb-2">Aucun billet pour le moment</h2>
      <p className="text-sm text-ink-muted mb-8">
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
