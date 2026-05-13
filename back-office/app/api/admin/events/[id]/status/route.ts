import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError, AdminAuthError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

const ALLOWED_STATUSES = ['cancelled', 'published'] as const

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { admin, userId } = await requireAdmin()
    const { id } = await ctx.params
    const { status } = await req.json()

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new AdminAuthError(400, 'Statut invalide')
    }

    const { error } = await admin
      .from('events')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error

    await logAdminAction(admin, userId, `event_status_${status}`, 'event', id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
