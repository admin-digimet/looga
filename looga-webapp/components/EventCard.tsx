'use client';

import Link from 'next/link';
import { Heart, ChevronRight, CalendarDays, MapPin, Image as ImageIcon } from 'lucide-react';
import { formatEventDate, formatPriceFrom } from '@/lib/utils';
import { useSavedStore } from '@/lib/store/savedStore';
import type { Event } from '@/types';

export function eventCardState(event: Event) {
  const cancelled = event.status === 'cancelled';
  const postponed = event.status === 'postponed';
  const available = event.ticketTypes.filter(t => t.active !== false && !t.soldOut && t.stock > 0);
  const soldOut = !cancelled && !postponed && (event.isSoldOut || (event.ticketTypes.length > 0 && available.length === 0));
  const lowestAvailable = available.length ? Math.min(...available.map(t => t.price)) : null;
  const priceKnown = event.pricePublished !== false && (event.ticketTypes.length > 0 || Number.isFinite(event.minPrice));
  const price = !priceKnown ? null : (lowestAvailable ?? (event.ticketTypes.length === 0 ? event.minPrice : null));
  const date = event.publishedAt ? Date.parse(event.publishedAt) : NaN;
  const fresh = Number.isFinite(date) && Date.now() >= date && Date.now() - date < 72 * 60 * 60 * 1000;
  return { cancelled, postponed, soldOut, price, fresh,
    action: cancelled || postponed ? 'Consulter les détails' : soldOut ? 'Billets épuisés' : 'Réserver' };
}

export function EventCard({ event, compactTime = false, highlightFreePrice = false, hideOrganizer = false, darkVariant = false, showAction = false }: { event: Event; compactTime?: boolean; highlightFreePrice?: boolean; hideOrganizer?: boolean; darkVariant?: boolean; showAction?: boolean }) {
  const isSaved = useSavedStore((s) => s.saved.includes(event.id));
  const toggleSaved = useSavedStore((s) => s.toggle);
  const state = eventCardState(event);
  const displayDate = state.postponed
    ? (event.rescheduledDate ? formatEventDate(event.rescheduledDate) : 'Nouvelle date à confirmer')
    : compactTime ? formatEventDate(event.date, event.time).replace(/(\d{1,2}):(\d{2})(?::\d{2})?/g, '$1h$2') : formatEventDate(event.date, event.time);
  const localDate = event.date?.slice(0, 10);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Abidjan', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const isToday = localDate === today && !state.postponed && !state.cancelled;
  const effectiveDate = state.postponed ? event.rescheduledDate : event.date;
  const badgeDate = effectiveDate && /^\d{4}-\d{2}-\d{2}/.test(effectiveDate)
    ? new Date(`${effectiveDate.slice(0,10)}T12:00:00Z`) : null;
  const day = badgeDate ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', timeZone: 'UTC' }).format(badgeDate) : null;
  const month = badgeDate ? new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' }).format(badgeDate).replace('.', '').toUpperCase() : null;
  // La catégorie seule ne suffit pas pour déduire un quartier ou une adresse précise.
  const place = event.location?.trim();

  function handleHeartClick(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation(); toggleSaved(event.id);
  }

  return (
    <div className={`flex h-full flex-col group ${darkVariant ? 'text-white' : ''} ${state.cancelled ? 'opacity-75' : state.postponed ? 'opacity-90' : ''}`}>
      <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-xl bg-[#352140]">
        <Link href={`/events/${event.id}`} className="block h-full w-full" aria-label={`Voir ${event.name}`}>
          {event.image ? <img src={event.image} alt={event.name} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.035]" /> : null}
          <div className={`${event.image ? 'hidden' : ''} flex h-full w-full items-center justify-center bg-gradient-to-br from-[#382044] to-[#190e27] text-[#FF5C1A]`} aria-hidden="true"><ImageIcon size={40}/></div>
        </Link>
        {day && month && <div className="absolute left-2 top-2 z-10 flex min-w-12 flex-col items-center rounded-lg bg-white px-2 py-1 text-center shadow-md" aria-label={`Date : ${day} ${month}`}><span className="text-lg font-extrabold leading-tight text-[#24122f]">{day}</span><span className="text-[10px] font-bold text-[#FF5C1A]">{month}</span></div>}
        {(state.cancelled || state.postponed || state.soldOut) && <span className={`absolute bottom-2 left-2 z-10 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${state.cancelled ? 'bg-[#A33D45]' : state.postponed ? 'bg-[#9A6827]' : 'bg-[#3B3044]'}`}>{state.cancelled ? 'ÉVÉNEMENT ANNULÉ' : state.postponed ? 'REPORTÉ' : 'COMPLET'}</span>}
        {event.isSponsored && <span className="absolute bottom-2 right-2 rounded-md bg-[#24122f]/90 px-2 py-1 text-[10px] text-white">Sponsorisé</span>}
        <button type="button" onClick={handleHeartClick} aria-label={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isSaved} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"><Heart className={`h-5 w-5 ${isSaved ? 'fill-[#FF5C1A] text-[#FF5C1A]' : 'text-gray-600'}`} /></button>
      </div>
      <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#FF5C1A]"><span>{event.category.replace(/_/g, ' ')}</span>{state.fresh && <span className="rounded-md bg-[#FF5C1A] px-2 py-0.5 text-[10px] text-white">NOUVEAU</span>}</div>
      <h3 className="mb-1 line-clamp-2 font-heading text-lg font-bold leading-tight text-white group-hover:text-[#FF5C1A]"><Link href={`/events/${event.id}`}>{event.name}</Link></h3>
      <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[#FF5C1A]"><CalendarDays size={14} className="shrink-0"/>{isToday ? `Aujourd’hui à ${event.time?.slice(0,5).replace(':','h') || ''}` : displayDate}</p>
      {place && <p className={`mb-1 flex items-center gap-1.5 line-clamp-1 text-sm ${darkVariant ? 'text-[#b9aec7]' : 'text-gray-400'}`}><MapPin size={14} className="shrink-0"/><span className="truncate">{place}</span></p>}
      <p className={`mb-1 text-sm font-medium ${state.price === 0 ? '!text-[#FF5C1A]' : darkVariant ? 'text-white' : 'text-gray-200'}`}>{state.price === null ? (state.soldOut ? 'Billets épuisés' : 'Tarif à venir') : formatPriceFrom(state.price)}</p>
      {showAction && <div className="mt-auto flex justify-end pt-3">{state.soldOut ? <span className="inline-flex min-h-11 items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white/60">Billets épuisés</span> : <Link href={`/events/${event.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF5C1A] px-4 py-2 text-sm font-bold text-white hover:brightness-110">{state.action}<ChevronRight className="h-4 w-4"/></Link>}</div>}
    </div>
  );
}
