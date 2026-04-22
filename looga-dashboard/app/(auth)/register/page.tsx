'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiRegisterOrganizer } from '@/lib/api/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    organization_name: '',
    email: '',
    phone: '',
    description: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.')
      return
    }

    setLoading(true)

    try {
      const data = await apiRegisterOrganizer({
        name: form.name,
        email: form.email,
        password: form.password,
        organization_name: form.organization_name,
        ...(form.phone && { phone: form.phone }),
        ...(form.description && { description: form.description }),
      })

      // Injecter la session Supabase pour que le layout SSR reste protégé
      const supabase = createClient()
      await supabase.auth.setSession({
        access_token: data.token,
        refresh_token: data.refresh_token,
      })

      router.push('/')
      router.refresh()
    } catch (err) {
      const e = err as Error
      setError(e.message ?? "Une erreur est survenue lors de l'inscription.")
      setLoading(false)
    }
  }

  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body gap-5">
        <div>
          <h2 className="card-title font-heading text-2xl">Compte organisateur</h2>
          <p className="text-base-content/60 text-sm mt-1">
            Commence à publier tes événements
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <div className="label"><span className="label-text font-medium">Ton nom</span></div>
            <input
              name="name"
              type="text"
              placeholder="Diabaté Ismael"
              className="input input-bordered w-full"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-control">
            <div className="label"><span className="label-text font-medium">Nom de l&apos;organisation</span></div>
            <input
              name="organization_name"
              type="text"
              placeholder="AfroEvent Productions"
              className="input input-bordered w-full"
              value={form.organization_name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-control">
            <div className="label"><span className="label-text font-medium">Email</span></div>
            <input
              name="email"
              type="email"
              placeholder="ton@email.com"
              className="input input-bordered w-full"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">Téléphone</span>
              <span className="label-text-alt text-base-content/40">Optionnel</span>
            </div>
            <input
              name="phone"
              type="tel"
              placeholder="+2250701020304"
              className="input input-bordered w-full"
              value={form.phone}
              onChange={handleChange}
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">Description</span>
              <span className="label-text-alt text-base-content/40">Optionnel</span>
            </div>
            <input
              name="description"
              type="text"
              placeholder="Organisateur de concerts à Abidjan"
              className="input input-bordered w-full"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <label className="form-control">
            <div className="label"><span className="label-text font-medium">Mot de passe</span></div>
            <input
              name="password"
              type="password"
              placeholder="Min. 6 caractères"
              className="input input-bordered w-full"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-control">
            <div className="label"><span className="label-text font-medium">Confirmer le mot de passe</span></div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-base-content/60">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
