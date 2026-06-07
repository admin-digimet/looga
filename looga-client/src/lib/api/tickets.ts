import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/api';
import type { Ticket } from '@/types/ticket';

export async function getTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<Ticket[]>(ENDPOINTS.tickets);
  return data;
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data } = await apiClient.get<Ticket>(ENDPOINTS.ticketById(id));
  return data;
}
