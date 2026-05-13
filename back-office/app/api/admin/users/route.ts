import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

const PAGE_SIZE = 50

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page') ?? '1')
    const offset = (page - 1) * PAGE_SIZE

    let query = admin
      .from('profiles')
      .select('id, name, phone, avatar_url, role, is_active, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (role) query = query.eq('role', role)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, count, error } = await query
    if (error) throw error

    // Récupérer les emails depuis auth.users (jointure manuelle)
    const ids = (data ?? []).map((u) => u.id)
    let emailMap: Record<string, string> = {}
    if (ids.length > 0) {
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      emailMap = (usersData?.users ?? []).reduce<Record<string, string>>((acc, u) => {
        acc[u.id] = u.email ?? ''
        return acc
      }, {})
    }

    const users = (data ?? []).map((u) => ({ ...u, email: emailMap[u.id] ?? '' }))
    return NextResponse.json({ data: users, total: count ?? users.length })
  } catch (err) {
    return handleAdminError(err)
  }
}
