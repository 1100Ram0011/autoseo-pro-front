/**
 * SearchInput — Input with magnifier icon
 *
 * Props:
 *   value       — input value
 *   onChange     — change handler (receives event or string based on raw)
 *   placeholder  — placeholder text
 *   className    — extra classes for wrapper
 *   inputClassName — extra classes for input
 *   raw          — if true, passes e.target.value to onChange
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  inputClassName = '',
  raw = true,
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        value={value}
        onChange={raw ? (e) => onChange(e.target.value) : onChange}
        placeholder={placeholder}
        className={`pl-8 pr-3 py-1.5 w-48 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors ${inputClassName}`}
      />
    </div>
  )
}
