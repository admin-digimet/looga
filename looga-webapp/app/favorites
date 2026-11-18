'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EventCard } from '@/components/EventCard';
import { getEventById } from '@/lib/api/events';
import { useSavedStore } from '@/lib/store/savedStore';
import type { Event } from '@/types';

export default function FavoritesPage() {
  const saved = useSavedStore((state) => state.saved);
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
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-orange" aria-hidden="true" />
          <h1 className="text-3xl font-bold">Mes favoris</h1>
        </div>
        {(!hydrated || loading) ? (
          <div className="flex items-center gap-3 py-12" role="status"><Loader2 className="w-5 h-5 animate-spin" /> Chargement des favoris…</div>
        ) : (
          <>
            {failed && (
              <div role="alert" className="mb-6 rounded-lg border border-orange/40 p-4">
                <p>Certains favoris n'ont pas pu être chargés. Ils restent enregistrés.</p>
                <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-2 text-orange font-semibold underline">Réessayer</button>
              </div>
            )}
            {visibleEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleEvents.map((event) => <EventCard key={event.id} event={event} compactTime />)}
              </div>
            ) : !failed ? (
              <div className="py-16 text-center">
                <Heart className="w-10 h-10 mx-auto mb-4 opacity-40" aria-hidden="true" />
                <p className="mb-5">Tu n'as pas encore d'événements favoris.</p>
                <Link href="/search" className="inline-flex rounded-lg bg-orange px-5 py-3 font-semibold text-black">Explorer les événements</Link>
              </div>
            ) : null}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
