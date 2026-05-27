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
export type TicketStatus = 'pending' | 'valid' | 'used' | 'expired' | 'cancelled'
export type ScanStatus = 'valid' | 'already_used' | 'invalid'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export interface Profile {
  id: string
  name: string
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
}

export interface OrganizerWithProfile extends Organizer {
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
  location_url: string | null
  image_url: string | null
  status: EventStatus
  is_sold_out: boolean
  min_price: number
  views_count: number
  created_at: string
  updated_at: string
  ticket_types?: TicketType[]
}

export interface EventWithStats extends Event {
  tickets_sold: number
  revenue: number
  scan_count: number
  checkin_rate: number
}

export interface TicketScan {
  id: string
  ticket_id: string | null
  event_id: string
  staff_id: string | null
  scanner_name: string | null
  status: ScanStatus
  scanned_at: string
  profiles?: { name: string }
  tickets?: {
    ticket_number: string
    ticket_types?: { name: string }
    profiles?: { name: string }
  }
}

export interface StaffAccount {
  id: string
  organizer_id: string
  user_id: string
  name: string
  is_active: boolean
  created_at: string
  profiles?: Profile
}

export interface EventStaffAssignment {
  id: string
  event_id: string
  staff_id: string
  assigned_at: string
  staff_accounts?: StaffAccount
  events?: Pick<Event, 'id' | 'title' | 'event_date' | 'status'>
}

export interface DashboardStats {
  total_events: number
  active_events: number
  total_revenue: number
  total_tickets_sold: number
  total_scans_today: number
}

export interface RevenueByEvent {
  event_id: string
  title: string
  revenue: number
  tickets_sold: number
}

export interface CreateEventPayload {
  title: string
  description: string
  category: EventCategory
  event_date: string
  event_time: string
  location_name: string
  location_address?: string
  location_url?: string
  image_url?: string
  status: EventStatus
  ticket_types: CreateTicketTypePayload[]
}

export interface CreateTicketTypePayload {
  name: string
  description?: string
  price: number
  stock_total: number
  advantages?: string
}
