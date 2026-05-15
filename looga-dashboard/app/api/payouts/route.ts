import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { computeOrganizerBalance } from '@/lib/payouts'

const ALLOWED_METHODS = ['mtn_momo', 'orange_money', 'wave', 'bank_transfer'] as const

async function getOrCreateOrganizer(adminClient: ReturnType<typeof createAdminClient>, userId: string, email: string | null) {
  let { data: organizer } = await adminClient
    .from('organizers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!organizer) {
    const { data: newOrg } = await adminClient
      .from('organizers')
      .insert({ user_id: userId, name: email ?? 'Mon organisation' })
      .select('id')
      .single()
    organizer = newOrg
  }
  return organizer
}

// GET /api/payouts — historique + stats de solde
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const organizer = await getOrCreateOrganizer(admin, user.id, user.email ?? null)
  if (!organizer) return NextResponse.json({ error: 'Organisateur introuvable' }, { status: 404 })

  const [{ data: requests, error }, balance] = await Promise.all([
    admin
      .from('payout_requests')
      .select('id, amount, method, phone_number, bank_details, status, admin_note, reviewed_at, paid_at, created_at')
      .eq('organizer_id', organizer.id)
      .order('created_at', { ascending: false }),
    computeOrganizerBalance(admin, organizer.id),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    requests: requests ?? [],
    balance,
  })
}

// POST /api/payouts — nouvelle demande de reversement
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json() as {
    amount?: number
    method?: string
    phone_number?: string
    bank_details?: { holder?: string; bank?: string; account?: string }
  }

  // Validations
  if (typeof body.amount !== 'number' || body.amount <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }
  if (!ALLOWED_METHODS.includes(body.method as typeof ALLOWED_METHODS[number])) {
    return NextResponse.json({ error: 'Méthode invalide' }, { status: 400 })
  }

  if (['mtn_momo', 'orange_money', 'wave'].includes(body.method!)) {
    if (!body.phone_number?.trim()) {
      return NextResponse.json({ error: 'Numéro de téléphone requis pour ce moyen' }, { status: 400 })
    }
  } else if (body.method === 'bank_transfer') {
    const bd = body.bank_details
    if (!bd?.holder?.trim() || !bd?.bank?.trim() || !bd?.account?.trim()) {
      return NextResponse.json({ error: 'Coordonnées bancaires complètes requises' }, { status: 400 })
    }
  }

  const admin = createAdminClient()
  const organizer = await getOrCreateOrganizer(admin, user.id, user.email ?? null)
  if (!organizer) return NextResponse.json({ error: 'Organisateur introuvable' }, { status: 404 })

  // Vérification serveur du solde disponible
  const balance = await computeOrganizerBalance(admin, organizer.id)
  if (body.amount > balance.available) {
    return NextResponse.json({
      error: `Montant supérieur au solde disponible (${balance.available.toLocaleString('fr-FR')} FCFA)`,
    }, { status: 400 })
  }

  const { data, error } = await admin
    .from('payout_requests')
    .insert({
      organizer_id: organizer.id,
      amount: body.amount,
      method: body.method,
      phone_number: body.phone_number ?? null,
      bank_details: body.bank_details ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
