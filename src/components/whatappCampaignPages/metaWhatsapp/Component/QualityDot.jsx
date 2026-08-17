import { cn } from '@/lib/utils'
import { QUALITY_COLORS } from './metaWhatsappConstants'

// ─── Quality dot (GREEN / YELLOW / RED / UNKNOWN) ──
export default function QualityDot({ rating }) {
  return (
    <span className="inline-flex items-center gap-[5px] text-[12px] text-[#94a3b8]">
      <span
        className={cn(
          'inline-block h-[7px] w-[7px] rounded-full',
          QUALITY_COLORS[rating] || QUALITY_COLORS.UNKNOWN
        )}
      />
      {rating}
    </span>
  )
}
