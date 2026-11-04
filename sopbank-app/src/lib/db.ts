import Database from '@tauri-apps/plugin-sql'
import type {
  Account,
  Category,
  CreateInstallmentInput,
  CreditCard,
  DashboardStats,
  Installment,
  MonthlySummary,
  CategorySummary,
  Transaction,
  TransactionType,
} from '../types'
import { addMonths, format, parseISO } from 'date-fns'

const DB_NAME = 'sqlite:sopbank.db'
const LS_KEY = 'sopbank-browser-data'

type BrowserStore = {
  categories: Category[]
  accounts: Account[]
  credit_cards: CreditCard[]
  transactions: Transaction[]
  installments: Installment[]
  nextId: number
}

let db: Database | null = null
let browserStore: BrowserStore | null = null

export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

function emptyBrowserStore(): BrowserStore {
  return {
    categories: [],
    accounts: [],
    credit_cards: [],
    transactions: [],
    installments: [],
    nextId: 1,
  }
}

function loadBrowserStore(): BrowserStore {
  if (browserStore) return browserStore
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    browserStore = JSON.parse(raw) as BrowserStore
    return browserStore
  }
  browserStore = emptyBrowserStore()
  return browserStore
}

function saveBrowserStore() {
  if (browserStore) {
    localStorage.setItem(LS_KEY, JSON.stringify(browserStore))
  }
}

function nextBrowserId(store: BrowserStore): number {
  const id = store.nextId
  store.nextId += 1
  return id
}

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load(DB_NAME)
  }
  return db
}

async function runQuery<T>(
  sql: string,
  bind: unknown[] = [],
): Promise<T[]> {
  if (isDesktopApp()) {
    const database = await getDb()
    return (await database.select(sql, bind)) as T[]
  }
  throw new Error('Browser mode uses dedicated helpers')
}

async function runExecute(sql: string, bind: unknown[] = []): Promise<void> {
  if (isDesktopApp()) {
    const database = await getDb()
    await database.execute(sql, bind)
  }
}

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Salário', type: 'income', color: '#22d3a8', icon: 'wallet' },
  { name: 'Freelance', type: 'income', color: '#34d399', icon: 'briefcase' },
  { name: 'Investimentos', type: 'income', color: '#2dd4bf', icon: 'trending-up' },
  { name: 'Alimentação', type: 'expense', color: '#f97316', icon: 'utensils' },
  { name: 'Moradia', type: 'expense', color: '#8b5cf6', icon: 'home' },
  { name: 'Transporte', type: 'expense', color: '#3b82f6', icon: 'car' },
  { name: 'Saúde', type: 'expense', color: '#ef4444', icon: 'heart-pulse' },
  { name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'gamepad-2' },
  { name: 'Educação', type: 'expense', color: '#6366f1', icon: 'graduation-cap' },
  { name: 'Compras', type: 'expense', color: '#eab308', icon: 'shopping-bag' },
  { name: 'Assinaturas', type: 'expense', color: '#14b8a6', icon: 'repeat' },
  { name: 'Outros', type: 'expense', color: '#64748b', icon: 'circle-dot' },
]

export async function initDatabase(): Promise<void> {
  if (isDesktopApp()) {
    const categories = await runQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM categories',
    )
    if (categories[0]?.count === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await runExecute(
          'INSERT INTO categories (name, type, color, icon) VALUES ($1, $2, $3, $4)',
          [cat.name, cat.type, cat.color, cat.icon],
        )
      }
    }
    return
  }

  const store = loadBrowserStore()
  if (store.categories.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      store.categories.push({ ...cat, id: nextBrowserId(store) })
    }
    saveBrowserStore()
  }
}

export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  if (isDesktopApp()) {
    if (type) {
      return runQuery<Category>(
        'SELECT * FROM categories WHERE type = $1 ORDER BY name',
        [type],
      )
    }
    return runQuery<Category>('SELECT * FROM categories ORDER BY type, name')
  }
  const store = loadBrowserStore()
  let list = [...store.categories]
  if (type) list = list.filter((c) => c.type === type)
  return list.sort((a, b) => a.name.localeCompare(b.name))
}

