interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accent?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export default function StatsCard({ title, value, subtitle, icon, accent = 'primary' }: StatsCardProps) {
  const accentBg = {
    primary:   'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success:   'bg-success/10 text-success',
    warning:   'bg-warning/10 text-warning',
    error:     'bg-error/10 text-error',
  }[accent]

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body p-5 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-base-content/60">{title}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentBg}`}>
            {icon}
          </div>
        </div>
        <div>
          <div className="text-2xl font-heading font-bold text-base-content">{value}</div>
          {subtitle && (
            <div className="text-xs text-base-content/50 mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  )
}
