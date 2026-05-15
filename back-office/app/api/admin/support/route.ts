import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = admin
      .from('support_messages')
      .select('id, name, email, subject, message, user_id, status, admin_note, responded_by, responded_at, created_at')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)
    if (search) query = query.or(`subject.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err) {
    return handleAdminError(err)
  }
}
