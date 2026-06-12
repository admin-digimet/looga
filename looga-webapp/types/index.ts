// Event types
export type EventCategory =
  | 'tout'
  | 'concerts'
  | 'soirees'
  | 'culture'
  | 'sports'
  | 'workshops'
  | 'gastronomie'
  | 'conferences'
  | 'networking'
  | 'mode'
  | 'famille'
  | 'humour'
  | 'religieux'
  | 'cinema'
  | 'caritatif'
  | 'enfants'
  | 'gaming'
  | 'tournee'
  | 'salon'
  | 'theatre'
  | 'bien_etre'
  | 'festival'
  | 'auto_moto'
  | 'autre';

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  advantages?: string;
  stock: number;
  soldOut: boolean;
}

export interface Artist {
  id: string;
  name: string;
  image?: string;
}

export interface OtherShow {
  id: string;
  venueName: string;
  city: string;
  date: string;
  minPrice: number;
}

export interface EventOrganizer {
  id?: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  website?: string | null;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  image: string;
  organizerName: string;
  organizer?: EventOrganizer | null;
  ticketTypes: TicketType[];
  artists?: Artist[];
  isSoldOut: boolean;
  minPrice: number;
  createdAt?: string;
  locationUrl?: string;
  images?: string[];
  otherShows?: OtherShow[];
  duration?: string;
  trending?: boolean;
  participantCount?: number;
}

export interface PaginatedEvents {
  data: Event[];
  nextPage: number | null;
  total: number;
}

// User types
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar_url: string | null;
  role: string;
  push_token: string | null;
  is_active: boolean;
  createdAt: string;
  updated_at: string;
}

export interface Organizer {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  is_approved: boolean;
  is_suspended: boolean;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
  organizer: Organizer | null;
}

// Ticket types
export type TicketStatus = 'pending' | 'valid' | 'used' | 'expired' | 'cancelled';

export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'wave' | 'card';

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
  /** Référence GeniusPay (présente sur un billet en attente de paiement) */
  paymentRef?: string;
}

export interface PurchasePayload {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
}
