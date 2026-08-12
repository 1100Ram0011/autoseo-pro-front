import React, { useEffect, useRef } from 'react'
import { DotsIcon } from './WaIcons'

/**
 * DropdownMenu
 * Props:
 *   items: Array<{ label: string, onClick: () => void, danger?: boolean }>
 *   align: 'left' | 'right' (default 'right')
 */
const DropdownMenu = ({ items = [], align = 'right' }) => {
    const [open, setOpen] = React.useState(false)
    const ref = useRef(null)

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: '#aaa', padding: '2px 4px', borderRadius: 4,
                    display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
                <DotsIcon />
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    [align === 'right' ? 'right' : 'left']: 0,
                    top: '100%',
                    marginTop: 4,
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    zIndex: 200,
                    minWidth: 130,
                    overflow: 'hidden',
                }}>
                    {items.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => { item.onClick(); setOpen(false) }}
                            style={{
                                width: '100%',
                                padding: '9px 14px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 12,
                                fontFamily: 'inherit',
                                color: item.danger ? '#e53935' : '#333',
                                display: 'block',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DropdownMenu
