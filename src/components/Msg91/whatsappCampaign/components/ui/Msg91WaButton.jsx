import React from 'react'

/**
 * Button
 * Props:
 *   variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 *   size: 'sm' | 'md'
 *   icon: ReactNode — prepended icon
 *   onClick, disabled, style, children
 */

const VARIANTS = {
    primary: {
        background: '#1a73e8',
        color: '#fff',
        border: 'none',
    },
    secondary: {
        background: '#fff',
        color: '#1a73e8',
        border: '1px solid #dde1e7',
    },
    ghost: {
        background: '#fff',
        color: '#555',
        border: '1px solid #dde1e7',
    },
    danger: {
        background: '#fff',
        color: '#e53935',
        border: '1px solid #fca5a5',
    },
}

const SIZES = {
    sm: { padding: '5px 10px', fontSize: 12 },
    md: { padding: '7px 14px', fontSize: 13 },
}

const Button = ({
    variant = 'ghost',
    size = 'md',
    icon,
    onClick,
    disabled = false,
    style = {},
    children,
}) => {
    const variantStyles = VARIANTS[variant] || VARIANTS.ghost
    const sizeStyles = SIZES[size] || SIZES.md

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 6,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontFamily: 'inherit',
                transition: 'opacity 0.15s, box-shadow 0.15s',
                opacity: disabled ? 0.5 : 1,
                outline: 'none',
                whiteSpace: 'nowrap',
                ...variantStyles,
                ...sizeStyles,
                ...style,
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
            {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {children}
        </button>
    )
}

export default Button