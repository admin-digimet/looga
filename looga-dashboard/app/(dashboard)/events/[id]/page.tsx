import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import StatsCard from '@/components/dashboard/StatsCard'
import type { Event, TicketScan } from '@/types'
import AssignmentsSection from '@/components/events/AssignmentsSection'

type Params = { params: Promise<{ id: string }> }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default async function EventDetailPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*, ticket_types(*)')
    .eq('id', id)
    .single()

  if (!event) notFound()

  // Stats
  const { data: tickets } = await supabase
    .from('tickets')
    .select('quantity, total_price, status')
    .eq('event_id', id)
    .in('status', ['valid', 'used'])

  const ticketsSold = tickets?.reduce((s, t) => s + t.quantity, 0) ?? 0
  const revenue = tickets?.reduce((s, t) => s + t.total_price, 0) ?? 0

  const { count: scanCount } = await supabase
    .from('ticket_scans')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  const checkinRate = ticketsSold > 0 ? Math.round(((scanCount ?? 0) / ticketsSold) * 100) : 0

  // Scans récents
  const { data: scans } = await supabase
    .from('ticket_scans')
    .select(`
      id, status, scanned_at, scanner_name,
      tickets ( ticket_number, ticket_types ( name ), profiles:user_id ( name ) )
    `)
    .eq('event_id', id)
    .order('scanned_at', { ascending: false })
    .limit(20)

  const ev = event as Event

  return (
    <>
      <TopNav title={ev.title} subtitle={formatDate(ev.event_date)} backHref="/events" />

      <div className="p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <EventStatusBadge status={ev.status} />
            <span className="text-sm text-base-content/60">{ev.location_name}</span>
            <span className="text-sm text-base-content/60">·</span>
            <span className="text-sm text-base-content/60">{ev.event_time}</span>
          </div>
          <Link href={`/events/${id}/edit`} className="btn btn-outline btn-sm">
            Modifier
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Billets vendus"
            value={ticketsSold}
            accent="primary"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>}
          />
          <StatsCard
            title="Revenus"
            value={formatPrice(revenue)}
            accent="success"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          />
          <StatsCard
            title="Scans total"
            value={scanCount ?? 0}
            accent="secondary"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>}
          />
          <StatsCard
            title="Check-in rate"
            value={`${checkinRate}%`}
            accent="warning"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>}
          />
        </div>

        <AssignmentsSection eventId={id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Types de billets */}
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body gap-3">
              <h3 className="font-heading font-bold">Types de billets</h3>
              {ev.ticket_types?.map((tt) => (
                <div key={tt.id} className="flex items-center justify-between py-2 border-b border-base-300 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{tt.name}</div>
                    <div className="text-xs text-base-content/50">
                      {tt.stock_total - tt.stock_remaining} / {tt.stock_total} vendus
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {new Intl.NumberFormat('fr-FR').format(tt.price)} F
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scans récents */}
          <div className="card bg-base-200 border border-base-300 lg:col-span-2">
            <div className="card-body gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold">Scans récents</h3>
                <span className="text-xs text-base-content/50">{scanCount} au total</span>
              </div>
              {!scans || scans.length === 0 ? (
                <p className="text-sm text-base-content/50 py-4 text-center">Aucun scan pour l&apos;instant</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr className="text-xs text-base-content/50">
                        <th>Heure</th>
                        <th>Participant</th>
                        <th>Billet</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(scans as unknown as TicketScan[]).map((scan) => (
                        <tr key={scan.id}>
                          <td className="text-xs text-base-content/60">{formatTime(scan.scanned_at)}</td>
                          <td className="text-sm">
                            {(scan.tickets as unknown as { profiles?: { name: string } })?.profiles?.name ?? '—'}
                          </td>
                          <td className="text-xs text-base-content/60">
                            {(scan.tickets as unknown as { ticket_types?: { name: string } })?.ticket_types?.name ?? '—'}
                          </td>
                          <td>
                            {scan.status === 'valid' ? (
                              <span className="badge badge-success badge-xs">Valide</span>
                            ) : scan.status === 'already_used' ? (
                              <span className="badge badge-warning badge-xs">Déjà utilisé</span>
                            ) : (
                              <span className="badge badge-error badge-xs">Invalide</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
