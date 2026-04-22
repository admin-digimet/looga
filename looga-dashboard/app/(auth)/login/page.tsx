'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiLogin } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await apiLogin(email, password)

      if (data.user.role !== 'organizer' || !data.organizer) {
        setError("Ce compte n'est pas un compte organisateur.")
        setLoading(false)
        return
      }

      // Injecter la session Supabase pour que le layout SSR reste protégé
      const supabase = createClient()
      await supabase.auth.setSession({
        access_token: data.token,
        refresh_token: data.refresh_token,
      })

      router.push('/')
      router.refresh()
    } catch (err) {
      const e = err as Error & { status?: number }
      if (e.status === 403) {
        setError('Compte suspendu. Contactez le support.')
      } else if (e.status === 401) {
        setError('Email ou mot de passe incorrect.')
      } else {
        setError('Email ou mot de passe incorrect.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body gap-5">
        <div>
          <h2 className="card-title font-heading text-2xl">Connexion</h2>
          <p className="text-base-content/60 text-sm mt-1">
            Accède à ton espace organisateur
          </p>
        </div>

        {error && (
          <div className="alert alert-error text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">Email</span>
            </div>
            <input
              type="email"
              placeholder="ton@email.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">Mot de passe</span>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-base-content/60">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
