import { TopNav } from '@/components/layout/TopNav'
import { getAdminStats } from '@/lib/api/admin'
import { LayoutDashboard, Calendar, Building2, Ticket } from 'lucide-react'

function formatFCFA(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

export default async function OverviewPage() {
  // TODO: passer le token réel une fois l'API admin disponible
  const stats = await getAdminStats('').catch(() => null)

  return (
    <div className="flex flex-col h-full">
      <TopNav title="Vue d'ensemble" />

      <div className="flex-1 p-6 flex flex-col gap-6">
        {/* Bandeau info mock */}
        <div className="alert alert-info py-2 text-sm">
          <span>
            Les données affichées sont des mocks en attendant les APIs admin backend.
            Voir <code className="font-mono text-xs">lib/api/admin.ts</code> pour la liste des endpoints à implémenter.
          </span>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Calendar size={20} />}
            label="Événements publiés"
            value={stats?.published_events ?? '—'}
            sub={`sur ${stats?.total_events ?? '—'} total`}
            color="primary"
          />
          <StatCard
            icon={<Building2 size={20} />}
            label="Organisateurs"
            value={stats?.total_organizers ?? '—'}
            color="secondary"
          />
          <StatCard
            icon={<Ticket size={20} />}
            label="Billets vendus"
            value={stats?.total_tickets_sold?.toLocaleString('fr-FR') ?? '—'}
            color="accent"
          />
          <StatCard
            icon={<LayoutDashboard size={20} />}
            label="Revenus totaux"
            value={stats ? formatFCFA(stats.total_revenue) : '—'}
            color="neutral"
          />
        </div>

        {/* Statuts événements */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body gap-4">
            <h2 className="card-title text-base font-heading">Répartition des événements</h2>
            <div className="flex flex-wrap gap-4">
              <StatusItem label="Publiés" count={stats?.published_events ?? 0} color="success" />
              <StatusItem label="Brouillons" count={stats?.draft_events ?? 0} color="warning" />
              <StatusItem label="Annulés" count={stats?.cancelled_events ?? 0} color="error" />
            </div>
          </div>
        </div>

        {/* Raccourcis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="/events" className="card bg-base-200 shadow-sm hover:bg-base-300 transition-colors cursor-pointer">
            <div className="card-body flex-row items-center gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Calendar size={22} />
              </div>
              <div>
                <p className="font-semibold font-heading">Modérer les événements</p>
                <p className="text-sm text-base-content/60">Voir, suspendre ou supprimer</p>
              </div>
            </div>
          </a>
          <a href="/organizers" className="card bg-base-200 shadow-sm hover:bg-base-300 transition-colors cursor-pointer">
            <div className="card-body flex-row items-center gap-4">
              <div className="bg-secondary/10 text-secondary p-3 rounded-lg">
                <Building2 size={22} />
              </div>
              <div>
                <p className="font-semibold font-heading">Gérer les organisateurs</p>
                <p className="text-sm text-base-content/60">Voir et suspendre des comptes</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: 'primary' | 'secondary' | 'accent' | 'neutral'
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    neutral: 'bg-neutral/10 text-neutral',
  }
  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body gap-3 p-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold font-heading">{value}</p>
          <p className="text-sm text-base-content/60">{label}</p>
          {sub && <p className="text-xs text-base-content/40 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function StatusItem({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`badge badge-${color} badge-sm`}>{count}</span>
      <span className="text-sm text-base-content/70">{label}</span>
    </div>
  )
}
