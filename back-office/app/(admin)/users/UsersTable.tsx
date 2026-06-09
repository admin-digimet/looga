'use client'

import { useEffect, useState, useCallback } from 'react'
import { Pause, Play, Search, Trash2, UserCog } from 'lucide-react'
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '@/lib/api/admin'
import Pagination from '@/components/Pagination'
import type { Profile } from '@/types'

const PAGE_SIZE = 20

type ProfileWithEmail = Profile & { email?: string }

const ROLE_BADGE: Record<string, string> = {
  user: 'badge-ghost',
  organizer: 'badge-secondary',
  staff: 'badge-info',
  admin: 'badge-primary',
  super_admin: 'badge-warning',
}

const ROLE_LABEL: Record<string, string> = {
  user: 'Utilisateur',
  organizer: 'Organisateur',
  staff: 'Scanner',
  admin: 'Admin',
  super_admin: 'Super-admin',
}

const ALL_ROLES = ['user', 'organizer', 'staff', 'admin', 'super_admin']

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function UsersTable() {
  const [users, setUsers] = useState<ProfileWithEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('tous')
  const [confirmDelete, setConfirmDelete] = useState<ProfileWithEmail | null>(null)
  const [editingRole, setEditingRole] = useState<ProfileWithEmail | null>(null)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminUsers({ role: roleFilter, search: search.trim() || undefined })
      setUsers(res.data as ProfileWithEmail[])
      setError(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [roleFilter, search])

  useEffect(() => {
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load])

  useEffect(() => { setPage(1) }, [roleFilter, search])

  async function handleToggleActive(u: ProfileWithEmail) {
    setActionLoading(u.id)
    try {
      await updateAdminUser(u.id, { is_active: !u.is_active })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: !x.is_active } : x)))
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleChangeRole(u: ProfileWithEmail, newRole: string) {
    setActionLoading(u.id)
    try {
      await updateAdminUser(u.id, { role: newRole })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole as ProfileWithEmail['role'] } : x)))
      setEditingRole(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(u: ProfileWithEmail) {
    setActionLoading(u.id)
    try {
      await deleteAdminUser(u.id)
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
      setConfirmDelete(null)
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
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select select-bordered bg-base-100 text-sm w-full sm:w-48"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="tous">Tous les rôles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
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
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
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
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-base-content/40">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
              {users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((u) => {
                const isLoading = actionLoading === u.id
                const initials = (u.name || u.email || '?').slice(0, 2).toUpperCase()
                return (
                  <tr key={u.id} className={isLoading ? 'opacity-50' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-placeholder">
                          <div className="bg-secondary text-secondary-content rounded-full w-8">
                            <span className="text-xs font-bold">{initials}</span>
                          </div>
                        </div>
                        <p className="font-medium">{u.name || '—'}</p>
                      </div>
                    </td>
                    <td className="text-base-content/70 text-xs">{u.email || '—'}</td>
                    <td className="text-base-content/70 text-xs">{u.phone || '—'}</td>
                    <td>
                      <span className={`badge badge-sm ${ROLE_BADGE[u.role] ?? 'badge-ghost'}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span className="text-success text-xs">Actif</span>
                      ) : (
                        <span className="text-error text-xs">Désactivé</span>
                      )}
                    </td>
                    <td className="text-base-content/50 whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          title="Changer le rôle"
                          disabled={isLoading}
                          onClick={() => setEditingRole(u)}
                        >
                          <UserCog size={14} />
                        </button>
                        <button
                          className={`btn btn-ghost btn-xs ${u.is_active ? 'text-warning' : 'text-success'}`}
                          title={u.is_active ? 'Désactiver' : 'Activer'}
                          disabled={isLoading}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.is_active ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          title="Supprimer"
                          disabled={isLoading}
                          onClick={() => setConfirmDelete(u)}
                        >
                          <Trash2 size={14} />
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

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-base-content/40">{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(users.length / PAGE_SIZE))}
          onPageChange={setPage}
        />
      </div>

      {editingRole && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg font-heading">Changer le rôle</h3>
            <p className="py-2 text-sm text-base-content/70">
              {editingRole.name || editingRole.email}
            </p>
            <div className="flex flex-col gap-2 mt-3">
              {ALL_ROLES.map((r) => (
                <button
                  key={r}
                  className={`btn btn-sm ${r === editingRole.role ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                  disabled={actionLoading === editingRole.id || r === editingRole.role}
                  onClick={() => handleChangeRole(editingRole, r)}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingRole(null)}>
                Fermer
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditingRole(null)} />
        </div>
      )}

      {confirmDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg font-heading">Supprimer le compte</h3>
            <p className="py-4 text-sm text-base-content/70">
              Es-tu sûr de vouloir supprimer{' '}
              <span className="font-semibold text-base-content">{confirmDelete.name || confirmDelete.email}</span> ?
              Cette action est irréversible et supprimera toutes les données associées (billets, etc.).
            </p>
            <div className="modal-action gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>
                Annuler
              </button>
              <button
                className="btn btn-error btn-sm"
                disabled={actionLoading === confirmDelete.id}
                onClick={() => handleDelete(confirmDelete)}
              >
                {actionLoading === confirmDelete.id
                  ? <span className="loading loading-spinner loading-xs" />
                  : <Trash2 size={14} />}
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
