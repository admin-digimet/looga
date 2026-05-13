'use client'

import { useEffect, useState } from 'react'
import { Building2, CheckCircle, Pause, Play, XCircle } from 'lucide-react'
import { getAdminOrganizers, toggleOrganizerSuspension } from '@/lib/api/admin'
import type { Organizer } from '@/types'

type OrganizerWithOwner = Organizer & {
  owner_name?: string | null
  owner_email?: string | null
  owner_phone?: string | null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function OrganizersTable() {
  const [organizers, setOrganizers] = useState<OrganizerWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getAdminOrganizers({ status: statusFilter })
      setOrganizers(data as OrganizerWithOwner[])
      setError(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function handleToggle(org: OrganizerWithOwner) {
    setActionLoading(org.id)
    try {
      await toggleOrganizerSuspension(org.id, !org.is_suspended)
      setOrganizers((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, is_suspended: !o.is_suspended } : o)),
      )
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
          {organizers.length} organisateur{organizers.length > 1 ? 's' : ''}
        </p>
        <select
          className="select select-bordered bg-base-100 text-sm w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
        >
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
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
                <th>Organisation</th>
                <th>Référent</th>
                <th>Contact</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Membre depuis</th>
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
              {!loading && organizers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-base-content/40">
                    Aucun organisateur trouvé
                  </td>
                </tr>
              )}
              {organizers.map((org) => {
                const isLoading = actionLoading === org.id
                return (
                  <tr key={org.id} className={isLoading ? 'opacity-50' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary/10 text-secondary p-2 rounded-lg">
                          <Building2 size={16} />
                        </div>
                        <p className="font-medium">{org.name}</p>
                      </div>
                    </td>
                    <td className="text-base-content/70">{org.owner_name ?? '—'}</td>
                    <td className="text-xs text-base-content/60">
                      <p className="truncate max-w-[200px]" title={org.owner_email ?? ''}>
                        {org.owner_email ?? '—'}
                      </p>
                      <p className="text-base-content/40">{org.owner_phone ?? ''}</p>
                    </td>
                    <td className="text-base-content/60 max-w-[200px]">
                      <p className="truncate">{org.description ?? '—'}</p>
                    </td>
                    <td>
                      {org.is_suspended ? (
                        <span className="flex items-center gap-1 text-error text-xs">
                          <XCircle size={14} /> Suspendu
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-success text-xs">
                          <CheckCircle size={14} /> Actif
                        </span>
                      )}
                    </td>
                    <td className="text-base-content/50">{formatDate(org.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end">
                        <button
                          className={`btn btn-ghost btn-xs ${org.is_suspended ? 'text-success' : 'text-warning'}`}
                          title={org.is_suspended ? 'Réactiver' : 'Suspendre'}
                          disabled={isLoading}
                          onClick={() => handleToggle(org)}
                        >
                          {isLoading ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : org.is_suspended ? (
                            <Play size={14} />
                          ) : (
                            <Pause size={14} />
                          )}
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
    </>
  )
}
