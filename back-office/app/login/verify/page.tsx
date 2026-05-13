'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyMfaPage() {
  const router = useRouter()
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function bootstrap() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.currentLevel === 'aal2') {
        router.replace('/overview')
        return
      }

      const { data: factors } = await supabase.auth.mfa.listFactors()
      const verified = factors?.totp?.find((f) => f.status === 'verified')

      if (!verified) {
        router.replace('/setup-mfa')
        return
      }

      if (!cancelled) {
        setFactorId(verified.id)
        setBootstrapping(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId) return
    setError('')
    setLoading(true)
    const supabase = createClient()
    try {
      const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.trim(),
      })
      if (verifyErr) {
        setError('Code invalide. Réessaie.')
        return
      }
      router.replace('/overview')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 shadow-sm w-full max-w-md">
        <div className="card-body gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-heading">Vérification 2FA</h1>
          <p className="text-sm text-base-content/60 text-center">
            Saisis le code à 6 chiffres affiché dans ton application d&apos;authentification.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-sm font-medium">Code à 6 chiffres</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="input input-bordered bg-base-100 w-full text-center tracking-widest font-mono text-lg"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
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
            disabled={loading || code.length !== 6}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : null}
            {loading ? 'Vérification…' : 'Continuer'}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
