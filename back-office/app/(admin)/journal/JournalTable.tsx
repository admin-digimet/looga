'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { getAdminJournal, type JournalEntry } from '@/lib/api/admin'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 20

const ACTION_LABELS: Record<string, string> = {
  'user.register':          'Inscription utilisateur',
  'user.login':             'Connexion',
  'organizer.register':     'Inscription organisateur',
  'event.create':           'Création événement',
  'event.update':           'Modification événement',
  'ticket.purchase':        'Achat billet',
  'ticket.scan':            'Scan billet',
  'payout.request':         'Demande reversement',
  'admin.delete_event':     'Admin — Suppr. événement',
  'admin.event_status_cancelled': 'Admin — Annulation event',
  'admin.event_status_published': 'Admin — Publication event',
  'admin.suspend_organizer': 'Admin — Suspension org.',
  'admin.unsuspend_organizer': 'Admin — Réactivation org.',
  'admin.approve_organizer': 'Admin — Approbation org.',
  'admin.revoke_organizer': 'Admin — Révocation org.',
  'admin.update_user_is_active': 'Admin — Modif. statut user',
  'admin.update_user_role': 'Admin — Modif. rôle user',
  'admin.delete_user':      'Admin — Suppr. utilisateur',
  'admin.payout_approved':  'Admin — Payout approuvé',
  'admin.payout_paid':      'Admin — Payout payé',
  'admin.payout_rejected':  'Admin — Payout rejeté',
}

const ACTOR_BADGE: Record<string, string> = {
  user:       'badge-success',
  organizer:  'badge-secondary',
  admin:      'badge-warning',
  system:     'badge-ghost',
}

const ACTOR_LABEL: Record<string, string> = {
  user:       'Utilisateur',
  organizer:  'Organisateur',
  admin:      'Admin',
  system:     'Système',
}

// Rôle ACTUEL (profiles.role) — prioritaire sur actor_type figé.
const ROLE_BADGE: Record<string, string> = {
  user:        'badge-success',
  organizer:   'badge-secondary',
  staff:       'badge-info',
  admin:       'badge-warning',
  super_admin: 'badge-warning',
}

const ROLE_LABEL: Record<string, string> = {
  user:        'Utilisateur',
  organizer:   'Organisateur',
  staff:       'Scanner',
  admin:       'Admin',
  super_admin: 'Admin',
}

function actorBadge(e: JournalEntry): string {
  if (e.actor_role && ROLE_BADGE[e.actor_role]) return ROLE_BADGE[e.actor_role]
  return ACTOR_BADGE[e.actor_type] ?? 'badge-ghost'
}

function actorLabel(e: JournalEntry): string {
  if (e.actor_role && ROLE_LABEL[e.actor_role]) return ROLE_LABEL[e.actor_role]
  return ACTOR_LABEL[e.actor_type] ?? e.actor_type
}

const STATUS_BADGE: Record<string, string> = {
  success: 'badge-success',
  failure: 'badge-error',
  warning: 'badge-warning',
}

const STATUS_LABEL: Record<string, string> = {
  success: 'Succès',
  failure: 'Échec',
  warning: 'Avert.',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) +
    ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function JournalTable() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [search, setSearch]   = useState('')
  const [actorType, setActorType] = useState('all')
  const [status, setStatus]   = useState('all')
  const [period, setPeriod]   = useState('all')
  const [page, setPage]       = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminJournal({ page, search, actor_type: actorType, status, period })
      setEntries(res.data)
      setTotal(res.total)
      setError(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [page, search, actorType, status, period])

  useEffect(() => { load() }, [load])

  function onFilter() { setPage(1) }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            className="input input-bordered bg-base-100 w-full pl-9 text-sm"
            placeholder="Rechercher acteur, action, cible…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); onFilter() }}
          />
        </div>
        <select
          className="select select-bordered bg-base-100 text-sm w-full sm:w-40"
          value={actorType}
          onChange={(e) => { setActorType(e.target.value); onFilter() }}
        >
          <option value="all">Tous les acteurs</option>
          <option value="user">Utilisateurs</option>
          <option value="organizer">Organisateurs</option>
          <option value="admin">Admins</option>
          <option value="system">Système</option>
        </select>
        <select
          className="select select-bordered bg-base-100 text-sm w-full sm:w-36"
          value={status}
          onChange={(e) => { setStatus(e.target.value); onFilter() }}
        >
          <option value="all">Tous statuts</option>
          <option value="success">Succès</option>
          <option value="failure">Échec</option>
          <option value="warning">Avertissement</option>
        </select>
        <select
          className="select select-bordered bg-base-100 text-sm w-full sm:w-36"
          value={period}
          onChange={(e) => { setPeriod(e.target.value); onFilter() }}
        >
          <option value="all">Toute période</option>
          <option value="today">Aujourd&apos;hui</option>
          <option value="week">7 derniers jours</option>
          <option value="month">30 derniers jours</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error py-2 text-sm"><span>{error}</span></div>
      )}

      {/* Tableau */}
      <div className="card bg-base-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra text-sm">
            <thead>
              <tr className="text-base-content/60 text-xs uppercase">
                <th>Date</th>
                <th>Acteur</th>
                <th>Action</th>
                <th>Cible</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <span className="loading loading-spinner loading-md" />
                  </td>
                </tr>
              )}
              {!loading && entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-base-content/40">
                    Aucune entrée dans le journal
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="text-base-content/50 whitespace-nowrap text-xs">
                    {formatDate(e.created_at)}
                  </td>
                  <td>
                    <div className="flex flex-col gap-0.5">
                      <span className={`badge badge-sm ${actorBadge(e)}`}>
                        {actorLabel(e)}
                      </span>
                      {e.actor_name && (
                        <span className="text-xs text-base-content/60 truncate max-w-32">{e.actor_name}</span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-48">
                    <span className="text-sm font-medium">
                      {ACTION_LABELS[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/60 max-w-40">
                    {e.target_type && (
                      <span className="badge badge-ghost badge-sm mr-1">{e.target_type}</span>
                    )}
                    <span className="truncate">{e.target_label ?? e.target_id ?? '—'}</span>
                  </td>
                  <td>
                    <span className={`badge badge-sm ${STATUS_BADGE[e.status] ?? 'badge-ghost'}`}>
                      {STATUS_LABEL[e.status] ?? e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-base-content/40">{total} entrée{total > 1 ? 's' : ''}</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  )
}
