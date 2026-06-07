export type TicketStatus = 'pending' | 'valid' | 'used' | 'expired' | 'cancelled';

export interface Ticket {
  id: string;
  ticketNumber: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  eventCategory: string;
  ticketTypeName: string;
  quantity: number;
  totalPrice: number;
  qrCode: string;
  status: TicketStatus;
  purchasedAt: string;
}

export interface LocalTicket {
  id: string;
  ticketNumber: string;
  eventId?: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventCategory: string;
  eventImage?: string;
  qrValue: string;
  status: TicketStatus;
}
