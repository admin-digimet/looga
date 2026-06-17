'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { CategoryBubbles } from '@/components/CategoryBubbles';
import { Footer } from '@/components/Footer';
import { EventCard } from '@/components/EventCard';
import { EventCardSkeleton } from '@/components/EventCardSkeleton';
import { Pagination } from '@/components/Pagination';
import * as eventsApi from '@/lib/api/events';
import type { EventCategory } from '@/types';

const EVENTS_SECTION_ID = 'events-section';
const PAGE_SIZE = 24;

const TABS = ['Tous', 'Concerts', 'Soirées', 'Ce week-end'];

/** Mappe un onglet vers les filtres de searchEvents. */
function tabParams(tab: string): { categories?: EventCategory[]; period?: 'weekend' } {
  if (tab === 'Concerts') return { categories: ['concerts'] };
  if (tab === 'Soirées') return { categories: ['soirees'] };
  if (tab === 'Ce week-end') return { period: 'weekend' };
  return {};
}

export default function HomePage() {
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

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        {/* Bulles catégories */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
          <CategoryBubbles />
        </div>

        {/* Events Section */}
        <div id={EVENTS_SECTION_ID} className="mt-8 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Événements à <span className="text-orange">Abidjan</span>
              </h2>

              <div className="flex overflow-x-auto gap-6 border-b border-gray-200 pb-[1px]">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => changeTab(tab)}
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
                      <div className="col-span-full text-center py-16 text-gray-500">
                        Aucun événement trouvé pour cette catégorie.
                      </div>
                    )
                    : events.map((event) => <EventCard key={event.id} event={event} />)}
                </div>

                {!isLoading && total > 0 && (
                  <div className="mt-12 flex flex-col items-center gap-3">
                    <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
                    <p className="text-sm text-gray-500">
                      Affichage de {from} à {to} sur {total} résultat{total > 1 ? 's' : ''}.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
