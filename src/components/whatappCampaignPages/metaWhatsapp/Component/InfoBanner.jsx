import { cn } from '@/lib/utils.js'

/**
 * InfoBanner — Dismissable notification banner
 *
 * Props:
 *   type      — "success" | "error" | "info" | "modal-error"
 *   message   — banner text (string or node)
 *   icon      — emoji/icon (default based on type)
 *   onDismiss — dismiss handler (if null, no × button)
 *   className — extra classes
 */

const BANNER_STYLES = {
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    defaultIcon: '✅',
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40',
    text: 'text-red-800 dark:text-red-300',
    defaultIcon: '❌',
  },
  info: {
    wrapper: 'border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/40',
    text: 'text-blue-800 dark:text-blue-300',
    defaultIcon: 'ℹ️',
  },
  'modal-error': {
    wrapper: 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    defaultIcon: '⚠️',
  },
  'template-error': {
    wrapper: 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    defaultIcon: '',
  },
}

export default function InfoBanner({
  type = 'info',
  message,
  icon,
  onDismiss,
  className,
  children,
}) {
  const style = BANNER_STYLES[type] || BANNER_STYLES.info
  const displayIcon = icon !== undefined ? icon : style.defaultIcon

  // Template error banner layout
  if (type === 'template-error') {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-[13px]',
          style.wrapper,
          style.text,
          className
        )}
      >
        <span>{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="cursor-pointer border-none bg-transparent text-base leading-none text-[#f87171]"
          >
            ×
          </button>
        )}
      </div>
    )
  }

  // Modal error layout (no dismiss, inline)
  if (type === 'modal-error') {
    return (
      <div
        className={cn(
          'flex items-start gap-2 rounded-lg border px-4 py-3 text-sm',
          style.wrapper,
          style.text,
          className
        )}
      >
        {displayIcon && <span className="mt-px shrink-0">{displayIcon}</span>}
        {message}
        {children}
      </div>
    )
  }

  // Info banner (no dismiss button, bold label)
  if (type === 'info') {
    return (
      <div
        className={cn(
          'rounded-[10px] border px-[18px] py-3.5',
          style.wrapper,
          className
        )}
      >
        <p className={cn('m-0 text-[13px] leading-relaxed', style.text)}>
          {children || message}
        </p>
      </div>
    )
  }

  // Success / Error banner with dismiss
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-[10px] border px-[18px] py-3',
        style.wrapper,
        className
      )}
    >
      {displayIcon && <span className="text-lg">{displayIcon}</span>}
      <span className={cn('font-semibold', style.text)}>
        {message}
      </span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'ml-auto cursor-pointer border-none bg-transparent text-lg leading-none',
            style.text
          )}
        >
          ×
        </button>
      )}
    </div>
  )
}
