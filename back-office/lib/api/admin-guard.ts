import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminRole = 'admin' | 'super_admin'

export interface AdminContext {
  userId: string
  role: AdminRole
  email: string
  admin: SupabaseClient
}

export class AdminAuthError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

/**
 * À utiliser au début de chaque API route admin.
 * Vérifie session + role + AAL2.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new AdminAuthError(401, 'Non authentifié')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    throw new AdminAuthError(403, 'Compte désactivé')
  }

  if (profile.role !== 'admin' && profile.role !== 'super_admin') {
    throw new AdminAuthError(403, 'Réservé aux administrateurs')
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel !== 'aal2') {
    throw new AdminAuthError(401, '2FA requis')
  }

  return {
    userId: user.id,
    role: profile.role,
    email: user.email ?? '',
    admin: createAdminClient(),
  }
}

export function requireSuperAdmin(ctx: AdminContext): void {
  if (ctx.role !== 'super_admin') {
    throw new AdminAuthError(403, 'Réservé aux super-administrateurs')
  }
}

export function handleAdminError(err: unknown): NextResponse {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }
  const message = err instanceof Error ? err.message : 'Erreur serveur'
  return NextResponse.json({ error: message }, { status: 500 })
}
