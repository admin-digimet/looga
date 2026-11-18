'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2, UserRound, ArrowRight, MapPin } from 'lucide-react';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useAuthStore } from '@/lib/store/authStore';
import { formatEventDate, formatPriceFrom } from '@/lib/utils';
import { getEventById } from '@/lib/api/events';
import { useSavedStore } from '@/lib/store/savedStore';
import type { Event } from '@/types';

export default function FavoritesPage() {
  const saved = useSavedStore((state) => state.saved);
  const toggleSaved = useSavedStore((state) => state.toggle);
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setHydrated(useSavedStore.persist.hasHydrated());
    const unsubscribe = useSavedStore.persist.onFinishHydration(() => setHydrated(true));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saved.length === 0) {
      setEvents([]);
      setFailed(false);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setFailed(false);
    Promise.allSettled(saved.map((id) => getEventById(id))).then((results) => {
      if (!active) return;
      setEvents(results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []));
      setFailed(results.some((result) => result.status === 'rejected'));
      setLoading(false);
    });
    return () => { active = false; };
  }, [hydrated, saved, retry]);

  const visibleEvents = events.filter((event) => saved.includes(event.id));

  return (
    <div className="min-h-screen bg-[#13091e] text-white flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#13091e]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="text-[#ff791f] font-heading font-extrabold text-3xl tracking-tight" aria-label="Looga — Accueil">looga.</Link>
          <nav aria-label="Navigation principale" className="flex items-center gap-5 sm:gap-9 text-sm font-semibold">
            <Link href="/search" className="hover:text-[#ff791f] transition-colors">Explorer</Link>
            <Link href="/" className="hidden sm:inline hover:text-[#ff791f] transition-colors">Événements</Link>
            <Link href="/organisateur" className="hidden md:inline hover:text-[#ff791f] transition-colors">Organisateurs</Link>
          </nav>
          {!authLoading && isAuthenticated ? <ProfileMenu /> : (
            <Link href="/auth/login" aria-label="Se connecter" className="rounded-full bg-white/10 p-3 hover:bg-white/20"><UserRound className="w-5 h-5" /></Link>
          )}
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto flex-1 px-5 sm:px-8 py-12 sm:py-16">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-8 h-8 text-[#ff791f]" aria-hidden="true" />
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight">Mes <span className="text-[#ff791f]">favoris</span></h1>
          </div>
          <p className="text-[#b6a8c2]">Retrouve les événements que tu as enregistrés.</p>
        </div>

        {(!hydrated || loading) ? (
          <div className="flex items-center gap-3 py-12 text-white/70" role="status"><Loader2 className="w-5 h-5 animate-spin" /> Chargement des favoris…</div>
        ) : (
          <>
            {failed && (
              <div role="alert" className="mb-6 rounded-xl border border-[#ff791f]/40 bg-[#25142f] p-4">
                <p>Certains favoris n'ont pas pu être chargés. Ils restent enregistrés.</p>
                <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-2 text-[#ff791f] font-semibold underline">Réessayer</button>
              </div>
            )}
            {visibleEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleEvents.map((event) => (
                  <article key={event.id} className="min-w-0 flex flex-col rounded-[26px] border border-[#4b3158] bg-[#25142f] p-3.5 shadow-lg">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#3a2549]">
                      <Link href={`/events/${event.id}`} aria-label={`Voir ${event.name}`} className="absolute inset-0 block overflow-hidden">
                        {event.image ? <img src={event.image} alt={event.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" /> : <span className="h-full w-full flex items-center justify-center text-5xl" aria-hidden="true">🎉</span>}
                      </Link>
                      <button type="button" onClick={() => toggleSaved(event.id)} aria-label={`Retirer ${event.name} des favoris`} aria-pressed={true} className="absolute right-3 top-3 z-10 rounded-full bg-white p-2.5 text-[#ff791f] hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#ff791f]">
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    <div className="px-1 pt-4 flex flex-col flex-1">
                      <Link href={`/events/${event.id}`} className="font-heading font-bold text-lg sm:text-xl leading-snug hover:text-[#ff791f] line-clamp-2">{event.name}</Link>
                      <p className="mt-2 text-sm font-semibold text-[#ff791f]">{formatEventDate(event.date, event.time).replace(/(\d{1,2}):(\d{2})(?::\d{2})?/g, '$1h$2')}</p>
                      <p className="mt-1 text-sm text-[#c4b7ce] flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" />{event.location}</p>
                      <p className="mt-1 text-sm font-semibold">{formatPriceFrom(event.minPrice)}</p>
                      <p className="mt-1 mb-5 text-sm text-[#c4b7ce]">{event.organizerName}</p>
                      <Link href={`/events/${event.id}`} className="mt-auto flex items-center justify-center gap-3 rounded-xl bg-[#ff791f] px-4 py-3 text-sm font-bold text-[#150b1e] hover:bg-[#ff9148] transition-colors">Réserver <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : !failed ? (
              <div className="rounded-2xl border border-[#4b3158] bg-[#25142f] py-16 px-5 text-center">
                <Heart className="w-11 h-11 mx-auto mb-4 text-[#ff791f]" aria-hidden="true" />
                <h2 className="font-heading text-xl font-bold mb-2">Aucun favori pour le moment</h2>
                <p className="text-[#c4b7ce] mb-6">Enregistre les événements qui te plaisent en cliquant sur le cœur.</p>
                <Link href="/search" className="inline-flex rounded-xl bg-[#ff791f] px-6 py-3 font-bold text-[#150b1e]">Explorer les événements</Link>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
