import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

export interface OrganizerFinanceTicketType {
  name: string
  price: number
  sold: number
  revenue: number
}

export interface OrganizerFinanceEvent {
  id: string
  title: string
  revenue: number
  tickets_sold: number
  ticket_types: OrganizerFinanceTicketType[]
}

export interface OrganizerFinanceResponse {
  total: number
  events: OrganizerFinanceEvent[]
}

// GET /api/admin/organizers/[id]/finance — détail financier d'un organisateur
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { admin } = await requireAdmin()
    const { id } = await ctx.params

    // Events de l'organisateur (+ leurs types de billets)
    const { data: events } = await admin
      .from('events')
      .select('id, title, ticket_types(id, name, price)')
      .eq('organizer_id', id)
      .order('event_date', { ascending: false })

    const eventList = events ?? []
    const eventIds = eventList.map((e) => e.id)

    // Tickets payés (valeur faciale = total_price) de tous ces events
    let tickets: { event_id: string; ticket_type_id: string; quantity: number; total_price: number }[] = []
    if (eventIds.length > 0) {
      const { data } = await admin
        .from('tickets')
        .select('event_id, ticket_type_id, quantity, total_price')
        .in('event_id', eventIds)
        .in('status', ['valid', 'used'])
      tickets = data ?? []
    }

    // Agrégation par event puis par type de billet
    const aggByType = new Map<string, { sold: number; revenue: number }>()
    const aggByEvent = new Map<string, { revenue: number; sold: number }>()
    for (const t of tickets) {
      const byType = aggByType.get(t.ticket_type_id) ?? { sold: 0, revenue: 0 }
      byType.sold += t.quantity
      byType.revenue += t.total_price
      aggByType.set(t.ticket_type_id, byType)

      const byEvent = aggByEvent.get(t.event_id) ?? { revenue: 0, sold: 0 }
      byEvent.revenue += t.total_price
      byEvent.sold += t.quantity
      aggByEvent.set(t.event_id, byEvent)
    }

    const resultEvents: OrganizerFinanceEvent[] = eventList.map((e) => {
      const ev = aggByEvent.get(e.id) ?? { revenue: 0, sold: 0 }
      const types = (e.ticket_types ?? []).map((tt: { id: string; name: string; price: number }) => {
        const agg = aggByType.get(tt.id) ?? { sold: 0, revenue: 0 }
        return { name: tt.name, price: tt.price, sold: agg.sold, revenue: agg.revenue }
      })
      return {
        id: e.id,
        title: e.title,
        revenue: ev.revenue,
        tickets_sold: ev.sold,
        ticket_types: types,
      }
    })

    const total = resultEvents.reduce((s, e) => s + e.revenue, 0)

    const response: OrganizerFinanceResponse = { total, events: resultEvents }
    return NextResponse.json(response)
  } catch (err) {
    return handleAdminError(err)
  }
}
