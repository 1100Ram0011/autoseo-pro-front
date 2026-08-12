// ─── Stat cell (label + value) ──
export default function StatCell({ label, value, colorCls }) {
  return (
    <div className="flex flex-col items-center min-w-[40px]">
      <span className={`text-[13px] font-bold tabular-nums leading-none ${colorCls}`}>
        {(value || 0).toLocaleString()}
      </span>
      <span className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}
