import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// GET /api/events/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: event, error } = await supabase
    .from('events')
    .select(`*, ticket_types (*)`)
    .eq('id', id)
    .single()

  if (error || !event) return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
  return NextResponse.json(event)
}

// PATCH /api/events/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const { ticket_types, ...eventFields } = body

  const { data, error } = await admin
    .from('events')
    .update({ ...eventFields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (Array.isArray(ticket_types) && ticket_types.length > 0) {
    const toUpdate = ticket_types.filter((t: Record<string, unknown>) => t.id)
    const toInsert = ticket_types.filter((t: Record<string, unknown>) => !t.id)

    // UPDATE les types existants (change prix, nom, stock, etc.)
    for (const t of toUpdate) {
      const { id: ttId, ...fields } = t as Record<string, unknown>
      await admin.from('ticket_types').update(fields).eq('id', ttId).eq('event_id', id)
    }

    // INSERT les nouveaux types
    if (toInsert.length > 0) {
      const { error: insertErr } = await admin.from('ticket_types').insert(
        toInsert.map((t: Record<string, unknown>) => {
          const { id: _unused, ...rest } = t  // ne pas passer id=undefined
          return { ...rest, event_id: id }
        })
      )
      if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // Supprimer les types retirés du formulaire (ignore FK si des billets existent)
    const submittedIds = new Set(toUpdate.map((t: Record<string, unknown>) => t.id).filter(Boolean))
    const { data: current } = await admin.from('ticket_types').select('id').eq('event_id', id)
    const toDelete = (current ?? []).filter((r: { id: string }) => !submittedIds.has(r.id))
    for (const row of toDelete) {
      await admin.from('ticket_types').delete().eq('id', row.id)
      // Si FK violation (billets existants), Supabase ignore silencieusement côté route
    }
  }

  return NextResponse.json(data)
}

// DELETE /api/events/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from('events').update({ status: 'cancelled' }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
