import { cn } from '@/lib/utils'

/**
 * MobileDrawer — Mobile-only drawer overlay with backdrop
 *
 * Props:
 *   open     — show/hide drawer
 *   onClose  — close handler
 *   isDark   — dark theme
 *   children — sidebar content
 */
export default function MobileDrawer({ open, onClose, isDark = true, children }) {
  if (!open) return null

  return (
    <div className="md:hidden">
      <button
        type="button"
        className={cn(
          'fixed inset-0 z-30',
          isDark ? 'bg-black/40' : 'bg-slate-900/25'
        )}
        onClick={onClose}
        aria-label="Close menu"
      />
      <div className="fixed inset-y-0 left-0 z-40 p-3">
        {children}
      </div>
    </div>
  )
}
