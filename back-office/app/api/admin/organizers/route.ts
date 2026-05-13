import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = admin
      .from('organizers')
      .select('*, profiles(email, name)')
      .order('created_at', { ascending: false })

    if (status === 'active') query = query.eq('is_suspended', false)
    if (status === 'suspended') query = query.eq('is_suspended', true)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err) {
    return handleAdminError(err)
  }
}
