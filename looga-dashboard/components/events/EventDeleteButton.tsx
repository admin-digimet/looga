'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EventDeleteButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn btn-error btn-xs"
        >
          {loading ? <span className="loading loading-spinner loading-xs" /> : 'Confirmer'}
        </button>
        <button onClick={() => setConfirm(false)} className="btn btn-ghost btn-xs">
          Annuler
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="btn btn-ghost btn-xs text-error"
      title="Supprimer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  )
}
