import { apiClient } from './client';
import { supabase } from '@/lib/supabase';
import { ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/lib/store/authStore';
import type { Ticket, PurchasePayload } from '@/types/ticket';

export async function getTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<Ticket[]>(ENDPOINTS.tickets);
  return data;
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data } = await apiClient.get<Ticket>(ENDPOINTS.ticketById(id));
  return data;
}

export async function purchaseTicket(payload: PurchasePayload): Promise<Ticket> {
  try {
    const { data } = await apiClient.post<Ticket>(ENDPOINTS.ticketPurchase, payload);
    return data;
  } catch {
    // API paiement non disponible → simulation directe Supabase
    return simulatePurchase(payload);
  }
}

/**
 * Simulation de paiement : crée le ticket directement dans Supabase.
 * Utilisé tant que POST /tickets/purchase n'est pas implémenté côté backend.
 * À supprimer une fois l'API de paiement disponible.
 */
async function simulatePurchase(payload: PurchasePayload): Promise<Ticket> {
  // Injecter le token Supabase pour que RLS fonctionne
  const { token, refreshToken } = useAuthStore.getState();
  console.log('[SIMULATE] token exists:', !!token, 'refreshToken exists:', !!refreshToken);
  if (!token) throw new Error('Non authentifié');

  await supabase.auth.setSession({
    access_token: token,
    refresh_token: refreshToken ?? '',
  });

  const { data: { user } } = await supabase.auth.getUser();
  console.log('[SIMULATE] supabase user:', user?.id ?? 'null');
  if (!user) throw new Error('Session invalide');

  // Récupérer le prix unitaire du type de billet
  const { data: ticketTypeData } = await supabase
    .from('ticket_types')
    .select('price')
    .eq('id', payload.ticketTypeId)
    .single();
  const unitPrice = (ticketTypeData as any)?.price ?? 0;
  const totalPrice = unitPrice * payload.quantity;

  const qrCode = `QR-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const ticketNumber = `LGO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000 + 10000))}`;

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      event_id: payload.eventId,
      ticket_type_id: payload.ticketTypeId,
      user_id: user.id,
      quantity: payload.quantity,
      total_price: totalPrice,
      status: 'valid',
      qr_code: qrCode,
      ticket_number: ticketNumber,
    })
    .select(`
      id, status, ticket_number, qr_code,
      events:event_id (title, event_date, event_time, location_name, category, image_url),
      ticket_types:ticket_type_id (name, price)
    `)
    .single();

  if (error) {
    console.error('[SIMULATE] Supabase insert error:', error.message, error.code, error.details);
    throw new Error(error.message);
  }

  const d = data as any;
  console.log('[SIMULATE] event join:', JSON.stringify(d.events));
  return {
    id: d.id,
    ticketNumber: d.ticket_number,
    eventId: payload.eventId,
    eventName: d.events?.title ?? '',
    eventDate: d.events?.event_date ?? '',
    eventTime: d.events?.event_time ?? '',
    eventLocation: d.events?.location_name ?? '',
    eventImage: d.events?.image_url ?? '',
    eventCategory: d.events?.category ?? '',
    ticketTypeName: d.ticket_types?.name ?? '',
    quantity: payload.quantity,
    totalPrice: (d.ticket_types?.price ?? 0) * payload.quantity,
    qrCode: d.qr_code,
    status: 'valid',
    purchasedAt: new Date().toISOString(),
  };
}
