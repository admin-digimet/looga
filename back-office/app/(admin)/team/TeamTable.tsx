'use client'

import { useEffect, useState, useCallback } from 'react'
import { Pause, Play, Plus, Shield, Trash2, UserCog } from 'lucide-react'
import {
  getAdminTeam,
  inviteTeamMember,
  updateTeamMember,
  deleteTeamMember,
  type TeamMember,
} from '@/lib/api/admin'
import Pagination from '@/components/Pagination'
import { ExportCsvButton } from '@/components/ExportCsvButton'
import { csvDate, type CsvColumn } from '@/lib/csv'

const PAGE_SIZE = 20

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  super_admin: 'Super-admin',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TEAM_COLUMNS: CsvColumn<TeamMember>[] = [
  { header: 'Nom', value: (m) => m.name || '' },
  { header: 'Email', value: (m) => m.email || '' },
  { header: 'Rôle', value: (m) => ROLE_LABEL[m.role] ?? m.role },
  { header: 'Statut', value: (m) => (m.is_active ? 'Actif' : 'Désactivé') },
  { header: 'Dernière connexion', value: (m) => csvDate(m.last_sign_in_at) },
  { header: 'Membre depuis', value: (m) => csvDate(m.created_at) },
]

interface MeRole {
  role: string
  email: string
}

