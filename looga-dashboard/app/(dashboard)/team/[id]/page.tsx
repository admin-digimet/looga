import { notFound } from 'next/navigation'
import Link from 'next/link'
import TopNav from '@/components/layout/TopNav'
import StatsCard from '@/components/dashboard/StatsCard'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default async function ScannerDetailPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: staff } = await supabase
    .from('staff_accounts')
    .select('id, name, is_active, created_at')
    .eq('id', id)
    .single()

  if (!staff) notFound()

  const { data: scans } = await supabase
    .from('ticket_scans')
    .select('status, scanned_at')
    .eq('staff_id', id)
    .order('scanned_at', { ascending: false })

  const totalScans = scans?.length ?? 0
  const validScans = scans?.filter((s) => s.status === 'valid').length ?? 0
  const alreadyUsed = scans?.filter((s) => s.status === 'already_used').length ?? 0
  const invalidScans = scans?.filter((s) => s.status === 'invalid').length ?? 0
  const lastScanAt = scans?.[0]?.scanned_at ?? null

  const { data: assignments } = await supabase
    .from('event_staff_assignments')
    .select('event_id, assigned_at, events(id, title, event_date, status)')
    .eq('staff_id', id)
    .order('assigned_at', { ascending: false })

  const initials = staff.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <TopNav title={staff.name} subtitle="Détail scanner" backHref="/team" />

      <div className="p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="avatar placeholder">
            <div className="bg-secondary/20 text-secondary rounded-full w-14">
              <span className="text-xl font-bold">{initials}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-xl">{staff.name}</h2>
              <span className={`badge badge-sm ${staff.is_active ? 'badge-success' : 'badge-ghost'}`}>
                {staff.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <span className="text-sm text-base-content/50">
              Créé le {formatDate(staff.created_at)}
              {lastScanAt && (
                <> · Dernier scan {formatDate(lastScanAt)} à {formatTime(lastScanAt)}</>
              )}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total scans"
            value={totalScans}
            accent="primary"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>}
          />
          <StatsCard
            title="Valides"
            value={validScans}
            accent="success"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>}
          />
          <StatsCard
            title="Déjà utilisés"
            value={alreadyUsed}
            accent="warning"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          />
          <StatsCard
            title="Invalides"
            value={invalidScans}
            accent="error"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          />
        </div>

        {/* Événements assignés */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body gap-3">
            <h3 className="font-heading font-bold">
              Événements assignés ({assignments?.length ?? 0})
            </h3>
            {!assignments || assignments.length === 0 ? (
              <p className="text-sm text-base-content/50 text-center py-4">
                Aucun événement assigné
              </p>
            ) : (
              <div className="flex flex-col">
                {assignments.map((a) => {
                  const ev = a.events as { id: string; title: string; event_date: string; status: string } | null
                  if (!ev) return null
                  return (
                    <Link
                      key={a.event_id}
                      href={`/events/${ev.id}`}
                      className="flex items-center justify-between py-3 border-b border-base-300 last:border-0 hover:text-primary transition-colors"
                    >
                      <span className="text-sm font-medium">{ev.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-base-content/50">{formatDate(ev.event_date)}</span>
                        <EventStatusBadge status={ev.status as 'draft' | 'published' | 'cancelled' | 'completed'} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
