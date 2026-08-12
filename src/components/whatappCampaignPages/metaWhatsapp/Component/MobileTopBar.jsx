import WhatsAppIconBox from './WhatsAppIconBox'

/**
 * MobileTopBar — Mobile-only top bar with WhatsApp branding + Menu button
 *
 * Props:
 *   title      — brand title (default: "WhatsApp Campaigns")
 *   onMenuOpen — handler to open mobile menu
 */
export default function MobileTopBar({
  title = 'WhatsApp Campaigns',
  onMenuOpen,
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <WhatsAppIconBox size="sm" />
        <span className="text-sm font-semibold text-foreground">
          {title}
        </span>
      </div>
      <button
        onClick={onMenuOpen}
        className="rounded-md border border-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        Menu
      </button>
    </div>
  )
}
