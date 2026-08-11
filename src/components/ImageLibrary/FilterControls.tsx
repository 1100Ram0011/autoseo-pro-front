import { cn } from '@/lib/utils'
import {
  Search,
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
  CircleX,
  ScanFace,
  LayoutDashboard,
  RotateCcw,
  Funnel,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function FilterSearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  inputClassName,
}: {
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-md border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
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
}: {
  items: any[];
  value: string;
  onChange?: (val: string) => void;
  className?: string;
  buttonClassName?: string;
  showCounts?: boolean;
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

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange?.(item.id)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md border px-4 text-xs font-medium transition',
              buttonClassName,
              active
                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

const ITEM_ICONS: any = {
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
  scheduled: Clock,
  rejected: CircleX,
  faceSwap: ScanFace,
  templates: LayoutDashboard,
}

export function FilterDropdown({
  items = [],
  groups,
  value,
  onChange,
  onClear,
  className,
  showSelectedLabel = false,
}: {
  items: any[];
  groups?: { label: string | null; ids: string[] }[];
  value: string;
  onChange?: (val: string) => void;
  onClear?: () => void;
  className?: string;
  showSelectedLabel?: boolean;
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeItem = items.find((i) => i.id === value)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const resolvedGroups = groups ?? [
    { label: null, ids: items.map((i) => i.id) },
  ]

  const isFiltered = value !== 'all' && value !== undefined && value !== null

  const handleSelect = (id: string) => {
    onChange?.(id)
    setOpen(false)
  }
  const handleClear = () => {
    onClear?.()
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn('relative flex items-center gap-2', className)}>
      {showSelectedLabel && activeItem && (
        <span className="shrink-0 text-sm font-bold text-blue-600">
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
            ? 'border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
        )}
      >
        <Funnel className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {resolvedGroups.map((group, gi) => {
            const groupItems = items.filter((i) => group.ids?.includes(i.id))
            if (!groupItems.length) return null
            return (
              <div key={gi}>
                {group.label && (
                  <div
                    className={cn(
                      'px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500',
                      gi > 0 && 'border-t border-slate-100 dark:border-slate-800'
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
                            ? 'border-l-2 border-blue-600 bg-slate-50 font-semibold text-blue-600 dark:bg-slate-800/50 dark:text-blue-400'
                            : 'border-l-2 border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                          )}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.count !== undefined && item.count !== null && (
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                              active
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
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

          <div className="border-t border-slate-200 p-2 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
