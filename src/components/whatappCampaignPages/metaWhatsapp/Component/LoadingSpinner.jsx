/**
 * LoadingSpinner — Two variants:
 *   variant="text"    → Simple centered text (Integration page)
 *   variant="spinner" → Animated spinning circle + text (Campaign page)
 *
 * Props:
 *   text     — loading text message
 *   variant  — "text" | "spinner" (default: "spinner")
 */
export default function LoadingSpinner({ text = 'Loading…', variant = 'spinner' }) {
  if (variant === 'text') {
    return (
      <div className="p-8 text-center text-[#64748b]">{text}</div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
      <div className="w-8 h-8 rounded-full border-[3px] border-orange-500/20 border-t-orange-500 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
