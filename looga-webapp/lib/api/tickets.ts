import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/constants';
import type { Ticket } from '@/types';

function transformTicket(raw: any): Ticket {
  return {
    id: raw.id,
    ticketNumber: raw.ticket_number ?? raw.ticketNumber ?? '',
    eventId: raw.event_id ?? raw.eventId ?? '',
    eventName: raw.event?.name ?? raw.event?.title ?? raw.eventName ?? '',
    eventDate: raw.event?.event_date ?? raw.event?.date ?? raw.eventDate ?? '',
    eventTime: raw.event?.event_time ?? raw.event?.time ?? raw.eventTime ?? '',
    eventLocation: raw.event?.location_name ?? raw.event?.location ?? raw.eventLocation ?? '',
    eventImage: raw.event?.image_url ?? raw.event?.image ?? raw.eventImage ?? '',
    eventCategory: raw.event?.category ?? raw.eventCategory ?? '',
    ticketTypeName: raw.ticket_type?.name ?? raw.ticketTypeName ?? '',
    quantity: raw.quantity ?? 1,
    totalPrice: raw.total_price ?? raw.totalPrice ?? 0,
    qrCode: raw.qr_code ?? raw.qrCode ?? '',
    status: raw.status ?? 'valid',
    purchasedAt: raw.created_at ?? raw.purchasedAt ?? '',
  };
}

export async function getTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<any>(ENDPOINTS.tickets);
  const raw = Array.isArray(data) ? data : (data.data ?? []);
  return raw.map(transformTicket);
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data } = await apiClient.get<any>(ENDPOINTS.ticketById(id));
  return transformTicket(data);
}

