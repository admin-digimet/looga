'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, FileText, Pencil } from 'lucide-react'
import { getAdminContent, type PageContentListItem } from '@/lib/api/admin'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ContentList() {
  const [pages, setPages] = useState<PageContentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminContent()
      .then((data) => { if (!cancelled) setPages(data) })
      .catch((e) => { if (!cancelled) setError((e as Error).message ?? 'Erreur') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="card bg-base-200 p-10 text-center">
        <span className="loading loading-spinner loading-md mx-auto" />
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-error py-2 text-sm"><span>{error}</span></div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {pages.map((p) => (
        <Link
          key={p.key}
          href={`/content/${p.key}`}
          className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-primary/30"
        >
          <div className="card-body flex-row items-start gap-4 p-5">
            <div className="bg-primary/10 text-primary p-3 rounded-lg shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold font-heading text-base">{p.label}</h3>
                {p.configured ? (
                  <span className="badge badge-success badge-sm">
                    <CheckCircle size={10} className="mr-1" />
                    Configuré
                  </span>
                ) : (
                  <span className="badge badge-ghost badge-sm">Par défaut</span>
                )}
              </div>
              <p className="text-xs text-base-content/50 mb-3">/{p.key}</p>
              <p className="text-xs text-base-content/60">
                {p.configured
                  ? `Modifié ${formatDate(p.updated_at)}`
                  : 'Contenu du code utilisé tant que pas modifié'}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 text-primary text-xs font-semibold">
                <Pencil size={11} />
                {p.configured ? 'Modifier' : 'Personnaliser'}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
