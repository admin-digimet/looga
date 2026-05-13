'use client'

import { useEffect, useState } from 'react'

interface MeResponse {
  email: string
  role: string
}

export function TopNav({ title }: { title: string }) {
  const [me, setMe] = useState<MeResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled && data) setMe(data) })
      .catch(() => { /* ignore */ })
    return () => { cancelled = true }
  }, [])

  const email = me?.email ?? ''
  const initials = (email || 'AD').slice(0, 2).toUpperCase()

  return (
    <header className="h-16 border-b border-base-300 bg-base-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-bold font-heading">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-base-content/60 hidden sm:block">
          {email || '—'}
        </span>
        <div className="avatar avatar-placeholder">
          <div className="bg-secondary text-secondary-content rounded-full w-9">
            <span className="text-xs font-bold">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
