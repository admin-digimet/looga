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
  ticketTypes: TicketType[];
  artists?: Artist[];
  isSoldOut: boolean;
  minPrice: number;
  createdAt?: string;
  locationUrl?: string;
  // Champs optionnels — section Photos
  images?: string[];
  // Section "Tous les spectacles"
  otherShows?: OtherShow[];
  // Durée du spectacle (ex: "2h30")
  duration?: string;
  // Badge artiste vérifié
  artistVerified?: boolean;
  // Preuve sociale — optionnels, fournis par l'API
  trending?: boolean;
  participantCount?: number;
}

export interface PaginatedEvents {
  data: Event[];
  nextPage: number | null;
  total: number;
}
