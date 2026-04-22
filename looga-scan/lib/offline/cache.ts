import { storage } from '@/lib/store/mmkv';
import { eventsApi } from '@/lib/api/events';
import type { ScanResult } from '@/types/scan';

/**
 * Structure d'un billet en cache local.
 */
interface CachedTicket {
  ticketId: string;
  qrValue: string;
  attendeeName: string;
  ticketType: string;
  ticketNumber?: string;
  status: 'valid' | 'used';
}

type TicketCache = Record<string, CachedTicket>;

function cacheKey(eventId: string): string {
  return `event_tickets_${eventId}`;
}

function readCache(eventId: string): TicketCache {
  const raw = storage.getString(cacheKey(eventId));
  if (!raw) return {};
  try {
    return JSON.parse(raw) as TicketCache;
  } catch {
    return {};
  }
}

function writeCache(eventId: string, cache: TicketCache) {
  storage.set(cacheKey(eventId), JSON.stringify(cache));
}

/**
 * Télécharger tous les billets d'un événement et les stocker en cache local.
 * À appeler quand un événement est sélectionné (avec connexion disponible).
 */
export async function downloadEventTickets(eventId: string): Promise<number> {
  try {
    const tickets = await eventsApi.getTickets(eventId);
    const cache: TicketCache = {};
    for (const t of tickets) {
      cache[t.qrValue] = {
        ticketId: t.ticketId,
        qrValue: t.qrValue,
        attendeeName: t.attendeeName,
        ticketType: t.ticketType,
        ticketNumber: t.ticketNumber,
        status: t.status === 'used' ? 'used' : 'valid',
      };
    }
    writeCache(eventId, cache);
    return tickets.length;
  } catch {
    // Échec silencieux — on garde l'ancien cache s'il existe
    return 0;
  }
}

/**
 * Vérifier un QR code dans le cache local (mode offline).
 */
export function lookupTicketOffline(qrValue: string, eventId: string): ScanResult {
  const cache = readCache(eventId);
  const ticket = cache[qrValue];

  if (!ticket) {
    return { status: 'invalid' };
  }

  if (ticket.status === 'used') {
    return {
      status: 'already_used',
      ticketId: ticket.ticketId,
      attendeeName: ticket.attendeeName,
      ticketType: ticket.ticketType,
      ticketNumber: ticket.ticketNumber,
    };
  }

  return {
    status: 'valid',
    ticketId: ticket.ticketId,
    attendeeName: ticket.attendeeName,
    ticketType: ticket.ticketType,
    ticketNumber: ticket.ticketNumber,
  };
}

/**
 * Marquer un billet comme "utilisé" dans le cache local.
 */
export function markTicketUsedOffline(qrValue: string, eventId: string) {
  const cache = readCache(eventId);
  if (cache[qrValue]) {
    cache[qrValue].status = 'used';
    writeCache(eventId, cache);
  }
}

/**
 * Vérifier si un cache existe pour un événement.
 */
export function hasTicketCache(eventId: string): boolean {
  return !!storage.getString(cacheKey(eventId));
}
