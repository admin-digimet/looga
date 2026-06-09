import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: organizer }] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user!.id).single(),
    supabase.from('organizers').select('id, name, logo_url').eq('user_id', user!.id).single(),
  ])

  return (
    <>
      <TopNav title="Paramètres" subtitle="Logo, nom et informations de ton organisation" />
      <div className="p-8 max-w-2xl">
        <SettingsClient
          initialName={organizer?.name ?? profile?.name ?? ''}
          initialLogoUrl={organizer?.logo_url ?? null}
          organizerId={organizer?.id ?? ''}
        />
      </div>
    </>
  )
}
