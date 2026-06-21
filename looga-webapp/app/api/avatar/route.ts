import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// POST /api/avatar — reçoit l'image compressée et l'upload côté serveur
// Évite les problèmes CORS + RLS du navigateur vers Supabase Storage
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  // L'uid est dérivé du token (vérifié côté Supabase), jamais d'un header
  // client (x-user-id était falsifiable). Sans ça, un user pourrait viser
  // le dossier d'un autre — la RLS Storage bloque, mais on ne s'y fie pas.
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  })
  if (!userRes.ok) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
  }
  const { id: userId } = (await userRes.json()) as { id?: string }
  if (!userId) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
  }

  const imageBuffer = await request.arrayBuffer()
  const path = `${userId}/avatar.webp`

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${path}`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'true',
    },
    body: imageBuffer,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json({ error: err.message ?? 'Upload échoué' }, { status: res.status })
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}?t=${Date.now()}`
  return NextResponse.json({ url: publicUrl })
}
