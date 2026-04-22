import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Billets vendus + revenus
  const { data: tickets } = await supabase
    .from('tickets')
    .select('quantity, total_price, status')
    .eq('event_id', id)
    .in('status', ['valid', 'used'])

  const ticketsSold = tickets?.reduce((sum, t) => sum + t.quantity, 0) ?? 0
  const revenue = tickets?.reduce((sum, t) => sum + t.total_price, 0) ?? 0

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

  return NextResponse.json({
    tickets_sold: ticketsSold,
    revenue,
    scan_count: scanCount ?? 0,
    checkin_rate: checkinRate,
    ticket_types: ticketTypes ?? [],
  })
}
