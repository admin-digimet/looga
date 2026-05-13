import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { admin, userId } = await requireAdmin()
    const { id } = await ctx.params
    const { suspend } = await req.json()
    const isSuspended = Boolean(suspend)

    const { error } = await admin
      .from('organizers')
      .update({ is_suspended: isSuspended })
      .eq('id', id)
    if (error) throw error

    await logAdminAction(
      admin,
      userId,
      isSuspended ? 'suspend_organizer' : 'unsuspend_organizer',
      'organizer',
      id,
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
