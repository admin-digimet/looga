import { storage } from '@/lib/store/mmkv';
import { scanApi } from '@/lib/api/scan';

/**
 * Un scan en attente de synchronisation.
 */
export interface OfflineScanRecord {
  qrValue: string;
  eventId: string;
  scannerName: string;
  scannedAt: string; // ISO timestamp
  status: 'valid' | 'already_used' | 'invalid';
}

function queueKey(eventId: string): string {
  return `offline_queue_${eventId}`;
}

function readQueue(eventId: string): OfflineScanRecord[] {
  const raw = storage.getString(queueKey(eventId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OfflineScanRecord[];
  } catch {
    return [];
  }
}

function writeQueue(eventId: string, queue: OfflineScanRecord[]) {
  storage.set(queueKey(eventId), JSON.stringify(queue));
}

/**
 * Ajouter un scan à la file d'attente offline.
 */
export function enqueueOfflineScan(scan: OfflineScanRecord) {
  const queue = readQueue(scan.eventId);
  queue.push(scan);
  writeQueue(scan.eventId, queue);
}

/**
 * Obtenir tous les scans en attente pour un événement.
 */
export function getOfflineQueue(eventId: string): OfflineScanRecord[] {
  return readQueue(eventId);
}

/**
 * Nombre de scans en attente.
 */
export function getOfflineQueueCount(eventId: string): number {
  return readQueue(eventId).length;
}

/**
 * Vider la file d'attente après synchronisation réussie.
 */
export function clearOfflineQueue(eventId: string) {
  storage.delete(queueKey(eventId));
}

/**
 * Synchroniser tous les scans en attente avec le serveur.
 * Retourne true si la sync a réussi, false sinon.
 */
export async function syncOfflineQueue(eventId: string): Promise<boolean> {
  const queue = readQueue(eventId);
  if (queue.length === 0) return true;

  try {
    await scanApi.syncOffline(queue);
    clearOfflineQueue(eventId);
    return true;
  } catch {
    // Échec — on garde la queue pour réessayer
    return false;
  }
}
