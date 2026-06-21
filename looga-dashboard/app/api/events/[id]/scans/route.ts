import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: scans, error } = await supabase
    .from('ticket_scans')
    .select(`
      id,
      status,
      scanned_at,
      scanner_name,
      tickets (
        ticket_number,
        quantity,
        ticket_types ( name ),
        profiles:user_id ( name )
      )
    `)
    .eq('event_id', id)
    .order('scanned_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[events:scans] error:', error)
    return NextResponse.json({ error: 'Impossible de charger les scans.' }, { status: 500 })
  }
  return NextResponse.json(scans ?? [])
}
