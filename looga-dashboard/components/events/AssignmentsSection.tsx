'use client'

import { useState, useEffect, useCallback } from 'react'
import type { EventStaffAssignment, StaffAccount } from '@/types'

interface Props {
  eventId: string
}

export default function AssignmentsSection({ eventId }: Props) {
  const [assignments, setAssignments] = useState<EventStaffAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [allStaff, setAllStaff] = useState<StaffAccount[]>([])
  const [assigning, setAssigning] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/events/${eventId}/assignments`)
    const data = await res.json()
    setAssignments(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [eventId])

  useEffect(() => { fetchAssignments() }, [fetchAssignments])

  async function openModal() {
    const res = await fetch('/api/team')
    const data = await res.json()
    const assignedIds = new Set(assignments.map((a) => a.staff_id))
    setAllStaff(
      (Array.isArray(data) ? data : []).filter(
        (s: StaffAccount) => s.is_active && !assignedIds.has(s.id)
      )
    )
    setShowModal(true)
  }

  async function assign(staffId: string) {
    setAssigning(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/events/${eventId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setActionError(data.error ?? 'Impossible d\'assigner ce scanner.')
        return
      }
      setShowModal(false)
      fetchAssignments()
    } catch {
      setActionError('Erreur réseau. Réessaie dans un instant.')
    } finally {
      setAssigning(false)
    }
  }

  async function remove(staffId: string) {
    setRemoving(staffId)
    setActionError(null)
    try {
      const res = await fetch(`/api/events/${eventId}/assignments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setActionError(data.error ?? 'Impossible de retirer ce scanner.')
        return
      }
      fetchAssignments()
    } catch {
      setActionError('Erreur réseau. Réessaie dans un instant.')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <>
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold">Scanners assignés</h3>
            <button className="btn btn-outline btn-sm gap-1" onClick={openModal}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Assigner
            </button>
          </div>

          {actionError && (
            <div className="alert alert-error text-sm py-2">
              <span>{actionError}</span>
              <button className="btn btn-ghost btn-xs ml-auto" onClick={() => setActionError(null)}>✕</button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 bg-base-300 rounded animate-pulse" />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-base-content/50 text-center py-4">
              Aucun scanner assigné à cet événement
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {assignments.map((a) => {
                const staff = a.staff_accounts as StaffAccount | undefined
                const initials = staff?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 py-2 border-b border-base-300 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-secondary/20 text-secondary rounded-full w-8">
                          <span className="text-xs font-bold">{initials}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{staff?.name ?? '—'}</span>
                    </div>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      disabled={removing === a.staff_id}
                      onClick={() => remove(a.staff_id)}
                    >
                      {removing === a.staff_id ? <span className="loading loading-spinner loading-xs" /> : 'Retirer'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-heading font-bold text-lg mb-4">Assigner un scanner</h3>
            {allStaff.length === 0 ? (
              <p className="text-sm text-base-content/60 text-center py-6">
                Tous les scanners actifs sont déjà assignés à cet événement.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {allStaff.map((s) => {
                  const initials = s.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <button
                      key={s.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors text-left"
                      disabled={assigning}
                      onClick={() => assign(s.id)}
                    >
                      <div className="avatar placeholder">
                        <div className="bg-secondary/20 text-secondary rounded-full w-9">
                          <span className="text-sm font-bold">{initials}</span>
                        </div>
                      </div>
                      <span className="font-medium text-sm">{s.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                Fermer
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </dialog>
      )}
    </>
  )
}
