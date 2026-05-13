import { NextResponse } from 'next/server'
import { requireAdmin, requireSuperAdmin, handleAdminError, AdminAuthError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminCtx = await requireAdmin()
    requireSuperAdmin(adminCtx)
    const { id } = await ctx.params
    const body = await req.json()

    const patch: Record<string, unknown> = {}
    if (typeof body.is_active === 'boolean') patch.is_active = body.is_active
    if (body.role === 'admin' || body.role === 'super_admin') patch.role = body.role

    if (Object.keys(patch).length === 0) {
      throw new AdminAuthError(400, 'Aucune modification fournie')
    }

    const { error } = await adminCtx.admin.from('profiles').update(patch).eq('id', id)
    if (error) throw error

    await logAdminAction(
      adminCtx.admin,
      adminCtx.userId,
      `update_team_${Object.keys(patch).join('_')}`,
      'team_member',
      id,
      JSON.stringify(patch),
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminCtx = await requireAdmin()
    requireSuperAdmin(adminCtx)
    const { id } = await ctx.params

    if (id === adminCtx.userId) {
      throw new AdminAuthError(400, 'Impossible de supprimer son propre compte')
    }

    const { error } = await adminCtx.admin.auth.admin.deleteUser(id)
    if (error) throw error

    await logAdminAction(adminCtx.admin, adminCtx.userId, 'delete_team_member', 'team_member', id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
