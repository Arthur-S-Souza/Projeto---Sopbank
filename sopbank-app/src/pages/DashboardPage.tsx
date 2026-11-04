import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp, Wallet, CreditCard as CardIcon } from 'lucide-react'
import { useData } from '../context/DataContext'
import {
  getDashboardStats,
  getExpenseByCategory,
  getMonthlySummaries,
} from '../lib/db'
import type { DashboardStats, CategorySummary, MonthlySummary } from '../types'
import { Card, CardTitle, StatCard } from '../components/ui/Card'
import { formatCurrency, monthLabel } from '../lib/utils'

export function DashboardPage() {
  const { selectedMonth, refreshKey } = useData()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthly, setMonthly] = useState<MonthlySummary[]>([])
  const [byCategory, setByCategory] = useState<CategorySummary[]>([])

  useEffect(() => {
    Promise.all([
      getDashboardStats(selectedMonth),
      getMonthlySummaries(6),
      getExpenseByCategory(selectedMonth),
    ]).then(([s, m, c]) => {
      setStats(s)
      setMonthly(
        m.map((row) => ({
          ...row,
          label: monthLabel(row.month).split(' ')[0],
        })) as (MonthlySummary & { label: string })[],
      )
      setByCategory(c.slice(0, 8))
    })
  }, [selectedMonth, refreshKey])

  if (!stats) return null

  const chartData = monthly.map((m) => ({
    name: monthLabel(m.month).split(' ')[0],
    Entradas: m.income,
    Saídas: m.expense,
  }))

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Painel</h1>
        <p className="mt-1 text-slate-400">
          Visão geral de {monthLabel(selectedMonth).toLowerCase()}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Entradas no mês"
          value={formatCurrency(stats.totalIncome)}
          trend="Receitas registradas"
          accent="accent"
        />
        <StatCard
          label="Saídas no mês"
          value={formatCurrency(stats.totalExpense)}
          trend="Despesas em contas"
          accent="danger"
        />
        <StatCard
          label="Saldo em contas"
          value={formatCurrency(stats.balance)}
          trend="Saldo inicial + movimentações"
          accent="violet"
        />
        <StatCard
          label="Fatura / parcelas"
          value={formatCurrency(stats.cardBillOpen)}
          trend={`${formatCurrency(stats.installmentsDueMonth)} em parcelas`}
          accent="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle subtitle="Últimos 6 meses">Entradas vs saídas</CardTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3555" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: '#161d2e',
                    border: '1px solid #2a3555',
                    borderRadius: 12,
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="Entradas" fill="#22d3a8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Saídas" fill="#f87171" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle subtitle="Despesas por categoria">Distribuição</CardTitle>
          {byCategory.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Nenhuma despesa neste mês
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {byCategory.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#161d2e',
                      border: '1px solid #2a3555',
                      borderRadius: 12,
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-2 space-y-1">
                {byCategory.slice(0, 4).map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between text-xs text-slate-400"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: c.color }}
                      />
                      {c.name}
                    </span>
                    {formatCurrency(c.total)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-start gap-4">
          <div className="rounded-xl bg-accent/15 p-3 text-accent">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-white">Resultado do mês</p>
            <p className="mt-1 text-2xl font-bold text-accent">
              {formatCurrency(stats.totalIncome - stats.totalExpense)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Entradas menos saídas (sem cartão consolidado)
            </p>
          </div>
        </Card>
        <Card className="flex items-start gap-4">
          <div className="rounded-xl bg-violet-500/15 p-3 text-violet-400">
            <CardIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-white">Compromissos no cartão</p>
            <p className="mt-1 text-2xl font-bold text-violet-300">
              {formatCurrency(stats.cardBillOpen)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Compras à vista no cartão + parcelas com vencimento no mês
            </p>
          </div>
        </Card>
      </div>

      <Card className="flex items-center gap-3 border-accent/20 bg-accent/5">
        <Wallet className="h-5 w-5 text-accent" />
        <p className="text-sm text-slate-300">
          Dica: registre entradas e saídas em{' '}
          <strong className="text-white">Lançamentos</strong>, use{' '}
          <strong className="text-white">Cartões</strong> para compras parceladas e acompanhe
          limites por mês.
        </p>
      </Card>
    </div>
  )
}
