import WhatsAppIconBox from './WhatsAppIconBox'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * SidebarBrand — Sidebar header with WhatsApp icon + title + mobile close
 *
 * Props:
 *   collapsed   — sidebar collapsed state
 *   isMobile    — mobile mode
 *   onClose     — mobile close handler
 *   title       — brand title (default: "WhatsApp Campaigns")
 */
export default function SidebarBrand({
  collapsed = false,
  isMobile = false,
  onClose,
  title = 'WhatsApp Campaigns',
}) {
  return (
    <div
      className={cn(
        'flex h-16 shrink-0 items-center gap-3 border-b px-4',
        !isMobile && collapsed && 'justify-center px-0'
      )}
    >
      <WhatsAppIconBox size="default" />

      {(!collapsed || isMobile) && (
        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <span className="truncate text-base font-semibold tracking-tight text-foreground">
            {title}
          </span>
        </div>
      )}

      {isMobile && onClose && (
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close menu"
        >
          <ChevronLeft size={18} />
        </button>
      )}
    </div>
  )
}
