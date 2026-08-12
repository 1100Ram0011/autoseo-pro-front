import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, InfoIcon, CheckIcon } from './WaIcons'
import ReactDOM from 'react-dom'

// ─── Base Button ──────────────────────────────────────────────────────────────
const VARIANT_CLS = {
    primary: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md border border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
    danger: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/60",
    text: "bg-transparent text-emerald-600 dark:text-emerald-400 border-none hover:text-emerald-700 dark:hover:text-emerald-300 p-0",
}
const SIZE_CLS = {
    sm: "px-2.5 py-1.5 text-[13px] gap-1.5",
    md: "px-4 py-2 text-[14px] gap-2",
}

export const Btn = ({ variant = 'ghost', size = 'md', icon, children, onClick, disabled, className = '', type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`
            inline-flex items-center font-medium rounded-lg cursor-pointer outline-none
            transition-all duration-150 active:scale-[0.98] whitespace-nowrap
            disabled:opacity-40 disabled:cursor-not-allowed
            ${SIZE_CLS[size]} ${VARIANT_CLS[variant]} ${className}
        `}
    >
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
    </button>
)

// ─── Toggle ───────────────────────────────────────────────────────────────────
export const Toggle = ({ checked, onChange, label, disabled }) => (
    <label className={`inline-flex items-center gap-2 select-none ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
        <div
            onClick={() => !disabled && onChange(!checked)}
            className={`relative w-10 h-5 rounded-full transition-all duration-200 shrink-0
                ${checked ? 'bg-emerald-600 border border-emerald-600' : 'bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'}
                ${disabled ? 'opacity-50' : 'cursor-pointer'}
            `}
        >
            <div className={`absolute top-[1px] w-[16px] h-[16px] rounded-full shadow-sm bg-white transition-all duration-200
                ${checked ? 'left-[20px]' : 'left-[1px]'}`}
            />
        </div>
        {label && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>}
    </label>
)

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export const Checkbox = ({ checked, onChange, label, disabled }) => (
    <label className={`inline-flex items-center MY-2 gap-2 select-none ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
        <div
            onClick={() => !disabled && onChange(!checked)}
            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all duration-150
                ${checked
                    ? 'bg-emerald-600 border border-emerald-600'
                    : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400'
                }
                ${disabled ? 'opacity-50' : 'cursor-pointer'}
            `}
        >
            {checked && <CheckIcon size={12} color="#fff" />}
        </div>
        {label && <span className="text-[13px] text-slate-700 dark:text-slate-300">{label}</span>}
    </label>
)

// ─── Tooltip ──────────────────────────────────────────────────────────────────
export const Tooltip = ({ content, children }) => {
  const [show, setShow] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.top - 6,              
        left: rect.left + rect.width / 2, 
      })
    }
    setShow(true)
  }

  return (
    <span
      ref={triggerRef}
      style={{ display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && content && typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: 'translate(-50%, -100%)',
              zIndex: 99999,
              pointerEvents: 'none',
              animation: 'waPortalTooltipFadeIn 0.12s ease-out forwards',
            }}
          >
            <style>{`
              @keyframes waPortalTooltipFadeIn {
                from { opacity: 0; transform: translate(-50%, calc(-100% + 4px)); }
                to { opacity: 1; transform: translate(-50%, -100%); }
              }
            `}</style>
            <div
              style={{
                background: '#1e293b',
                color: '#fff',
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 6,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.4,
              }}
            >
              {content}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #1e293b',
              }}
            />
          </div>,
          document.body
        )
      }
    </span>
  )
}

// ─── Floating Label Input ─────────────────────────────────────────────────────
export const FloatingInput = ({
    label, value, onChange, placeholder, type = 'text',
    prefix, suffix, disabled, readOnly, error, className = '',
    onFocus: onFocusExternal, onBlur: onBlurExternal,
}) => {
    const [focused, setFocused] = useState(false)
    const hasValue = value !== undefined && value !== null && String(value).length > 0
    const lifted = focused || hasValue || placeholder

    return (
        <div className={`relative flex-1 ${className}`}>
            {label && (
                <label className={`absolute z-10 pointer-events-none font-medium transition-all duration-150 leading-none flex items-center
                    ${prefix ? 'left-11' : 'left-3'}
                    ${lifted ? '-top-[7px] text-[11px]' : 'top-1/2 -translate-y-1/2 text-[14px]'}
                    ${focused ? 'text-emerald-600 dark:text-emerald-400' : error ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}
                `}>
                    <span className={`${lifted ? 'bg-white dark:bg-slate-900 px-1' : ''}`}>{label}</span>
                </label>
            )}
            <div className="relative flex items-center">
                {prefix && (
                    <div className="absolute left-3 flex items-center gap-1 z-10 pointer-events-none text-slate-500 dark:text-slate-400 text-sm">
                        {prefix}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    onFocus={(e) => { setFocused(true); onFocusExternal?.(e) }}
                    onBlur={(e) => { setFocused(false); onBlurExternal?.(e) }}
                    className={`w-full h-[46px] rounded-lg text-[14px] text-slate-900 dark:text-slate-100 outline-none transition-all duration-150
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        ${prefix ? 'pl-10' : 'pl-3'} ${suffix ? 'pr-9' : 'pr-3'}
                        ${readOnly || disabled ? 'bg-slate-100 dark:bg-slate-900 cursor-default text-slate-500 dark:text-slate-400' : 'bg-white dark:bg-slate-950'}
                        ${error
                            ? 'border border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : focused
                                ? 'border border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500'
                                : 'border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 focus:border-emerald-500'
                        }
                    `}
                />
                {suffix && (
                    <div className="absolute right-2.5 flex items-center cursor-pointer text-slate-500 dark:text-slate-400">
                        {suffix}
                    </div>
                )}
            </div>
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{error}</p>}
        </div>
    )
}

// ─── Floating Label Select ────────────────────────────────────────────────────
export const FloatingSelect = ({ label, value, onChange, options, disabled, className = '', style = {} }) => {
    const [focused, setFocused] = useState(false)
    return (
        <div className={`relative flex-1 ${className}`} style={style}>
            {label && (
                <label className={`absolute left-3 -top-[7px] z-10 pointer-events-none text-[10px] font-medium leading-none transition-colors duration-150
                    ${focused ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    <span className="bg-white dark:bg-slate-900 px-1">{label}</span>
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full h-[46px] pl-3 pr-8 rounded-lg text-[14px] text-slate-900 dark:text-slate-100 outline-none appearance-none transition-all duration-150 cursor-pointer
                    ${disabled ? 'bg-slate-100 dark:bg-slate-900 cursor-default text-slate-500' : 'bg-white dark:bg-slate-950'}
                    ${focused
                        ? 'border border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500'
                        : 'border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                    }
                `}
            >
                {options.map(opt => {
                    const v = typeof opt === 'string' ? opt : opt.value
                    const l = typeof opt === 'string' ? opt : opt.label
                    return <option key={v} value={v} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{l}</option>
                })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                <ChevronDownIcon />
            </div>
        </div>
    )
}

// ─── Floating Textarea ────────────────────────────────────────────────────────
export const FloatingTextarea = React.forwardRef(
    ({ value, onChange, placeholder, minHeight = 100, toolbar, error }, ref) => {
        const [focused, setFocused] = useState(false)
        return (
            <div>
                <textarea
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{ minHeight, resize: 'vertical' }}
                    className={`w-full p-3 rounded-lg text-[14px] text-slate-900 dark:text-slate-100 leading-relaxed outline-none transition-all duration-150
                        placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950
                        ${error
                            ? 'border border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : focused
                                ? 'border border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500'
                                : 'border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 focus:border-emerald-500'
                        }
                    `}
                />
                {toolbar && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                        {toolbar}
                    </div>
                )}
                {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{error}</p>}
            </div>
        )
    }
)
FloatingTextarea.displayName = 'FloatingTextarea'

// ─── FormField ────────────────────────────────────────────────────────────────
export const FormField = ({ label, description, optional, children, tooltip, className = '' }) => (
    <div className={`my-5 ${className}`}>
        {label && (
            <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                    {label}
                    {optional && <span className="font-normal text-slate-500 dark:text-slate-400 ml-1">(Optional)</span>}
                </span>
                {tooltip && (
                    <Tooltip content={tooltip}>
                        <InfoIcon size={14} color="#64748b" />
                    </Tooltip>
                )}
            </div>
        )}
        {description && (
            <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2 mb-3">{description}</p>
        )}
        {children}
    </div>
)

// ─── Tab Group ────────────────────────────────────────────────────────────────
export const TabGroup = ({ tabs, value, onChange }) => (
    <div className="flex gap-1.5 flex-wrap">
        {tabs.map(tab => {
            const active = value === tab.value
            return (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium
                                border cursor-pointer outline-none transition-all duration-150 shadow-sm
                        ${active
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    {tab.label}
                    {tab.info && (
                        <Tooltip content={tab.info}>
                            <InfoIcon size={12} color={active ? '#059669' : '#64748b'} />
                        </Tooltip>
                    )}
                </button>
            )
        })}
    </div>
)

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
export const DropdownMenu = ({ trigger, children }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    return (
        <div ref={ref} className="relative inline-block">
            <div onClick={() => setOpen(o => !o)}>{trigger}</div>
            {open && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-[500] min-w-[240px] overflow-hidden
                                bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl
                                animate-[fadeIn_0.15s_ease_forwards]">
                    {React.Children.map(children, child =>
                        React.cloneElement(child, { onClose: () => setOpen(false) })
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton = ({ width = '100%', height = 20, className = '' }) => (
    <div
        className={`rounded-md animate-pulse bg-slate-200 dark:bg-slate-800 ${className}`}
        style={{ width, height }}
    />
)

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider = ({ className = '' }) => (
    <div className={`h-px bg-slate-200 dark:bg-slate-800 my-6 ${className}`} />
)

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, colorCls = 'text-emerald-700 dark:text-emerald-400', bgCls = 'bg-emerald-50 dark:bg-emerald-950/40', ringCls = 'ring-emerald-200 dark:ring-emerald-800' }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${colorCls} ${bgCls} ${ringCls}`}>
        {children}
    </span>
)
// w-hidden
//                                 bg-white border border-slate-200 rounded-xl shadow-xl
//                                 animate-[fadeIn_0.15s_ease_forwards]">
//                     {React.Children.map(children, child =>
//                         React.cloneElement(child, { onClose: () => setOpen(false) })
//                     )}
//                 </div>
//             )}
//         </div>
//     )
// }

// ─── Skeleton ─────────────────────────────────────────────────────────────────
// export const Skeleton = ({ width = '100%', height = 20, className = '' }) => (
//     <div
//         className={`rounded-md animate-pulse bg-slate-200 ${className}`}
//         style={{ width, height }}
//     />
// )

// // ─── Divider ──────────────────────────────────────────────────────────────────
// export const Divider = ({ className = '' }) => (
//     <div className={`h-px bg-slate-200 my-6 ${className}`} />
// )

// // ─── Badge ────────────────────────────────────────────────────────────────────
// export const Badge = ({ children, colorCls = 'text-blue-700', bgCls = 'bg-blue-50', ringCls = 'ring-blue-200' }) => (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${colorCls} ${bgCls} ${ringCls}`}>
//         {children}
//     </span>
// )
