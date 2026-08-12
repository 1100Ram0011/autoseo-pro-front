import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, InfoIcon, CheckIcon } from './Msg91WaIcons'

// ─── CSS Variables injected once ─────────────────────────────────────────────
// const injectCSS = () => {
//     if (document.getElementById('wa-ui-styles')) return
//     const el = document.createElement('style')
//     el.id = 'wa-ui-styles'
//     el.textContent = `
//     @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
//     *, *::before, *::after { box-sizing: border-box; }
//     :root {
//       --blue: #1a73e8;
//       --blue-light: rgba(26,115,232,0.09);
//       --border: #d4d9e1;
//       --border-focus: #1a73e8;
//       --text: #1e2330;
//       --text-muted: #6b7280;
//       --text-light: #9ca3af;
//       --bg: #f7f8fa;
//       --surface: var(--app-pages-bg)fff;
//       --surface-2: #f9fafb;
//       --radius: 6px;
//       --radius-md: 8px;
//       --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
//       --shadow: 0 4px 12px rgba(0,0,0,0.08);
//       --shadow-lg: 0 10px 30px rgba(0,0,0,0.12);
//       --transition: 0.15s ease;
//     }
//     .wa-btn { transition: opacity var(--transition), background var(--transition), box-shadow var(--transition); }
//     .wa-btn:hover:not(:disabled) { opacity: 0.88; }
//     .wa-btn:active:not(:disabled) { transform: translateY(1px); }
//     .wa-input { transition: border-color var(--transition), box-shadow var(--transition); }
//     .wa-input:focus { border-color: var(--border-focus) !important; box-shadow: 0 0 0 3px var(--blue-light) !important; }
//     .wa-fade-in { animation: waFadeIn 0.2s ease forwards; }
//     @keyframes waFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
//     .wa-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: waSkeleton 1.4s ease infinite; border-radius: 4px; }
//     @keyframes waSkeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
//     .wa-tab-btn { transition: background var(--transition), color var(--transition), border-color var(--transition); }
//     .wa-tab-btn:hover:not(.active) { background: #f5f7fa !important; }
//   `
//     document.head.appendChild(el)
// }

const injectCSS = () => {
  if (document.getElementById('wa-ui-styles')) return
  const el = document.createElement('style')
  el.id = 'wa-ui-styles'
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --blue: #1a73e8;
      --blue-light: rgba(26,115,232,0.09);

      --border: #d4d9e1;
      --border-focus: #1a73e8;

      --text: #1e2330;
      --text-muted: #6b7280;
      --text-light: #9ca3af;

      --bg: #f7f8fa;
      --surface: #ffffff;
      --surface-2: #f9fafb;

      --radius: 6px;
      --radius-md: 8px;

      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --shadow: 0 4px 12px rgba(0,0,0,0.08);
      --shadow-lg: 0 10px 30px rgba(0,0,0,0.12);

      --transition: 0.15s ease;
    }

    /* ✅ DARK MODE FIX */
    .dark {
      --blue: #60a5fa;
      --blue-light: rgba(96,165,250,0.15);

      --border: #3f3f46;
      --border-focus: #60a5fa;

      --text: #f9fafb;
      --text-muted: #a1a1aa;
      --text-light: #71717a;

      --bg: #09090b;
      --surface: #18181b;
      --surface-2: #27272a;
    }

    .wa-btn { transition: opacity var(--transition), background var(--transition), box-shadow var(--transition); }
    .wa-btn:hover:not(:disabled) { opacity: 0.88; }
    .wa-btn:active:not(:disabled) { transform: translateY(1px); }

    .wa-input {
      transition: border-color var(--transition), box-shadow var(--transition);
      background: var(--app-pages-bg);
      color: var(--text);
    }

    .wa-input:focus {
      border-color: var(--border-focus) !important;
      box-shadow: 0 0 0 3px var(--blue-light) !important;
    }

    .wa-fade-in { animation: waFadeIn 0.2s ease forwards; }
    @keyframes waFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

    .wa-tooltip-fade-in { animation: waTooltipFadeIn 0.15s ease forwards; }
    @keyframes waTooltipFadeIn {
      from { opacity: 0; transform: translate(-50%, 4px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }

    .wa-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: waSkeleton 1.4s ease infinite;
      border-radius: 4px;
    }

    @keyframes waSkeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .wa-tab-btn { transition: background var(--transition), color var(--transition), border-color var(--transition); }

    .wa-tab-btn:hover:not(.active) {
      background: var(--surface-2) !important;
    }
  `
  document.head.appendChild(el)
}
// ─── Inject CSS at module load ────────────────────────────────────────────────
if (typeof document !== 'undefined') injectCSS()

// ─── Base Button ──────────────────────────────────────────────────────────────
export const Btn = ({
  children,
  icon,
  onClick,
  disabled,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className} `}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export const Toggle = ({ checked, onChange, label, disabled }) => (
  <label
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'default' : 'pointer',
      userSelect: 'none',
    }}
  >
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: checked ? 'var(--blue)' : '#d1d5db',
        position: 'relative',
        transition: 'background 0.2s',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'var(--app-pages-bg)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }}
      />
    </div>
    {label && (
      <span
        style={{
          fontSize: 12,
          color: 'var(--text)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </span>
    )}
  </label>
)

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export const Checkbox = ({ checked, onChange, label, disabled }) => (
  <label
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'default' : 'pointer',
      userSelect: 'none',
    }}
  >
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 16,
        height: 16,
        borderRadius: 3,
        border: `1.5px solid ${checked ? 'var(--blue)' : 'var(--border)'}`,
        background: checked ? 'var(--blue)' : 'var(--app-pages-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {checked && <CheckIcon size={10} color="var(--app-pages-bg)" />}
    </div>
    {label && (
      <span
        style={{
          fontSize: 13,
          color: 'var(--text)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </span>
    )}
  </label>
)

// ─── Tooltip ──────────────────────────────────────────────────────────────────
export const Tooltip = ({ content, children }) => {
  const [show, setShow] = useState(false)
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <span
          className="wa-tooltip-fade-in"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 6,
            background: 'var(--app-pages-bg)',
            color: 'var(--app-pages-text)',
            fontSize: 11,
            padding: '5px 9px',
            borderRadius: 5,
            whiteSpace: 'nowrap',
            zIndex: 999,
            boxShadow: 'var(--shadow)',
            pointerEvents: 'none',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {content}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid var(--app-pages-bg)',
            }}
          />
        </span>
      )}
    </span>
  )
}

