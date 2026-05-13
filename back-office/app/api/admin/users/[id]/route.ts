import { NextResponse } from 'next/server'
import { requireAdmin, requireSuperAdmin, handleAdminError, AdminAuthError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

const ROLES = ['user', 'organizer', 'staff', 'admin', 'super_admin'] as const

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminCtx = await requireAdmin()
    const { id } = await ctx.params
    const body = await req.json()

    const patch: Record<string, unknown> = {}
    if (typeof body.is_active === 'boolean') patch.is_active = body.is_active
    if (typeof body.role === 'string') {
      requireSuperAdmin(adminCtx) // changement de rôle réservé super_admin
      if (!ROLES.includes(body.role)) throw new AdminAuthError(400, 'Rôle invalide')
      patch.role = body.role
    }

    if (Object.keys(patch).length === 0) {
      throw new AdminAuthError(400, 'Aucune modification fournie')
    }

    const { error } = await adminCtx.admin.from('profiles').update(patch).eq('id', id)
    if (error) throw error

    await logAdminAction(
      adminCtx.admin,
      adminCtx.userId,
      `update_user_${Object.keys(patch).join('_')}`,
      'user',
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

    // Supprime auth.users → cascade vers profiles via le trigger handle_new_user
    const { error } = await adminCtx.admin.auth.admin.deleteUser(id)
    if (error) throw error

    await logAdminAction(adminCtx.admin, adminCtx.userId, 'delete_user', 'user', id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleAdminError(err)
  }
}
