import { supabase } from '@/lib/supabase/client'
import type { AuthResponse } from '@/types/user'

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    if (__DEV__) console.log('[AUTH] login attempt:', email)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (__DEV__) console.log('[AUTH] signInWithPassword error:', error.message, error.status)
      throw error
    }

    if (__DEV__) console.log('[AUTH] auth OK, checking staff_accounts for user:', data.user.id)

    // Vérifier que ce compte est bien un scanner créé par un organisateur
    const { data: staff, error: staffError } = await supabase
      .from('staff_accounts')
      .select('id, name, is_active, organizer_id')
      .eq('user_id', data.user.id)
      .single()

    if (staffError || !staff) {
      if (__DEV__) console.log('[AUTH] staff_accounts not found:', staffError?.message)
      await supabase.auth.signOut()
      throw new Error('Compte scanner introuvable. Contacte ton organisateur.')
    }

    if (!staff.is_active) {
      if (__DEV__) console.log('[AUTH] staff account disabled')
      await supabase.auth.signOut()
      throw new Error('Ce compte scanner est désactivé.')
    }

    if (__DEV__) console.log('[AUTH] staff OK:', staff.name)

    return {
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: staff.id,
        name: staff.name,
        email: data.user.email ?? email,
        role: 'staff',
      },
    }
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut()
  },
}
