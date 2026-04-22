/**
 * Admin API — looga-backoffice
 *
 * Ces endpoints n'existent pas encore côté backend.
 * Chaque fonction retourne des données mockées en attendant.
 * Quand le backend livre, supprimer le bloc mock et décommenter l'appel réel.
 *
 * APIs demandées au backend :
 * GET    /admin/stats
 * GET    /admin/events?page=&limit=&status=&search=
 * DELETE /admin/events/:id
 * PATCH  /admin/events/:id/status  { status: 'cancelled' | 'published' }
 * GET    /admin/organizers
 * PATCH  /admin/organizers/:id/suspend
 */

import type { AdminStats, AdminEventListItem, Organizer } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

// ─── Stats globales ───────────────────────────────────────────────────────────

// TODO: remplacer par GET /admin/stats quand disponible
export async function getAdminStats(_token: string): Promise<AdminStats> {
  // Mock
  return {
    total_events: 24,
    published_events: 16,
    draft_events: 5,
    cancelled_events: 3,
    total_organizers: 8,
    total_tickets_sold: 1420,
    total_revenue: 7_100_000,
  }
}

// ─── Événements ───────────────────────────────────────────────────────────────

export interface AdminEventsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

// TODO: remplacer par GET /admin/events quand disponible
export async function getAdminEvents(
  _token: string,
  _params: AdminEventsParams = {},
): Promise<{ data: AdminEventListItem[]; total: number }> {
  // Mock
  const mock: AdminEventListItem[] = [
    {
      id: '1',
      organizer_id: 'org-1',
      title: 'Afrobeat Night — Magic City',
      description: null,
      category: 'soirees',
      event_date: '2026-05-10',
      event_time: '22:00',
      location_name: 'Magic City, Marcory',
      location_address: null,
      image_url: null,
      status: 'published',
      is_sold_out: false,
      min_price: 2000,
      views_count: 142,
      created_at: '2026-04-10T10:00:00Z',
      updated_at: '2026-04-10T10:00:00Z',
      tickets_sold: 230,
      organizer_name: 'AfroEvent CI',
    },
    {
      id: '2',
      organizer_id: 'org-2',
      title: 'Showcase Kerozen',
      description: null,
      category: 'concerts',
      event_date: '2026-05-14',
      event_time: '20:00',
      location_name: 'Palais de la Culture',
      location_address: null,
      image_url: null,
      status: 'published',
      is_sold_out: false,
      min_price: 3000,
      views_count: 98,
      created_at: '2026-04-11T14:00:00Z',
      updated_at: '2026-04-11T14:00:00Z',
      tickets_sold: 80,
      organizer_name: 'Nuit Étoilée Events',
    },
    {
      id: '3',
      organizer_id: 'org-1',
      title: 'Tech Summit Abidjan 2026',
      description: null,
      category: 'conferences',
      event_date: '2026-05-20',
      event_time: '09:00',
      location_name: 'CCIAD',
      location_address: null,
      image_url: null,
      status: 'draft',
      is_sold_out: false,
      min_price: 5000,
      views_count: 12,
      created_at: '2026-04-12T09:00:00Z',
      updated_at: '2026-04-12T09:00:00Z',
      tickets_sold: 0,
      organizer_name: 'AfroEvent CI',
    },
    {
      id: '4',
      organizer_id: 'org-3',
      title: 'Événement non conforme test',
      description: 'Contenu inapproprié signalé',
      category: 'autre',
      event_date: '2026-04-25',
      event_time: '18:00',
      location_name: 'Lieu inconnu',
      location_address: null,
      image_url: null,
      status: 'published',
      is_sold_out: false,
      min_price: 0,
      views_count: 3,
      created_at: '2026-04-15T08:00:00Z',
      updated_at: '2026-04-15T08:00:00Z',
      tickets_sold: 0,
      organizer_name: 'Organisateur inconnu',
    },
  ]
  return { data: mock, total: mock.length }
}

// TODO: remplacer par DELETE /admin/events/:id quand disponible
export async function deleteAdminEvent(token: string, eventId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/admin/events/${eventId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Erreur lors de la suppression')
  }
}

// TODO: remplacer par PATCH /admin/events/:id/status quand disponible
export async function updateAdminEventStatus(
  token: string,
  eventId: string,
  status: 'cancelled' | 'published',
): Promise<void> {
  const res = await fetch(`${BASE_URL}/admin/events/${eventId}/status`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Erreur lors de la mise à jour')
  }
}

// ─── Organisateurs ────────────────────────────────────────────────────────────

// TODO: remplacer par GET /admin/organizers quand disponible
export async function getAdminOrganizers(_token: string): Promise<Organizer[]> {
  // Mock
  return [
    {
      id: 'org-1',
      user_id: 'user-1',
      name: 'AfroEvent CI',
      description: 'Organisateur de concerts à Abidjan',
      logo_url: null,
      website: null,
      is_approved: true,
      is_suspended: false,
      created_at: '2026-03-01T00:00:00Z',
    },
    {
      id: 'org-2',
      user_id: 'user-2',
      name: 'Nuit Étoilée Events',
      description: null,
      logo_url: null,
      website: null,
      is_approved: true,
      is_suspended: false,
      created_at: '2026-03-10T00:00:00Z',
    },
    {
      id: 'org-3',
      user_id: 'user-3',
      name: 'Organisateur inconnu',
      description: null,
      logo_url: null,
      website: null,
      is_approved: true,
      is_suspended: false,
      created_at: '2026-04-14T00:00:00Z',
    },
  ]
}

// TODO: remplacer par PATCH /admin/organizers/:id/suspend quand disponible
export async function toggleOrganizerSuspension(
  token: string,
  organizerId: string,
  suspend: boolean,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/admin/organizers/${organizerId}/suspend`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ suspended: suspend }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Erreur lors de la mise à jour')
  }
}
