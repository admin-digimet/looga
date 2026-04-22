import { create } from 'zustand';

import { storage } from './mmkv';
import type { Event } from '@/types/event';

const SAVED_KEY = 'looga_saved_events';

interface SavedState {
  savedEvents: Event[];
  toggle: (event: Event) => void;
  isSaved: (id: string) => boolean;
  loadSaved: () => void;
}

function persist(events: Event[]) {
  storage.set(SAVED_KEY, JSON.stringify(events));
}

function read(): Event[] {
  const raw = storage.getString(SAVED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Event[];
  } catch {
    return [];
  }
}

export const useSavedStore = create<SavedState>((set, get) => ({
  savedEvents: [],

  loadSaved: () => {
    set({ savedEvents: read() });
  },

  toggle: (event) => {
    const current = get().savedEvents;
    const exists = current.some((e) => e.id === event.id);
    const updated = exists
      ? current.filter((e) => e.id !== event.id)
      : [event, ...current];
    persist(updated);
    set({ savedEvents: updated });
  },

  isSaved: (id) => get().savedEvents.some((e) => e.id === id),
}));
