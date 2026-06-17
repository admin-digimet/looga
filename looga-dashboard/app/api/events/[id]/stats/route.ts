import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Billets vendus + revenus (base = valeur faciale, hors frais user 2%)
  const { data: tickets } = await supabase
    .from('tickets')
    .select('quantity, total_price, status, ticket_type_id')
    .eq('event_id', id)
    .in('status', ['valid', 'used'])

  const ticketsSold = tickets?.reduce((sum, t) => sum + t.quantity, 0) ?? 0
  const revenue = tickets?.reduce((sum, t) => sum + t.total_price, 0) ?? 0

  // Agrégation par type de billet : nb vendus + montant
  const soldByType = new Map<string, { sold: number; revenue: number }>()
  for (const t of tickets ?? []) {
    const agg = soldByType.get(t.ticket_type_id) ?? { sold: 0, revenue: 0 }
    agg.sold += t.quantity
    agg.revenue += t.total_price
    soldByType.set(t.ticket_type_id, agg)
  }

  // Scans totaux
  const { count: scanCount } = await supabase
    .from('ticket_scans')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  // Check-in rate
  const checkinRate = ticketsSold > 0 ? Math.round(((scanCount ?? 0) / ticketsSold) * 100) : 0

  // Stock par type de billet
  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('id, name, price, stock_total, stock_remaining')
    .eq('event_id', id)

  const ticketTypesWithSales = (ticketTypes ?? []).map((tt) => {
    const agg = soldByType.get(tt.id) ?? { sold: 0, revenue: 0 }
    return { ...tt, sold: agg.sold, revenue: agg.revenue }
  })

  return NextResponse.json({
    tickets_sold: ticketsSold,
    revenue,
    scan_count: scanCount ?? 0,
    checkin_rate: checkinRate,
    ticket_types: ticketTypesWithSales,
  })
}
