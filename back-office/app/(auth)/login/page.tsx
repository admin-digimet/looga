'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reasonError = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(reasonError === 'not_admin' ? "Ce compte n'est pas un administrateur Looga." : '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError || !data.user) {
        setError('Email ou mot de passe incorrect.')
        return
      }

      // Vérifier le rôle admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await supabase.auth.signOut()
        setError("Profil introuvable. Contactez léquipe support.")
        return
      }

      if (!profile.is_active) {
        await supabase.auth.signOut()
        setError('Compte suspendu. Contactez l\'equipe support.')
        return
      }

      if (profile.role !== 'admin' && profile.role !== 'super_admin') {
        await supabase.auth.signOut()
        setError("Ce compte n'est pas un administrateur Looga.")
        return
      }

      // Router selon l'état MFA
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      if (!aal) {
        router.push('/overview')
        router.refresh()
        return
      }

      if (aal.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
        router.push('/login/verify')
      } else if (aal.nextLevel === 'aal1' && aal.currentLevel === 'aal1') {
        router.push('/setup-mfa')
      } else {
        router.push('/overview')
        router.refresh()
      }
    } catch {
      setError('Une erreur est survenue. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-primary">looga</h1>
          <p className="text-sm text-base-content/60 mt-1">Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-sm font-medium">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered bg-base-100 w-full"
              placeholder="admin@looga.ci"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-sm font-medium">Mot de passe</span>
            </label>
            <input
              type="password"
              className="input input-bordered bg-base-100 w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="alert alert-error py-2 px-3 text-sm">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : null}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-xs text-center text-base-content/40">
          Accès réservé aux administrateurs Looga  
        </p>
      </div>
    </div>
  )
}
