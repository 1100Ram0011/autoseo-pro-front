/**
 * FilterChips — Status filter chip buttons
 *
 * Props:
 *   statuses      — array of status keys (e.g. ["DRAFT", "RUNNING", ...])
 *   activeStatus  — currently selected status (empty string = "All")
 *   onSelect      — callback(status) when a chip is clicked
 *   statusConfig  — status config object (e.g. STATUS_CFG)
 *   allLabel      — label for the "all" chip (default: "All")
 */
export default function FilterChips({
  statuses = [],
  activeStatus = '',
  onSelect,
  statusConfig = {},
  allLabel = 'All',
}) {
  const allStatuses = ['', ...statuses]

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {allStatuses.map((s) => {
        const active = activeStatus === s
        const cfg = s ? statusConfig[s] : null
        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all duration-150
              ${
                active
                  ? `${cfg ? cfg.bgCls : 'bg-orange-500/15'} ${cfg ? cfg.textCls : 'text-orange-400'} ring-1 ${cfg ? cfg.ringCls : 'ring-orange-500/30'}`
                  : 'bg-transparent text-slate-600 hover:text-slate-400'
              }`}
          >
            {s || allLabel}
          </button>
        )
      })}
    </div>
  )
}
