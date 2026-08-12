import { cn } from '@/lib/utils.js'
import { STATUS_MAP, STATUS_CFG } from './metaWhatsappConstants'

/**
 * StatusBadge — Two variants:
 *   variant="pill"  → Integration page style (rounded-full, simple bg+text)
 *   variant="ring"  → Campaign page style (ring-1, dot/pulse indicator)
 *
 * Props:
 *   status   — status key (e.g. "active", "RUNNING")
 *   variant  — "pill" | "ring"  (default: "pill")
 *   label    — override label text (e.g. "PRIMARY")
 *   className — extra classes
 *   customBg — custom bg class (for PRIMARY badge etc.)
 *   customText — custom text class
 */
export default function StatusBadge({
  status,
  variant = 'pill',
  label,
  className,
  customBg,
  customText,
}) {
  // ── Pill variant (Integration page) ──
  if (variant === 'pill') {
    const s = STATUS_MAP[status] || STATUS_MAP.pending
    const bg = customBg || s.bg
    const text = customText || s.text
    const displayLabel = label || s.label

    return (
      <span
        className={cn(
          'rounded-full px-2.5 py-px text-[11px] font-semibold',
          bg,
          text,
          className
        )}
      >
        {displayLabel}
      </span>
    )
  }

  // ── Ring variant (Campaign page) ──
  const sc = STATUS_CFG[status] || STATUS_CFG.DRAFT
  const displayLabel = label || sc.label

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ring-1',
        sc.bgCls,
        sc.textCls,
        sc.ringCls,
        className
      )}
    >
      {sc.pulse ? (
        <span className="relative flex w-2 h-2 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${sc.bgCls.replace('/10', '')}`}
            style={{ background: sc.stripe }}
          />
          <span
            className="relative inline-flex w-2 h-2 rounded-full"
            style={{ background: sc.stripe }}
          />
        </span>
      ) : (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: sc.stripe }}
        />
      )}
      {displayLabel}
    </span>
  )
}
