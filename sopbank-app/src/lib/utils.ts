import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function monthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-')
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]
  return `${months[Number(m) - 1]} ${y}`
}

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function parseMoneyInput(raw: string): number {
  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const n = parseFloat(normalized)
  return Number.isFinite(n) ? n : 0
}

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  cash: 'Dinheiro',
  investment: 'Investimentos',
}

export const CARD_BRANDS = ['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Outro']
