import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../lib/utils'

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-surface-600 bg-surface-900 p-6 shadow-2xl',
          wide ? 'max-w-2xl' : 'max-w-lg',
        )}
        role="dialog"
        aria-modal
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
