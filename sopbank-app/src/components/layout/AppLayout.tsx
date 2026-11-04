import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  Tags,
  Sparkles,
} from 'lucide-react'
import { cn, monthLabel } from '../../lib/utils'
import { useData } from '../../context/DataContext'
import { isDesktopApp } from '../../lib/db'

const nav = [
  { to: '/', label: 'Painel', icon: LayoutDashboard },
  { to: '/lancamentos', label: 'Lançamentos', icon: ArrowLeftRight },
  { to: '/cartoes', label: 'Cartões', icon: CreditCard },
  { to: '/contas', label: 'Contas', icon: Wallet },
  { to: '/categorias', label: 'Categorias', icon: Tags },
]

export function AppLayout() {
  const { selectedMonth, setSelectedMonth, ready } = useData()

  return (
    <div className="flex h-full min-h-0 bg-surface-950">
      <aside className="flex w-64 shrink-0 flex-col border-r border-surface-800 bg-surface-900/50">
        <div className="border-b border-surface-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">SopBank</p>
              <p className="text-xs text-slate-500">Finanças pessoais</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-slate-400 hover:bg-surface-800 hover:text-white',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-surface-800 p-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">
            Mês de referência
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full rounded-xl border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-white"
          />
          <p className="mt-2 text-xs text-slate-500">{monthLabel(selectedMonth)}</p>
          {!isDesktopApp() && (
            <p className="mt-3 rounded-lg bg-warning/10 px-2 py-1.5 text-[10px] text-warning">
              Modo navegador (dados locais). Instale o app desktop para SQLite.
            </p>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {!ready ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="mt-4 text-sm text-slate-400">Carregando…</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  )
}
