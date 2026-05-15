'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Check, Flag, X } from 'lucide-react'
import { getAdminReports, updateReport, type AdminReport, type ReportStatus } from '@/lib/api/admin'

const STATUS_LABEL: Record<ReportStatus, string> = {
  pending: 'En attente',
  reviewed: 'Traité',
  dismissed: 'Ignoré',
}

const STATUS_BADGE: Record<ReportStatus, string> = {
  pending: 'badge-warning',
  reviewed: 'badge-success',
  dismissed: 'badge-ghost',
}

const TARGET_LABEL: Record<string, string> = {
  event: 'Événement',
  user: 'Utilisateur',
  organizer: 'Organisateur',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ReportsTable() {
  const [reports, setReports] = useState<AdminReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminReports({ status: statusFilter })
      setReports(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  async function handleUpdate(report: AdminReport, status: ReportStatus) {
    setActionLoading(report.id)
    try {
      await updateReport(report.id, status)
      setReports((prev) => prev.map((r) =>
        r.id === report.id ? { ...r, status, reviewed_at: new Date().toISOString() } : r,
      ))
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-base-content/60">
          {reports.length} signalement{reports.length > 1 ? 's' : ''}
        </p>
        <select
          className="select select-bordered bg-base-100 text-sm w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="reviewed">Traités</option>
          <option value="dismissed">Ignorés</option>
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
                <th>Cible</th>
                <th>Type</th>
                <th>Motif</th>
                <th>Reporter</th>
                <th>Statut</th>
                <th>Date</th>
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
              {!loading && reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-base-content/40">
                    Aucun signalement
                  </td>
                </tr>
              )}
              {reports.map((r) => {
                const isLoading = actionLoading === r.id
                return (
                  <tr key={r.id} className={isLoading ? 'opacity-50' : ''}>
                    <td className="max-w-[240px]">
                      {r.target_type === 'event' ? (
                        <Link
                          href={`/events`}
                          className="font-medium text-primary hover:underline truncate block"
                          title={r.target_label ?? r.target_id}
                        >
                          {r.target_label ?? r.target_id}
                        </Link>
                      ) : (
                        <span className="font-medium truncate block">{r.target_id}</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm">
                        {TARGET_LABEL[r.target_type] ?? r.target_type}
                      </span>
                    </td>
                    <td className="max-w-[300px]">
                      <p className="text-sm text-base-content/80 line-clamp-2" title={r.reason}>
                        <Flag size={12} className="inline mr-1 text-warning" />
                        {r.reason}
                      </p>
                    </td>
                    <td className="text-base-content/70 text-xs">{r.reporter_name ?? '—'}</td>
                    <td>
                      <span className={`badge badge-sm ${STATUS_BADGE[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="text-base-content/50 whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-ghost btn-xs text-success"
                              title="Marquer comme traité"
                              disabled={isLoading}
                              onClick={() => handleUpdate(r, 'reviewed')}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-base-content/60"
                              title="Ignorer"
                              disabled={isLoading}
                              onClick={() => handleUpdate(r, 'dismissed')}
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {r.status !== 'pending' && (
                          <span className="text-xs text-base-content/40">—</span>
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
    </>
  )
}
