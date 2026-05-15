'use client'

import { useEffect, useState, useCallback } from 'react'
import { Check, Mail, Search, X } from 'lucide-react'
import {
  getAdminSupport,
  updateSupportMessage,
  type SupportMessage,
  type SupportStatus,
} from '@/lib/api/admin'

const STATUS_LABEL: Record<SupportStatus, string> = {
  pending: 'En attente',
  responded: 'Répondu',
  closed: 'Fermé',
}

const STATUS_BADGE: Record<SupportStatus, string> = {
  pending: 'badge-warning',
  responded: 'badge-success',
  closed: 'badge-ghost',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function SupportTable() {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SupportMessage | null>(null)
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminSupport({
        status: statusFilter,
        search: search.trim() || undefined,
      })
      setMessages(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load])

  async function handleAction(msg: SupportMessage, status: SupportStatus) {
    setActionLoading(msg.id)
    try {
      await updateSupportMessage(msg.id, { status, admin_note: note.trim() || undefined })
      setMessages((prev) => prev.map((m) =>
        m.id === msg.id ? { ...m, status, admin_note: note.trim() || m.admin_note } : m,
      ))
      setSelected(null)
      setNote('')
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            className="input input-bordered bg-base-100 w-full pl-9 text-sm"
            placeholder="Rechercher par sujet, nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select select-bordered bg-base-100 text-sm w-full sm:w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="responded">Répondus</option>
          <option value="closed">Fermés</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error py-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-base-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra text-sm">
            <thead>
              <tr className="text-base-content/60 text-xs uppercase">
                <th>Expéditeur</th>
                <th>Sujet</th>
                <th>Aperçu</th>
                <th>Statut</th>
                <th>Reçu le</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <span className="loading loading-spinner loading-md" />
                  </td>
                </tr>
              )}
              {!loading && messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-base-content/40">
                    Aucun message
                  </td>
                </tr>
              )}
              {messages.map((m) => {
                const isLoading = actionLoading === m.id
                return (
                  <tr key={m.id} className={isLoading ? 'opacity-50' : ''}>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <a href={`mailto:${m.email}`} className="text-xs text-primary hover:underline truncate max-w-[180px]">
                          {m.email}
                        </a>
                      </div>
                    </td>
                    <td className="font-medium max-w-[240px]">
                      <p className="truncate" title={m.subject}>{m.subject}</p>
                    </td>
                    <td className="text-base-content/70 text-xs max-w-[300px]">
                      <p className="line-clamp-2" title={m.message}>{m.message}</p>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${STATUS_BADGE[m.status]}`}>
                        {STATUS_LABEL[m.status]}
                      </span>
                    </td>
                    <td className="text-base-content/50 whitespace-nowrap">
                      {formatDate(m.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          title="Voir le message complet"
                          onClick={() => { setSelected(m); setNote(m.admin_note ?? '') }}
                        >
                          <Mail size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détail message */}
      {selected && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg font-heading mb-1">{selected.subject}</h3>
            <p className="text-xs text-base-content/60 mb-4">
              De <span className="font-medium">{selected.name}</span> ·{' '}
              <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a> ·{' '}
              {formatDate(selected.created_at)}
            </p>

            <div className="bg-base-100 rounded-lg p-4 text-sm whitespace-pre-wrap mb-4 max-h-64 overflow-y-auto">
              {selected.message}
            </div>

            <div>
              <label className="label py-0">
                <span className="label-text text-sm font-medium">Note interne (optionnel)</span>
              </label>
              <textarea
                className="textarea textarea-bordered bg-base-100 w-full text-sm"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note pour l'équipe (visible uniquement côté admin)"
              />
            </div>

            <div className="alert alert-info py-2 text-xs mt-3">
              <span>
                💡 Pour répondre, clique sur l&apos;email ci-dessus (ouvre ton client mail).
                Puis marque le statut ici une fois fait.
              </span>
            </div>

            <div className="modal-action gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setNote('') }}>
                Fermer
              </button>
              {selected.status === 'pending' && (
                <button
                  className="btn btn-success btn-sm"
                  disabled={actionLoading === selected.id}
                  onClick={() => handleAction(selected, 'responded')}
                >
                  <Check size={14} /> Marquer comme répondu
                </button>
              )}
              {selected.status !== 'closed' && (
                <button
                  className="btn btn-ghost btn-sm border border-base-300"
                  disabled={actionLoading === selected.id}
                  onClick={() => handleAction(selected, 'closed')}
                >
                  <X size={14} /> Clore
                </button>
              )}
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => { setSelected(null); setNote('') }} />
        </div>
      )}
    </>
  )
}
