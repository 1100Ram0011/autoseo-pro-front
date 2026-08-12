import React, { useState, useRef, useEffect, useCallback } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BoldIcon, ItalicIcon, StrikeIcon, EmojiIcon, PlusIcon, InfoIcon } from './WaIcons'
import { Tooltip } from './WaBaseUI'

// ─── Toolbar icon button ──────────────────────────────────────────────────────
const ToolbarBtn = ({ icon, title, onClick, active }) => (
    <Tooltip content={title}>
        <button
            type="button"
            onClick={onClick}
            style={{
                border: 'none',
                background: active ? 'var(--blue-light)' : 'none',
                cursor: 'pointer',
                color: active ? 'var(--blue)' : 'var(--text-muted)',
                padding: '4px 6px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.13s, color 0.13s',
            }}
            onMouseEnter={e => {
                if (!active) {
                    e.currentTarget.style.background = '#f0f2f5'
                    e.currentTarget.style.color = 'var(--text)'
                }
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = 'var(--text-muted)'
                }
            }}
        >
            {icon}
        </button>
    </Tooltip>
)

// ─── Emoji Picker Portal ──────────────────────────────────────────────────────
const EmojiPickerPortal = ({ anchorRef, onSelect, onClose }) => {
    const pickerRef = useRef(null)

    // Position the picker above (or below) the anchor button
    const [pos, setPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (!anchorRef.current) return
        const rect = anchorRef.current.getBoundingClientRect()
        const pickerH = 400
        const pickerW = 352
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top

        const top = spaceAbove >= pickerH
            ? rect.top + window.scrollY - pickerH - 6
            : rect.bottom + window.scrollY + 6

        let left = rect.left + window.scrollX
        // Keep in viewport
        if (left + pickerW > window.innerWidth) left = window.innerWidth - pickerW - 8

        setPos({ top, left })
    }, [anchorRef])

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (
                pickerRef.current && !pickerRef.current.contains(e.target) &&
                anchorRef.current && !anchorRef.current.contains(e.target)
            ) {
                onClose()
            }
        }
        // Slight delay so the open-click doesn't immediately close
        const t = setTimeout(() => document.addEventListener('mousedown', handler), 80)
        return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
    }, [onClose, anchorRef])

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <div
            ref={pickerRef}
            style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                zIndex: 9999,
                borderRadius: 12,
                boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                animation: 'waFadeIn 0.15s ease',
            }}
        >
            <Picker
                data={data}
                onEmojiSelect={(emoji) => {
                    onSelect(emoji.native)
                    onClose()
                }}
                theme="light"
                previewPosition="none"
                skinTonePosition="search"
                maxFrequentRows={2}
                perLine={8}
            />
        </div>
    )
}

// ─── Wrap selection helper ────────────────────────────────────────────────────
// Inserts text at cursor or wraps selection in the referenced textarea
const insertAtCursor = (textareaRef, wrapper, value, onChange) => {
    const el = textareaRef?.current
    if (!el) {
        // fallback: append
        onChange(value + wrapper)
        return
    }

    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const selected = value.slice(start, end)

    let newText, newCursor

    if (wrapper.includes('text')) {
        // e.g. '*text*' — replace placeholder with selection or 'text'
        const inner = selected || 'text'
        const [pre, post] = wrapper.split('text')
        newText = value.slice(0, start) + pre + inner + post + value.slice(end)
        newCursor = start + pre.length + inner.length + post.length
    } else {
        // plain insert (emoji, variable)
        newText = value.slice(0, start) + wrapper + value.slice(end)
        newCursor = start + wrapper.length
    }

    onChange(newText)

    // Restore cursor after React re-render
    requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(newCursor, newCursor)
    })
}

// ─── Main BodyToolbar ─────────────────────────────────────────────────────────
/**
 * BodyToolbar
 *
 * Props:
 *   value        — current textarea string value
 *   onChange     — (newValue: string) => void
 *   textareaRef  — React ref pointing at the <textarea> DOM element
 *   showInfo     — show the ⓘ info tooltip next to Add Variable
 *   nextIndex    — The next global variable index to insert
 */
const BodyToolbar = ({ value = '', onChange, textareaRef, showInfo, nextIndex }) => {
    const [emojiOpen, setEmojiOpen] = useState(false)
    const emojiAnchorRef = useRef(null)

    const insert = useCallback((wrapper) => {
        insertAtCursor(textareaRef, wrapper, value, onChange)
    }, [textareaRef, value, onChange])

    const handleEmojiSelect = useCallback((native) => {
        insertAtCursor(textareaRef, native, value, onChange)
    }, [textareaRef, value, onChange])

    const toggleEmoji = (e) => {
        e.stopPropagation()
        setEmojiOpen(o => !o)
    }

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>

                {/* Emoji */}
                <span ref={emojiAnchorRef} style={{ display: 'inline-flex' }}>
                    <ToolbarBtn
                        icon={<EmojiIcon size={14} />}
                        title="Insert emoji"
                        onClick={toggleEmoji}
                        active={emojiOpen}
                    />
                </span>

                {/* Bold */}
                <ToolbarBtn
                    icon={<BoldIcon size={14} />}
                    title="Bold — *text*"
                    onClick={() => insert('*text*')}
                />

                {/* Italic */}
                <ToolbarBtn
                    icon={<ItalicIcon size={14} />}
                    title="Italic — _text_"
                    onClick={() => insert('_text_')}
                />

                {/* Strikethrough */}
                <ToolbarBtn
                    icon={<StrikeIcon size={14} />}
                    title="Strikethrough — ~text~"
                    onClick={() => insert('~text~')}
                />

                {/* Monospace */}
                <ToolbarBtn
                    icon={
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="4" y1="9" x2="20" y2="9" />
                            <line x1="4" y1="15" x2="20" y2="15" />
                            <line x1="10" y1="3" x2="8" y2="21" />
                            <line x1="16" y1="3" x2="14" y2="21" />
                        </svg>
                    }
                    title="Monospace — `text`"
                    onClick={() => insert('`text`')}
                />

                {/* Divider */}
                <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 6px', flexShrink: 0 }} />

                {/* Add Variable */}
                <button
                    type="button"
                    onClick={() => {
                        insert(`{{${nextIndex}}}`);
                    }}

                    style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: 'var(--blue)', fontSize: 12, fontWeight: 500,
                        padding: '4px 6px', borderRadius: 4,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'background 0.13s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                    <PlusIcon size={12} />
                    Add Variable
                </button>

                {/* Info */}
                {showInfo && (
                    <Tooltip content="Variables like {{1}} are replaced with dynamic values when sending">
                        <button
                            type="button"
                            style={{
                                border: 'none', background: 'none', cursor: 'pointer',
                                color: 'var(--text-light)', padding: '4px 3px',
                                display: 'flex', alignItems: 'center',
                            }}
                        >
                            <InfoIcon size={13} />
                        </button>
                    </Tooltip>
                )}
            </div>

            {/* Emoji picker rendered via fixed positioning */}
            {emojiOpen && (
                <EmojiPickerPortal
                    anchorRef={emojiAnchorRef}
                    onSelect={handleEmojiSelect}
                    onClose={() => setEmojiOpen(false)}
                />
            )}
        </>
    )
}

export default BodyToolbar
