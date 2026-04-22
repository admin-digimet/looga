export type TicketStatus = 'valid' | 'used' | 'expired';

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

export interface PurchasePayload {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
}

export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'wave' | 'card';
