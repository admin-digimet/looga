import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

interface OrganizerRow {
  id: string
  user_id: string | null
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  is_approved: boolean
  is_suspended: boolean
  created_at: string
  profiles?: { name: string | null; phone: string | null } | null
}

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = admin
      .from('organizers')
      .select('id, user_id, name, description, logo_url, website, is_approved, is_suspended, created_at, profiles!user_id(name, phone)')
      .order('created_at', { ascending: false })

    if (status === 'active') query = query.eq('is_suspended', false)
    if (status === 'suspended') query = query.eq('is_suspended', true)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error } = await query
    if (error) throw error

    const rows = (data ?? []) as unknown as OrganizerRow[]

    // Récupérer les emails depuis auth.users
    const userIds = rows.map((r) => r.user_id).filter((id): id is string => !!id)
    let emailMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      emailMap = (usersData?.users ?? []).reduce<Record<string, string>>((acc, u) => {
        acc[u.id] = u.email ?? ''
        return acc
      }, {})
    }

    const result = rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      description: r.description,
      logo_url: r.logo_url,
      website: r.website,
      is_approved: r.is_approved,
      is_suspended: r.is_suspended,
      created_at: r.created_at,
      owner_name: r.profiles?.name ?? null,
      owner_phone: r.profiles?.phone ?? null,
      owner_email: r.user_id ? emailMap[r.user_id] ?? null : null,
    }))

    return NextResponse.json(result)
  } catch (err) {
    return handleAdminError(err)
  }
}
