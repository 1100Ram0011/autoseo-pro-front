import { cn } from '@/lib/utils.js'
import {
  Search,
  SlidersHorizontal,
  X,
  Layers3,
  Bookmark,
  BadgeCheck,
  EyeOff,
  Trash2,
  Archive,
  Flag,
  Clock,
  AlertTriangle,
  CreditCard,
  RotateCcw,
  Funnel,
  CircleX,
  ScanFace,
  LayoutDashboard,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function FilterSearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  inputClassName,
}) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-pages-subhead-text)]" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-md border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] pl-11 pr-3 text-sm text-[var(--app-pages-text)] outline-none transition placeholder:text-[var(--app-pages-subhead-text)] hover:border-[var(--app-brand-primary)]',
          inputClassName
        )}
      />
    </div>
  )
}

export function FilterTabs({
  items = [],
  value,
  onChange,
  className,
  buttonClassName,
  showCounts = true,
}) {
  return (
    <div
      className={cn(
        'flex max-w-full flex-nowrap items-center gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0',
        className
      )}
    >
      {items.map((item) => {
        const active = value === item.id
        const hasCount =
          showCounts && item.count !== undefined && item.count !== null

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange?.(item.id)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md border px-4 text-xs font-medium transition',
              buttonClassName,
              active
                ? 'border-[var(--app-brand-primary)] text-[var(--app-brand-primary)] '
                : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-subhead-text)] hover:text-[var(--app-pages-text)]'
            )}
          >
            {item.label}
            {/* {hasCount ? <span className="ml-1">({item.count})</span> : null} */}
          </button>
        )
      })}
    </div>
  )
}

export function ClearFilterButton({
  onClick,
  className,
  children = 'Clear Filters',
}) {
  return (
    <span className="mb-1 w-fit shrink-0 sm:mb-0">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md border border-[var(--app-debit-color)] bg-[var(--app-pages--bg)] px-3 text-sm font-semibold text-[var(--app-debit-color)] transition hover:opacity-90 sm:h-9 sm:px-3',
          className
        )}
      >
        <span className="sm:hidden">Clear</span>
        <span className="hidden sm:inline">{children}</span>
      </button>
    </span>
  )
}

// ─── icon map for dropdown items ─────────────────────────────────────────────

const ITEM_ICONS = {
  all: Layers3,
  saved: Bookmark,
  published: BadgeCheck,
  unpublished: EyeOff,
  deleted: Trash2,
  archived: Archive,
  reported: Flag,
  underReview: Clock,
  failed: AlertTriangle,
  pending: CreditCard,
  scheduled:Clock,
  rejected: CircleX,
  faceSwap: ScanFace,
  templates: LayoutDashboard,
}

// ─── NEW: FilterDropdown ──────────────────────────────────────────────────────
export function FilterDropdown({
  items = [],
  groups, // NEW: [{ label: string, ids: string[] }, ...]
  value,
  onChange,
  onClear,
  className,
  showSelectedLabel = false,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const activeItem = items.find((i) => i.id === value)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // If no groups provided, treat all items as one unnamed group
  const resolvedGroups = groups ?? [
    { label: null, ids: items.map((i) => i.id) },
  ]

  const isFiltered = value !== 'all' && value !== undefined && value !== null

  const handleSelect = (id) => {
    onChange?.(id)
    setOpen(false)
  }
  const handleClear = () => {
    onClear?.()
    setOpen(false)
  }

  return (
    <div
      ref={ref}
      className={cn('relative flex items-center gap-2', className)}
    >
      {showSelectedLabel && activeItem && (
        <span className="shrink-0 text-sm font-bold text-[var(--app-brand-primary)]">
          {activeItem.label}:
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Open filter"
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-md border transition',
          open || isFiltered
            ? ' text-[var(--app-brand-primary)] hover:border-[var(--app-pages-muted)]'
            : ' bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'
        )}
      >
        <Funnel className="h-4 w-4" />
        {/* {isFiltered && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#2D6EF3]" />
        )} */}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--app-brand-border)] bg-[var(--app-pages-bg)]')}
        >
          {resolvedGroups.map((group, gi) => {
            const groupItems = items.filter((i) => group.ids?.includes(i.id))
            if (!groupItems.length) return null
            return (
              <div key={gi}>
                {group.label && (
                  <div
                    className={cn(
                      'px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-[var(--app-pages-subhead-text)]',
                      gi > 0 &&
                        'border-t border-[var(--app-brand-border)]'
                    )}
                  >
                    {group.label}
                  </div>
                )}
                <div className="py-1">
                  {groupItems.map((item) => {
                    const Icon = ITEM_ICONS[item.id?.toLowerCase()] ?? Layers3
                    const active = value === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2 text-sm transition',
                          active
                            ? 'border-l-2 border-[var(--app-brand-primary)] bg-[var(--app-pages-bg)] font-semibold text-[var(--app-brand-primary)]'
                            : 'border-l-2 border-transparent text-[var(--app-pages-subhead-text)] hover:border-[var(--app-brand-primary)] hover:text-[var(--app-brand-primary)]'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            active ? 'text-[var(--app-brand-primary)]' : 'text-[var(--app-pages-subhead-text)]'
                          )}
                        />
                        <span className={cn("flex-1 text-left", active ? 'text-[var(--app-brand-primary)]' : 'text-[var(--app-pages-subhead-text)]')}>{item.label}</span>
                        {item.count !== undefined && item.count !== null && (
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                              active
                                ? 'bg-[var(--app-pages-bg)]/15 text-[var(--app-brand-primary)]'
                                : 'bg-[var(--app-pages-bg)] text-[var(--app-pages-subhead-text)]'
                            )}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div className="border-t border-[var(--app-debit-color)] p-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[var(--app-debit-color)] transition hover:bg-[var(--app-debit-color)]/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
