'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RevenueByEvent } from '@/types'

interface RevenueChartProps {
  data: RevenueByEvent[]
}

function formatPrice(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return String(value)
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-base-content/40 text-sm">
        Aucune donnée de revenus disponible
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.title.length > 16 ? d.title.slice(0, 16) + '…' : d.title,
    revenue: d.revenue,
    billets: d.tickets_sold,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'rgba(26,26,26,0.5)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatPrice}
          tick={{ fontSize: 11, fill: 'rgba(26,26,26,0.5)' }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          formatter={(value) => [`${new Intl.NumberFormat('fr-FR').format(Number(value))} FCFA`, 'Revenus']}
          contentStyle={{
            background: '#EDEAE4',
            border: '1px solid #D8D5CE',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="revenue" fill="#FF5C1A" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}
