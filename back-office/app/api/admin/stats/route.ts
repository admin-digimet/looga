import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

export interface AdminStatsResponse {
  total_users: number
  users_by_role: Record<string, number>
  total_organizers: number
  total_events: number
  events_by_status: Record<string, number>
  total_tickets_sold: number
  total_revenue: number
  revenue_30d: { date: string; amount: number }[]
  pending_payouts: number
}

export async function GET() {
  try {
    const { admin } = await requireAdmin()

    const [
      profilesRes,
      organizersRes,
      eventsRes,
      ticketsRes,
      paymentsRes,
      payoutsRes,
    ] = await Promise.all([
      admin.from('profiles').select('role'),
      admin.from('organizers').select('id', { count: 'exact', head: true }),
      admin.from('events').select('status'),
      admin.from('tickets').select('id, quantity').eq('status', 'valid'),
      admin.from('payments').select('amount, created_at').eq('status', 'success'),
      admin.from('payout_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    const profiles = profilesRes.data ?? []
    const events = eventsRes.data ?? []
    const tickets = ticketsRes.data ?? []
    const payments = paymentsRes.data ?? []

    const usersByRole = profiles.reduce<Record<string, number>>((acc, p) => {
      acc[p.role] = (acc[p.role] ?? 0) + 1
      return acc
    }, {})

    const eventsByStatus = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1
      return acc
    }, {})

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0)
    const ticketsSold = tickets.reduce((sum, t) => sum + (t.quantity ?? 1), 0)

    // Revenu agrégé par jour sur 30 jours
    const now = Date.now()
    const buckets = new Map<string, number>()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000)
      buckets.set(d.toISOString().slice(0, 10), 0)
    }
    for (const p of payments) {
      if (!p.created_at) continue
      const day = new Date(p.created_at).toISOString().slice(0, 10)
      if (buckets.has(day)) {
        buckets.set(day, (buckets.get(day) ?? 0) + (p.amount ?? 0))
      }
    }

    const response: AdminStatsResponse = {
      total_users: profiles.length,
      users_by_role: usersByRole,
      total_organizers: organizersRes.count ?? 0,
      total_events: events.length,
      events_by_status: eventsByStatus,
      total_tickets_sold: ticketsSold,
      total_revenue: totalRevenue,
      revenue_30d: Array.from(buckets, ([date, amount]) => ({ date, amount })),
      pending_payouts: payoutsRes.count ?? 0,
    }

    return NextResponse.json(response)
  } catch (err) {
    return handleAdminError(err)
  }
}
