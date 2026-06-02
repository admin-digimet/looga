import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';
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

export async function getSimilarEvents(params: {
  category?: string;
  excludeId: string;
  limit?: number;
}): Promise<Event[]> {
  const { category, excludeId, limit = 4 } = params;
  const select =
    'id,organizer_id,title,description,category,event_date,event_time,location_name,image_url,status,is_sold_out,min_price,views_count,created_at,organizer:organizers(id,name,description,logo_url,website),ticket_types(id,name,price,stock_remaining,is_active)';

  let url = `${SUPABASE_URL}/rest/v1/events?status=eq.published&id=neq.${excludeId}&select=${encodeURIComponent(select)}&order=event_date.asc&limit=${limit}`;
  if (category) url += `&category=eq.${category}`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) return [];
  const raw = await res.json();
  return Array.isArray(raw) ? raw.map(transformEvent) : [];
}

export type PricePreset = 'all' | 'free' | 'paid';
export type PeriodPreset = 'all' | 'today' | 'weekend' | 'week' | 'month';
export type SortPreset = 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc';

export interface SearchEventsParams {
  q?: string;
  cities?: string[];
  categories?: EventCategory[];
  price?: PricePreset;
  period?: PeriodPreset;
  sort?: SortPreset;
  page?: number;
  pageSize?: number;
}

function periodRange(preset: PeriodPreset | undefined): { gte?: string; lt?: string } {
  if (!preset || preset === 'all') return {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isoDate = (d: Date) => d.toISOString().slice(0, 10);
  switch (preset) {
    case 'today': {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return { gte: isoDate(today), lt: isoDate(tomorrow) };
    }
    case 'weekend': {
      // Vendredi 18h → dimanche 23h59
      const friday = new Date(today);
      const day = today.getDay(); // 0=dim, 5=ven, 6=sam
      const offset = day <= 5 ? 5 - day : 5 + (7 - day);
      friday.setDate(today.getDate() + offset);
      const monday = new Date(friday);
      monday.setDate(friday.getDate() + 3);
      return { gte: isoDate(friday), lt: isoDate(monday) };
    }
    case 'week': {
      const inAWeek = new Date(today);
      inAWeek.setDate(today.getDate() + 7);
      return { gte: isoDate(today), lt: isoDate(inAWeek) };
    }
    case 'month': {
      const inAMonth = new Date(today);
      inAMonth.setMonth(today.getMonth() + 1);
      return { gte: isoDate(today), lt: isoDate(inAMonth) };
    }
  }
}

export async function searchEvents(params: SearchEventsParams): Promise<PaginatedEvents> {
  const { q, cities, categories, price, period, sort = 'date_asc', page = 1, pageSize = 18 } = params;

  const select =
    'id,organizer_id,title,description,category,event_date,event_time,location_name,image_url,status,is_sold_out,min_price,views_count,created_at,organizer:organizers(id,name,description,logo_url,website),ticket_types(id,name,price,stock_remaining,is_active)';

  const search = new URLSearchParams();
  search.set('status', 'eq.published');
  search.set('select', select);

  if (categories && categories.length > 0) {
    const list = categories.map((c) => `"${c}"`).join(',');
    search.set('category', `in.(${list})`);
  }

  if (cities && cities.length > 0) {
    // ilike multi via "or" — match si le nom de ville est dans location_name
    const ors = cities.map((c) => `location_name.ilike.*${c}*`).join(',');
    search.set('or', `(${ors})`);
  }

  if (q && q.trim()) {
    const safe = q.trim().replace(/[*,()]/g, '');
    // Search dans title OU description OU location_name
    const orParam = `(title.ilike.*${safe}*,description.ilike.*${safe}*,location_name.ilike.*${safe}*)`;
    // Si on a déjà un "or" pour les villes, on doit utiliser "and" avec un nested or — PostgREST limite à un seul or top-level
    // Pour MVP : si villes ET search, on combine en concaténant les conditions du search dans le or villes
    const existing = search.get('or');
    if (existing) {
      const merged = existing.slice(1, -1) + ',title.ilike.*' + safe + '*,description.ilike.*' + safe + '*';
      search.set('or', `(${merged})`);
    } else {
      search.set('or', orParam);
    }
  }

  if (price === 'free') search.set('min_price', 'eq.0');
  if (price === 'paid') search.set('min_price', 'gt.0');

  const range = periodRange(period);
  if (range.gte) search.append('event_date', `gte.${range.gte}`);
  if (range.lt) search.append('event_date', `lt.${range.lt}`);

  const order =
    sort === 'date_desc' ? 'event_date.desc'
    : sort === 'price_asc' ? 'min_price.asc'
    : sort === 'price_desc' ? 'min_price.desc'
    : 'event_date.asc';
  search.set('order', order);

  // Range header pour pagination + total count
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const url = `${SUPABASE_URL}/rest/v1/events?${search.toString()}`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Range: `${from}-${to}`,
      Prefer: 'count=exact',
    },
  });

  if (!res.ok) {
    return { data: [], nextPage: null, total: 0 };
  }

  const contentRange = res.headers.get('Content-Range') ?? '';
  const total = Number(contentRange.split('/')[1] ?? 0) || 0;
  const raw = await res.json();
  const data: Event[] = Array.isArray(raw) ? raw.map(transformEvent) : [];
  const nextPage = to + 1 < total ? page + 1 : null;

  return { data, nextPage, total };
}

export async function getEventById(id: string): Promise<Event> {
  // PostgREST direct : event + organizer + ticket_types en un round-trip.
  // Lecture publique → on n'utilise QUE l'anon key (le user token peut être expiré → 401).
  const select = 'id,organizer_id,title,description,category,event_date,event_time,location_name,location_address,image_url,status,is_sold_out,min_price,views_count,created_at,organizer:organizers(id,name,description,logo_url,website),ticket_types(id,name,description,price,advantages,stock_total,stock_remaining,is_active)';
  const url = `${SUPABASE_URL}/rest/v1/events?id=eq.${id}&select=${encodeURIComponent(select)}`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/vnd.pgrst.object+json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw Object.assign(new Error(text || 'Event introuvable'), { status: res.status });
  }

  return transformEvent(await res.json());
}
