import { useEffect, useState } from 'react'
import { Plus, Trash2, Wallet } from 'lucide-react'
import { useData } from '../context/DataContext'
import { addAccount, deleteAccount, getAccounts } from '../lib/db'
import type { Account } from '../types'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Badge'
import { Card, CardTitle } from '../components/ui/Card'
import { Field, Input, Label, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ACCOUNT_TYPE_LABELS, formatCurrency } from '../lib/utils'

export function AccountsPage() {
  const { refreshKey, refresh } = useData()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'checking',
    initial_balance: '',
    color: '#10b981',
  })

  useEffect(() => {
    getAccounts().then(setAccounts)
  }, [refreshKey])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await addAccount({
      name: form.name,
      type: form.type as Account['type'],
      initial_balance: parseFloat(form.initial_balance.replace(',', '.')) || 0,
      color: form.color,
    })
    setModalOpen(false)
    setForm({ name: '', type: 'checking', initial_balance: '', color: '#10b981' })
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Contas</h1>
          <p className="mt-1 text-slate-400">
            Contas bancárias, dinheiro e investimentos
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title="Nenhuma conta"
          description="Cadastre contas para acompanhar saldo e vincular lançamentos."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Wallet className="h-4 w-4" />
              Adicionar conta
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <Card key={a.id} className="relative">
              <div
                className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                style={{ background: a.color }}
              />
              <div className="flex items-start justify-between pl-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {ACCOUNT_TYPE_LABELS[a.type]}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">{a.name}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Saldo inicial{' '}
                    <span className="font-semibold text-accent">
                      {formatCurrency(a.initial_balance)}
                    </span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (confirm('Excluir esta conta?')) {
                      await deleteAccount(a.id)
                      refresh()
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardTitle subtitle="Como funciona o saldo">
          Sobre o saldo exibido no painel
        </CardTitle>
        <p className="text-sm leading-relaxed text-slate-400">
          O saldo consolidado soma o saldo inicial de cada conta mais todas as entradas e
          menos todas as saídas vinculadas a contas. Despesas no cartão de crédito não debitam
          contas até você registrar o pagamento da fatura como saída em uma conta.
        </p>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova conta">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field>
            <Label>Nome</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Conta corrente Itaú"
            />
          </Field>
          <Field>
            <Label>Tipo</Label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>Saldo inicial (R$)</Label>
            <Input
              value={form.initial_balance}
              onChange={(e) => setForm({ ...form, initial_balance: e.target.value })}
            />
          </Field>
          <Field>
            <Label>Cor</Label>
            <Input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-12 cursor-pointer p-1"
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
