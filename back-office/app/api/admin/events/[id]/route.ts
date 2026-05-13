import { NextResponse } from 'next/server'
import { requireAdmin, handleAdminError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { admin, userId } = await requireAdmin()
    const { id } = await ctx.params

    const { error } = await admin.from('events').delete().eq('id', id)
    if (error) throw error

    await logAdminAction(admin, userId, 'delete_event', 'event', id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
