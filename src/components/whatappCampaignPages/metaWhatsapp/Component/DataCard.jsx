/**
 * DataCard — Overview stat card with gradient text value
 *
 * Props:
 *   label  — stat label text
 *   value  — stat value (string or number)
 *   from   — gradient from class (e.g. "from-orange-500")
 *   to     — gradient to class (e.g. "to-yellow-400")
 *   shadow — shadow class (e.g. "shadow-orange-500/20")
 */
export default function DataCard({ label, value, from, to, shadow }) {
  return (
    <div className="bg-white dark:bg-[#13151f] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all group">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{label}</span>
      </div>
      <span
        className={`text-2xl font-extrabold bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent`}
      >
        {value}
      </span>
    </div>
  )
}
