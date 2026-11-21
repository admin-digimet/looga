'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { formatEventDate, formatPriceFrom } from '@/lib/utils';
import { useSavedStore } from '@/lib/store/savedStore';
import type { Event } from '@/types';

export function EventCard({ event, compactTime = false, highlightFreePrice = false, hideOrganizer = false, darkVariant = false }: { event: Event; compactTime?: boolean; highlightFreePrice?: boolean; hideOrganizer?: boolean; darkVariant?: boolean }) {
  const isSaved = useSavedStore((s) => s.saved.includes(event.id));
  const toggleSaved = useSavedStore((s) => s.toggle);

  const tagInfo = event.isSoldOut
    ? { label: 'Complet', color: 'text-red-700 bg-red-100' }
    : event.trending
    ? { label: 'Tendance', color: 'text-purple-700 bg-purple-100' }
    : null;

  function handleHeartClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(event.id);
  }

  return (
    <div className={`flex flex-col group h-full ${darkVariant ? 'text-white' : ''}`}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-3">
        <Link href={`/events/${event.id}`} className="block h-full w-full" aria-label={`Voir ${event.name}`}>
          {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">
            🎉
          </div>
        )}
        </Link>
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isSaved}
          className={`absolute top-2 right-2 p-2 bg-white/90 rounded-full transition-opacity ${
            isSaved ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isSaved ? 'text-orange fill-orange' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      {tagInfo && (
        <span className={`text-xs font-bold px-2 py-1 rounded w-max mb-2 ${tagInfo.color}`}>
          {tagInfo.label}
        </span>
      )}

      <h3 className={`font-bold text-lg leading-tight mb-1 group-hover:text-orange line-clamp-2 wrap-break-word ${darkVariant ? 'text-white' : ''}`}>
        <Link href={`/events/${event.id}`} className="focus-visible:underline focus-visible:outline-2 focus-visible:outline-orange">{event.name}</Link>
      </h3>
      <p className="text-orange font-semibold text-sm mb-1">
        {compactTime ? formatEventDate(event.date, event.time).replace(/(\d{1,2}):(\d{2})(?::\d{2})?/g, '$1h$2') : formatEventDate(event.date, event.time)}
      </p>
      <p className={`${darkVariant ? 'text-[#b9aec7]' : 'text-gray-500'} text-sm mb-1`}>{event.location}</p>
      <p className={`${highlightFreePrice && event.minPrice === 0 ? '!text-[#FF5C1A]' : darkVariant ? 'text-white' : 'text-gray-700'} text-sm font-medium mb-1`}>{formatPriceFrom(event.minPrice)}</p>
      {!hideOrganizer && <p className="text-gray-500 text-sm mt-auto">{event.organizerName}</p>}
    </div>
  );
}
