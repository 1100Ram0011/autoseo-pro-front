import { cn } from '@/lib/utils'

const VARIANTS = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-none dark:bg-emerald-600 dark:hover:bg-emerald-500',
  secondary: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  outline: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 dark:hover:text-red-300',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 border-none',
  warning: 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20 dark:hover:bg-yellow-500/20',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-[11px] gap-1.5',
  default: 'px-4 py-2 text-xs gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'default',
  icon: Icon,
  label,
  children,
  onClick,
  disabled,
  loading,
  loadingLabel,
  className,
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-lg cursor-pointer outline-none transition-all duration-200 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {loadingLabel || 'Loading…'}
        </span>
      ) : (
        <>
          {Icon && <span className="flex items-center shrink-0">{typeof Icon === 'function' ? <Icon size={14} /> : Icon}</span>}
          {label || children}
        </>
      )}
    </button>
  )
}
