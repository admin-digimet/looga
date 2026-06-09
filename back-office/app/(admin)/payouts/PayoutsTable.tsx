'use client'

import { useEffect, useState, useCallback } from 'react'
import { Check, CircleSlash, Search, Wallet } from 'lucide-react'
import { getAdminPayouts, updatePayout } from '@/lib/api/admin'
import type { PayoutRequest, PayoutStatus } from '@/lib/api/admin'
import { PaymentMethodIcon } from '@/components/PaymentMethodIcon'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 20

const STATUS_LABEL: Record<PayoutStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  paid: 'Payée',
  rejected: 'Rejetée',
}

const STATUS_BADGE: Record<PayoutStatus, string> = {
  pending: 'badge-warning',
  approved: 'badge-info',
  paid: 'badge-success',
  rejected: 'badge-error',
}

const METHOD_LABEL: Record<string, string> = {
  mtn_momo: 'MTN MoMo',
  orange_money: 'Orange Money',
  wave: 'Wave',
  bank_transfer: 'Virement bancaire',
}

function formatFCFA(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function PayoutsTable() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [actionModal, setActionModal] = useState<{ payout: PayoutRequest; action: PayoutStatus } | null>(null)
  const [note, setNote] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminPayouts({ status: statusFilter, search: search.trim() || undefined })
      setPayouts(data)
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

  async function confirmAction() {
    if (!actionModal) return
    const { payout, action } = actionModal
    setActionLoading(payout.id)
    try {
      await updatePayout(payout.id, { status: action, admin_note: note.trim() || undefined })
      await load()
      setActionModal(null)
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
            placeholder="Rechercher un organisateur..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="select select-bordered bg-base-100 text-sm w-full sm:w-48"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="paid">Payées</option>
          <option value="rejected">Rejetées</option>
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
                <th>Organisateur</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Coordonnées</th>
                <th>Statut</th>
                <th>Demandé le</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <span className="loading loading-spinner loading-md" />
                  </td>
                </tr>
              )}
              {!loading && payouts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-base-content/40">
                    Aucune demande de payout
                  </td>
                </tr>
              )}
              {payouts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((p) => {
                const isLoading = actionLoading === p.id
                return (
                  <tr key={p.id} className={isLoading ? 'opacity-50' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary/10 text-secondary p-2 rounded-lg">
                          <Wallet size={14} />
                        </div>
                        <p className="font-medium">{p.organizer_name ?? '—'}</p>
                      </div>
                    </td>
                    <td className="font-bold">{formatFCFA(p.amount)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <PaymentMethodIcon method={p.method} size="sm" />
                        <span>{METHOD_LABEL[p.method] ?? p.method}</span>
                      </div>
                    </td>
                    <td className="text-xs text-base-content/60">
                      {p.phone_number || (p.bank_details ? 'Voir détails' : '—')}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${STATUS_BADGE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="text-base-content/50 whitespace-nowrap">{formatDate(p.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {p.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-ghost btn-xs text-info"
                              title="Approuver"
                              disabled={isLoading}
                              onClick={() => { setActionModal({ payout: p, action: 'approved' }); setNote('') }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Rejeter"
                              disabled={isLoading}
                              onClick={() => { setActionModal({ payout: p, action: 'rejected' }); setNote('') }}
                            >
                              <CircleSlash size={14} />
                            </button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <button
                            className="btn btn-success btn-xs"
                            title="Marquer comme payé"
                            disabled={isLoading}
                            onClick={() => { setActionModal({ payout: p, action: 'paid' }); setNote('') }}
                          >
                            Marquer payé
                          </button>
                        )}
                        {(p.status === 'paid' || p.status === 'rejected') && (
                          <span className="text-xs text-base-content/40 italic" title={p.admin_note ?? ''}>
                            {p.admin_note ? 'Note ↗' : '—'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-base-content/40">{payouts.length} demande{payouts.length > 1 ? 's' : ''}</p>
        <Pagination page={page} totalPages={Math.max(1, Math.ceil(payouts.length / PAGE_SIZE))} onPageChange={setPage} />
      </div>

      {actionModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg font-heading">
              {actionModal.action === 'approved' && 'Approuver la demande'}
              {actionModal.action === 'rejected' && 'Rejeter la demande'}
              {actionModal.action === 'paid' && 'Confirmer le paiement'}
            </h3>
            <div className="py-4 text-sm text-base-content/70 space-y-2">
              <p>
                <span className="font-semibold text-base-content">{actionModal.payout.organizer_name}</span> ·{' '}
                {formatFCFA(actionModal.payout.amount)} via {METHOD_LABEL[actionModal.payout.method]}
              </p>
              {actionModal.action === 'paid' && (
                <p className="text-warning text-xs">
                  ⚠️ Confirmer après avoir effectué le virement réel.
                </p>
              )}
            </div>
            <textarea
              className="textarea textarea-bordered bg-base-100 w-full text-sm"
              placeholder={actionModal.action === 'rejected' ? 'Motif du rejet (visible par l\'organisateur)' : 'Note interne (optionnel)'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <div className="modal-action gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => { setActionModal(null); setNote('') }}>
                Annuler
              </button>
              <button
                className={`btn btn-sm ${actionModal.action === 'rejected' ? 'btn-error' : actionModal.action === 'paid' ? 'btn-success' : 'btn-info'}`}
                disabled={actionLoading === actionModal.payout.id || (actionModal.action === 'rejected' && !note.trim())}
                onClick={confirmAction}
              >
                {actionLoading === actionModal.payout.id
                  ? <span className="loading loading-spinner loading-xs" />
                  : 'Confirmer'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => { setActionModal(null); setNote('') }} />
        </div>
      )}
    </>
  )
}
