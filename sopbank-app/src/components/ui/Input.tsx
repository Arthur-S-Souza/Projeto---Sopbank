import { cn } from '../../lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-xl border border-surface-600 bg-surface-800 px-3 text-sm text-white placeholder:text-slate-500 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-xl border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20',
        className,
      )}
      {...props}
    />
  )
}

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400', className)}
      {...props}
    >
      {children}
    </label>
  )
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-xl border border-surface-600 bg-surface-800 px-3 text-sm text-white focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Field({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}
