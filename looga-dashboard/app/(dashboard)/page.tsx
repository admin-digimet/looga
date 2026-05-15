import { createClient, createAdminClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import StatsCard from '@/components/dashboard/StatsCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import type { RevenueByEvent, ScanStatus } from '@/types'

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

const scanStatusLabel: Record<ScanStatus, string> = {
  valid: 'Entrée validée',
  already_used: 'Déjà utilisé',
  invalid: 'Billet invalide',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  let { data: organizer } = await admin
    .from('organizers').select('id, name').eq('user_id', user!.id).single()

  if (!organizer) {
    const { data: profile } = await admin
      .from('profiles').select('name').eq('id', user!.id).single()
    const { data: newOrg } = await admin
      .from('organizers')
      .insert({ user_id: user!.id, name: profile?.name ?? user!.email ?? 'Mon organisation' })
      .select('id, name')
      .single()
    organizer = newOrg
  }

  if (!organizer) {
    return (
      <div className="p-8">
        <p className="text-base-content/60">Erreur : impossible de charger le compte organisateur.</p>
      </div>
    )
  }

  // ── Tous les événements avec ticket_types et views_count ──────────────────
  const { data: allEvents } = await supabase
    .from('events')
    .select('id, title, event_date, status, views_count, ticket_types(stock_total, stock_remaining)')
    .eq('organizer_id', organizer.id)
    .order('event_date', { ascending: false })

  const eventIds = (allEvents ?? []).map((e) => e.id)
  const eventTitleMap = new Map((allEvents ?? []).map((e) => [e.id, e.title]))

  const totalEvents = allEvents?.length ?? 0
  const activeEvents = (allEvents ?? []).filter((e) => e.status === 'published').length

  // ── Tous les billets vendus (un seul appel, groupé en JS) ─────────────────
  let totalRevenue = 0
  let totalTicketsSold = 0
  const revenueByEventId = new Map<string, { revenue: number; sold: number }>()

  if (eventIds.length > 0) {
    const { data: ticketStats } = await supabase
      .from('tickets')
      .select('event_id, quantity, total_price')
      .in('event_id', eventIds)
      .in('status', ['valid', 'used'])

    for (const t of ticketStats ?? []) {
      const cur = revenueByEventId.get(t.event_id) ?? { revenue: 0, sold: 0 }
      cur.revenue += t.total_price
      cur.sold += t.quantity
      revenueByEventId.set(t.event_id, cur)
    }

    totalRevenue = [...revenueByEventId.values()].reduce((s, v) => s + v.revenue, 0)
    totalTicketsSold = [...revenueByEventId.values()].reduce((s, v) => s + v.sold, 0)
  }

  // ── Scans aujourd'hui ─────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  const fallbackId = '00000000-0000-0000-0000-000000000000'
  const { count: scansToday } = await supabase
    .from('ticket_scans')
    .select('*', { count: 'exact', head: true })
    .in('event_id', eventIds.length > 0 ? eventIds : [fallbackId])
    .gte('scanned_at', `${today}T00:00:00Z`)

  // ── Revenue chart (top 6 events) ──────────────────────────────────────────
  const revenueByEvent: RevenueByEvent[] = (allEvents ?? []).slice(0, 6).map((ev) => ({
    event_id: ev.id,
    title: ev.title,
    revenue: revenueByEventId.get(ev.id)?.revenue ?? 0,
    tickets_sold: revenueByEventId.get(ev.id)?.sold ?? 0,
  }))

  // ── Taux de remplissage par événement ─────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventsWithFill = (allEvents ?? []).map((ev: any) => {
    const capacity: number = (ev.ticket_types ?? []).reduce((s: number, tt: { stock_total: number }) => s + tt.stock_total, 0)
    const sold = revenueByEventId.get(ev.id)?.sold ?? 0
    const revenue = revenueByEventId.get(ev.id)?.revenue ?? 0
    const fillRate = capacity > 0 ? Math.round((sold / capacity) * 100) : 0
    return { id: ev.id, title: ev.title, capacity, sold, revenue, fillRate, status: ev.status }
  })
    .filter((ev) => ev.capacity > 0)
    .sort((a, b) => b.revenue - a.revenue || b.fillRate - a.fillRate)
    .slice(0, 6)

  // ── Indicateurs globaux ───────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalCapacity = (allEvents ?? []).reduce((s, ev: any) =>
    s + (ev.ticket_types ?? []).reduce((ts: number, tt: { stock_total: number }) => ts + tt.stock_total, 0), 0)
  const globalFillRate = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0

  const totalViews = (allEvents ?? []).reduce((s, ev) => s + ((ev as { views_count?: number }).views_count ?? 0), 0)
  const conversionRate = totalViews > 0 ? ((totalTicketsSold / totalViews) * 100).toFixed(1) : '—'

  const avgTicketPrice = totalTicketsSold > 0 ? Math.round(totalRevenue / totalTicketsSold) : 0

  // ── Activité récente (derniers scans) ─────────────────────────────────────
  const { data: recentScans } = await supabase
    .from('ticket_scans')
    .select('id, status, scanned_at, event_id, scanner_name, tickets(ticket_number, ticket_types(name), profiles(name))')
    .in('event_id', eventIds.length > 0 ? eventIds : [fallbackId])
    .order('scanned_at', { ascending: false })
    .limit(8)

  return (
    <>
      <TopNav
        title="Vue d'ensemble"
        subtitle={`Tableau de bord analytique · ${organizer.name}`}
      />

      <div className="p-8 flex flex-col gap-6">

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Revenus totaux"
            value={formatPrice(totalRevenue)}
            subtitle="Billets valides et utilisés"
            accent="success"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
          <StatsCard
            title="Billets vendus"
            value={totalTicketsSold}
            subtitle={avgTicketPrice > 0 ? `Moy. ${formatPrice(avgTicketPrice)}/billet` : `${totalEvents} événement(s)`}
            accent="secondary"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              </svg>
            }
          />
          <StatsCard
            title="Événements actifs"
            value={activeEvents}
            subtitle={`${totalEvents} au total`}
            accent="primary"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
          <StatsCard
            title="Scans aujourd'hui"
            value={scansToday ?? 0}
            subtitle="Entrées validées"
            accent="warning"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <line x1="7" y1="12" x2="17" y2="12" />
              </svg>
            }
          />
        </div>

        {/* ── Revenue chart + Taux de remplissage ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue chart */}
          <div className="card bg-base-200 border border-base-300 lg:col-span-2">
            <div className="card-body gap-2">
              <div>
                <h3 className="font-heading font-bold">Performance des ventes</h3>
                <p className="text-xs text-base-content/50 mt-0.5">Revenus générés par événement</p>
              </div>
              <RevenueChart data={revenueByEvent} />
            </div>
          </div>

          {/* Taux de remplissage */}
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body gap-4">
              <div>
                <h3 className="font-heading font-bold">Taux de remplissage</h3>
                <p className="text-xs text-base-content/50 mt-0.5">Places vendues sur capacité totale</p>
              </div>

              {eventsWithFill.length === 0 ? (
                <p className="text-sm text-base-content/40 text-center py-8">Aucune donnée de capacité</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {eventsWithFill.map((ev) => (
                    <div key={ev.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium truncate flex-1 mr-3" title={ev.title}>
                          {ev.title.length > 20 ? ev.title.slice(0, 20) + '…' : ev.title}
                        </span>
                        <span className={`text-sm font-bold shrink-0 ${
                          ev.fillRate >= 90 ? 'text-error' :
                          ev.fillRate >= 60 ? 'text-warning' :
                          'text-success'
                        }`}>{ev.fillRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            ev.fillRate >= 90 ? 'bg-error' :
                            ev.fillRate >= 60 ? 'bg-warning' :
                            'bg-success'
                          }`}
                          style={{ width: `${Math.min(ev.fillRate, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-base-content/40 mt-1">
                        {ev.sold} / {ev.capacity} places
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Activité récente + Indicateurs clés ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activité récente */}
          <div className="card bg-base-200 border border-base-300 lg:col-span-2">
            <div className="card-body gap-3">
              <div>
                <h3 className="font-heading font-bold">Activité récente</h3>
                <p className="text-xs text-base-content/50 mt-0.5">Dernières entrées enregistrées</p>
              </div>

              {!recentScans || recentScans.length === 0 ? (
                <p className="text-sm text-base-content/40 text-center py-8">Aucun scan enregistré</p>
              ) : (
                <div className="flex flex-col divide-y divide-base-300">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(recentScans as any[]).map((scan) => (
                    <div key={scan.id} className="flex items-center gap-3 py-2.5">

                      {/* Status icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        scan.status === 'valid'        ? 'bg-success/10 text-success' :
                        scan.status === 'already_used' ? 'bg-error/10 text-error' :
                        'bg-base-300 text-base-content/40'
                      }`}>
                        {scan.status === 'valid' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : scan.status === 'already_used' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {scan.tickets?.profiles?.name ?? 'Participant inconnu'}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md shrink-0 ${
                            scan.status === 'valid'        ? 'bg-success/10 text-success' :
                            scan.status === 'already_used' ? 'bg-error/10 text-error' :
                            'bg-base-300 text-base-content/50'
                          }`}>
                            {scanStatusLabel[scan.status as ScanStatus]}
                          </span>
                        </div>
                        <div className="text-xs text-base-content/50 truncate mt-0.5">
                          {eventTitleMap.get(scan.event_id) ?? '—'}
                          {scan.tickets?.ticket_types?.name ? ` · ${scan.tickets.ticket_types.name}` : ''}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-xs text-base-content/40 shrink-0 ml-2">
                        {timeAgo(scan.scanned_at)}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Indicateurs clés */}
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body gap-5">
              <div>
                <h3 className="font-heading font-bold">Indicateurs clés</h3>
                <p className="text-xs text-base-content/50 mt-0.5">Performance globale</p>
              </div>

              <div className="flex flex-col gap-5">

                {/* Prix moyen */}
                <div>
                  <div className="text-xs text-base-content/50 uppercase tracking-wide font-medium mb-1">
                    Prix moyen / billet
                  </div>
                  <div className="text-2xl font-heading font-bold">
                    {avgTicketPrice > 0 ? formatPrice(avgTicketPrice) : '—'}
                  </div>
                </div>

                <div className="h-px bg-base-300" />

                {/* Taux de conversion */}
                <div>
                  <div className="text-xs text-base-content/50 uppercase tracking-wide font-medium mb-1">
                    Taux de conversion
                  </div>
                  <div className="text-2xl font-heading font-bold">
                    {conversionRate}{conversionRate !== '—' ? '%' : ''}
                  </div>
                  <div className="text-xs text-base-content/40 mt-0.5">
                    {totalViews > 0
                      ? `${new Intl.NumberFormat('fr-FR').format(totalViews)} vues → ${totalTicketsSold} billets`
                      : 'Aucune vue enregistrée'}
                  </div>
                </div>

                <div className="h-px bg-base-300" />

                {/* Remplissage global */}
                <div>
                  <div className="text-xs text-base-content/50 uppercase tracking-wide font-medium mb-1">
                    Remplissage global
                  </div>
                  <div className="text-2xl font-heading font-bold">{globalFillRate}%</div>
                  <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(globalFillRate, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-base-content/40 mt-1">
                    {totalTicketsSold} / {totalCapacity} places
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
