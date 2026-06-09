import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import EventDeleteButton from '@/components/events/EventDeleteButton'
import type { Event, EventStatus } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

const PAGE_SIZE = 20

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { status: filterStatus = 'all', page: pageParam = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageParam, 10) || 1)

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const organizerId = organizer?.id ?? ''

  // Compter le total pour la pagination
  let countQuery = supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('organizer_id', organizerId)
  if (filterStatus !== 'all') countQuery = countQuery.eq('status', filterStatus)
  const { count: totalCount } = await countQuery

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  // Récupérer seulement la page courante
  let eventsQuery = supabase
    .from('events')
    .select('*, ticket_types(*)')
    .eq('organizer_id', organizerId)
    .order('event_date', { ascending: false })
    .range((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE - 1)
  if (filterStatus !== 'all') eventsQuery = eventsQuery.eq('status', filterStatus)
  const { data: events } = await eventsQuery

  const statusFilters: { label: string; value: EventStatus | 'all' }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Publiés', value: 'published' },
    { label: 'Brouillons', value: 'draft' },
    { label: 'Terminés', value: 'past' },
    { label: 'Annulés', value: 'cancelled' },
  ]

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (p > 1) params.set('page', String(p))
    return `/events${params.toString() ? `?${params.toString()}` : ''}`
  }

  return (
    <>
      <TopNav title="Événements" subtitle={`${totalCount ?? 0} événement(s)${filterStatus !== 'all' ? ` • ${statusFilters.find(f => f.value === filterStatus)?.label}` : ' au total'}`} />

      <div className="p-8 flex flex-col gap-6">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-base-200 rounded-xl p-1">
            {statusFilters.map((f) => (
              <Link
                key={f.value}
                href={f.value === 'all' ? '/events' : `/events?status=${f.value}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${filterStatus === f.value
                    ? 'bg-base-100 text-base-content shadow-sm'
                    : 'text-base-content/60 hover:text-base-content'
                  }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          <Link href="/events/new" className="btn btn-primary gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Créer un événement
          </Link>
        </div>

        {/* Table */}
        {!events || events.length === 0 ? (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body items-center text-center py-16 gap-3">
              <div className="text-4xl">📅</div>
              <h3 className="font-heading font-bold text-lg">Aucun événement</h3>
              <p className="text-base-content/60 text-sm">
                Crée ton premier événement pour qu&apos;il apparaisse sur l&apos;app mobile.
              </p>
              <Link href="/events/new" className="btn btn-primary btn-sm mt-2">
                Créer un événement
              </Link>
            </div>
          </div>
        ) : (
          <div className="card bg-base-200 border border-base-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="text-base-content/60 text-xs uppercase tracking-wide">
                    <th>Événement</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Prix min</th>
                    <th>Types</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(events as Event[]).map((event) => (
                    <tr key={event.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          {event.image_url ? (
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-lg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={event.image_url} alt={event.title} className="object-cover" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                              🎪
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm">{event.title}</div>
                            <div className="text-xs text-base-content/50">{event.location_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{formatDate(event.event_date)}</td>
                      <td><EventStatusBadge status={event.status} /></td>
                      <td className="text-sm font-medium text-primary">
                        {event.min_price > 0 ? formatPrice(event.min_price) : 'Gratuit'}
                      </td>
                      <td className="text-sm text-base-content/60">
                        {event.ticket_types?.length ?? 0} type(s)
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/events/${event.id}`}
                            className="btn btn-ghost btn-xs"
                          >
                            Voir
                          </Link>
                          <Link
                            href={`/events/${event.id}/edit`}
                            className="btn btn-ghost btn-xs"
                          >
                            Modifier
                          </Link>
                          <EventDeleteButton eventId={event.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1">
            {safePage > 1 && (
              <Link href={pageHref(safePage - 1)} className="btn btn-ghost btn-sm">‹ Précédent</Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={pageHref(p)}
                className={`btn btn-sm ${p === safePage ? 'btn-primary' : 'btn-ghost'}`}
              >
                {p}
              </Link>
            ))}
            {safePage < totalPages && (
              <Link href={pageHref(safePage + 1)} className="btn btn-ghost btn-sm">Suivant ›</Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
