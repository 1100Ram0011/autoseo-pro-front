/**
 * TableFooter — Count + status legend footer
 *
 * Props:
 *   count        — total item count
 *   label        — item name (default: "campaign")
 *   statusConfig — status config object (e.g. STATUS_CFG)
 */
export default function TableFooter({
  count = 0,
  label = 'campaign',
  statusConfig = {},
}) {
  const plural = count !== 1 ? `${label}s` : label

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-50 dark:bg-[#0c0e16] border-t border-slate-200 dark:border-white/[0.04] shrink-0">
      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
        {count} {plural}
      </span>
      <div className="flex items-center gap-3.5 flex-wrap">
        {Object.entries(statusConfig).map(([k, cfg]) => (
          <span
            key={k}
            className={`flex items-center gap-1.5 text-[10px] ${cfg.textCls}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: cfg.stripe }}
            />
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  )
}
