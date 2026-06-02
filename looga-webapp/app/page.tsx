'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EventCard } from '@/components/EventCard';
import { EventCardSkeleton } from '@/components/EventCardSkeleton';
import { useEvents } from '@/hooks/useEvents';
import type { EventCategory } from '@/types';

const EVENTS_SECTION_ID = 'events-section';

function scrollToEvents() {
  document.getElementById(EVENTS_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const destinations = [
  { name: 'Abidjan', image: 'https://media.istockphoto.com/id/2167527219/fr/photo/vue-en-plong%C3%A9e-de-la-ville-illumin%C3%A9e-avec-la-rivi%C3%A8re-la-nuit.jpg?s=612x612&w=0&k=20&c=B9vCgUbsn1aFiSnGVaqvYCeTn3NtHy1R2mdjHz5ZQ20=' },
  { name: 'Bouaké', image: 'https://media-files.abidjan.net/photo/hotel-de-ville-de-bouake-symbole-de-la-renaissance-de-la-region-du-gbeke_57pk7xxwjsl.jpg' },
  { name: 'Yamoussokro', image: 'https://img.lemde.fr/2020/07/20/0/0/5476/3651/1440/960/60/0/bfd2eb8_685220762-000_1Q208W.jpg' },
  { name: 'Grand-Bassam', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=600&q=80' },
];

const popularCities = [
  'Abidjan', 'Bouaké', 'Yamoussoukro', 'Grand-Bassam', 'San-Pédro', 'Korhogo',
  'Daloa', 'Man', 'Dakar', 'Lomé', 'Cotonou', 'Ouagadougou',
];

const TAB_MAP: Record<string, EventCategory | undefined> = {
  'Tous': undefined,
  'Concerts': 'concerts',
  'Soirées': 'soirees',
  'Ce week-end': 'tout',
};
const TABS = ['Tous', 'Concerts', 'Soirées', 'Ce week-end'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Tous');
  const category = TAB_MAP[activeTab];

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useEvents({ category });

  const events = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        {/* Hero */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gray-900" />
            <img
              src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
              alt="Live Music Hero"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-16">
              <span className="text-orange font-bold tracking-wider text-sm mb-2">PLONGEZ DEDANS</span>
              <h1 className="text-white font-extrabold text-5xl md:text-7xl tracking-tighter leading-none mb-2">
                LES MEILLEURS
              </h1>
              <h1 className="text-violet font-extrabold text-5xl md:text-7xl tracking-tighter leading-none mb-8">
                ÉVÉNEMENTS
              </h1>
              <button
                type="button"
                onClick={scrollToEvents}
                className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-cream-2 transition-colors"
              >
                Découvrir
              </button>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div id={EVENTS_SECTION_ID} className="mt-12 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                Événements à <span className="text-orange">Abidjan</span>
              </h2>

              <div className="flex overflow-x-auto gap-6 border-b border-gray-200 pb-[1px]">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-orange text-orange'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {isError ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">
                  Une erreur est survenue lors du chargement des événements.
                </p>
                <button
                  onClick={() => refetch()}
                  className="border border-gray-300 text-gray-700 font-semibold py-2 px-6 rounded hover:bg-gray-50 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} />)
                    : events.length === 0
                    ? (
                      <div className="col-span-4 text-center py-16 text-gray-500">
                        Aucun événement trouvé pour cette catégorie.
                      </div>
                    )
                    : events.map((event) => <EventCard key={event.id} event={event} />)}
                </div>

                {hasNextPage && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="border border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isFetchingNextPage ? 'Chargement…' : "Voir plus d'événements"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-cream-2 py-16 mt-12">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Top destinations</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {destinations.map((dest) => (
                <Link
                  key={dest.name}
                  href={`/search?cities=${encodeURIComponent(dest.name)}`}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden group focus:outline-none focus-visible:ring-4 focus-visible:ring-orange/40"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-white font-extrabold text-2xl tracking-tight">
                    {dest.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Popular cities */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Villes populaires</h2>
          <div className="flex flex-wrap gap-3">
            {popularCities.map((city) => (
              <Link
                key={city}
                href={`/search?cities=${encodeURIComponent(city)}`}
                className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-orange/10 hover:text-orange px-4 py-2 rounded-full transition-colors"
              >
                Événements à {city}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
