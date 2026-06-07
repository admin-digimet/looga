import { apiClient } from './client';
import { supabase } from '@/lib/supabase';
import { ENDPOINTS } from '@/constants/api';
import { LOOGA_WEBSITE_URL } from '@/constants/links';
import type { Ticket } from '@/types/ticket';

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

/**
 * Initialise un paiement Genius Pay via l'Edge Function Supabase /payment/init.
 * Retourne l'URL de checkout hostée Genius Pay vers laquelle ouvrir l'in-app browser.
 */
export async function initPayment(payload: InitPaymentPayload): Promise<InitPaymentResult> {
  const body = {
    eventId: payload.eventId,
    ticketTypeId: payload.ticketTypeId,
    quantity: payload.quantity,
    successUrl: `${LOOGA_WEBSITE_URL}/payment/success`,
    errorUrl: `${LOOGA_WEBSITE_URL}/payment/error`,
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
  out_ticket_id?: string;
  out_ticket_number?: string;
  out_qr_code?: string;
  // fallback ancienne signature
  ticket_id?: string;
  ticket_number?: string;
  qr_code?: string;
}

/**
 * Création directe d'un ticket gratuit via RPC Postgres atomique.
 * Bypass Genius Pay (qui rejette les paiements < 200 XOF).
 */
export async function initFreeTicket(payload: InitPaymentPayload): Promise<InitFreeTicketResult> {
  const { data, error } = await supabase.rpc('create_free_ticket', {
    p_event_id: payload.eventId,
    p_ticket_type_id: payload.ticketTypeId,
    p_quantity: payload.quantity,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row: RawFreeTicketRpcRow = Array.isArray(data) ? data[0] : data;
  const ticketId = row?.out_ticket_id ?? row?.ticket_id ?? '';
  const ticketNumber = row?.out_ticket_number ?? row?.ticket_number ?? '';
  const qrCode = row?.out_qr_code ?? row?.qr_code ?? '';

  if (!ticketId) {
    throw new Error('Réponse de création de ticket gratuit invalide');
  }

  return { ticketId, ticketNumber, qrCode };
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
  events?: {
    title?: string;
    event_date?: string;
    event_time?: string;
    location_name?: string;
    image_url?: string;
    category?: string;
  } | null;
  ticket_types?: { name?: string } | null;
}

function rowToTicket(row: RawTicketRow): Ticket {
  return {
    id: row.id,
    ticketNumber: row.ticket_number ?? '',
    eventId: row.event_id ?? '',
    eventName: row.events?.title ?? '',
    eventDate: row.events?.event_date ?? '',
    eventTime: row.events?.event_time ?? '',
    eventLocation: row.events?.location_name ?? '',
    eventImage: row.events?.image_url ?? '',
    eventCategory: row.events?.category ?? '',
    ticketTypeName: row.ticket_types?.name ?? '',
    quantity: row.quantity ?? 1,
    totalPrice: row.total_price ?? 0,
    qrCode: row.qr_code ?? '',
    status: (row.status as Ticket['status']) ?? 'valid',
    purchasedAt: row.purchased_at ?? row.created_at ?? '',
  };
}

/**
 * Lookup d'un ticket par sa référence de paiement Genius Pay.
 * Utilisé pour le polling après retour du checkout in-app browser.
 */
export async function getTicketByReference(reference: string): Promise<Ticket | null> {
  if (!reference) return null;

  const { data, error } = await supabase
    .from('tickets')
    .select(
      'id, ticket_number, event_id, quantity, total_price, qr_code, status, payment_ref, purchased_at, created_at, events:event_id (title, event_date, event_time, location_name, image_url, category), ticket_types:ticket_type_id (name)'
    )
    .eq('payment_ref', reference)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return rowToTicket(data as unknown as RawTicketRow);
}
