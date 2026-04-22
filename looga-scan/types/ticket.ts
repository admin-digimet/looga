export interface Ticket {
  id: string;
  ticketNumber: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  status: 'valid' | 'used' | 'cancelled';
  qrValue: string;
  purchasedAt: string;
  checkedInAt?: string;
}
