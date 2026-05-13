import { NextResponse } from 'next/server'
import { requireAdmin, requireSuperAdmin, handleAdminError, AdminAuthError } from '@/lib/api/admin-guard'
import { logAdminAction } from '@/lib/api/admin-log'

export async function POST(req: Request) {
  try {
    const adminCtx = await requireAdmin()
    requireSuperAdmin(adminCtx)
    const { email, name, role } = await req.json()

    if (!email || typeof email !== 'string') {
      throw new AdminAuthError(400, 'Email requis')
    }
    if (role !== 'admin' && role !== 'super_admin') {
      throw new AdminAuthError(400, 'Rôle invalide')
    }

    // Invite via Supabase Auth (envoie le mail d'invitation)
    const { data, error } = await adminCtx.admin.auth.admin.inviteUserByEmail(email, {
      data: { name: name ?? email.split('@')[0], role },
    })
    if (error) throw error
    if (!data?.user) throw new AdminAuthError(500, 'Invitation échouée')

    // Le trigger handle_new_user crée le profile, on s'assure du rôle correct
    await adminCtx.admin
      .from('profiles')
      .upsert({
        id: data.user.id,
        name: name ?? email.split('@')[0],
        role,
        is_active: true,
      })

    await logAdminAction(
      adminCtx.admin,
      adminCtx.userId,
      `invite_${role}`,
      'team_member',
      data.user.id,
      email,
    )
    return NextResponse.json({ ok: true, id: data.user.id })
  } catch (err) {
    return handleAdminError(err)
  }
}
