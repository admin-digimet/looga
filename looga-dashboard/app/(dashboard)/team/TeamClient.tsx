'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { StaffAccount } from '@/types'

function AddScannerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    onSuccess()
    onClose()
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-heading font-bold text-lg mb-4">Ajouter un scanner</h3>

        {error && (
          <div className="alert alert-error text-sm mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <div className="label"><span className="label-text font-medium">Nom complet</span></div>
            <input
              type="text"
              placeholder="Koffi Scanner"
              className="input input-bordered"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text font-medium">Email</span></div>
            <input
              type="email"
              placeholder="scanner@looga.ci"
              className="input input-bordered"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </label>
          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">Mot de passe temporaire</span>
            </div>
            <input
              type="password"
              placeholder="Min. 8 caractères"
              className="input input-bordered"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              minLength={8}
              required
            />
          </label>

          <div className="modal-action mt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}

export default function TeamClient() {
  const [staff, setStaff] = useState<StaffAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/team')
    const data = await res.json()
    setStaff(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  async function toggleActive(id: string, currentValue: boolean) {
    await fetch(`/api/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentValue }),
    })
    fetchStaff()
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex justify-end">
        <button className="btn btn-primary gap-2" onClick={() => setShowModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un scanner
        </button>
      </div>

      {loading ? (
        <div className="card bg-base-200 border border-base-300 overflow-hidden animate-pulse">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {['Scanner', 'Date de création', 'Statut', ''].map((h, i) => (
                    <th key={i}><div className="h-4 w-20 bg-base-300 rounded" /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-base-300 rounded-full" />
                        <div className="h-4 w-32 bg-base-300 rounded" />
                      </div>
                    </td>
                    <td><div className="h-4 w-24 bg-base-300 rounded" /></td>
                    <td><div className="h-5 w-14 bg-base-300 rounded-full" /></td>
                    <td><div className="h-6 w-16 bg-base-300 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : staff.length === 0 ? (
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body items-center text-center py-16 gap-3">
            <div className="text-4xl">👥</div>
            <h3 className="font-heading font-bold text-lg">Aucun scanner</h3>
            <p className="text-base-content/60 text-sm max-w-sm">
              Crée des comptes pour ton équipe. Ils pourront se connecter sur l&apos;app looga-scan pour valider les billets.
            </p>
            <button className="btn btn-primary btn-sm mt-2" onClick={() => setShowModal(true)}>
              Ajouter un scanner
            </button>
          </div>
        </div>
      ) : (
        <div className="card bg-base-200 border border-base-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs text-base-content/60 uppercase tracking-wide">
                  <th>Scanner</th>
                  <th>Date de création</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const initials = member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={member.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-secondary/20 text-secondary rounded-full w-9">
                              <span className="text-sm font-bold">{initials}</span>
                            </div>
                          </div>
                          <Link href={`/team/${member.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                            {member.name}
                          </Link>
                        </div>
                      </td>
                      <td className="text-sm text-base-content/60">
                        {new Date(member.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${member.is_active ? 'badge-success' : 'badge-ghost'}`}>
                          {member.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link href={`/team/${member.id}`} className="btn btn-ghost btn-xs">
                            Voir
                          </Link>
                          <button
                            className={`btn btn-xs ${member.is_active ? 'btn-error btn-outline' : 'btn-success btn-outline'}`}
                            onClick={() => toggleActive(member.id, member.is_active)}
                          >
                            {member.is_active ? 'Désactiver' : 'Activer'}
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
      )}

      {showModal && (
        <AddScannerModal onClose={() => setShowModal(false)} onSuccess={fetchStaff} />
      )}
    </div>
  )
}
