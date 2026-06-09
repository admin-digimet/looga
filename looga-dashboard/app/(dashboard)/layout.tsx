import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import AutoRefresh from '@/components/AutoRefresh'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Vérifier le rôle organisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'organizer') {
    await supabase.auth.signOut()
    redirect('/login?error=not_organizer')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-base-100">
      <AutoRefresh intervalMs={60_000} />
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
