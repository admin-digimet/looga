'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Ban, Search } from 'lucide-react'
import { deleteAdminEvent, updateAdminEventStatus, getAdminEvents } from '@/lib/api/admin'
import type { AdminEventListItem } from '@/types'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: 'Publié', className: 'badge-success' },
  draft:     { label: 'Brouillon', className: 'badge-warning' },
  cancelled: { label: 'Annulé', className: 'badge-error' },
  past:      { label: 'Passé', className: 'badge-neutral' },
}

const CATEGORY_LABELS: Record<string, string> = {
  concerts:     'Concerts',
  soirees:      'Soirées',
  culture:      'Culture',
  sports:       'Sports',
  workshops:    'Workshops',
  gastronomie:  'Gastronomie',
  conferences:  'Conférences',
  networking:   'Networking',
  mode:         'Mode',
  famille:      'Famille',
  humour:       'Humour',
  religieux:    'Religieux',
  cinema:       'Cinéma',
  caritatif:    'Caritatif',
  enfants:      'Enfants',
  gaming:       'Gaming',
  tournee:      'Tournée',
  salon:        'Salon',
  theatre:      'Théâtre',
  bien_etre:    'Bien-être',
  festival:     'Festival',
  auto_moto:    'Auto-Moto',
  autre:        'Autre',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatFCFA(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' F'
}

export function EventsTable({ events: initialEvents }: { events?: AdminEventListItem[] } = {}) {
  const router = useRouter()
  const [events, setEvents] = useState<AdminEventListItem[]>(initialEvents ?? [])
  const [loadingList, setLoadingList] = useState(!initialEvents)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<AdminEventListItem | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (initialEvents) return
    let cancelled = false
    getAdminEvents()
      .then((res) => { if (!cancelled) setEvents(res.data) })
      .catch((e) => { if (!cancelled) setLoadError(e?.message ?? 'Erreur') })
      .finally(() => { if (!cancelled) setLoadingList(false) })
    return () => { cancelled = true }
  }, [initialEvents])

  const filtered = events.filter((e) => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    const matchSearch = search.trim() === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.organizer_name ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleDelete = useCallback(async (event: AdminEventListItem) => {
    setActionLoading(event.id)
    setActionError('')
    try {
      await deleteAdminEvent(event.id)
      setEvents((prev) => prev.filter((e) => e.id !== event.id))
      setConfirmDelete(null)
      router.refresh()
    } catch (err: unknown) {
      const e = err as { message?: string }
      setActionError(e.message ?? 'Erreur lors de la suppression')
    } finally {
      setActionLoading(null)
    }
  }, [router])

  const handleCancel = useCallback(async (event: AdminEventListItem) => {
    setActionLoading(event.id)
    setActionError('')
    try {
      await updateAdminEventStatus(event.id, 'cancelled')
      setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, status: 'cancelled' } : e))
      router.refresh()
    } catch (err: unknown) {
      const e = err as { message?: string }
      setActionError(e.message ?? 'Erreur lors de la mise à jour')
    } finally {
      setActionLoading(null)
    }
  }, [router])

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            className="input input-bordered bg-base-100 w-full pl-9 text-sm"
            placeholder="Rechercher par titre ou organisateur..."
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
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
          <option value="cancelled">Annulés</option>
          <option value="past">Passés</option>
        </select>
      </div>

      {actionError && (
        <div className="alert alert-error py-2 text-sm">
          <span>{actionError}</span>
        </div>
      )}
      {loadError && (
        <div className="alert alert-warning py-2 text-sm">
          <span>{loadError}</span>
        </div>
      )}

      {/* Table */}
      <div className="card bg-base-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra text-sm">
            <thead>
              <tr className="text-base-content/60 text-xs uppercase">
                <th>Titre</th>
                <th>Organisateur</th>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Billets</th>
                <th>Créé le</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingList && (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <span className="loading loading-spinner loading-md" />
                  </td>
                </tr>
              )}
              {!loadingList && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-base-content/40">
                    Aucun événement trouvé
                  </td>
                </tr>
              )}
              {filtered.map((event) => {
                const statusInfo = STATUS_LABELS[event.status] ?? { label: event.status, className: 'badge-ghost' }
                const isLoading = actionLoading === event.id
                return (
                  <tr key={event.id} className={isLoading ? 'opacity-50' : ''}>
                    <td className="font-medium max-w-[200px]">
                      <p className="truncate">{event.title}</p>
                      <p className="text-xs text-base-content/40">{event.location_name}</p>
                    </td>
                    <td className="text-base-content/70">{event.organizer_name ?? '—'}</td>
                    <td className="whitespace-nowrap">{formatDate(event.event_date)}</td>
                    <td>{CATEGORY_LABELS[event.category] ?? event.category}</td>
                    <td>
                      <span className={`badge badge-sm ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{event.tickets_sold ?? 0}</td>
                    <td className="text-base-content/50 whitespace-nowrap">{formatDate(event.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {event.status !== 'cancelled' && (
                          <button
                            className="btn btn-ghost btn-xs text-warning"
                            title="Suspendre"
                            disabled={isLoading}
                            onClick={() => handleCancel(event)}
                          >
                            <Ban size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          title="Supprimer"
                          disabled={isLoading}
                          onClick={() => setConfirmDelete(event)}
                        >
                          {isLoading ? <span className="loading loading-spinner loading-xs" /> : <Trash2 size={14} />}
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

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg font-heading">Supprimer l'événement</h3>
            <p className="py-4 text-sm text-base-content/70">
              Es-tu sûr de vouloir supprimer{' '}
              <span className="font-semibold text-base-content">{confirmDelete.title}</span> ?
              Cette action est irréversible.
            </p>
            <div className="modal-action gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmDelete(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-error btn-sm"
                disabled={actionLoading === confirmDelete.id}
                onClick={() => handleDelete(confirmDelete)}
              >
                {actionLoading === confirmDelete.id
                  ? <span className="loading loading-spinner loading-xs" />
                  : <Trash2 size={14} />
                }
                Supprimer
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmDelete(null)} />
        </div>
      )}
    </>
  )
}
