'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SetupMfaPage() {
  const router = useRouter()
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enrolling, setEnrolling] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function bootstrap() {
      // Vérifier session
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      // Vérifier rôle
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        await supabase.auth.signOut()
        router.replace('/login?error=not_admin')
        return
      }

      // Si déjà aal2, on n'a rien à faire ici
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.currentLevel === 'aal2') {
        router.replace('/overview')
        return
      }

      // Si un factor TOTP verified existe déjà, on ne refait pas l'enrollment
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const verifiedTotp = factors?.totp?.find((f) => f.status === 'verified')
      if (verifiedTotp) {
        router.replace('/login/verify')
        return
      }

      // Nettoyer les factors unverified abandonnés (sinon enroll échoue)
      const unverifiedTotp = factors?.totp?.filter((f) => f.status !== 'verified') ?? []
      for (const f of unverifiedTotp) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }

      // Lancer l'enrollment
      const { data: enroll, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Looga Admin',
      })

      if (cancelled) return

      if (enrollErr || !enroll) {
        setError('Impossible de générer le QR code. Réessaie.')
        setEnrolling(false)
        return
      }

      setFactorId(enroll.id)
      setQrCode(enroll.totp.qr_code)
      setSecret(enroll.totp.secret)
      setEnrolling(false)
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

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 shadow-sm w-full max-w-md">
        <div className="card-body gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-heading">Activation 2FA obligatoire</h1>
          <p className="text-sm text-base-content/60 text-center">
            Scanne le QR code avec une application d&apos;authentification (Google Authenticator,
            1Password, Authy…), puis saisis le code à 6 chiffres pour activer la double
            authentification.
          </p>
        </div>

        {enrolling ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : qrCode ? (
          <>
            <div className="bg-white rounded-xl p-4 flex justify-center">
              {/* Supabase fournit qr_code en SVG data URI */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR code 2FA" className="w-48 h-48" />
            </div>

            {secret && (
              <details className="text-xs">
                <summary className="cursor-pointer text-base-content/60">
                  Impossible de scanner ? Saisir la clé manuellement
                </summary>
                <p className="mt-2 font-mono break-all bg-base-100 p-2 rounded select-all">
                  {secret}
                </p>
              </details>
            )}

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
                {loading ? 'Vérification…' : 'Activer le 2FA'}
              </button>
            </form>
          </>
          ) : (
            <div className="alert alert-error py-2 px-3 text-sm">
              <span>{error || 'Erreur lors de l\'enrollment.'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
