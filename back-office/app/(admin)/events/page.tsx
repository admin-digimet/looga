import { TopNav } from '@/components/layout/TopNav'
import { getAdminEvents } from '@/lib/api/admin'
import { EventsTable } from './EventsTable'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const { data: events, total } = await getAdminEvents('', {
    status: params.status,
    search: params.search,
    page: params.page ? Number(params.page) : 1,
  }).catch(() => ({ data: [], total: 0 }))

  return (
    <div className="flex flex-col h-full">
      <TopNav title="Événements" />

      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* Bandeau info mock */}
        <div className="alert alert-info py-2 text-sm">
          <span>
            Données mockées — API <code className="font-mono text-xs">GET /admin/events</code> non encore disponible.
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-base-content/60">{total} événement{total > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        {/* Table interactive (client component) */}
        <EventsTable events={events} />
      </div>
    </div>
  )
}
