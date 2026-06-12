import axios from 'axios';
import { SUPABASE_URL, SUPABASE_ANON_KEY, TOKEN_KEY } from '@/lib/constants';
import type { Ticket } from '@/types';

interface RawTicketRow {
  id: string;
  ticket_number?: string;
  event_id?: string;
  quantity?: number;
  total_price?: number;
  qr_code?: string;
  status?: string;
  payment_ref?: string;
  purchased_at?: string;
  created_at?: string;
  event?: {
    title?: string;
    name?: string;
    event_date?: string;
    event_time?: string;
    location_name?: string;
    image_url?: string;
    category?: string;
  } | null;
  ticket_type?: { name?: string } | null;
}

function transformTicket(raw: RawTicketRow): Ticket {
  return {
    id: raw.id,
    ticketNumber: raw.ticket_number ?? '',
    eventId: raw.event_id ?? '',
    eventName: raw.event?.title ?? raw.event?.name ?? '',
    eventDate: raw.event?.event_date ?? '',
    eventTime: raw.event?.event_time ?? '',
    eventLocation: raw.event?.location_name ?? '',
    eventImage: raw.event?.image_url ?? '',
    eventCategory: raw.event?.category ?? '',
    ticketTypeName: raw.ticket_type?.name ?? '',
    quantity: raw.quantity ?? 1,
    totalPrice: raw.total_price ?? 0,
    qrCode: raw.qr_code ?? '',
    status: (raw.status as Ticket['status']) ?? 'valid',
    purchasedAt: raw.purchased_at ?? raw.created_at ?? '',
    paymentRef: raw.payment_ref ?? '',
  };
}

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
  };
}

const TICKETS_SELECT =
  '*,event:events(id,title,event_date,event_time,location_name,image_url,category),ticket_type:ticket_types(name)';

export async function getTickets(): Promise<Ticket[]> {
  const url = `${SUPABASE_URL}/rest/v1/tickets?select=${encodeURIComponent(TICKETS_SELECT)}&order=created_at.desc`;
  const { data } = await axios.get<RawTicketRow[]>(url, { headers: authHeaders() });
  return Array.isArray(data) ? data.map(transformTicket) : [];
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const url = `${SUPABASE_URL}/rest/v1/tickets?id=eq.${encodeURIComponent(id)}&select=${encodeURIComponent(TICKETS_SELECT)}&limit=1`;
  const { data } = await axios.get<RawTicketRow[]>(url, { headers: authHeaders() });
  if (!Array.isArray(data) || data.length === 0) return null;
  return transformTicket(data[0]);
}
