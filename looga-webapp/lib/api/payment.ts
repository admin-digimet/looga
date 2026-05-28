import axios from 'axios';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS, SITE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, TOKEN_KEY } from '@/lib/constants';
import type { Ticket } from '@/types';

export interface InitPaymentPayload {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export interface InitPaymentResult {
  checkoutUrl: string;
  reference: string;
}

interface RawPaymentInitResponse {
  checkoutUrl?: string;
  checkout_url?: string;
  payment_url?: string;
  reference?: string;
  ticketId?: string;
  message?: string;
  error?: string;
}

function pickCheckoutUrl(raw: RawPaymentInitResponse): string {
  return raw.checkoutUrl ?? raw.checkout_url ?? raw.payment_url ?? '';
}

export async function initPayment(payload: InitPaymentPayload): Promise<InitPaymentResult> {
  const body = {
    eventId: payload.eventId,
    ticketTypeId: payload.ticketTypeId,
    quantity: payload.quantity,
    successUrl: `${SITE_URL}/payment/success`,
    errorUrl: `${SITE_URL}/payment/error`,
  };

  const { data } = await apiClient.post<RawPaymentInitResponse>(ENDPOINTS.paymentInit, body);

  const checkoutUrl = pickCheckoutUrl(data);
  const reference = data.reference ?? '';

  if (!checkoutUrl) {
    throw new Error(data.error ?? data.message ?? 'Réponse de paiement invalide');
  }

  return { checkoutUrl, reference };
}

export interface InitFreeTicketResult {
  ticketId: string;
  ticketNumber: string;
  qrCode: string;
}

interface RawFreeTicketRpcRow {
  ticket_id: string;
  ticket_number: string;
  qr_code: string;
}

export async function initFreeTicket(payload: InitPaymentPayload): Promise<InitFreeTicketResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const url = `${SUPABASE_URL}/rest/v1/rpc/create_free_ticket`;

  const { data } = await axios.post<RawFreeTicketRpcRow[] | RawFreeTicketRpcRow>(
    url,
    {
      p_event_id: payload.eventId,
      p_ticket_type_id: payload.ticketTypeId,
      p_quantity: payload.quantity,
    },
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.ticket_id) {
    throw new Error('Réponse de création de ticket gratuit invalide');
  }

  return {
    ticketId: row.ticket_id,
    ticketNumber: row.ticket_number,
    qrCode: row.qr_code,
  };
}

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
  };
  ticket_type?: { name?: string };
}

function rowToTicket(row: RawTicketRow): Ticket {
  return {
    id: row.id,
    ticketNumber: row.ticket_number ?? '',
    eventId: row.event_id ?? '',
    eventName: row.event?.name ?? row.event?.title ?? '',
    eventDate: row.event?.event_date ?? '',
    eventTime: row.event?.event_time ?? '',
    eventLocation: row.event?.location_name ?? '',
    eventImage: row.event?.image_url ?? '',
    eventCategory: row.event?.category ?? '',
    ticketTypeName: row.ticket_type?.name ?? '',
    quantity: row.quantity ?? 1,
    totalPrice: row.total_price ?? 0,
    qrCode: row.qr_code ?? '',
    status: (row.status as Ticket['status']) ?? 'valid',
    purchasedAt: row.purchased_at ?? row.created_at ?? '',
  };
}

export async function getTicketByReference(reference: string): Promise<Ticket | null> {
  if (!reference) return null;
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const select = '*,event:events(*),ticket_type:ticket_types(name)';
  const url = `${SUPABASE_URL}/rest/v1/tickets?payment_ref=eq.${encodeURIComponent(reference)}&select=${encodeURIComponent(select)}&limit=1`;

  const { data } = await axios.get<RawTicketRow[]>(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
    },
  });

  if (!Array.isArray(data) || data.length === 0) return null;
  return rowToTicket(data[0]);
}
