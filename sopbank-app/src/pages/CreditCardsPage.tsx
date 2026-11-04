import { useEffect, useState } from 'react'
import { Plus, Trash2, Check, CreditCard } from 'lucide-react'
import { addMonths, format } from 'date-fns'
import { useData } from '../context/DataContext'
import {
  addCreditCard,
  createInstallmentPlan,
  deleteCreditCard,
  deleteInstallmentGroup,
  getCardUsage,
  getCategories,
  getCreditCards,
  getInstallments,
  setInstallmentPaid,
} from '../lib/db'
import type { CreditCard as CardType, Installment } from '../types'
import { Button } from '../components/ui/Button'
import { Badge, EmptyState } from '../components/ui/Badge'
import { Card, CardTitle } from '../components/ui/Card'
import { Field, Input, Label, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { CARD_BRANDS, formatCurrency, formatDate } from '../lib/utils'

export function CreditCardsPage() {
  const { selectedMonth, refreshKey, refresh } = useData()
  const [cards, setCards] = useState<CardType[]>([])
  const [installments, setInstallments] = useState<Installment[]>([])
  const [usageMap, setUsageMap] = useState<Record<number, { used: number; limit: number }>>({})
  const [cardModal, setCardModal] = useState(false)
  const [parcelModal, setParcelModal] = useState(false)
  const [expenseCategories, setExpenseCategories] = useState<{ id: number; name: string }[]>([])

  const [cardForm, setCardForm] = useState({
    name: '',
    brand: 'Visa',
    credit_limit: '',
    closing_day: '1',
    due_day: '10',
    color: '#8b5cf6',
  })

  const [parcelForm, setParcelForm] = useState({
    credit_card_id: '',
    description: '',
    purchase_date: new Date().toISOString().slice(0, 10),
    total_amount: '',
    total_installments: '12',
    category_id: '',
    first_due_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    Promise.all([
      getCreditCards(),
      getInstallments({ month: selectedMonth }),
      getCategories('expense'),
    ]).then(async ([cc, inst, cats]) => {
      setCards(cc)
      setInstallments(inst)
      setExpenseCategories(cats.map((c) => ({ id: c.id, name: c.name })))
      const usage: Record<number, { used: number; limit: number }> = {}
      for (const c of cc) {
        usage[c.id] = await getCardUsage(c.id, selectedMonth)
      }
      setUsageMap(usage)
    })
  }, [selectedMonth, refreshKey])

  async function saveCard(e: React.FormEvent) {
    e.preventDefault()
    await addCreditCard({
      name: cardForm.name,
      brand: cardForm.brand,
      credit_limit: parseFloat(cardForm.credit_limit.replace(',', '.')) || 0,
      closing_day: Number(cardForm.closing_day),
      due_day: Number(cardForm.due_day),
      color: cardForm.color,
    })
    setCardModal(false)
    setCardForm({
      name: '',
      brand: 'Visa',
      credit_limit: '',
      closing_day: '1',
      due_day: '10',
      color: '#8b5cf6',
    })
    refresh()
  }

  async function saveParcel(e: React.FormEvent) {
    e.preventDefault()
    const total = parseFloat(parcelForm.total_amount.replace(',', '.'))
    const n = Number(parcelForm.total_installments)
    if (!total || !n || !parcelForm.credit_card_id) return

    await createInstallmentPlan({
      credit_card_id: Number(parcelForm.credit_card_id),
      description: parcelForm.description,
      purchase_date: parcelForm.purchase_date,
      total_amount: total,
      total_installments: n,
      category_id: parcelForm.category_id ? Number(parcelForm.category_id) : null,
      first_due_date: parcelForm.first_due_date,
    })
    setParcelModal(false)
    refresh()
  }

  const grouped = installments.reduce<Record<string, Installment[]>>((acc, i) => {
    if (!acc[i.group_id]) acc[i.group_id] = []
    acc[i.group_id].push(i)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Cartões de crédito</h1>
          <p className="mt-1 text-slate-400">Limites, fatura e compras parceladas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCardModal(true)}>
            <Plus className="h-4 w-4" />
            Novo cartão
          </Button>
          <Button onClick={() => setParcelModal(true)} disabled={cards.length === 0}>
            <Plus className="h-4 w-4" />
            Compra parcelada
          </Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title="Nenhum cartão cadastrado"
          description="Cadastre seus cartões para controlar limites e parcelas."
          action={
            <Button onClick={() => setCardModal(true)}>
              <CreditCard className="h-4 w-4" />
              Adicionar cartão
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const usage = usageMap[card.id] ?? { used: 0, limit: card.credit_limit }
            const pct =
              usage.limit > 0
                ? Math.min(100, (usage.used / usage.limit) * 100)
                : 0
            return (
              <div
                key={card.id}
                className="relative overflow-hidden rounded-2xl border border-surface-700 p-5"
                style={{
                  background: `linear-gradient(135deg, ${card.color}33 0%, #0f1420 60%)`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-300">{card.brand ?? 'Cartão'}</p>
                    <p className="text-xl font-bold text-white">{card.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      if (confirm('Excluir cartão e parcelas vinculadas?')) {
                        await deleteCreditCard(card.id)
                        refresh()
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  Fechamento dia {card.closing_day} · Vencimento dia {card.due_day}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Uso no mês</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(usage.used)}
                      {usage.limit > 0 && (
                        <span className="text-slate-500">
                          {' '}
                          / {formatCurrency(usage.limit)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct > 85 ? '#f87171' : card.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Card>
        <CardTitle subtitle={`Vencimentos em ${selectedMonth}`}>
          Parcelas do mês
        </CardTitle>
        {installments.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Nenhuma parcela com vencimento neste mês.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([groupId, group]) => {
              const first = group[0]
              const total = group.reduce((s, i) => s + i.amount, 0)
              const paidCount = group.filter((i) => i.paid).length
              return (
                <div
                  key={groupId}
                  className="rounded-xl border border-surface-700 bg-surface-800/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{first.description}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {first.card_name} · Compra {formatDate(first.purchase_date)} ·{' '}
                        {group.length}x · Total {formatCurrency(total)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {paidCount}/{group.length} parcelas pagas
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        if (confirm('Excluir todas as parcelas desta compra?')) {
                          await deleteInstallmentGroup(groupId)
                          refresh()
                        }
                      }}
                    >
                      Excluir compra
                    </Button>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {group.map((i) => (
                      <li
                        key={i.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-900/60 px-3 py-2 text-sm"
                      >
                        <span className="text-slate-300">
                          {i.installment_number}/{i.total_installments} · Venc.{' '}
                          {formatDate(i.due_date)}
                          {i.category_name && (
                            <Badge className="ml-2">{i.category_name}</Badge>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {formatCurrency(i.amount)}
                          </span>
                          <Button
                            size="sm"
                            variant={i.paid ? 'secondary' : 'primary'}
                            onClick={async () => {
                              await setInstallmentPaid(i.id, !i.paid)
                              refresh()
                            }}
                          >
                            <Check className="h-3 w-3" />
                            {i.paid ? 'Pago' : 'Marcar pago'}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal open={cardModal} onClose={() => setCardModal(false)} title="Novo cartão">
        <form className="space-y-4" onSubmit={saveCard}>
          <Field>
            <Label>Nome</Label>
            <Input
              required
              value={cardForm.name}
              onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              placeholder="Ex: Nubank Roxinho"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Bandeira</Label>
              <Select
                value={cardForm.brand}
                onChange={(e) => setCardForm({ ...cardForm, brand: e.target.value })}
              >
                {CARD_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>Limite (R$)</Label>
              <Input
                value={cardForm.credit_limit}
                onChange={(e) =>
                  setCardForm({ ...cardForm, credit_limit: e.target.value })
                }
              />
            </Field>
            <Field>
              <Label>Dia fechamento</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={cardForm.closing_day}
                onChange={(e) =>
                  setCardForm({ ...cardForm, closing_day: e.target.value })
                }
              />
            </Field>
            <Field>
              <Label>Dia vencimento</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={cardForm.due_day}
                onChange={(e) => setCardForm({ ...cardForm, due_day: e.target.value })}
              />
            </Field>
            <Field className="col-span-2">
              <Label>Cor</Label>
              <Input
                type="color"
                value={cardForm.color}
                onChange={(e) => setCardForm({ ...cardForm, color: e.target.value })}
                className="h-12 cursor-pointer p-1"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCardModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={parcelModal}
        onClose={() => setParcelModal(false)}
        title="Registrar compra parcelada"
        wide
      >
        <form className="space-y-4" onSubmit={saveParcel}>
          <Field>
            <Label>Cartão</Label>
            <Select
              required
              value={parcelForm.credit_card_id}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, credit_card_id: e.target.value })
              }
            >
              <option value="">Selecione…</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>Descrição</Label>
            <Input
              required
              value={parcelForm.description}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, description: e.target.value })
              }
              placeholder="Ex: Notebook"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Data da compra</Label>
              <Input
                type="date"
                required
                value={parcelForm.purchase_date}
                onChange={(e) =>
                  setParcelForm({ ...parcelForm, purchase_date: e.target.value })
                }
              />
            </Field>
            <Field>
              <Label>Valor total (R$)</Label>
              <Input
                required
                value={parcelForm.total_amount}
                onChange={(e) =>
                  setParcelForm({ ...parcelForm, total_amount: e.target.value })
                }
              />
            </Field>
            <Field>
              <Label>Número de parcelas</Label>
              <Input
                type="number"
                min={1}
                max={48}
                required
                value={parcelForm.total_installments}
                onChange={(e) =>
                  setParcelForm({ ...parcelForm, total_installments: e.target.value })
                }
              />
            </Field>
            <Field>
              <Label>1ª parcela (vencimento)</Label>
              <Input
                type="date"
                required
                value={parcelForm.first_due_date}
                onChange={(e) =>
                  setParcelForm({ ...parcelForm, first_due_date: e.target.value })
                }
              />
            </Field>
            <Field className="col-span-2">
              <Label>Categoria</Label>
              <Select
                value={parcelForm.category_id}
                onChange={(e) =>
                  setParcelForm({ ...parcelForm, category_id: e.target.value })
                }
              >
                <option value="">Opcional</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {parcelForm.total_amount && parcelForm.total_installments && (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">
              Valor estimado por parcela:{' '}
              {formatCurrency(
                parseFloat(parcelForm.total_amount.replace(',', '.')) /
                  Number(parcelForm.total_installments) || 0,
              )}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setParcelModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Gerar parcelas</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
