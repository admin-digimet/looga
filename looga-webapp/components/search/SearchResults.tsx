'use client';

import { SearchX, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
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
  isFetchNextPageError: boolean;
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
  isFetchNextPageError,
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
                <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#FF5C1A] text-[#14091f] text-[11px] font-bold">
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
      {isError && events.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 [&_.animate-pulse>div]:bg-[#392349]">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#382044]">
            <span className="absolute left-2 top-2 h-3 w-3 rounded-full bg-[#FF5C1A]/40" aria-hidden="true" />
            <span className="absolute bottom-3 right-3 h-2.5 w-2.5 rounded-full bg-[#FF5C1A]/70" aria-hidden="true" />
            <SearchX className="h-10 w-10 text-[#FF5C1A]" aria-hidden="true" />
          </div>
          <h3 className="font-heading text-xl font-extrabold text-white mb-2">
            Pas de sortie par ici… pour l’instant !
          </h3>
          <p className="text-sm text-white/55 mb-6 max-w-sm mx-auto">
            Essaie d’autres filtres, il y a sûrement quelque chose pour toi.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-block bg-[#FF5C1A] text-white font-bold py-3 px-7 rounded-xl hover:opacity-90"
          >
            Voir tous les événements
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {events.map((event) => (
              <article key={event.id} className="group flex h-full flex-col rounded-[22px] border border-white/10 bg-[#251331] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#FF5C1A]/45 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] [&_h3]:text-white [&_h3]:font-bold [&_h3]:text-[18px] [&_h3]:leading-snug [&_p]:text-white/70 [&_p]:mb-0.5 [&_h3]:mb-1 [&_a:hover_h3]:text-[#FF5C1A] [&_img]:rounded-xl [&_p.text-orange]:text-[#FF5C1A] [&_p.text-gray-700]:text-white [&_a>div:first-child]:aspect-[16/10] [&_a>div:first-child]:bg-[#392349] [&_a>div:first-child>div]:bg-[#392349] [&_a>div:first-child>button]:opacity-100 [&_a>div:first-child>button]:shadow-md">
                <div className="flex-1"><EventCard event={event} compactTime highlightFreePrice hideOrganizer /></div>
                <Link href={`/events/${event.id}`} className="mt-2 ml-auto inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[#FF5C1A] px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#FF7438]" aria-label={`Voir les billets pour ${event.name}`}>
                  {event.isSoldOut ? 'Voir l’événement' : 'Réserver'} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
            {(hasNextPage || isFetchNextPageError) && (
              <>
              {isFetchNextPageError && (
                <p role="alert" className="mb-4 text-sm text-white/70">
                  Impossible de charger les événements suivants. Les événements déjà affichés sont conservés.
                </p>
              )}
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
                aria-busy={isFetchingNextPage}
                className="inline-flex items-center gap-2 border border-[#FF5C1A] text-[#FF5C1A] font-semibold py-3 px-8 rounded-xl hover:bg-[#FF5C1A] hover:text-white disabled:opacity-50"
              >
                {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {isFetchingNextPage ? 'Chargement…' : isFetchNextPageError ? 'Réessayer le chargement' : "Voir plus d'événements"}
              </button>
              </>
            )}
            <p className="text-xs text-white/55">{events.length} sur {total} événements</p>
          </div>
        </>
      )}
    </div>
  );
}
