import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

const PAGE_SIZE = 20

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const { searchParams } = new URL(req.url)

    const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const search     = searchParams.get('search')?.trim() ?? ''
    const actorType  = searchParams.get('actor_type') ?? 'all'
    const status     = searchParams.get('status') ?? 'all'
    const period     = searchParams.get('period') ?? 'all'

    let query = admin
      .from('journal')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (actorType !== 'all') query = query.eq('actor_type', actorType)
    if (status !== 'all')    query = query.eq('status', status)

    if (period !== 'all') {
      const now = new Date()
      let from: Date
      if (period === 'today') {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (period === 'week') {
        from = new Date(Date.now() - 7 * 24 * 3600 * 1000)
      } else {
        from = new Date(Date.now() - 30 * 24 * 3600 * 1000)
      }
      query = query.gte('created_at', from.toISOString())
    }

    if (search) {
      query = query.or(
        `actor_name.ilike.%${search}%,actor_email.ilike.%${search}%,target_label.ilike.%${search}%,action.ilike.%${search}%`
      )
    }

    const { data, count, error } = await query
    if (error) throw error

    const rows = data ?? []

    // Résout le rôle ACTUEL de chaque acteur (profiles.role) pour que la colonne
    // "Acteur" reflète qui est la personne aujourd'hui (ex: un scanner = 'staff'),
    // pas seulement le actor_type figé au moment du log.
    const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))] as string[]
    let roleById: Record<string, string> = {}
    if (actorIds.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, role')
        .in('id', actorIds)
      roleById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.role]))
    }

    const enriched = rows.map((r) => ({
      ...r,
      actor_role: r.actor_id ? roleById[r.actor_id] ?? null : null,
    }))

    return NextResponse.json({ data: enriched, total: count ?? 0 })
  } catch (err) {
    return handleAdminError(err)
  }
}
