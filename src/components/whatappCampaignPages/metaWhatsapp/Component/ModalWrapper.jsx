import { createPortal } from 'react-dom'

/**
 * ModalWrapper — Portal-based modal overlay with accent bar, header, close button,
 * backdrop blur, and full light/dark theme support aligned with Modal.jsx reference.
 */
export default function ModalWrapper({
  onClose,
  title,
  children,
  footer,
  maxWidth = '480px',
  accentColors = 'from-emerald-500 via-teal-400 to-emerald-400',
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-h-[88vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100"
        style={{ maxWidth }}
      >
        {/* Top accent bar */}
        {accentColors && (
          <div
            className={`h-[3px] w-full bg-gradient-to-r ${accentColors}`}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-lg leading-none cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 text-slate-700 dark:text-slate-300">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0 flex items-center justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
