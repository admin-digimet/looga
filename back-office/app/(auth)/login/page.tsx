'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiLogin } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await apiLogin(email, password)

      if (result.user.role !== 'admin' && result.user.role !== 'super_admin') {
        setError("Ce compte n'est pas un compte administrateur Looga.")
        return
      }

      const supabase = createClient()
      await supabase.auth.setSession({
        access_token: result.token,
        refresh_token: result.refresh_token,
      })

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string }
      if (e.status === 403) {
        setError('Compte suspendu. Contactez le support.')
      } else if (e.status === 401) {
        setError('Email ou mot de passe incorrect.')
      } else {
        setError('Une erreur est survenue. Réessaie.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body gap-6">
        {/* Logo */}
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
