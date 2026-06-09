import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { admin, userId } = await requireAdmin()
    const { id } = await ctx.params
    const { approve } = await req.json()
    const isApproved = Boolean(approve)

    const { error } = await admin
      .from('organizers')
      .update({ is_approved: isApproved })
      .eq('id', id)
    if (error) throw error

    await logAdminAction(
      admin,
      userId,
      isApproved ? 'approve_organizer' : 'revoke_organizer',
      'organizer',
      id,
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