// ─── Floating Label Input ─────────────────────────────────────────────────────
export const FloatingInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
  suffix,
  disabled,
  readOnly,
  error,
  style = {},
  onFocus: onFocusExternal,
  onBlur: onBlurExternal,
  onlyAlphanumeric = false,
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue =
    value !== undefined && value !== null && String(value).length > 0
  const lifted = focused || hasValue || placeholder

  const handleChange = (e) => {
    // Only allow alphanumeric characters and spaces
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')

    // Create a new event-like object with the sanitized value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitized
      }
    }

    onChange?.(syntheticEvent)
  }

  return (
    <div style={{ position: 'relative', flex: 1, ...style }}>
      {label && (
        <label
          style={{
            position: 'absolute',
            left: prefix ? 44 : 11,
            top: lifted ? -9 : '50%',
            transform: lifted ? 'none' : 'translateY(-50%)',
            fontSize: lifted ? 10 : 13,
            color: focused ? 'var(--blue)' : error ? '#dc2626' : '#6b7280',
            // background: 'var(--app-pages-bg)',
            padding: '0 3px',
            transition: 'all 0.15s ease',
            pointerEvents: 'none',
            zIndex: 1,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1,
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
      >
        {prefix && (
          <div
            style={{
              position: 'absolute',
              left: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 15,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            {prefix}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onlyAlphanumeric ? handleChange : onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={(e) => {
            setFocused(true)
            onFocusExternal?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlurExternal?.(e)
          }}
          className="wa-input"
          style={{
            width: '100%',
            height: 44,
            paddingLeft: prefix ? 44 : 12,
            paddingRight: suffix ? 36 : 12,
            border: `1px solid ${error ? '#dc2626' : focused ? 'var(--blue)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            fontSize: 13,
            outline: 'none',
            fontFamily: "'DM Sans', sans-serif",
            color: 'var(--text)',
            background:
              readOnly || disabled ? 'var(--surface-2)' : 'var(--app-pages-bg)',
            cursor: readOnly ? 'default' : 'text',
          }}
        />
        {suffix && (
          <div
            style={{
              position: 'absolute',
              right: 10,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p
          style={{
            fontSize: 11,
            color: '#dc2626',
            margin: '3px 0 0',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}


// ─── Floating Label Select ────────────────────────────────────────────────────
export const FloatingSelect = ({
  label,
  value,
  onChange,
  options,
  disabled,
  style = {},
}) => {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative', flex: 1, ...style }}>
      {label && (
        <label
          style={{
            position: 'absolute',
            left: 11,
            top: -9,
            fontSize: 10,
            color: focused ? 'var(--blue)' : '#6b7280',
            background: 'var(--app-pages-bg)',
            padding: '0 3px',
            zIndex: 1,
            fontFamily: "'DM Sans', sans-serif",
            pointerEvents: 'none',
            lineHeight: 1,
            transition: 'color 0.15s',
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="wa-input"
        style={{
          width: '100%',
          height: 44,
          padding: '0 32px 0 12px',
          border: `1px solid ${focused ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          fontSize: 13,
          outline: 'none',
          fontFamily: "'DM Sans', sans-serif",
          color: 'var(--text)',
          background: disabled ? 'var(--surface-2)' : 'var(--app-pages-bg)',
          appearance: 'none',
          cursor: disabled ? 'default' : 'pointer',
          ...style,
        }}
      >
        {options.map((opt) => {
          const v = typeof opt === 'string' ? opt : opt.value
          const l = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={v} value={v}>
              {l}
            </option>
          )
        })}
      </select>
      {/* <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                <ChevronDownIcon />
            </div> */}
    </div>
  )
}

// ─── Textarea (forwardRef so BodyToolbar can read/set cursor position) ──────────
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
          className="wa-input"
          style={{
            width: '100%',
            minHeight,
            padding: 12,
            resize: 'vertical',
            border: `1px solid ${error ? '#dc2626' : focused ? 'var(--blue)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            fontSize: 13,
            outline: 'none',
            fontFamily: "'DM Sans', sans-serif",
            color: 'var(--text)',
            lineHeight: 1.55,
            background: 'var(--app-pages-bg)',
          }}
        />
        {toolbar && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 2,
              marginTop: 4,
            }}
          >
            {toolbar}
          </div>
        )}
        {error && (
          <p
            style={{
              fontSize: 11,
              color: '#dc2626',
              margin: '3px 0 0',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
FloatingTextarea.displayName = 'FloatingTextarea'

// ─── FormField wrapper ────────────────────────────────────────────────────────
export const FormField = ({
  label,
  description,
  optional,
  children,
  tooltip,
  style = {},
}) => (
  <div
    className="bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]"
    style={{ marginBottom: 20, ...style }}
  >
    {label && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginBottom: 3,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {label}
          {optional && (
            <span
              style={{
                fontWeight: 400,
                color: 'var(--text-muted)',
                marginLeft: 4,
              }}
            >
              (Optional)
            </span>
          )}
        </span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <InfoIcon size={13} color="var(--text-light)" />
          </Tooltip>
        )}
      </div>
    )}
    {description && (
      <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          margin: '0 0 8px',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    )}
    {children}
  </div>
)

// ─── Tab Group (pill style like Custom / Product / Carousel) ──────────────────
export const TabGroup = ({ tabs, value, onChange }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {tabs.map((tab) => {
      const active = value === tab.value
      return (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`wa-tab-btn${active ? ' active' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            border: `1.5px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
            background: active ? 'var(--blue-light)' : 'var(--app-pages-bg)',
            color: active ? 'var(--blue)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
          }}
        >
          {tab.label}
          {tab.info && (
            <Tooltip content={tab.info}>
              <InfoIcon
                size={11}
                color={active ? 'var(--blue)' : 'var(--text-light)'}
              />
            </Tooltip>
          )}
        </button>
      )
    })}
  </div>
)

// ─── Dropdown (custom, for Add Button menu) ───────────────────────────────────
export const DropdownMenu = ({ trigger, children }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className="wa-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            background: 'var(--app-pages-bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 500,
            minWidth: 220,
            overflow: 'hidden',
          }}
        >
          {React.Children.map(children, (child) =>
            React.cloneElement(child, { onClose: () => setOpen(false) })
          )}
        </div>
      )}
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
export const Skeleton = ({ width = '100%', height = 20, style = {} }) => (
  <div className="wa-skeleton" style={{ width, height, ...style }} />
)

// ─── Section Divider ──────────────────────────────────────────────────────────
export const Divider = ({ style = {} }) => (
  <div
    style={{
      height: 1,
      background: 'var(--border)',
      margin: '20px 0',
      ...style,
    }}
  />
)

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({
  children,
  color = 'var(--blue)',
  bg = 'var(--blue-light)',
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 7px',
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 600,
      color,
      background: bg,
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    {children}
  </span>
)
