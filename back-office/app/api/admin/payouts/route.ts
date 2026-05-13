import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = admin
      .from('payout_requests')
      .select('*, organizers(name)')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    let result = (data ?? []).map((p: Record<string, unknown> & { organizers?: { name: string } | null }) => ({
      ...p,
      organizer_name: p.organizers?.name ?? null,
      organizers: undefined,
    }))

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => (p.organizer_name as string | null)?.toLowerCase().includes(q))
    }

    return NextResponse.json(result)
  } catch (err) {
    return handleAdminError(err)
  }
}
