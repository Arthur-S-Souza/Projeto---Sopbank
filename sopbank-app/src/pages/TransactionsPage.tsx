import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useData } from '../context/DataContext'
import {
  addTransaction,
  deleteTransaction,
  getAccounts,
  getCategories,
  getCreditCards,
  getTransactions,
} from '../lib/db'
import type { Account, Category, CreditCard, Transaction } from '../types'
import { Button } from '../components/ui/Button'
import { Badge, EmptyState } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Field, Input, Label, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { formatCurrency, formatDate } from '../lib/utils'

type FormState = {
  type: 'income' | 'expense'
  amount: string
  description: string
  date: string
  category_id: string
  account_id: string
  credit_card_id: string
  notes: string
  paymentMethod: 'account' | 'card'
}

const emptyForm = (): FormState => ({
  type: 'expense',
  amount: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  category_id: '',
  account_id: '',
  credit_card_id: '',
  notes: '',
  paymentMethod: 'account',
})

export function TransactionsPage() {
  const { selectedMonth, refreshKey, refresh } = useData()
  const [items, setItems] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<CreditCard[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    Promise.all([
      getTransactions({
        month: selectedMonth,
        type: filter === 'all' ? undefined : filter,
      }),
      getCategories(),
      getAccounts(),
      getCreditCards(),
    ]).then(([tx, cat, acc, cc]) => {
      setItems(tx)
      setCategories(cat)
      setAccounts(acc)
      setCards(cc)
    })
  }, [selectedMonth, refreshKey, filter])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount.replace(',', '.'))
    if (!amount || !form.description) return

    const isExpense = form.type === 'expense'
    const useCard = isExpense && form.paymentMethod === 'card'

    await addTransaction({
      type: form.type,
      amount,
      description: form.description,
      date: form.date,
      category_id: form.category_id ? Number(form.category_id) : null,
      account_id: useCard ? null : form.account_id ? Number(form.account_id) : null,
      credit_card_id:
        useCard && form.credit_card_id ? Number(form.credit_card_id) : null,
      notes: form.notes || null,
    })

    setModalOpen(false)
    setForm(emptyForm())
    refresh()
  }

  const filteredCategories = categories.filter((c) => c.type === form.type)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Lançamentos</h1>
          <p className="mt-1 text-slate-400">Entradas e saídas do mês</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Button>
      </div>

      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todos' : f === 'income' ? 'Entradas' : 'Saídas'}
          </Button>
        ))}
      </div>

      <Card>
        {items.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento"
            description="Adicione sua primeira entrada ou saída para este mês."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Criar lançamento
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-700 text-xs uppercase text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Data</th>
                  <th className="pb-3 pr-4 font-semibold">Descrição</th>
                  <th className="pb-3 pr-4 font-semibold">Categoria</th>
                  <th className="pb-3 pr-4 font-semibold">Origem</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Valor</th>
                  <th className="pb-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-surface-800/80 hover:bg-surface-800/30"
                  >
                    <td className="py-3 pr-4 text-slate-400">{formatDate(t.date)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {t.type === 'income' ? (
                          <ArrowUpCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-danger" />
                        )}
                        <span className="font-medium text-white">{t.description}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {t.category_name ? (
                        <Badge>{t.category_name}</Badge>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {t.card_name ?? t.account_name ?? '—'}
                    </td>
                    <td
                      className={`py-3 pr-4 text-right font-semibold ${
                        t.type === 'income' ? 'text-accent' : 'text-danger'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          await deleteTransaction(t.id)
                          refresh()
                        }}
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-slate-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo lançamento"
        wide
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={form.type === 'income' ? 'primary' : 'secondary'}
              className="flex-1"
              onClick={() => setForm((f) => ({ ...f, type: 'income', paymentMethod: 'account' }))}
            >
              Entrada
            </Button>
            <Button
              type="button"
              variant={form.type === 'expense' ? 'primary' : 'secondary'}
              className="flex-1"
              onClick={() => setForm((f) => ({ ...f, type: 'expense' }))}
            >
              Saída
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>Descrição</Label>
              <Input
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Supermercado"
              />
            </Field>
            <Field>
              <Label>Valor (R$)</Label>
              <Input
                required
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
              />
            </Field>
            <Field>
              <Label>Data</Label>
              <Input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field>
              <Label>Categoria</Label>
              <Select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Selecione…</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {form.type === 'expense' && (
            <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-4">
              <p className="mb-3 text-sm font-semibold text-white">Forma de pagamento</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={form.paymentMethod === 'account' ? 'primary' : 'secondary'}
                  onClick={() => setForm({ ...form, paymentMethod: 'account' })}
                >
                  Conta / dinheiro
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={form.paymentMethod === 'card' ? 'primary' : 'secondary'}
                  onClick={() => setForm({ ...form, paymentMethod: 'card' })}
                >
                  Cartão (à vista)
                </Button>
              </div>
              {form.paymentMethod === 'account' ? (
                <Field className="mt-3">
                  <Label>Conta</Label>
                  <Select
                    value={form.account_id}
                    onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                  >
                    <option value="">Opcional</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field className="mt-3">
                  <Label>Cartão</Label>
                  <Select
                    required
                    value={form.credit_card_id}
                    onChange={(e) =>
                      setForm({ ...form, credit_card_id: e.target.value })
                    }
                  >
                    <option value="">Selecione o cartão…</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
          )}

          {form.type === 'income' && (
            <Field>
              <Label>Conta de destino</Label>
              <Select
                value={form.account_id}
                onChange={(e) => setForm({ ...form, account_id: e.target.value })}
              >
                <option value="">Opcional</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field>
            <Label>Observações</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
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
