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
    active: raw.is_active ?? true,
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
    // Ces champs ne s'affichent que si l'API les transmet réellement.
    publishedAt: raw.published_at ?? raw.publishedAt ?? undefined,
    status: raw.status ?? undefined,
    rescheduledDate: raw.rescheduled_date ?? raw.rescheduledDate ?? undefined,
    isSponsored: raw.is_sponsored ?? raw.isSponsored ?? false,
    pricePublished: raw.price_published ?? raw.pricePublished ?? (raw.min_price != null || raw.minPrice != null || (raw.ticket_types ?? raw.ticketTypes ?? []).length > 0),
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

  if (!res.ok) {
    throw new Error(`Le chargement des événements similaires a échoué (HTTP ${res.status}).`);
  }
  const raw = await res.json();
  return Array.isArray(raw) ? raw.map(transformEvent) : [];
}

export type PricePreset = 'all' | 'free' | 'paid';
export type PeriodPreset = 'all' | 'today' | 'tonight' | 'weekend' | 'week' | 'month';
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

// Les dates d'événement sont interprétées dans le fuseau d'Abidjan (UTC+0).
// Les méthodes UTC évitent les décalages liés au fuseau du navigateur.
function periodRange(preset: PeriodPreset | undefined): { gte?: string; lt?: string; friday?: string } {
  if (!preset || preset === 'all') return {};
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const isoDate = (date: Date) => date.toISOString().slice(0, 10);
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  };

  switch (preset) {
    case 'today':
    case 'tonight':
      return { gte: isoDate(today), lt: isoDate(addDays(today, 1)) };
    case 'weekend': {
      // Vendredi à partir de 18 h, samedi et dimanche en entier.
      // Le samedi et le dimanche, rester sur le week-end en cours.
      const day = today.getUTCDay(); // 0 = dimanche, 5 = vendredi, 6 = samedi
      const offset = day === 0 ? -2 : day === 6 ? -1 : 5 - day;
      const friday = addDays(today, offset);
      return { gte: isoDate(friday), lt: isoDate(addDays(friday, 3)), friday: isoDate(friday) };
    }
    case 'week':
      return { gte: isoDate(today), lt: isoDate(addDays(today, 7)) };
    case 'month': {
      const nextMonth = new Date(today);
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
      return { gte: isoDate(today), lt: isoDate(nextMonth) };
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

  // Combine city and keyword as AND of two OR groups, never as a single OR.
  // This preserves independent filtering when both criteria are present.
  const cityVariants: Record<string, string[]> = {
    'Abidjan': ['Abidjan'],
    'Grand-Bassam': ['Grand-Bassam', 'Grand Bassam'],
    'Assinie': ['Assinie', 'Assinié'],
  };
  const selectedCities = (cities ?? []).flatMap((city) => cityVariants[city] ?? [city]);
  const safePattern = (value: string) => value.trim().replace(/[*,().]/g, '');
  const cityTerms = selectedCities
    .map(safePattern)
    .filter(Boolean)
    .map((city) => `location_name.ilike.*${city}*`);
  const keyword = q ? safePattern(q) : '';
  const keywordTerms = keyword ? [
    `title.ilike.*${keyword}*`,
    `description.ilike.*${keyword}*`,
    `location_name.ilike.*${keyword}*`,
  ] : [];

  const andGroups: string[] = [];
  if (cityTerms.length && keywordTerms.length) {
    andGroups.push(`or(${cityTerms.join(',')})`, `or(${keywordTerms.join(',')})`);
  } else if (cityTerms.length || keywordTerms.length) {
    search.set('or', `(${(cityTerms.length ? cityTerms : keywordTerms).join(',')})`);
  }

  if (price === 'free') search.set('min_price', 'eq.0');
  if (price === 'paid') search.set('min_price', 'gt.0');

  const range = periodRange(period);
  if (range.gte) search.append('event_date', `gte.${range.gte}`);
  if (range.lt) search.append('event_date', `lt.${range.lt}`);
  // Contrairement à 'Aujourd’hui', 'Ce soir' commence à 18 h.
  if (period === 'tonight') search.set('event_time', 'gte.18:00:00');
  // Le vendredi, seuls les événements à partir de 18 h font partie du week-end.
  if (period === 'weekend' && range.friday) {
    andGroups.push(`or(event_date.gt.${range.friday},and(event_date.eq.${range.friday},event_time.gte.18:00:00))`);
  }
  if (andGroups.length) search.set('and', `(${andGroups.join(',')})`);

  // Trier aussi par heure, puis par identifiant pour stabiliser la pagination.
  const order =
    sort === 'date_desc' ? 'event_date.desc,event_time.desc,id.desc'
    : sort === 'price_asc' ? 'min_price.asc,event_date.asc,event_time.asc,id.asc'
    : sort === 'price_desc' ? 'min_price.desc,event_date.asc,event_time.asc,id.asc'
    : 'event_date.asc,event_time.asc,id.asc';
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
    throw new Error(`La recherche des événements a échoué (HTTP ${res.status}).`);
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
