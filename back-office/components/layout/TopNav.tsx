import { createClient } from '@/lib/supabase/server'

export async function TopNav({ title }: { title: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'AD'

  return (
    <header className="h-16 border-b border-base-300 bg-base-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-bold font-heading">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-base-content/60 hidden sm:block">{user?.email}</span>
        <div className="avatar avatar-placeholder">
          <div className="bg-secondary text-secondary-content rounded-full w-9">
            <span className="text-xs font-bold">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
