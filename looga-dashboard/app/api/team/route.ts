import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/team — liste des scanners de l'organisateur
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: organizer } = await supabase
    .from('organizers').select('id').eq('user_id', user.id).single()
  if (!organizer) return NextResponse.json({ error: 'Organisateur introuvable' }, { status: 404 })

  const { data, error } = await supabase
    .from('staff_accounts')
    .select('*, profiles(name, avatar_url)')
    .eq('organizer_id', organizer.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/team — créer un compte scanner
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: organizer } = await supabase
    .from('organizers').select('id').eq('user_id', user.id).single()
  if (!organizer) return NextResponse.json({ error: 'Organisateur introuvable' }, { status: 404 })

  const { name, email, password } = await request.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Champs requis : name, email, password' }, { status: 422 })
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch (e: any) {
    return NextResponse.json({ error: `Config serveur manquante : ${e.message}` }, { status: 500 })
  }

  // Créer le compte auth Supabase (email déjà confirmé)
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'staff' },
  })

  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

  // Insérer le profil staff
  const { error: profileError } = await admin.from('profiles').upsert({
    id: newUser.user.id,
    name,
    role: 'staff',
  })
  if (profileError) console.error('[POST /api/team] profil upsert:', profileError.message)

  // Insérer dans staff_accounts
  const { data: staffAccount, error: staffError } = await admin
    .from('staff_accounts')
    .insert({
      organizer_id: organizer.id,
      user_id: newUser.user.id,
      name,
    })
    .select()
    .single()

  if (staffError) return NextResponse.json({ error: staffError.message }, { status: 500 })
  return NextResponse.json(staffAccount, { status: 201 })
}
