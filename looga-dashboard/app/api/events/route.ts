import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { validateEventCreate } from '@/lib/api/validateEvent'
import type { CreateEventPayload } from '@/types'

// GET /api/events — liste des événements de l'organisateur
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()

  // Admin client pour bypasser RLS sur la lookup organizer
  let { data: organizer } = await admin
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Auto-créer l'entrée organizer si elle n'existe pas (cas migration manuelle)
  if (!organizer) {
    const { data: newOrg } = await admin
      .from('organizers')
      .insert({ user_id: user.id, name: user.email ?? 'Mon organisation' })
      .select('id')
      .single()
    organizer = newOrg
  }

  if (!organizer) return NextResponse.json({ error: 'Organisateur introuvable' }, { status: 404 })

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types (*)
    `)
    .eq('organizer_id', organizer.id)
    .order('event_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(events)
}

// POST /api/events — créer un événement avec ses types de billets
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body: CreateEventPayload = await request.json()

  const validationError = validateEventCreate(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 422 })

  const admin = createAdminClient()

  let { data: organizer } = await admin
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!organizer) {
    const { data: newOrg } = await admin
      .from('organizers')
      .insert({ user_id: user.id, name: user.email ?? 'Mon organisation' })
      .select('id')
      .single()
    organizer = newOrg
  }

  if (!organizer) return NextResponse.json({ error: 'Organisateur introuvable' }, { status: 404 })

  const minPrice = body.ticket_types.length > 0
    ? Math.min(...body.ticket_types.map((t) => t.price))
    : 0

  const { data: event, error: eventError } = await admin
    .from('events')
    .insert({
      organizer_id: organizer.id,
      title: body.title,
      description: body.description,
      category: body.category,
      event_date: body.event_date,
      event_time: body.event_time,
      location_name: body.location_name,
      location_address: body.location_address,
      location_url: body.location_url,
      image_url: body.image_url,
      status: body.status ?? 'published',
      min_price: minPrice,
    })
    .select()
    .single()

  if (eventError) {
    console.error('[events:create] insert error:', eventError)
    return NextResponse.json(
      { error: "Impossible de créer l'événement. Vérifie les informations saisies et réessaie." },
      { status: 500 },
    )
  }

  // Insérer les types de billets
  if (body.ticket_types.length > 0) {
    const ticketTypesData = body.ticket_types.map((t) => ({
      event_id: event.id,
      name: t.name,
      description: t.description,
      price: t.price,
      stock_total: t.stock_total,
      stock_remaining: t.stock_total,
      advantages: t.advantages,
    }))

    const { error: ttError } = await admin.from('ticket_types').insert(ticketTypesData)
    if (ttError) {
      console.error('[events:create] ticket_types insert error:', ttError)
      return NextResponse.json(
        { error: "Impossible d'enregistrer les types de billets. Vérifie les montants et les quantités, puis réessaie." },
        { status: 500 },
      )
    }
  }

  return NextResponse.json(event, { status: 201 })
}
