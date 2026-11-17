'use client';

import { SearchX, Loader2 } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { EventCardSkeleton } from '@/components/EventCardSkeleton';
import type { Event } from '@/types';
import type { SortPreset } from '@/lib/api/events';

const SORT_OPTIONS: { key: SortPreset; label: string }[] = [
  { key: 'date_asc',   label: 'Date (prochains)' },
  { key: 'date_desc',  label: 'Date (derniers)' },
  { key: 'price_asc',  label: 'Prix (croissant)' },
  { key: 'price_desc', label: 'Prix (décroissant)' },
];

interface Props {
  events: Event[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  sort: SortPreset;
  onSortChange: (s: SortPreset) => void;
  onLoadMore: () => void;
  onResetFilters: () => void;
  onOpenFilters?: () => void; // pour mobile drawer
  activeFiltersCount: number;
}

export function SearchResults({
  events,
  total,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  sort,
  onSortChange,
  onLoadMore,
  onResetFilters,
  onOpenFilters,
  activeFiltersCount,
}: Props) {
  return (
    <div className="flex-1 min-w-0">
      {/* Header — compteur + tri + bouton filtres mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-sm font-semibold text-white/80 hover:border-orange"
            >
              Filtres
              {activeFiltersCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#ff791f] text-[#14091f] text-[11px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
          <p className="text-sm text-white/60">
            {isLoading
              ? 'Recherche en cours…'
              : `${total.toLocaleString('fr-FR')} ${total > 1 ? 'événements trouvés' : 'événement trouvé'}`}
          </p>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <span className="text-white/60">Trier par</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortPreset)}
            className="border border-white/20 rounded-lg px-3 py-1.5 text-sm font-semibold text-white/80 bg-[#382044] outline-none focus:border-orange cursor-pointer"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Body */}
      {isError ? (
        <div className="text-center py-20">
          <p className="text-white/55 mb-4">Une erreur est survenue.</p>
          <button
            type="button"
            onClick={onResetFilters}
            className="border border-white/20 text-white/80 font-semibold py-2 px-6 rounded-lg hover:bg-white/10"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#ff791f]/10 flex items-center justify-center">
            <SearchX className="w-8 h-8 text-[#ff791f]" />
          </div>
          <h3 className="font-heading text-xl font-extrabold text-white mb-2">
            Aucun événement trouvé
          </h3>
          <p className="text-sm text-white/55 mb-6 max-w-sm mx-auto">
            Essaie d&apos;élargir tes critères ou de réinitialiser les filtres.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-block bg-[#ff791f] text-[#14091f] font-bold py-3 px-7 rounded-xl hover:opacity-90"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
            {events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
          {hasNextPage && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 border border-white/20 text-white/80 font-semibold py-3 px-8 rounded-lg hover:bg-white/10 disabled:opacity-50"
              >
                {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFetchingNextPage ? 'Chargement…' : "Voir plus d'événements"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
