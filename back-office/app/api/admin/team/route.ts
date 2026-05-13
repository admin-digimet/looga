import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

export async function GET() {
  try {
    const { admin } = await requireAdmin()

    const { data: profiles, error } = await admin
      .from('profiles')
      .select('id, name, phone, avatar_url, role, is_active, created_at')
      .in('role', ['admin', 'super_admin'])
      .order('created_at', { ascending: false })
    if (error) throw error

    const ids = (profiles ?? []).map((p) => p.id)
    let userMap: Record<string, { email: string; last_sign_in_at: string | null }> = {}
    if (ids.length > 0) {
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      userMap = (usersData?.users ?? []).reduce<Record<string, { email: string; last_sign_in_at: string | null }>>((acc, u) => {
        acc[u.id] = {
          email: u.email ?? '',
          last_sign_in_at: u.last_sign_in_at ?? null,
        }
        return acc
      }, {})
    }

    const team = (profiles ?? []).map((p) => ({
      ...p,
      email: userMap[p.id]?.email ?? '',
      last_sign_in_at: userMap[p.id]?.last_sign_in_at ?? null,
    }))

    return NextResponse.json(team)
  } catch (err) {
    return handleAdminError(err)
  }
}
