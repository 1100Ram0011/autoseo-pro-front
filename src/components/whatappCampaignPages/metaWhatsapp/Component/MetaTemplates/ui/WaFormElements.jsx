import React, { useState } from 'react'

const baseInputStyle = {
    height: 38,
    padding: '0 12px',
    border: '1px solid #dde1e7',
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    color: '#333',
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
}

/**
 * Input
 * Props: label, placeholder, value, onChange, type, style, error
 */
export const Input = ({ label, placeholder, value, onChange, type = 'text', style = {}, error }) => {
    const [focused, setFocused] = useState(false)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
            {label && (
                <label style={{ fontSize: 11, fontWeight: 600, color: '#5f6368' }}>{label}</label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    ...baseInputStyle,
                    borderColor: error ? '#e53935' : focused ? '#1a73e8' : '#dde1e7',
                    boxShadow: focused ? '0 0 0 3px rgba(26,115,232,0.1)' : 'none',
                }}
            />
            {error && <span style={{ fontSize: 11, color: '#e53935' }}>{error}</span>}
        </div>
    )
}

/**
 * Textarea
 * Props: label, placeholder, value, onChange, minHeight, style, toolbar
 */
export const Textarea = ({ label, description, placeholder, value, onChange, minHeight = 100, style = {}, toolbar }) => {
    const [focused, setFocused] = useState(false)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
            {label && (
                <label style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                    {label}
                </label>
            )}
            {description && (
                <p style={{ fontSize: 11, color: '#999', margin: 0 }}>{description}</p>
            )}
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%',
                    minHeight,
                    padding: 12,
                    border: `1px solid ${focused ? '#1a73e8' : '#dde1e7'}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    color: '#333',
                    boxSizing: 'border-box',
                    boxShadow: focused ? '0 0 0 3px rgba(26,115,232,0.1)' : 'none',
                    transition: 'border-color 0.15s',
                }}
            />
            {toolbar && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 2 }}>{toolbar}</div>}
        </div>
    )
}

/**
 * Select
 * Props: label, value, onChange, options (array of strings or {value, label}), style
 */
export const Select = ({ label, value, onChange, options = [], style = {} }) => {
    const [focused, setFocused] = useState(false)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
            {label && (
                <label style={{ fontSize: 11, fontWeight: 600, color: '#5f6368' }}>{label}</label>
            )}
            <select
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    ...baseInputStyle,
                    cursor: 'pointer',
                    borderColor: focused ? '#1a73e8' : '#dde1e7',
                    boxShadow: focused ? '0 0 0 3px rgba(26,115,232,0.1)' : 'none',
                }}
            >
                {options.map(opt => {
                    const val = typeof opt === 'string' ? opt : opt.value
                    const lbl = typeof opt === 'string' ? opt : opt.label
                    return <option key={val} value={val}>{lbl}</option>
                })}
            </select>
        </div>
    )
}

/**
 * FormField — wraps label + description + children
 */
export const FormField = ({ label, description, optional = false, children }) => (
    <div style={{ marginBottom: 20 }}>
        {label && (
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 4 }}>
                {label}{optional && <span style={{ color: '#999', fontWeight: 400 }}> (Optional)</span>}
            </div>
        )}
        {description && (
            <p style={{ fontSize: 11, color: '#999', margin: '0 0 8px' }}>{description}</p>
        )}
        {children}
    </div>
)
