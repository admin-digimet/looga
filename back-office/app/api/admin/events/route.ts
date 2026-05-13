import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

const PAGE_SIZE = 50

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page') ?? '1')
    const offset = (page - 1) * PAGE_SIZE

    let query = admin
      .from('events')
      .select('*, organizers(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data, count, error } = await query
    if (error) throw error

    const events = (data ?? []).map((e: Record<string, unknown> & { organizers?: { name: string } | null }) => ({
      ...e,
      organizer_name: e.organizers?.name ?? null,
      organizers: undefined,
    }))

    return NextResponse.json({ data: events, total: count ?? events.length })
  } catch (err) {
    return handleAdminError(err)
  }
}
