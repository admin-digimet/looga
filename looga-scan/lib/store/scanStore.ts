import { create } from 'zustand';

import { storage } from './mmkv';
import type { ScanEvent, ScanRecord } from '@/types/scan';

const HISTORY_KEY = 'looga_scan_history';
const EVENT_KEY = 'looga_scan_active_event';

function persistHistory(records: ScanRecord[]) {
  storage.set(HISTORY_KEY, JSON.stringify(records));
}

function readHistory(): ScanRecord[] {
  const raw = storage.getString(HISTORY_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as ScanRecord[]; } catch { return []; }
}

function persistEvent(event: ScanEvent | null) {
  if (event) {
    storage.set(EVENT_KEY, JSON.stringify(event));
  } else {
    storage.delete(EVENT_KEY);
  }
}

function readEvent(): ScanEvent | null {
  const raw = storage.getString(EVENT_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as ScanEvent; } catch { return null; }
}

function computeCounts(history: ScanRecord[]) {
  let validCount = 0;
  let refusedCount = 0;
  for (const r of history) {
    if (r.status === 'valid') validCount++;
    else refusedCount++;
  }
  return { validCount, refusedCount };
}

interface ScanState {
  activeEvent: ScanEvent | null;
  scanHistory: ScanRecord[];
  scanCount: number;
  refusedCount: number;
  isOffline: boolean;
  pendingSyncCount: number;
  setActiveEvent: (event: ScanEvent | null) => void;
  addScanRecord: (record: ScanRecord) => void;
  loadFromStorage: () => void;
  clearEvent: () => void;
  clearHistory: () => void;
  setOffline: (offline: boolean) => void;
  setPendingSyncCount: (count: number) => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  activeEvent: null,
  scanHistory: [],
  scanCount: 0,
  refusedCount: 0,
  isOffline: false,
  pendingSyncCount: 0,

  loadFromStorage: () => {
    const event = readEvent();
    const history = readHistory();
    const { validCount, refusedCount } = computeCounts(history);
    set({
      activeEvent: event,
      scanHistory: history,
      scanCount: validCount,
      refusedCount,
    });
  },

  setActiveEvent: (event) => {
    persistEvent(event);
    set({ activeEvent: event });
  },

  addScanRecord: (record) => {
    const updated = [record, ...get().scanHistory];
    persistHistory(updated);
    const { validCount, refusedCount } = computeCounts(updated);
    set({ scanHistory: updated, scanCount: validCount, refusedCount });
  },

  clearEvent: () => {
    persistEvent(null);
    set({ activeEvent: null });
  },

  clearHistory: () => {
    persistHistory([]);
    set({ scanHistory: [], scanCount: 0, refusedCount: 0 });
  },

  setOffline: (offline) => set({ isOffline: offline }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
}));
