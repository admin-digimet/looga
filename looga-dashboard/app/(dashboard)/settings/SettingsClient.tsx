'use client'

import { useRef, useState } from 'react'

interface Props {
  initialName: string
  initialLogoUrl: string | null
  organizerId: string
}

export default function SettingsClient({ initialName, initialLogoUrl, organizerId }: Props) {
  const [name, setName] = useState(initialName)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères.')
      return
    }
    setError(null)
    setSaving(true)

    try {
      let logoUrl = initialLogoUrl

      if (logoFile) {
        const imageCompression = (await import('browser-image-compression')).default
        const compressed = await imageCompression(logoFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 400,
          useWebWorker: true,
          fileType: 'image/webp',
        })

        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const path = `org/${organizerId}/logo.webp`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, compressed, { upsert: true, contentType: 'image/webp' })

        if (uploadError) {
          setError("Erreur lors de l'upload du logo. Réessaie.")
          setSaving(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        logoUrl = publicUrl
      }

      const res = await fetch('/api/organizer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), logo_url: logoUrl }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Une erreur est survenue.')
        return
      }

      setLogoFile(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Une erreur est survenue. Réessaie.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {error && (
        <div className="alert alert-error text-sm py-2">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-xs ml-auto" onClick={() => setError(null)}>✕</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success text-sm py-2">
          <span>Paramètres enregistrés avec succès.</span>
        </div>
      )}

      {/* Logo */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body gap-4">
          <h2 className="font-heading font-bold text-lg">Logo / Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-base-300 border border-base-300 flex items-center justify-center">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-heading font-bold text-base-content/30">
                    {(initialName[0] ?? 'O').toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 btn btn-circle btn-xs btn-primary"
                title="Changer le logo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Logo de ton organisation</p>
              <p className="text-xs text-base-content/50">JPEG, PNG ou WebP · 2 Mo max · Carré recommandé</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn btn-outline btn-sm w-fit mt-1"
              >
                Choisir une image
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nom */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body gap-4">
          <h2 className="font-heading font-bold text-lg">Informations</h2>
          <div className="form-control">
            <div className="label"><span className="label-text font-medium">Nom de l&apos;organisation *</span></div>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon Organisation"
              required
              minLength={2}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary min-w-36" disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-sm" /> : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
