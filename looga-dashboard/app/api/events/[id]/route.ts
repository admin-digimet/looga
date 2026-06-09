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

  if (Array.isArray(ticket_types)) {
    // Snapshot AVANT toute modification pour calculer les suppressions correctement
    const { data: snap } = await admin
      .from('ticket_types')
      .select('id')
      .eq('event_id', id)
    const currentIds = new Set((snap ?? []).map((r: { id: string }) => r.id))

    const withId = ticket_types.filter((t: Record<string, unknown>) => t.id)
    const withoutId = ticket_types.filter((t: Record<string, unknown>) => !t.id)
    const keptIds = new Set(withId.map((t: Record<string, unknown>) => t.id as string))

    // 1. UPDATE les types existants
    for (const t of withId) {
      const row = t as Record<string, unknown>
      const typeId = row.id as string
      const updateFields: Record<string, unknown> = {}
      for (const k of ['name', 'description', 'price', 'stock_total', 'advantages']) {
        if (k in row) updateFields[k] = row[k]
      }
      await admin.from('ticket_types').update(updateFields).eq('id', typeId).eq('event_id', id)
    }

    // 2. INSERT les nouveaux types
    if (withoutId.length > 0) {
      const rows = withoutId.map((t: Record<string, unknown>) => ({
        name: t.name,
        description: t.description ?? '',
        price: t.price,
        stock_total: t.stock_total,
        advantages: t.advantages ?? '',
        event_id: id,
      }))
      const { error: insertErr } = await admin.from('ticket_types').insert(rows)
      if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // 3. DELETE les types retirés — best-effort, ignore FK violations
    for (const rid of [...currentIds].filter((rid) => !keptIds.has(rid))) {
      await admin.from('ticket_types').delete().eq('id', rid)
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
