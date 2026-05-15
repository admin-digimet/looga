import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError, AdminAuthError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

const STATUSES = ['pending', 'responded', 'closed'] as const

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { admin, userId } = await requireAdmin()
    const { id } = await ctx.params
    const { status, admin_note } = await req.json()

    if (!STATUSES.includes(status)) {
      throw new AdminAuthError(400, 'Statut invalide')
    }

    const patch: Record<string, unknown> = { status }
    if (admin_note !== undefined) patch.admin_note = admin_note
    if (status === 'responded') {
      patch.responded_by = userId
      patch.responded_at = new Date().toISOString()
    }

    const { error } = await admin.from('support_messages').update(patch).eq('id', id)
    if (error) throw error

    await logAdminAction(admin, userId, `support_${status}`, 'user', id, admin_note)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
