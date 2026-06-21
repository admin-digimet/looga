import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// GET /api/events/[id]/assignments — liste les scanners assignés à cet événement
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data, error } = await supabase
    .from('event_staff_assignments')
    .select('*, staff_accounts(id, name, is_active)')
    .eq('event_id', id)
    .order('assigned_at', { ascending: true })

  if (error) {
    console.error('[assignments:get] error:', error)
    return NextResponse.json({ error: 'Impossible de charger les affectations.' }, { status: 500 })
  }
  return NextResponse.json(data ?? [])
}

// POST /api/events/[id]/assignments — assigner un scanner
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { staff_id } = await request.json()
  if (!staff_id) return NextResponse.json({ error: 'staff_id requis' }, { status: 400 })

  const { data, error } = await supabase
    .from('event_staff_assignments')
    .insert({ event_id: id, staff_id })
    .select('*, staff_accounts(id, name, is_active)')
    .single()

  if (error) {
    console.error('[assignments:create] error:', error)
    return NextResponse.json({ error: "Impossible d'affecter ce scanner." }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/events/[id]/assignments — retirer un scanner
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { staff_id } = await request.json()
  if (!staff_id) return NextResponse.json({ error: 'staff_id requis' }, { status: 400 })

  const { error } = await supabase
    .from('event_staff_assignments')
    .delete()
    .eq('event_id', id)
    .eq('staff_id', staff_id)

  if (error) {
    console.error('[assignments:delete] error:', error)
    return NextResponse.json({ error: 'Impossible de retirer ce scanner.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
