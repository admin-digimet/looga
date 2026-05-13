import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, SUPABASE_URL, SUPABASE_ANON_KEY, TOKEN_KEY } from '@/lib/constants';
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
  // Appel PostgREST direct pour récupérer event + organizer + ticket_types en un round-trip.
  // L'Edge Function /events/:id ne fait pas le join organizer, donc on bypass ici.
  const select = 'id,organizer_id,title,description,category,event_date,event_time,location_name,location_address,image_url,status,is_sold_out,min_price,views_count,created_at,organizer:organizers(id,name,description,logo_url,website),ticket_types(id,name,description,price,advantages,stock_total,stock_remaining,is_active)';
  const url = `${SUPABASE_URL}/rest/v1/events?id=eq.${id}&select=${encodeURIComponent(select)}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
      Accept: 'application/vnd.pgrst.object+json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw Object.assign(new Error(text || 'Event introuvable'), { status: res.status });
  }

  return transformEvent(await res.json());
}
