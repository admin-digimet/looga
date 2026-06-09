import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/organizer — met à jour logo_url et/ou name de l'organisateur
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const { logo_url, name } = body

  const updates: { logo_url?: string; name?: string } = {}
  if (logo_url !== undefined) updates.logo_url = logo_url
  if (name !== undefined) updates.name = name

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 422 })
  }

  const { error } = await supabase
    .from('organizers')
    .update(updates)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (name) {
    await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id)
  }

  return NextResponse.json({ ok: true })
}
