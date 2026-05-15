'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import {
  getAdminContentByKey,
  updateAdminContent,
  type PageSection,
} from '@/lib/api/admin'

export function ContentEditor({ pageKey }: { pageKey: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [intro, setIntro] = useState('')
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAdminContentByKey(pageKey)
      .then((data) => {
        if (cancelled) return
        if (data) {
          setTitle(data.title)
          setIntro(data.intro ?? '')
          setSections(data.sections ?? [])
        }
      })
      .catch((e) => { if (!cancelled) setError((e as Error).message ?? 'Erreur') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [pageKey])

  function updateSection(idx: number, patch: Partial<PageSection>) {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  function addSection() {
    setSections((prev) => [...prev, { heading: '', body: '' }])
  }

  function removeSection(idx: number) {
    setSections((prev) => prev.filter((_, i) => i !== idx))
  }

  function moveSection(idx: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return next
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Le titre est obligatoire')
      return
    }
    const cleanSections = sections.filter((s) => s.heading.trim() || s.body.trim())
    setSaving(true)
    setError(null)
    try {
      await updateAdminContent(pageKey, {
        title: title.trim(),
        intro: intro.trim() || null,
        sections: cleanSections,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="card bg-base-200 p-10 text-center">
        <span className="loading loading-spinner loading-md mx-auto" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link href="/content" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> Retour
        </Link>
        <code className="text-xs text-base-content/50">/{pageKey}</code>
      </div>

      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <div>
            <label className="label py-1">
              <span className="label-text font-medium">Titre de la page</span>
            </label>
            <input
              type="text"
              className="input input-bordered bg-base-100 w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: À propos de Looga"
            />
          </div>

          <div>
            <label className="label py-1">
              <span className="label-text font-medium">Introduction</span>
              <span className="label-text-alt text-base-content/40">Optionnel</span>
            </label>
            <textarea
              className="textarea textarea-bordered bg-base-100 w-full"
              rows={2}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Brève phrase d'introduction affichée sous le titre"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <h3 className="font-heading font-bold text-base">Sections</h3>
        <button className="btn btn-primary btn-sm" onClick={addSection}>
          <Plus size={14} /> Ajouter une section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="alert alert-info py-3 text-sm">
          <span>
            Aucune section pour l&apos;instant — tant que vide, le contenu par défaut du code s&apos;affichera côté webapp.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sections.map((section, idx) => (
          <div key={idx} className="card bg-base-200 shadow-sm">
            <div className="card-body gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-base-content/50 font-semibold">
                  Section {idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, -1)}
                    title="Remonter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    disabled={idx === sections.length - 1}
                    onClick={() => moveSection(idx, 1)}
                    title="Descendre"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => removeSection(idx)}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">Titre de la section</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-100 w-full"
                  value={section.heading}
                  onChange={(e) => updateSection(idx, { heading: e.target.value })}
                  placeholder="Ex: Notre mission"
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">Contenu</span>
                  <span className="label-text-alt text-base-content/40">
                    Paragraphes séparés par ligne vide · Listes : commencer chaque ligne par &quot;- &quot;
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered bg-base-100 w-full text-sm"
                  rows={6}
                  value={section.body}
                  onChange={(e) => updateSection(idx, { body: e.target.value })}
                  placeholder="Tape ton texte ici. Saute une ligne pour faire un nouveau paragraphe."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="alert alert-error py-2 text-sm">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success py-2 text-sm">
          <span>✓ Contenu enregistré — visible sur la webapp.</span>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2 sticky bottom-0 bg-base-100/80 backdrop-blur p-2 -mx-6 px-6 border-t border-base-300">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => router.push('/content')}
        >
          Annuler
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <span className="loading loading-spinner loading-xs" /> : <Save size={14} />}
          {saving ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
      </div>
    </>
  )
}
