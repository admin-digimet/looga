'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedState {
  saved: string[];
  toggle: (eventId: string) => void;
  isSaved: (eventId: string) => boolean;
  clear: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      saved: [],
      toggle: (eventId) =>
        set((state) => ({
          saved: state.saved.includes(eventId)
            ? state.saved.filter((id) => id !== eventId)
            : [...state.saved, eventId],
        })),
      isSaved: (eventId) => get().saved.includes(eventId),
      clear: () => set({ saved: [] }),
    }),
    { name: 'looga_saved_events' },
  ),
);
