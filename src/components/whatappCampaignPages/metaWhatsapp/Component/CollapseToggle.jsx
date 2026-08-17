import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * CollapseToggle — Sidebar collapse/expand button
 *
 * Props:
 *   collapsed — current collapsed state
 *   onToggle  — toggle handler
 */
export default function CollapseToggle({ collapsed, onToggle }) {
  return (
    <div className="border-t p-3">
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md px-3 py-2',
          'text-sm font-medium text-muted-foreground',
          'transition-all duration-200 hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center'
        )}
      >
        <ChevronLeft
          size={16}
          className={cn(
            'shrink-0 transition-transform duration-300',
            collapsed && 'rotate-180'
          )}
        />
        {!collapsed && <span>Collapse</span>}
      </button>
    </div>
  )
}
