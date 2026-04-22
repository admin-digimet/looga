import { useMutation, useQuery } from '@tanstack/react-query';

import { scanApi } from '@/lib/api/scan';
import { useScanStore } from '@/lib/store/scanStore';
import { storage } from '@/lib/store/mmkv';
import type { ScanRecord, ScanResult } from '@/types/scan';

const SCANNER_NAME_KEY = 'scanner_name';

export function useVerifyScan(eventId: string) {
  return useMutation({
    mutationFn: (qrCode: string) => {
      const scannerName = storage.getString(SCANNER_NAME_KEY) ?? undefined;
      return scanApi.verify(qrCode, eventId, scannerName);
    },
    onSuccess: (result: ScanResult) => {
      const record: ScanRecord = {
        id: Date.now().toString(),
        ticketId: result.ticketId ?? '',
        attendeeName: result.attendeeName ?? '',
        ticketType: result.ticketType ?? '',
        status: result.status,
        scannedAt: new Date().toISOString(),
      };
      useScanStore.getState().addScanRecord(record);
    },
  });
}

export function useVerifyById(eventId: string) {
  return useMutation({
    mutationFn: (ticketId: string) => scanApi.verifyById(ticketId, eventId),
    onSuccess: (result: ScanResult) => {
      if (result.attendeeName && result.status === 'valid') {
        const record: ScanRecord = {
          id: Date.now().toString(),
          ticketId: result.ticketId ?? '',
          attendeeName: result.attendeeName,
          ticketType: result.ticketType ?? '',
          status: result.status,
          scannedAt: new Date().toISOString(),
        };
        useScanStore.getState().addScanRecord(record);
      }
    },
  });
}

export function useScanHistory(eventId: string) {
  return useQuery({
    queryKey: ['scan-history', eventId],
    queryFn: () => scanApi.getHistory(eventId),
    staleTime: 0,
  });
}

export function useAttendees(eventId: string, search?: string) {
  return useQuery({
    queryKey: ['attendees', eventId, search],
    queryFn: () => scanApi.getAttendees(eventId, search),
    staleTime: 1000 * 30,
    enabled: !!search && search.length >= 2,
  });
}
