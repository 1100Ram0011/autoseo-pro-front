import { cn } from '@/lib/utils.js'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip.jsx'

/**
 * SidebarNavItem — Single navigation item with tooltip + active gradient
 *
 * Props:
 *   id         — unique id
 *   label      — nav label text
 *   icon       — Lucide icon component
 *   isActive   — active state
 *   collapsed  — sidebar collapsed state
 *   isMobile   — mobile mode
 *   isDark     — dark theme
 *   onClick    — click handler
 */
export default function SidebarNavItem({
  id,
  label,
  icon: Icon,
  isActive = false,
  collapsed = false,
  isMobile = false,
  isDark = true,
  onClick,
}) {
  const activeItemClasses = `
    relative overflow-hidden rounded-md
    bg-[var(--app-profile-active-bg)]
    text-[var(--app-profile-link-text)]
    before:absolute before:bottom-0 before:left-0 before:top-0
    before:w-[7px] before:rounded-r-full
    before:bg-[var(--app-profile-active-border)]
  `
  const inactiveItemClasses = `
    rounded-md
    text-[var(--app-profile-title-text)]
    hover:bg-[var(--app-brand-surface-alt)]
    hover:text-[var(--app-brand-text)]
  `
  const activeIconClasses = `
    text-[var(--app-profile-btn-bg)]
  `
  const inactiveIconClasses = `
    text-[var(--app-profile-title-text)]
    transition-colors
    group-hover:text-[var(--app-brand-text)]
  `

  return (
    <li>
      <TooltipProvider delayDuration={150} disableHoverableContent>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                'group flex w-full items-center gap-3 px-3 py-3',
                'text-sm font-medium transition-all duration-200 active:scale-[0.98]',
                !isMobile && collapsed && 'justify-center',
                isActive
                  ? activeItemClasses
                  : inactiveItemClasses
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'shrink-0',
                  isActive
                    ? activeIconClasses
                    : inactiveIconClasses
                )}
              />
              {(!collapsed || isMobile) && (
                <span className="truncate">{label}</span>
              )}
            </button>
          </TooltipTrigger>
          {!isMobile && collapsed && (
            <TooltipContent side="right">{label}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </li>
  )
}
