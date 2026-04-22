import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface TopNavProps {
  title: string
  subtitle?: string
  backHref?: string
}

export default async function TopNav({ title, subtitle, backHref }: TopNavProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let organizerName = 'Organisateur'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    if (profile?.name) organizerName = profile.name
  }

  const initials = organizerName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="bg-base-100 border-b border-base-300 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Retour"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
        )}
        <div>
          <h1 className="text-xl font-heading font-bold text-base-content">{title}</h1>
          {subtitle && (
            <p className="text-sm text-base-content/60 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-base-content/70 hidden sm:block">{organizerName}</span>
        <div className="avatar avatar-placeholder">
          <div className="bg-primary text-primary-content rounded-full w-9 flex items-center justify-center">
            <span className="text-sm font-bold">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
