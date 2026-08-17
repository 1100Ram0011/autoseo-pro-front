import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ConfirmDialog — Portal-based confirmation dialog with header and variant support
 *
 * Props:
 *   open             — show/hide boolean
 *   title            — modal title text (e.g., "Generate API Key")
 *   message          — dialog message text
 *   confirmLabel     — confirm button text (default: "Confirm")
 *   confirmClassName — extra classes for confirm button
 *   variant          — "primary" | "warning" | "danger" (default: "primary")
 *   onConfirm        — confirm handler function
 *   onCancel         — cancel handler function
 *   cancelLabel      — cancel button text (default: "Cancel")
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmClassName = '',
  variant = 'primary',
  onConfirm,
  onCancel,
  cancelLabel = 'Cancel',
}) {
  if (!open) return null

  const VARIANT_STYLES = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border-none',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs border-none',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs border-none',
  }

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header Title */}
        {title && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer outline-none focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Message Body */}
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none focus:outline-none"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'cursor-pointer rounded-lg px-4 py-2 text-xs font-bold transition-all outline-none focus:outline-none',
              VARIANT_STYLES[variant] || VARIANT_STYLES.primary,
              confirmClassName
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
