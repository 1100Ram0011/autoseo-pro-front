import { FaWhatsapp } from 'react-icons/fa'
import { cn } from '@/lib/utils'

/**
 * WhatsAppIconBox — Green gradient WhatsApp icon box
 * Reused in: Sidebar brand, Mobile top bar, Integration page number rows
 *
 * Props:
 *   size      — "sm" (32px) | "default" (36px) | "lg" (42px)
 *   iconSize  — override icon size in px
 *   className — extra classes
 */

const SIZES = {
  sm: { box: 'h-8 w-8 rounded-lg', icon: 16 },
  default: { box: 'h-9 w-9 rounded-xl', icon: 18 },
  lg: { box: 'h-[42px] w-[42px] rounded-[10px]', icon: 20 },
}

export default function WhatsAppIconBox({
  size = 'default',
  iconSize,
  className,
}) {
  const s = SIZES[size] || SIZES.default
  const finalIconSize = iconSize || s.icon

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-[#25d366]/10 border border-[#25d366]/20 shadow-[0_0_12px_rgba(37,211,102,0.1)]',
        s.box,
        className
      )}
    >
      <FaWhatsapp size={finalIconSize} className="text-[#25d366] drop-shadow-[0_0_8px_rgba(37,211,102,0.4)]" />
    </div>
  )
}
