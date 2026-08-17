import { cn } from '@/lib/utils'

/**
 * IconButton — Small square icon-only button
 *
 * Props:
 *   icon      — icon content (text/emoji/node)
 *   onClick   — click handler
 *   className — extra classes
 *   title     — tooltip text
 */
export default function IconButton({ icon, onClick, className, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-8 h-8 rounded-lg bg-transparent border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
        'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
        'flex items-center justify-center transition text-base cursor-pointer',
        className
      )}
    >
      {icon}
    </button>
  )
}
