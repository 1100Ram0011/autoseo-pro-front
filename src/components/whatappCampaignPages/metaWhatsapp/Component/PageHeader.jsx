import { cn } from '@/lib/utils'
import Button from './Button'

/**
 * PageHeader — Title + subtitle + right-side action button
 *
 * Props:
 *   title          — page title
 *   subtitle       — subtitle text
 *   actionLabel    — button text (e.g. "+ Connect WhatsApp", "New Campaign")
 *   onAction       — button click handler
 *   disabled       — disable the button
 *   loading        — show loading state
 *   loadingLabel   — text when loading
 *   buttonClassName — extra classes for button
 *   buttonStyle    — inline style for button (for gradient etc.)
 *   titleTag       — "h1" | "h2" (default: "h2")
 *   titleClassName — extra classes for title
 *   subtitleClassName — extra classes for subtitle
 *   className      — extra classes for container
 */
export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  disabled = false,
  loading = false,
  loadingLabel,
  buttonClassName,
  buttonStyle,
  titleTag: TitleTag = 'h2',
  titleClassName,
  subtitleClassName,
  className,
  children,
}) {
  // Default title classes based on tag
  const defaultTitleCls =
    TitleTag === 'h1'
      ? 'text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight'
      : 'text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight'

  const defaultSubtitleCls =
    TitleTag === 'h1'
      ? 'text-slate-500 dark:text-slate-400 text-sm mt-1 font-normal'
      : 'text-slate-500 dark:text-slate-400 text-xs mt-1 font-normal'

  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex items-center gap-3">
        <div>
          <TitleTag className={cn(defaultTitleCls, titleClassName)}>
            {title}
          </TitleTag>
          {subtitle && (
            <p className={cn(defaultSubtitleCls, subtitleClassName)}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {actionLabel && (
          <Button
            label={actionLabel}
            onClick={onAction}
            disabled={disabled}
            loading={loading}
            loadingLabel={loadingLabel}
            className={buttonClassName}
            size="lg"
          />
        )}
      </div>
    </div>
  )
}
