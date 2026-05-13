import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

const PAGE_SIZE = 50

interface EventRow {
  id: string
  organizer_id: string
  title: string
  description: string | null
  category: string
  event_date: string
  event_time: string
  location_name: string
  location_address: string | null
  image_url: string | null
  status: string
  is_sold_out: boolean
  min_price: number
  views_count: number
  created_at: string
  updated_at: string
  organizers?: { name: string | null } | null
}

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
      .select(
        'id, organizer_id, title, description, category, event_date, event_time, location_name, location_address, image_url, status, is_sold_out, min_price, views_count, created_at, updated_at, organizers!organizer_id(name)',
        { count: 'exact' },
      )
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

    const rows = (data ?? []) as unknown as EventRow[]
    const events = rows.map((e) => ({
      id: e.id,
      organizer_id: e.organizer_id,
      title: e.title,
      description: e.description,
      category: e.category,
      event_date: e.event_date,
      event_time: e.event_time,
      location_name: e.location_name,
      location_address: e.location_address,
      image_url: e.image_url,
      status: e.status,
      is_sold_out: e.is_sold_out,
      min_price: e.min_price,
      views_count: e.views_count,
      created_at: e.created_at,
      updated_at: e.updated_at,
      organizer_name: e.organizers?.name ?? null,
    }))

    return NextResponse.json({ data: events, total: count ?? events.length })
  } catch (err) {
    return handleAdminError(err)
  }
}
