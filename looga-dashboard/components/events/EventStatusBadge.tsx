import type { EventStatus } from '@/types'

const config: Record<EventStatus, { label: string; className: string }> = {
  draft:     { label: 'Brouillon',  className: 'badge-ghost' },
  published: { label: 'Publié',     className: 'badge-success' },
  cancelled: { label: 'Annulé',     className: 'badge-error' },
  past:      { label: 'Terminé',    className: 'badge-neutral' },
}

export default function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, className } = config[status] ?? config.draft
  return <span className={`badge badge-sm font-medium ${className}`}>{label}</span>
}
