'use client'

import { useCallback, useEffect, useState } from 'react'
import { NewPayoutModal } from './NewPayoutModal'

type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected'
type PayoutMethod = 'mtn_momo' | 'orange_money' | 'wave' | 'bank_transfer'

interface PayoutRequest {
  id: string
  amount: number
  method: PayoutMethod
  phone_number: string | null
  bank_details: { holder?: string; bank?: string; account?: string } | null
  status: PayoutStatus
  admin_note: string | null
  reviewed_at: string | null
  paid_at: string | null
  created_at: string
}

interface Balance {
  revenue_total: number
  paid_out: number
  locked: number
  available: number
}

interface PayoutsResponse {
  requests: PayoutRequest[]
  balance: Balance
}

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

const METHOD_LABEL: Record<PayoutMethod, string> = {
  mtn_momo: 'MTN Mobile Money',
  orange_money: 'Orange Money',
  wave: 'Wave',
  bank_transfer: 'Virement bancaire',
}

function formatFCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function PayoutsClient() {
  const [data, setData] = useState<PayoutsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payouts')
      if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur')
      setData(await res.json())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  if (!data) return null

  const { balance, requests } = data
  const canRequest = balance.available > 0

  return (
    <>
      {/* 3 cards stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Solde disponible"
          value={formatFCFA(balance.available)}
          subtitle="Montant que tu peux retirer"
          accent="primary"
        />
        <StatCard
          label="En attente"
          value={formatFCFA(balance.locked)}
          subtitle="Demandes en cours de traitement"
          accent="warning"
        />
        <StatCard
          label="Total versé"
          value={formatFCFA(balance.paid_out)}
          subtitle="Cumul des virements effectués"
          accent="success"
        />
      </div>

      {/* Bouton + info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
        <p className="text-sm text-base-content/60">
          Revenu brut total : <span className="font-semibold text-base-content">{formatFCFA(balance.revenue_total)}</span>
        </p>
        <button
          className="btn btn-primary"
          disabled={!canRequest}
          onClick={() => setShowModal(true)}
          title={!canRequest ? 'Aucun solde disponible' : undefined}
        >
          Demander un reversement
        </button>
      </div>

      {/* Historique */}
      <div className="card bg-base-200 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="p-4 border-b border-base-300">
            <h2 className="font-heading font-bold text-base">Historique</h2>
          </div>
          {requests.length === 0 ? (
            <div className="p-10 text-center text-base-content/40 text-sm">
              Aucune demande pour l&apos;instant. Clique sur &laquo;&nbsp;Demander un reversement&nbsp;&raquo; pour commencer.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra text-sm">
                <thead>
                  <tr className="text-base-content/60 text-xs uppercase">
                    <th>Montant</th>
                    <th>Méthode</th>
                    <th>Coordonnées</th>
                    <th>Statut</th>
                    <th>Demandé le</th>
                    <th>Mise à jour</th>
                    <th>Note admin</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="hover">
                      <td className="font-bold">{formatFCFA(r.amount)}</td>
                      <td>{METHOD_LABEL[r.method]}</td>
                      <td className="text-xs text-base-content/60">
                        {r.method === 'bank_transfer'
                          ? `${r.bank_details?.holder ?? ''} · ${r.bank_details?.bank ?? ''}`
                          : r.phone_number ?? '—'}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${STATUS_BADGE[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-base-content/60">{formatDate(r.created_at)}</td>
                      <td className="whitespace-nowrap text-base-content/60">
                        {formatDate(r.paid_at ?? r.reviewed_at)}
                      </td>
                      <td className="text-xs text-base-content/60 max-w-[200px]">
                        <span className="line-clamp-2" title={r.admin_note ?? ''}>
                          {r.admin_note ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewPayoutModal
          available={balance.available}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false)
            load()
          }}
        />
      )}
    </>
  )
}

function StatCard({
  label, value, subtitle, accent,
}: {
  label: string
  value: string
  subtitle: string
  accent: 'primary' | 'warning' | 'success'
}) {
  const colorMap = {
    primary: 'text-primary',
    warning: 'text-warning',
    success: 'text-success',
  }
  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body p-5">
        <p className="text-xs text-base-content/60 uppercase tracking-wide font-semibold">{label}</p>
        <p className={`text-2xl font-bold font-heading mt-1 ${colorMap[accent]}`}>{value}</p>
        <p className="text-xs text-base-content/50 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}
