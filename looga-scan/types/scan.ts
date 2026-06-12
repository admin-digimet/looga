export type ScanStatus = 'valid' | 'already_used' | 'invalid';

export interface ScanResult {
  status: ScanStatus;
  ticketId?: string;
  attendeeName?: string;
  ticketType?: string;
  ticketNumber?: string;
  eventName?: string;
  /** Rempli si status === 'already_used' — date ISO du premier scan */
  firstScanAt?: string;
  /** Nom du scanner qui a validé en premier (si already_used) */
  firstScannerName?: string;
  /** Précise pourquoi un billet est refusé (status === 'invalid').
   *  'not_paid' = billet jamais payé (status pending/cancelled/expired). */
  invalidReason?: 'not_paid' | 'unknown';
}

export interface ScanRecord {
  id: string;
  ticketId: string;
  attendeeName: string;
  ticketType: string;
  status: ScanStatus;
  scannedAt: string;
}

export interface Attendee {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  ticketType: string;
  status: 'pending' | 'checked_in';
  checkedInAt?: string;
}

export interface ScanEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  image?: string;
  ticketsSold: number;
  checkedIn: number;
}