export function TeamTable() {
  const [me, setMe] = useState<MeRole | null>(null)
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'admin' as 'admin' | 'super_admin' })
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<TeamMember | null>(null)
  const [editingRole, setEditingRole] = useState<TeamMember | null>(null)
  const [page, setPage] = useState(1)

  const isSuperAdmin = me?.role === 'super_admin'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminTeam()
      setTeam(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setMe(d) })
    load()
  }, [load])

  async function handleToggle(member: TeamMember) {
    setActionLoading(member.id)
    try {
      await updateTeamMember(member.id, { is_active: !member.is_active })
      setTeam((prev) => prev.map((m) => (m.id === member.id ? { ...m, is_active: !m.is_active } : m)))
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleChangeRole(member: TeamMember, newRole: 'admin' | 'super_admin') {
    setActionLoading(member.id)
    try {
      await updateTeamMember(member.id, { role: newRole })
      setTeam((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m)))
      setEditingRole(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(member: TeamMember) {
    setActionLoading(member.id)
    try {
      await deleteTeamMember(member.id)
      setTeam((prev) => prev.filter((m) => m.id !== member.id))
      setConfirmDelete(null)
    } catch (e) {
      setError((e as Error).message ?? 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteBusy(true)
    setInviteError(null)
    try {
      await inviteTeamMember(inviteForm)
      setShowInvite(false)
      setInviteForm({ email: '', name: '', role: 'admin' })
      await load()
    } catch (err) {
      setInviteError((err as Error).message ?? 'Invitation échouée')
    } finally {
      setInviteBusy(false)
    }
  }

  return (
    <>
      {!isSuperAdmin && (
        <div className="alert alert-info py-2 text-sm">
          <span>
            Lecture seule. Demande à un super-administrateur pour gérer l&apos;équipe.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-base-content/60">
          {team.length} membre{team.length > 1 ? 's' : ''} de l&apos;équipe
        </p>
        <div className="flex gap-2">
          <ExportCsvButton<TeamMember>
            filename="equipe"
            columns={TEAM_COLUMNS}
            getRows={() => getAdminTeam()}
          />
          {isSuperAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(true)}>
              <Plus size={14} /> Inviter un admin
            </button>
          )}
        </div>
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
                <th>Membre</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Dernière connexion</th>
                <th>Membre depuis</th>
                {isSuperAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="text-center py-10">
                    <span className="loading loading-spinner loading-md" />
                  </td>
                </tr>
              )}
              {!loading && team.length === 0 && (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="text-center py-10 text-base-content/40">
                    Aucun membre
                  </td>
                </tr>
              )}
              {team.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((m) => {
                const isLoading = actionLoading === m.id
                const isMe = m.email === me?.email
                const initials = (m.name || m.email || '?').slice(0, 2).toUpperCase()
                return (
                  <tr key={m.id} className={isLoading ? 'opacity-50' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-placeholder">
                          <div className={`${m.role === 'super_admin' ? 'bg-warning text-warning-content' : 'bg-primary text-primary-content'} rounded-full w-8`}>
                            <span className="text-xs font-bold">{initials}</span>
                          </div>
                        </div>
                        <p className="font-medium">{m.name || '—'} {isMe && <span className="text-xs text-base-content/40">(toi)</span>}</p>
                      </div>
                    </td>
                    <td className="text-base-content/70 text-xs">{m.email || '—'}</td>
                    <td>
                      <span className={`badge badge-sm ${m.role === 'super_admin' ? 'badge-warning' : 'badge-primary'}`}>
                        <Shield size={10} className="mr-1" />
                        {ROLE_LABEL[m.role] ?? m.role}
                      </span>
                    </td>
                    <td>
                      {m.is_active ? (
                        <span className="text-success text-xs">Actif</span>
                      ) : (
                        <span className="text-error text-xs">Désactivé</span>
                      )}
                    </td>
                    <td className="text-base-content/50 whitespace-nowrap text-xs">{formatDate(m.last_sign_in_at)}</td>
                    <td className="text-base-content/50 whitespace-nowrap text-xs">{formatDate(m.created_at)}</td>
                    {isSuperAdmin && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {!isMe && (
                            <>
                              <button
                                className="btn btn-ghost btn-xs"
                                title="Changer le rôle"
                                disabled={isLoading}
                                onClick={() => setEditingRole(m)}
                              >
                                <UserCog size={14} />
                              </button>
                              <button
                                className={`btn btn-ghost btn-xs ${m.is_active ? 'text-warning' : 'text-success'}`}
                                title={m.is_active ? 'Désactiver' : 'Activer'}
                                disabled={isLoading}
                                onClick={() => handleToggle(m)}
                              >
                                {m.is_active ? <Pause size={14} /> : <Play size={14} />}
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                title="Supprimer"
                                disabled={isLoading}
                                onClick={() => setConfirmDelete(m)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-base-content/40">{team.length} membre{team.length > 1 ? 's' : ''}</p>
        <Pagination page={page} totalPages={Math.max(1, Math.ceil(team.length / PAGE_SIZE))} onPageChange={setPage} />
      </div>

      {/* Modal invitation */}
      {showInvite && (
        <div className="modal modal-open">
          <form onSubmit={handleInvite} className="modal-box max-w-md">
            <h3 className="font-bold text-lg font-heading mb-1">Inviter un nouvel administrateur</h3>
            <p className="text-sm text-base-content/60 mb-4">
              Un email d&apos;invitation Supabase sera envoyé. Au premier login, le 2FA sera obligatoire.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="label py-0">
                  <span className="label-text text-sm font-medium">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered bg-base-100 w-full"
                  placeholder="admin@looga.ci"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label py-0">
                  <span className="label-text text-sm font-medium">Nom</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-100 w-full"
                  placeholder="Jean Doe"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="label py-0">
                  <span className="label-text text-sm font-medium">Rôle</span>
                </label>
                <select
                  className="select select-bordered bg-base-100 w-full"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as 'admin' | 'super_admin' }))}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super-admin</option>
                </select>
              </div>
            </div>

            {inviteError && (
              <div className="alert alert-error py-2 text-sm mt-3">
                <span>{inviteError}</span>
              </div>
            )}

            <div className="modal-action gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowInvite(false)}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={inviteBusy}>
                {inviteBusy ? <span className="loading loading-spinner loading-xs" /> : null}
                Envoyer l&apos;invitation
              </button>
            </div>
          </form>
          <div className="modal-backdrop" onClick={() => setShowInvite(false)} />
        </div>
      )}

      {/* Modal édition rôle */}
      {editingRole && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg font-heading">Changer le rôle</h3>
            <p className="py-2 text-sm text-base-content/70">{editingRole.name || editingRole.email}</p>
            <div className="flex flex-col gap-2 mt-3">
              {(['admin', 'super_admin'] as const).map((r) => (
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

      {/* Modal suppression */}
      {confirmDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg font-heading">Supprimer le compte</h3>
            <p className="py-4 text-sm text-base-content/70">
              Es-tu sûr de vouloir supprimer{' '}
              <span className="font-semibold text-base-content">{confirmDelete.name || confirmDelete.email}</span> de l&apos;équipe ?
              Cette action est irréversible.
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
