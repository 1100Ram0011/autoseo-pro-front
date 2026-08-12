import { inputCls } from './metaWhatsappConstants'

/**
 * FormField — Labeled form field (input / textarea / select / datetime-local)
 *
 * Props:
 *   label       — field label
 *   required    — show orange asterisk
 *   hint        — small help text below (e.g. "Leave blank to run immediately")
 *   hintColor   — hint text color class (default: "text-slate-700")
 *   error       — error text below field
 *   children    — custom children (overrides type-based rendering)
 *   type        — "input" | "textarea" | "select" | "datetime-local"
 *   value       — field value
 *   onChange    — change handler (receives e.target.value)
 *   placeholder — placeholder text
 *   disabled    — disabled state
 *   options     — for select: [{ value, label }]
 *   labelSuffix — extra text after label (e.g. "(approved only)")
 *   inputClassName — extra classes for input element
 */
export default function FormField({
  label,
  required = false,
  hint,
  hintColor = 'text-slate-700',
  error,
  children,
  type = 'input',
  value,
  onChange,
  placeholder,
  disabled = false,
  options = [],
  labelSuffix,
  inputClassName = '',
}) {
  const handleChange = (e) => onChange?.(e.target.value)

  return (
    <div>
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
          {label}{' '}
          {required && <span className="text-emerald-600 dark:text-emerald-400">*</span>}
          {labelSuffix && (
            <span className="ml-1 normal-case font-normal text-slate-500 dark:text-slate-400">
              {labelSuffix}
            </span>
          )}
        </label>
      )}

      {children ? (
        children
      ) : type === 'textarea' ? (
        <textarea
          className={`${inputCls} min-h-[58px] resize-y ${inputClassName}`}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : type === 'select' ? (
        <select
          className={`${inputCls} ${disabled ? 'opacity-50' : ''} ${inputClassName}`}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'datetime-local' ? (
        <input
          type="datetime-local"
          className={`${inputCls} ${inputClassName}`}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      ) : (
        <input
          className={`${inputCls} ${inputClassName}`}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}

      {error && (
        <p className="text-red-400 text-[11px] mt-1">{error}</p>
      )}
      {hint && (
        <p className={`text-[11px] mt-1 ${hintColor}`}>{hint}</p>
      )}
    </div>
  )
}
