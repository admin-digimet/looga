import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/constants';
import type { Event, EventCategory, PaginatedEvents } from '@/types';

interface GetEventsParams {
  page?: number;
  category?: EventCategory;
  search?: string;
  city?: string;
}

function transformTicketType(raw: any) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description,
    price: raw.price ?? 0,
    advantages: raw.advantages,
    stock: raw.stock_remaining ?? raw.stock ?? 0,
    soldOut: (raw.stock_remaining ?? raw.stock ?? 1) === 0,
  };
}

function transformEvent(raw: any): Event {
  const rawOrganizer = raw.organizer ?? null;
  return {
    id: raw.id,
    name: raw.title ?? raw.name ?? '',
    description: raw.description ?? '',
    category: raw.category ?? 'tout',
    date: raw.event_date ?? raw.date ?? '',
    time: raw.event_time ?? raw.time ?? '',
    location: raw.location_name ?? raw.location ?? '',
    image: raw.image_url ?? raw.image ?? '',
    organizerName: rawOrganizer?.name ?? raw.organizer_name ?? raw.organizerName ?? '',
    organizer: rawOrganizer
      ? {
          id: rawOrganizer.id,
          name: rawOrganizer.name ?? '',
          description: rawOrganizer.description ?? null,
          logo_url: rawOrganizer.logo_url ?? null,
          website: rawOrganizer.website ?? null,
        }
      : null,
    ticketTypes: (raw.ticket_types ?? raw.ticketTypes ?? []).map(transformTicketType),
    isSoldOut: raw.is_sold_out ?? raw.isSoldOut ?? false,
    minPrice: raw.min_price ?? raw.minPrice ?? 0,
    createdAt: raw.created_at ?? raw.createdAt ?? '',
    locationUrl: raw.location_url ?? raw.locationUrl ?? '',
  };
}

export async function getEvents(params: GetEventsParams = {}): Promise<PaginatedEvents> {
  const { data } = await apiClient.get<any>(ENDPOINTS.events, { params });
  const raw = Array.isArray(data) ? data : (data.data ?? []);
  return {
    data: raw.map(transformEvent),
    nextPage: data.nextPage ?? data.next_page ?? null,
    total: data.total ?? raw.length,
  };
}

export async function getEventById(id: string): Promise<Event> {
  const { data } = await apiClient.get<any>(ENDPOINTS.eventById(id));
  return transformEvent(data);
}
