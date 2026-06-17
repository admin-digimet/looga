'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  Calendar,
  Coins,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { getAdminStats } from '@/lib/api/admin'
import type { AdminStatsResponse } from '@/app/api/admin/stats/route'

function formatFCFA(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

const ROLE_LABELS: Record<string, string> = {
  user: 'Utilisateurs',
  organizer: 'Organisateurs',
  staff: 'Scanners',
  admin: 'Admins',
  super_admin: 'Super-admins',
}

export default function OverviewPage() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminStats()
      .then((s) => { if (!cancelled) setStats(s) })
      .catch((e) => { if (!cancelled) setError(e?.message ?? 'Erreur') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const maxRevenue = Math.max(...(stats?.revenue_30d.map((d) => d.amount) ?? [0]), 1)

  return (
    <div className="flex flex-col h-full">
      <TopNav title="Vue d'ensemble" />

      <div className="flex-1 p-6 flex flex-col gap-6">
        {error && (
          <div className="alert alert-error py-2 text-sm">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card bg-base-200 shadow-sm">
                <div className="card-body gap-3 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-base-300" />
                  <div className="h-7 bg-base-300 rounded w-16" />
                  <div className="h-3 bg-base-300 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* KPI principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users size={20} />}
                label="Utilisateurs totaux"
                value={stats.total_users.toLocaleString('fr-FR')}
                sub={Object.entries(stats.users_by_role)
                  .map(([role, count]) => `${ROLE_LABELS[role] ?? role}: ${count}`)
                  .join(' · ')}
                color="primary"
              />
              <StatCard
                icon={<Building2 size={20} />}
                label="Organisateurs"
                value={stats.total_organizers.toLocaleString('fr-FR')}
                color="secondary"
              />
              <StatCard
                icon={<Ticket size={20} />}
                label="Billets vendus"
                value={stats.total_tickets_sold.toLocaleString('fr-FR')}
                color="accent"
              />
              <StatCard
                icon={<Wallet size={20} />}
                label="Revenus circulés"
                value={formatFCFA(stats.total_revenue)}
                sub="cumul des paiements réussis (frais inclus)"
                color="neutral"
              />
            </div>

            {/* Finances Looga — commission 8% au reversement */}
            <div>
              <h2 className="font-heading font-bold text-lg mb-3">Finances Looga</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<TrendingUp size={20} />}
                  label="Total plateforme"
                  value={formatFCFA(stats.total_plateforme)}
                  sub="Σ ventes de billets (valeur faciale)"
                  color="primary"
                />
                <StatCard
                  icon={<Coins size={20} />}
                  label="Commission Looga (8%)"
                  value={formatFCFA(stats.looga_commission)}
                  sub="8% du total plateforme"
                  color="accent"
                />
                <StatCard
                  icon={<PiggyBank size={20} />}
                  label="Commission encaissée"
                  value={formatFCFA(stats.looga_commission_realized)}
                  sub="8% des reversements déjà payés"
                  color="secondary"
                />
                <StatCard
                  icon={<Landmark size={20} />}
                  label="Reversements en attente"
                  value={formatFCFA(stats.payouts_pending_amount)}
                  sub="demandes à traiter (montant brut)"
                  color="neutral"
                />
              </div>
            </div>

            {/* Graphique revenu 30 jours + répartition events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="card bg-base-200 shadow-sm lg:col-span-2">
                <div className="card-body gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title text-base font-heading">
                      <TrendingUp size={18} className="text-primary" />
                      Revenus — 30 derniers jours
                    </h2>
                    <span className="text-xs text-base-content/60">
                      Total : {formatFCFA(stats.revenue_30d.reduce((s, d) => s + d.amount, 0))}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-32">
                    {stats.revenue_30d.map((d) => {
                      const pct = (d.amount / maxRevenue) * 100
                      return (
                        <div
                          key={d.date}
                          className="flex-1 bg-primary/30 hover:bg-primary rounded-t transition-colors"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                          title={`${d.date} · ${formatFCFA(d.amount)}`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-base-content/60">
                    <span>{stats.revenue_30d[0]?.date}</span>
                    <span>{stats.revenue_30d[stats.revenue_30d.length - 1]?.date}</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 shadow-sm">
                <div className="card-body gap-4">
                  <h2 className="card-title text-base font-heading">
                    <Calendar size={18} className="text-secondary" />
                    Événements ({stats.total_events})
                  </h2>
                  <ul className="space-y-2 text-sm">
                    <StatusRow label="Publiés" count={stats.events_by_status.published ?? 0} color="success" />
                    <StatusRow label="Brouillons" count={stats.events_by_status.draft ?? 0} color="warning" />
                    <StatusRow label="Annulés" count={stats.events_by_status.cancelled ?? 0} color="error" />
                    <StatusRow label="Passés" count={stats.events_by_status.past ?? 0} color="neutral" />
                  </ul>
                </div>
              </div>
            </div>

            {/* Raccourcis */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ShortcutCard
                href="/events"
                icon={<Calendar size={22} />}
                title="Modérer les événements"
                subtitle="Suspendre ou supprimer"
                color="primary"
              />
              <ShortcutCard
                href="/payouts"
                icon={<Wallet size={22} />}
                title="Demandes de payout"
                subtitle={
                  stats.pending_payouts > 0
                    ? `${stats.pending_payouts} en attente`
                    : 'Aucune en attente'
                }
                color="secondary"
                highlight={stats.pending_payouts > 0}
              />
              <ShortcutCard
                href="/users"
                icon={<LayoutDashboard size={22} />}
                title="Utilisateurs"
                subtitle="Gérer les comptes"
                color="accent"
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, sub, color,
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
          {sub && <p className="text-xs text-base-content/40 mt-1 line-clamp-1" title={sub}>{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-base-content/70">{label}</span>
      <span className={`badge badge-${color} badge-sm`}>{count}</span>
    </li>
  )
}

function ShortcutCard({
  href, icon, title, subtitle, color, highlight,
}: {
  href: string
  icon: React.ReactNode
  title: string
  subtitle: string
  color: 'primary' | 'secondary' | 'accent'
  highlight?: boolean
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  }
  return (
    <Link
      href={href}
      className={`card bg-base-200 shadow-sm hover:bg-base-300 transition-colors ${
        highlight ? 'ring-2 ring-secondary/40' : ''
      }`}
    >
      <div className="card-body flex-row items-center gap-4">
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="font-semibold font-heading">{title}</p>
          <p className="text-sm text-base-content/60">{subtitle}</p>
        </div>
      </div>
    </Link>
  )
}
