import { cn } from '../../lib/utils'

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-surface-700/80 bg-surface-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  subtitle,
}: {
  className?: string
  children: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className={cn('mb-4', className)}>
      <h2 className="text-lg font-bold text-white">{children}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  trend,
  accent = 'accent',
}: {
  label: string
  value: string
  trend?: string
  accent?: 'accent' | 'danger' | 'warning' | 'violet'
}) {
  const accents = {
    accent: 'from-accent/20 to-transparent border-accent/30',
    danger: 'from-danger/20 to-transparent border-danger/30',
    warning: 'from-warning/20 to-transparent border-warning/30',
    violet: 'from-violet-500/20 to-transparent border-violet-500/30',
  }
  return (
    <div
      className={cn(
        'rounded-2xl border bg-gradient-to-br p-5',
        accents[accent],
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
    </div>
  )
}
