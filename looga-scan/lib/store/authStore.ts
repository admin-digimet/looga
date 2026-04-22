import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { ScanUser } from '@/types/user'

interface AuthState {
  token: string | null
  user: ScanUser | null
  pin: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: ScanUser) => Promise<void>
  setPin: (pin: string) => Promise<void>
  logout: () => Promise<void>
  loadToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  pin: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token, user) => {
    // Supabase persiste la session automatiquement via ExpoSecureStoreAdapter
    set({ token, user, isAuthenticated: true })
  },

  setPin: async (pin) => {
    set({ pin })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ token: null, user: null, pin: null, isAuthenticated: false })
  },

  loadToken: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        set({ isLoading: false, isAuthenticated: false })
        return
      }

      // Session active — récupérer les infos scanner
      const { data: staff } = await supabase
        .from('staff_accounts')
        .select('id, name, is_active')
        .eq('user_id', session.user.id)
        .single()

      if (!staff || !(staff as any).is_active) {
        await supabase.auth.signOut()
        set({ isLoading: false, isAuthenticated: false })
        return
      }

      const user: ScanUser = {
        id: (staff as any).id,
        name: (staff as any).name,
        email: session.user.email ?? '',
        role: 'staff',
      }

      set({
        token: session.access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false, isAuthenticated: false })
    }
  },
}))
