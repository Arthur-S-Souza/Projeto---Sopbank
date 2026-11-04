import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { addCategory, deleteCategory, getCategories } from '../lib/db'
import type { Category } from '../types'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card, CardTitle } from '../components/ui/Card'
import { Field, Input, Label, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

export function CategoriesPage() {
  const { refreshKey, refresh } = useData()
  const [categories, setCategories] = useState<Category[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#6366f1',
  })

  useEffect(() => {
    getCategories().then(setCategories)
  }, [refreshKey])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await addCategory({
      name: form.name,
      type: form.type,
      color: form.color,
      icon: 'tag',
    })
    setModalOpen(false)
    setForm({ name: '', type: 'expense', color: '#6366f1' })
    refresh()
  }

  const income = categories.filter((c) => c.type === 'income')
  const expense = categories.filter((c) => c.type === 'expense')

  function CategoryList({ items, title }: { items: Category[]; title: string }) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <ul className="space-y-2">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl bg-surface-800/50 px-3 py-2"
            >
              <Badge color={c.color}>{c.name}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  if (confirm('Excluir categoria?')) {
                    await deleteCategory(c.id)
                    refresh()
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-slate-500" />
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Categorias</h1>
          <p className="mt-1 text-slate-400">Organize entradas e saídas por tipo</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryList items={income} title="Entradas" />
        <CategoryList items={expense} title="Saídas" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova categoria">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field>
            <Label>Nome</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field>
            <Label>Tipo</Label>
            <Select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as 'income' | 'expense' })
              }
            >
              <option value="expense">Saída</option>
              <option value="income">Entrada</option>
            </Select>
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
