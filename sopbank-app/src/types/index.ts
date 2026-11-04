export type CategoryType = 'income' | 'expense'
export type AccountType = 'checking' | 'savings' | 'cash' | 'investment'
export type TransactionType = 'income' | 'expense'

export interface Category {
  id: number
  name: string
  type: CategoryType
  color: string
  icon: string
}

export interface Account {
  id: number
  name: string
  type: AccountType
  initial_balance: number
  color: string
}

export interface CreditCard {
  id: number
  name: string
  brand: string | null
  credit_limit: number
  closing_day: number
  due_day: number
  color: string
}

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  description: string
  date: string
  category_id: number | null
  account_id: number | null
  credit_card_id: number | null
  notes: string | null
  created_at: string
  category_name?: string
  account_name?: string
  card_name?: string
}

export interface Installment {
  id: number
  credit_card_id: number
  description: string
  purchase_date: string
  installment_number: number
  total_installments: number
  amount: number
  due_date: string
  paid: number
  category_id: number | null
  group_id: string
  category_name?: string
  card_name?: string
}

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  balance: number
  cardBillOpen: number
  installmentsDueMonth: number
}

export interface MonthlySummary {
  month: string
  income: number
  expense: number
}

export interface CategorySummary {
  name: string
  color: string
  total: number
}

export interface CreateInstallmentInput {
  credit_card_id: number
  description: string
  purchase_date: string
  total_amount: number
  total_installments: number
  category_id: number | null
  first_due_date: string
}