export async function addCategory(
  data: Omit<Category, 'id'>,
): Promise<void> {
  if (isDesktopApp()) {
    await runExecute(
      'INSERT INTO categories (name, type, color, icon) VALUES ($1, $2, $3, $4)',
      [data.name, data.type, data.color, data.icon],
    )
    return
  }
  const store = loadBrowserStore()
  store.categories.push({ ...data, id: nextBrowserId(store) })
  saveBrowserStore()
}

export async function deleteCategory(id: number): Promise<void> {
  if (isDesktopApp()) {
    await runExecute('DELETE FROM categories WHERE id = $1', [id])
    return
  }
  const store = loadBrowserStore()
  store.categories = store.categories.filter((c) => c.id !== id)
  saveBrowserStore()
}

export async function getAccounts(): Promise<Account[]> {
  if (isDesktopApp()) {
    return runQuery<Account>('SELECT * FROM accounts ORDER BY name')
  }
  return [...loadBrowserStore().accounts].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export async function addAccount(
  data: Omit<Account, 'id'>,
): Promise<void> {
  if (isDesktopApp()) {
    await runExecute(
      'INSERT INTO accounts (name, type, initial_balance, color) VALUES ($1, $2, $3, $4)',
      [data.name, data.type, data.initial_balance, data.color],
    )
    return
  }
  const store = loadBrowserStore()
  store.accounts.push({ ...data, id: nextBrowserId(store) })
  saveBrowserStore()
}

export async function deleteAccount(id: number): Promise<void> {
  if (isDesktopApp()) {
    await runExecute('DELETE FROM accounts WHERE id = $1', [id])
    return
  }
  const store = loadBrowserStore()
  store.accounts = store.accounts.filter((a) => a.id !== id)
  saveBrowserStore()
}

export async function getCreditCards(): Promise<CreditCard[]> {
  if (isDesktopApp()) {
    return runQuery<CreditCard>('SELECT * FROM credit_cards ORDER BY name')
  }
  return [...loadBrowserStore().credit_cards].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export async function addCreditCard(
  data: Omit<CreditCard, 'id'>,
): Promise<void> {
  if (isDesktopApp()) {
    await runExecute(
      'INSERT INTO credit_cards (name, brand, credit_limit, closing_day, due_day, color) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        data.name,
        data.brand,
        data.credit_limit,
        data.closing_day,
        data.due_day,
        data.color,
      ],
    )
    return
  }
  const store = loadBrowserStore()
  store.credit_cards.push({ ...data, id: nextBrowserId(store) })
  saveBrowserStore()
}

export async function deleteCreditCard(id: number): Promise<void> {
  if (isDesktopApp()) {
    await runExecute('DELETE FROM credit_cards WHERE id = $1', [id])
    return
  }
  const store = loadBrowserStore()
  store.credit_cards = store.credit_cards.filter((c) => c.id !== id)
  store.installments = store.installments.filter((i) => i.credit_card_id !== id)
  saveBrowserStore()
}

export async function getTransactions(filters?: {
  month?: string
  type?: TransactionType
}): Promise<Transaction[]> {
  if (isDesktopApp()) {
    let sql = `
      SELECT t.*, c.name as category_name, a.name as account_name, cc.name as card_name
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN accounts a ON a.id = t.account_id
      LEFT JOIN credit_cards cc ON cc.id = t.credit_card_id
      WHERE 1=1
    `
    const bind: unknown[] = []
    if (filters?.month) {
      bind.push(`${filters.month}%`)
      sql += ` AND t.date LIKE $${bind.length}`
    }
    if (filters?.type) {
      bind.push(filters.type)
      sql += ` AND t.type = $${bind.length}`
    }
    sql += ' ORDER BY t.date DESC, t.id DESC'
    return runQuery<Transaction>(sql, bind)
  }

  const store = loadBrowserStore()
  const cats = new Map(store.categories.map((c) => [c.id, c.name]))
  const accs = new Map(store.accounts.map((a) => [a.id, a.name]))
  const cards = new Map(store.credit_cards.map((c) => [c.id, c.name]))

  return store.transactions
    .filter((t) => {
      if (filters?.month && !t.date.startsWith(filters.month)) return false
      if (filters?.type && t.type !== filters.type) return false
      return true
    })
    .map((t) => ({
      ...t,
      category_name: t.category_id ? cats.get(t.category_id) : undefined,
      account_name: t.account_id ? accs.get(t.account_id) : undefined,
      card_name: t.credit_card_id ? cards.get(t.credit_card_id) : undefined,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function addTransaction(data: {
  type: TransactionType
  amount: number
  description: string
  date: string
  category_id: number | null
  account_id: number | null
  credit_card_id: number | null
  notes?: string | null
}): Promise<void> {
  if (isDesktopApp()) {
    await runExecute(
      `INSERT INTO transactions (type, amount, description, date, category_id, account_id, credit_card_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.type,
        data.amount,
        data.description,
        data.date,
        data.category_id,
        data.account_id,
        data.credit_card_id,
        data.notes ?? null,
      ],
    )
    return
  }
  const store = loadBrowserStore()
  store.transactions.push({
    id: nextBrowserId(store),
    type: data.type,
    amount: data.amount,
    description: data.description,
    date: data.date,
    category_id: data.category_id,
    account_id: data.account_id,
    credit_card_id: data.credit_card_id,
    notes: data.notes ?? null,
    created_at: new Date().toISOString(),
  })
  saveBrowserStore()
}

export async function deleteTransaction(id: number): Promise<void> {
  if (isDesktopApp()) {
    await runExecute('DELETE FROM transactions WHERE id = $1', [id])
    return
  }
  const store = loadBrowserStore()
  store.transactions = store.transactions.filter((t) => t.id !== id)
  saveBrowserStore()
}

export async function getInstallments(filters?: {
  credit_card_id?: number
  month?: string
  unpaidOnly?: boolean
}): Promise<Installment[]> {
  if (isDesktopApp()) {
    let sql = `
      SELECT i.*, c.name as category_name, cc.name as card_name
      FROM installments i
      LEFT JOIN categories c ON c.id = i.category_id
      LEFT JOIN credit_cards cc ON cc.id = i.credit_card_id
      WHERE 1=1
    `
    const bind: unknown[] = []
    if (filters?.credit_card_id) {
      bind.push(filters.credit_card_id)
      sql += ` AND i.credit_card_id = $${bind.length}`
    }
    if (filters?.month) {
      bind.push(`${filters.month}%`)
      sql += ` AND i.due_date LIKE $${bind.length}`
    }
    if (filters?.unpaidOnly) {
      sql += ' AND i.paid = 0'
    }
    sql += ' ORDER BY i.due_date ASC, i.installment_number ASC'
    return runQuery<Installment>(sql, bind)
  }

  const store = loadBrowserStore()
  const cats = new Map(store.categories.map((c) => [c.id, c.name]))
  const cards = new Map(store.credit_cards.map((c) => [c.id, c.name]))

  return store.installments
    .filter((i) => {
      if (filters?.credit_card_id && i.credit_card_id !== filters.credit_card_id)
        return false
      if (filters?.month && !i.due_date.startsWith(filters.month)) return false
      if (filters?.unpaidOnly && i.paid !== 0) return false
      return true
    })
    .map((i) => ({
      ...i,
      category_name: i.category_id ? cats.get(i.category_id) : undefined,
      card_name: cards.get(i.credit_card_id),
    }))
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
}

export async function createInstallmentPlan(
  input: CreateInstallmentInput,
): Promise<void> {
  const installmentAmount =
    Math.round((input.total_amount / input.total_installments) * 100) / 100
  const groupId = crypto.randomUUID()
  let due = parseISO(input.first_due_date)

  const rows: Omit<Installment, 'id'>[] = []
  let allocated = 0

  for (let n = 1; n <= input.total_installments; n++) {
    let amount = installmentAmount
    if (n === input.total_installments) {
      amount = Math.round((input.total_amount - allocated) * 100) / 100
    }
    allocated += amount
    rows.push({
      credit_card_id: input.credit_card_id,
      description: input.description,
      purchase_date: input.purchase_date,
      installment_number: n,
      total_installments: input.total_installments,
      amount,
      due_date: format(due, 'yyyy-MM-dd'),
      paid: 0,
      category_id: input.category_id,
      group_id: groupId,
    })
    due = addMonths(due, 1)
  }

  if (isDesktopApp()) {
    for (const row of rows) {
      await runExecute(
        `INSERT INTO installments (credit_card_id, description, purchase_date, installment_number, total_installments, amount, due_date, paid, category_id, group_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          row.credit_card_id,
          row.description,
          row.purchase_date,
          row.installment_number,
          row.total_installments,
          row.amount,
          row.due_date,
          row.paid,
          row.category_id,
          row.group_id,
        ],
      )
    }
    return
  }

  const store = loadBrowserStore()
  for (const row of rows) {
    store.installments.push({ ...row, id: nextBrowserId(store) })
  }
  saveBrowserStore()
}

export async function setInstallmentPaid(
  id: number,
  paid: boolean,
): Promise<void> {
  if (isDesktopApp()) {
    await runExecute('UPDATE installments SET paid = $1 WHERE id = $2', [
      paid ? 1 : 0,
      id,
    ])
    return
  }
  const store = loadBrowserStore()
  const item = store.installments.find((i) => i.id === id)
  if (item) item.paid = paid ? 1 : 0
  saveBrowserStore()
}

export async function deleteInstallmentGroup(groupId: string): Promise<void> {
  if (isDesktopApp()) {
    await runExecute('DELETE FROM installments WHERE group_id = $1', [groupId])
    return
  }
  const store = loadBrowserStore()
  store.installments = store.installments.filter((i) => i.group_id !== groupId)
  saveBrowserStore()
}

export async function getDashboardStats(month: string): Promise<DashboardStats> {
  const transactions = await getTransactions({ month })
  const installments = await getInstallments({ month, unpaidOnly: true })

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const cardCharges = transactions
    .filter((t) => t.type === 'expense' && t.credit_card_id)
    .reduce((s, t) => s + t.amount, 0)
  const installmentsDue = installments.reduce((s, i) => s + i.amount, 0)

  const accounts = await getAccounts()
  const accountFlow = await getTransactions()
  let accountsBase = accounts.reduce((s, a) => s + a.initial_balance, 0)
  for (const t of accountFlow) {
    if (!t.account_id) continue
    if (t.type === 'income') accountsBase += t.amount
    else accountsBase -= t.amount
  }

  return {
    totalIncome,
    totalExpense,
    balance: accountsBase,
    cardBillOpen: cardCharges + installmentsDue,
    installmentsDueMonth: installmentsDue,
  }
}

export async function getMonthlySummaries(
  months: number = 6,
): Promise<MonthlySummary[]> {
  const all = await getTransactions()
  const map = new Map<string, MonthlySummary>()

  for (const t of all) {
    const month = t.date.slice(0, 7)
    if (!map.has(month)) {
      map.set(month, { month, income: 0, expense: 0 })
    }
    const entry = map.get(month)!
    if (t.type === 'income') entry.income += t.amount
    else entry.expense += t.amount
  }

  const sorted = [...map.values()].sort((a, b) => a.month.localeCompare(b.month))
  return sorted.slice(-months)
}

export async function getExpenseByCategory(
  month: string,
): Promise<CategorySummary[]> {
  const transactions = await getTransactions({ month, type: 'expense' })
  const installments = await getInstallments({ month })
  const map = new Map<string, CategorySummary>()

  for (const t of transactions) {
    const name = t.category_name ?? 'Sem categoria'
    const color = '#64748b'
    if (!map.has(name)) map.set(name, { name, color, total: 0 })
    map.get(name)!.total += t.amount
  }

  for (const i of installments) {
    const name = i.category_name ?? 'Cartão (parcelas)'
    if (!map.has(name)) map.set(name, { name, color: '#8b5cf6', total: 0 })
    map.get(name)!.total += i.amount
  }

  const categories = await getCategories('expense')
  for (const c of categories) {
    const entry = map.get(c.name)
    if (entry) entry.color = c.color
  }

  return [...map.values()].sort((a, b) => b.total - a.total)
}

export async function getCardUsage(
  cardId: number,
  month: string,
): Promise<{ used: number; limit: number }> {
  const cards = await getCreditCards()
  const card = cards.find((c) => c.id === cardId)
  const tx = await getTransactions({ month })
  const inst = await getInstallments({ credit_card_id: cardId, month })

  const usedTx = tx
    .filter((t) => t.credit_card_id === cardId && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const usedInst = inst.reduce((s, i) => s + i.amount, 0)

  return {
    used: usedTx + usedInst,
    limit: card?.credit_limit ?? 0,
  }
}
