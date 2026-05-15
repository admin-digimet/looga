import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const targetType = searchParams.get('target_type')

    let query = admin
      .from('reports')
      .select('id, reporter_id, target_type, target_id, reason, status, reviewed_by, reviewed_at, created_at, reporter:profiles!reporter_id(name, phone)')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)
    if (targetType) query = query.eq('target_type', targetType)

    const { data, error } = await query
    if (error) throw error

    const rows = (data ?? []) as unknown as Array<Record<string, unknown> & {
      target_type: string
      target_id: string
      reporter?: { name: string | null; phone: string | null } | { name: string | null; phone: string | null }[] | null
    }>

    // Enrichir avec le nom de la cible (event title) pour les target_type='event'
    const eventIds = Array.from(
      new Set(rows.filter((r) => r.target_type === 'event').map((r) => r.target_id)),
    )
    let eventMap: Record<string, string> = {}
    if (eventIds.length > 0) {
      const { data: eventsData } = await admin
        .from('events')
        .select('id, title')
        .in('id', eventIds)
      eventMap = (eventsData ?? []).reduce<Record<string, string>>((acc, e) => {
        acc[e.id as string] = (e.title as string) ?? ''
        return acc
      }, {})
    }

    const result = rows.map((r) => {
      // PostgREST peut renvoyer reporter en objet ou array selon la relation
      const reporterObj = Array.isArray(r.reporter) ? r.reporter[0] : r.reporter
      return {
        ...r,
        target_label: r.target_type === 'event' ? eventMap[r.target_id] ?? null : null,
        reporter_name: reporterObj?.name ?? null,
        reporter: undefined,
      }
    })

    return NextResponse.json(result)
  } catch (err) {
    return handleAdminError(err)
  }
}
