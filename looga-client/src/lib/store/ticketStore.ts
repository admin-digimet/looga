import { create } from 'zustand';

import { storage } from './mmkv';
import type { LocalTicket } from '@/types/ticket';

const TICKETS_KEY = 'looga_tickets';

interface TicketState {
  tickets: LocalTicket[];
  addTicket: (ticket: LocalTicket) => void;
  getTicket: (id: string) => LocalTicket | undefined;
  loadTickets: () => void;
}

function persistTickets(tickets: LocalTicket[]) {
  storage.set(TICKETS_KEY, JSON.stringify(tickets));
}

function readTickets(): LocalTicket[] {
  const raw = storage.getString(TICKETS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalTicket[];
  } catch {
    return [];
  }
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],

  loadTickets: () => {
    set({ tickets: readTickets() });
  },

  addTicket: (ticket) => {
    const updated = [ticket, ...get().tickets];
    persistTickets(updated);
    set({ tickets: updated });
  },

  getTicket: (id) => get().tickets.find((t) => t.id === id),
}));
