import React, { useEffect } from 'react'
import { CloseIcon } from './WaIcons'

/**
 * Modal
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   title: string
 *   width: number | string (default 900)
 *   footer: ReactNode
 *   children: ReactNode
 */
const Modal = ({ open, onClose, title, width = 900, footer, children }) => {
    // Close on Escape key
    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 12,
                    width: '100%',
                    maxWidth: width,
                    maxHeight: '92vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e8eaed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none', background: 'none', cursor: 'pointer',
                            color: '#aaa', padding: 4, borderRadius: 4,
                            display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        padding: '12px 20px',
                        borderTop: '1px solid #e8eaed',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 10,
                        flexShrink: 0,
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Modal
