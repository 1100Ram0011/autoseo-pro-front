/**
 * EmptyState — Two variants:
 *   variant="simple"  → Simple icon + description (Integration page)
 *   variant="fancy"   → Layered circles with icon + title + description (Campaign page)
 *
 * Props:
 *   icon        — emoji or text icon (e.g. "📱", "⚡")
 *   title       — bold title text (optional, used in fancy)
 *   description — description text
 *   variant     — "simple" | "fancy" (default: "simple")
 */
import { Smartphone } from 'lucide-react'

export default function EmptyState({
  icon = <Smartphone className="text-slate-400" size={32} />,
  title,
  description = 'No data found.',
  variant = 'simple',
  action = null,
}) {
  if (variant === 'fancy') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-orange-500/20 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/8 border border-orange-500/20 flex items-center justify-center text-2xl">
            {icon}
          </div>
        </div>
        <div className="text-center">
          {title && <p className="font-bold text-slate-300 mb-1">{title}</p>}
          <p className="text-slate-600 text-sm">{description}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    )
  }

  // simple variant
  return (
    <div className="p-12 text-center flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <p className="m-0 text-[#64748b]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
