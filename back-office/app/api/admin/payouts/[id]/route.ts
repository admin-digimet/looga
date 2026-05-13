import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError, AdminAuthError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

const STATUSES = ['pending', 'approved', 'paid', 'rejected'] as const

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { admin, userId } = await requireAdmin()
    const { id } = await ctx.params
    const { status, admin_note } = await req.json()

    if (!STATUSES.includes(status)) {
      throw new AdminAuthError(400, 'Statut invalide')
    }

    const now = new Date().toISOString()
    const patch: Record<string, unknown> = {
      status,
      reviewed_by: userId,
      reviewed_at: now,
    }
    if (admin_note !== undefined) patch.admin_note = admin_note
    if (status === 'paid') patch.paid_at = now

    const { error } = await admin.from('payout_requests').update(patch).eq('id', id)
    if (error) throw error

    await logAdminAction(admin, userId, `payout_${status}`, 'payout', id, admin_note)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
