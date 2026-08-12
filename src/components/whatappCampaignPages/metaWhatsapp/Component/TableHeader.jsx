/**
 * TableHeader — Dynamic column header row
 *
 * Props:
 *   columns — array of { label, width, align, flex }
 *     label  — column header text
 *     width  — fixed width (e.g. "220px", "155px") or undefined for flex
 *     align  — text alignment ("left" | "center" | "right")
 *     flex   — if true, uses flex-1
 */
export default function TableHeader({ columns = [] }) {
  return (
    <div className="flex items-center pl-4 pr-4 py-2.5 bg-slate-100/70 dark:bg-[#0e1018] border-b border-slate-200 dark:border-white/[0.05] shrink-0">
      {columns.map((col, i) => (
        <div key={col.label || i} className="contents">
          {i > 0 && <div className="self-stretch w-px mx-3.5 shrink-0 bg-slate-200 dark:bg-white/[0.05]" />}
          <div
            className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-400 ${
              col.align === 'center'
                ? 'text-center'
                : col.align === 'right'
                  ? 'text-right'
                  : ''
            } ${col.flex ? 'flex-1' : ''}`}
            style={col.width ? { width: col.width } : undefined}
          >
            {col.label}
          </div>
        </div>
      ))}
    </div>
  )
}
