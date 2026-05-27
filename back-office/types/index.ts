export type UserRole = 'user' | 'organizer' | 'staff' | 'admin' | 'super_admin'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'past'
export type EventCategory =
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
  | 'autre'

export interface Profile {
  id: string
  name: string
  email?: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Organizer {
  id: string
  user_id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  is_approved: boolean
  is_suspended: boolean
  created_at: string
  profile?: Profile
}

export interface TicketType {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number
  advantages: string | null
  stock_total: number
  stock_remaining: number
  is_active: boolean
  created_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  description: string | null
  category: EventCategory
  event_date: string
  event_time: string
  location_name: string
  location_address: string | null
  image_url: string | null
  status: EventStatus
  is_sold_out: boolean
  min_price: number
  views_count: number
  created_at: string
  updated_at: string
  ticket_types?: TicketType[]
  organizer?: Pick<Organizer, 'id' | 'name' | 'logo_url'>
}

export interface EventWithStats extends Event {
  tickets_sold: number
  revenue: number
}

// Types spécifiques au back-office admin

export interface AdminStats {
  total_events: number
  published_events: number
  draft_events: number
  cancelled_events: number
  total_organizers: number
  total_tickets_sold: number
  total_revenue: number
}

export interface AdminEventListItem extends Event {
  tickets_sold?: number
  organizer_name?: string
}
