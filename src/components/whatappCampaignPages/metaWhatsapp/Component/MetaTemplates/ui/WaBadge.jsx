import React from 'react'

/**
 * Badge — generic colored tag
 * Props: color, bg, children, style
 */
export const Badge = ({ color = '#333', bg = '#f0f0f0', children, style = {} }) => (
    <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        color,
        background: bg,
        ...style,
    }}>
        {children}
    </span>
)

/**
 * StatusBadge — shows a dot + label for Enabled/Disabled/Pending
 */
export const StatusBadge = ({ status = 'Enabled' }) => {
    const colors = {
        Enabled: { dot: '#25D366', text: '#25D366', bg: '#f0fdf4' },
        Disabled: { dot: '#e53935', text: '#e53935', bg: '#fff5f5' },
        Pending: { dot: '#f59e0b', text: '#d97706', bg: '#fffbeb' },
    }
    const c = colors[status] || colors.Enabled

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{status}</span>
        </span>
    )
}

/**
 * LanguageTag — shows language with a green dot
 */
export const LanguageTag = ({ lang = 'En', count = 0 }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366', display: 'inline-block' }} />
        <span style={{ fontSize: 12, color: '#333' }}>{lang}</span>
        <span style={{ fontSize: 11, color: '#bbb' }}>{count}</span>
    </span>
)

/**
 * CategoryBadge
 */
export const CategoryBadge = ({ category }) => {
    const colors = {
        MARKETING: { color: '#6d28d9', bg: '#ede9fe' },
        UTILITY: { color: '#0369a1', bg: '#e0f2fe' },
        AUTHENTICATION: { color: '#065f46', bg: '#d1fae5' },
    }
    const c = colors[category] || { color: '#555', bg: '#f0f0f0' }
    return <Badge color={c.color} bg={c.bg}>{category}</Badge>
}
