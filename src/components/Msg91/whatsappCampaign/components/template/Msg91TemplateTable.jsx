import React, { useState, useRef, useEffect, useCallback } from 'react'
import { CopyIcon, DotsIcon } from '../ui/Msg91WaIcons'
import { Skeleton } from '../ui/Msg91WaBaseUI'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getBodyText = (t) => {
    const raw = t._raw || {}
    if (raw.body) return raw.body
    const bodyComp = Array.isArray(raw._msg91Components)
        ? raw._msg91Components.find(c => (c.type || '').toUpperCase() === '')
        : null
    return bodyComp?.text || ''
}

/**
 * Parse text into segments: plain | variable {{n}} | url
 */
const parseBodySegments = (text) => {
    if (!text) return []
    const regex = /(\{\{[\d]+\}\})|(https?:\/\/[^\s]+)/g
    const segments = []
    let lastIndex = 0
    let match
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
        }
        if (match[1]) segments.push({ type: 'variable', value: match[1] })
        else if (match[2]) segments.push({ type: 'url', value: match[2] })
        lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) {
        segments.push({ type: 'text', value: text.slice(lastIndex) })
    }
    return segments
}

// ─── Highlighted body text ────────────────────────────────────────────────────
const HighlightedBody = ({ text, className: extraClass = '' }) => {
    const segments = parseBodySegments(text)
    return (
        <p className={`m-0 ${extraClass}`}>
            {segments.map((seg, i) => {
                if (seg.type === 'variable') {
                    return (
                        <span key={i} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded px-1.5 py-px font-bold border border-amber-200 dark:border-amber-700 text-[inherit] font-[inherit] inline tracking-normal">
                            {seg.value}
                        </span>
                    )
                }
                if (seg.type === 'url') {
                    return (
                        <span key={i} className="text-blue-700 dark:text-blue-400 underline break-all cursor-pointer text-[inherit] font-[inherit]">
                            {seg.value}
                        </span>
                    )
                }
                return <span key={i}>{seg.value}</span>
            })}
        </p>
    )
}

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusDot = ({ status }) => {
    const cfgMap = {
        Enabled:   { dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/40' },
        Disabled:  { dot: 'bg-red-500',    text: 'text-red-700 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-950/30' },
        Pending:   { dot: 'bg-amber-500',  text: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/30' },
        Approved:  { dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/40' },
        Rejected:  { dot: 'bg-red-500',    text: 'text-red-700 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-950/30' },
        Submitted: { dot: 'bg-blue-500',   text: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/30' },
        Draft:     { dot: 'bg-gray-400',   text: 'text-gray-500 dark:text-zinc-400',    bg: 'bg-gray-50 dark:bg-zinc-800' },
    }
    const cfg = cfgMap[status] || cfgMap.Draft

    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${cfg.text} ${cfg.bg} px-2 py-0.5 rounded-full font-['DM_Sans',sans-serif]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block shrink-0`} />
            {status}
        </span>
    )
}

// ─── Category badge ───────────────────────────────────────────────────────────
const CatBadge = ({ cat }) => {
    const cfgMap = {
        MARKETING:      { bg: 'bg-violet-100 dark:bg-violet-950/40', text: 'text-violet-800 dark:text-violet-300' },
        UTILITY:        { bg: 'bg-blue-100 dark:bg-blue-950/40',     text: 'text-blue-800 dark:text-blue-300' },
        AUTHENTICATION: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300' },
    }
    const cfg = cfgMap[cat] || { bg: 'bg-gray-100 dark:bg-zinc-700', text: 'text-gray-700 dark:text-zinc-300' }

    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold font-['DM_Sans',sans-serif] ${cfg.bg} ${cfg.text}`}>
            {cat}
        </span>
    )
}

// ─── Copy button ──────────────────────────────────────────────────────────────
const CopyBtn = ({ text }) => {
    const [copied, setCopied] = useState(false)
    const handle = (e) => {
        e.stopPropagation()
        navigator.clipboard?.writeText(text).catch(() => { })
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <button
            type="button"
            onClick={handle}
            title={copied ? 'Copied!' : 'Copy name'}
            className={`border-none bg-none cursor-pointer p-0.5 rounded flex items-center transition-colors shrink-0 ${copied ? 'text-green-500' : 'text-gray-400 dark:text-zinc-500'}`}
        >
            <CopyIcon size={12} color="currentColor" />
        </button>
    )
}

// ─── Row actions dropdown ─────────────────────────────────────────────────────
const RowActions = ({ onEdit, onDuplicate, onDelete }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [open])

    const items = [
        { label: 'Delete', onClick: onDelete, danger: true },
    ]

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
                className="border-none bg-none cursor-pointer text-gray-400 dark:text-zinc-500 p-1 rounded flex items-center hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                title="More actions"
            >
                <DotsIcon size={16} />
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+3px)] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg dark:shadow-zinc-900/40 z-[300] min-w-[130px] overflow-hidden">
                    {items.map((item, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); item.onClick?.(); setOpen(false) }}
                            className={`w-full px-3.5 py-2 border-none bg-none text-left cursor-pointer text-xs font-['DM_Sans',sans-serif] hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors ${item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-zinc-100'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Media placeholder ────────────────────────────────────────────────────────
const MediaPlaceholder = ({ type }) => {
    const icons = {
        IMAGE: (
            <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        ),
        VIDEO: (
            <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
        ),
        DOCUMENT: (
            <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
    }
    const labels = { IMAGE: 'Image', VIDEO: 'Video', DOCUMENT: 'Document' }
    return (
        <div className="w-full h-[120px] bg-gray-200 dark:bg-zinc-700 flex flex-col items-center justify-center gap-1.5 text-gray-400 dark:text-zinc-500">
            {icons[type]}
            <span className="text-[10px] font-sans">
                {labels[type] || type}
            </span>
        </div>
    )
}

// ─── Button icon ──────────────────────────────────────────────────────────────
const BtnIcon = ({ type }) => {
    if (type === 'URL') return (
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    )
    if (type === 'PHONE') return (
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    )
    return (
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    )
}

// ─── WhatsApp message bubble ──────────────────────────────────────────────────
const WaBubble = ({ template, cHeader, cBody, cFooter, cButtons, widthClass = "max-w-[268px]" }) => {
    const raw = template?._raw || {}
    const header = cHeader !== undefined ? cHeader : (raw.header || null)
    const body = cBody !== undefined ? cBody : (template ? getBodyText(template) : '')
    const footer = cFooter !== undefined ? cFooter : (raw.footer || '')
    const buttons = cButtons !== undefined ? cButtons : (Array.isArray(raw.buttons) ? raw.buttons : [])

    return (
        <div className={`bg-white dark:bg-zinc-800 rounded-[10px_10px_10px_2px] overflow-hidden w-full ${widthClass} self-start border border-black/[0.07] dark:border-zinc-700 shadow-sm shrink-0`}>
            {/* Header text */}
            {header?.type === 'TEXT' && header.text && (
                <div className="px-2.5 pt-2 pb-1 border-b border-gray-100 dark:border-zinc-700">
                    <HighlightedBody
                        text={header.text}
                        className="font-bold text-[12.5px] leading-[1.4] text-gray-900 dark:text-zinc-100 font-['Helvetica_Neue',Arial,sans-serif]"
                    />
                </div>
            )}

            {/* Header media */}
            {header?.type && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.type) && (
                <MediaPlaceholder type={header.type} />
            )}

            {/* Body */}
            {body ? (
                <div className="px-2.5 pt-[7px] pb-1">
                    <HighlightedBody
                        text={body}
                        className="text-xs text-gray-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap break-words font-['Helvetica_Neue',Arial,sans-serif]"
                    />
                </div>
            ) : null}

            {/* Footer */}
            {footer && (
                <div className="px-2.5 py-1 text-[10.5px] text-gray-400 dark:text-zinc-500 font-['Helvetica_Neue',Arial,sans-serif]">
                    {footer}
                </div>
            )}

            {/* Timestamp */}
            <div className="text-right px-2.5 pb-1.5 text-[10px] text-gray-300 dark:text-zinc-600 font-['Helvetica_Neue',Arial,sans-serif]">
                12:30 PM ✓✓
            </div>

            {/* Buttons */}
            {buttons.length > 0 && (
                <div className="border-t border-gray-200 dark:border-zinc-700">
                    {buttons.map((btn, i) => (
                        <div key={i} className={`flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs text-blue-600 dark:text-blue-400 font-medium font-['Helvetica_Neue',Arial,sans-serif] ${i < buttons.length - 1 ? 'border-b border-gray-200 dark:border-zinc-700' : ''}`}>
                            <BtnIcon type={btn.type} />
                            {btn.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Language Preview Popup ───────────────────────────────────────────────────
const LangPreviewPopup = ({ template, onClose }) => {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    const body = getBodyText(template)
    const variables = body.match(/\{\{[\d]+\}\}/g) || []
    const links = body.match(/https?:\/\/[^\s]+/g) || []
    const hasAnnotations = variables.length > 0 || links.length > 0
    const carouselCards = template.carouselCards || template._raw?.carouselCards || [];
    const isCarousel = template.marketingType === 'Carousel' || template._raw?.marketingType === 'Carousel' || carouselCards.length > 0;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[999] backdrop-blur-sm"
                style={{ animation: 'waFadeIn 0.15s ease' }}
            />

            {/* Popup */}
            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${isCarousel ? 'w-[90vw] md:w-[600px]' : 'w-80'}`}
                style={{ animation: 'waPopIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <style>{`
                    @keyframes waFadeIn { from{opacity:0} to{opacity:1} }
                    @keyframes waPopIn {
                        from { opacity:0; transform:translate(-50%,-50%) scale(0.86) }
                        to   { opacity:1; transform:translate(-50%,-50%) scale(1) }
                    }
                `}</style>

                {/* WA header bar */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#075e54] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#128c7e] flex items-center justify-center text-[15px] font-bold text-white font-sans uppercase shrink-0">
                            {template.name?.[0] || 'W'}
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-white m-0 font-sans max-w-[178px] overflow-hidden text-ellipsis whitespace-nowrap">
                                {template.name?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[10px] text-[#b2dfdb] m-0 font-sans">
                                WhatsApp Business
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="border-none bg-white/[0.18] hover:bg-white/30 cursor-pointer rounded-full w-7 h-7 flex items-center justify-center text-white text-lg leading-none shrink-0 transition-colors"
                        title="Close (Esc)"
                    >
                        ×
                    </button>
                </div>

                {/* Chat bubble area */}
                <div className="bg-[#e5ddd5] dark:bg-zinc-800 p-4 flex flex-col gap-1 overflow-x-auto overflow-y-auto no-scrollbar flex-1">
                    {isCarousel ? (
                        <div className="flex flex-col gap-2">
                            {body && (
                                <WaBubble cBody={body} cFooter={template._raw?.footer || template.footer} />
                            )}
                            <div className="flex gap-2 overflow-x-auto snap-x pb-2">
                                {carouselCards.map((card, i) => (
                                    <WaBubble 
                                        key={i}
                                        cHeader={card.header} 
                                        cBody={card.body} 
                                        cButtons={card.buttons} 
                                        widthClass="w-[240px]"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <WaBubble template={template} />
                    )}
                </div>

                {/* Legend */}
                {hasAnnotations && (
                    <div className="bg-white dark:bg-zinc-900 px-3.5 py-2 border-t border-gray-100 dark:border-zinc-700 flex gap-4 flex-wrap items-center">
                        {variables.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-['DM_Sans',sans-serif] text-gray-500 dark:text-zinc-400">
                                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 rounded px-1.5 py-px font-bold text-[11px]">
                                    {`{{n}}`}
                                </span>
                                {variables.length} variable{variables.length !== 1 ? 's' : ''}
                            </div>
                        )}
                        {links.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-['DM_Sans',sans-serif] text-gray-500 dark:text-zinc-400">
                                <span className="text-blue-700 dark:text-blue-400 underline text-[11px]">
                                    link
                                </span>
                                {links.length} link{links.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <tr className="border-b border-gray-100 dark:border-zinc-700">
        {[160, 90, 60, 200, 80, 40].map((w, i) => (
            <td key={i} className="px-4 py-3">
                <Skeleton width={w} height={13} />
            </td>
        ))}
    </tr>
)

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onCreateClick }) => (
    <tr>
        <td colSpan={6} className="px-5 py-16 text-center">
            <div className="flex flex-col items-center gap-2.5">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-300 dark:text-zinc-600">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <p className="text-[13px] text-gray-400 dark:text-zinc-500 m-0 font-['DM_Sans',sans-serif]">
                    No templates found
                </p>
                <button
                    type="button"
                    onClick={onCreateClick}
                    className="text-xs text-blue-600 dark:text-blue-400 border-none bg-none cursor-pointer font-medium font-['DM_Sans',sans-serif]"
                >
                    Create your first template →
                </button>
            </div>
        </td>
    </tr>
)

// ─── Table Row ────────────────────────────────────────────────────────────────
const TableRow = ({ t, even, onEdit, onDelete, onDuplicate, onLangClick }) => {
    const [hov, setHov] = useState(false)
    const bodyText = getBodyText(t)

    return (
        <tr
            className={`border-b border-gray-100 dark:border-zinc-700 transition-colors cursor-default border-l-[2.5px] border-l-transparent ${hov ? 'bg-blue-50/60 dark:bg-blue-950/20' : even ? 'bg-white dark:bg-zinc-800' : 'bg-gray-50/50 dark:bg-zinc-900/50'}`}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {/* Name */}
            <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-zinc-100">
                <div className="flex items-center gap-1 max-w-[180px]">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {t.name}
                    </span>
                    <CopyBtn text={t.name} />
                </div>
            </td>

            {/* Category */}
            <td className="px-4 py-2.5">
                <CatBadge cat={t.category} />
            </td>

            {/* Language — clickable eye icon opens popup */}
            <td className="px-4 py-2.5">
                <span
                    onClick={() => onLangClick(t)}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-900 dark:text-zinc-100 cursor-pointer px-[7px] py-0.5 rounded-md transition-all select-none border border-transparent hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800"
                    title="Preview template"
                >
                    <span className="w-[7px] h-[7px] rounded-full bg-green-500 inline-block shrink-0" />
                    {t.language}
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="shrink-0 text-blue-300 dark:text-blue-600">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </span>
            </td>

            {/* Body preview */}
            <td className="px-4 py-2.5 max-w-[220px]">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 dark:text-zinc-400 text-xs max-w-[200px] font-['DM_Sans',sans-serif]" title={bodyText}>
                    {bodyText || '—'}
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-2.5">
                <StatusDot status={t.status} />
            </td>

            {/* Actions */}
            <td className="px-4 py-2.5">
                <RowActions
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                />
            </td>
        </tr>
    )
}

// ─── Main Table ───────────────────────────────────────────────────────────────
const TemplateMobileCard = ({ t, onEdit, onDelete, onDuplicate, onLangClick }) => {
    const bodyText = getBodyText(t)

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                            {t.name}
                        </p>
                        <CopyBtn text={t.name} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <CatBadge cat={t.category} />
                        <StatusDot status={t.status} />
                    </div>
                </div>
                <RowActions
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                />
            </div>

            <button
                type="button"
                onClick={() => onLangClick(t)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {t.language}
            </button>

            <p className="mt-3 line-clamp-3 break-words text-xs leading-relaxed text-gray-500 dark:text-zinc-400">
                {bodyText || 'No body content'}
            </p>
        </div>
    )
}

const Msg91TemplateTable = ({ templates, loading, onEdit, onDelete, onDuplicate, onCreateClick }) => {
    const [langPopupTemplate, setLangPopupTemplate] = useState(null)

    const handleLangClick = useCallback((t) => setLangPopupTemplate(t), [])
    const closeLangPopup = useCallback(() => setLangPopupTemplate(null), [])

    const headers = ['Name', 'Category', 'Language', 'Body', 'Status', 'Actions']

    return (
        <>
            {langPopupTemplate && (
                <LangPreviewPopup
                    template={langPopupTemplate}
                    onClose={closeLangPopup}
                />
            )}

            <div className="min-h-80 dark:bg-zinc-800 md:hidden">
                <div className="space-y-3 p-3">
                    {loading &&
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                <Skeleton width="70%" height={14} />
                                <div className="mt-3 flex gap-2">
                                    <Skeleton width={74} height={20} />
                                    <Skeleton width={84} height={20} />
                                </div>
                                <Skeleton width="100%" height={12} style={{ marginTop: 14 }} />
                            </div>
                        ))}

                    {!loading &&
                        templates?.length > 0 &&
                        templates.map((t) => (
                            <TemplateMobileCard
                                key={t.id}
                                t={t}
                                onEdit={() => onEdit(t)}
                                onDelete={() => onDelete(t)}
                                onDuplicate={() => onDuplicate(t)}
                                onLangClick={handleLangClick}
                            />
                        ))}

                    {!loading && (!templates || templates.length === 0) && (
                        <div className="rounded-xl border border-gray-200 bg-white py-10 text-center dark:border-zinc-700 dark:bg-zinc-800">
                            <p className="text-[13px] text-gray-400 dark:text-zinc-500">
                                No templates found
                            </p>
                            <button
                                type="button"
                                onClick={onCreateClick}
                                className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400"
                            >
                                Create your first template
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className='hidden min-h-80 overflow-y-auto dark:bg-zinc-800 sm:max-h-[50vh] md:block no-scrollbar'>
                <div className="touch-pan-x overflow-x-auto [-webkit-overflow-scrolling:touch]">
                <table className="w-full min-w-[760px] border-collapse text-xs font-['DM_Sans',sans-serif] ">
                    <thead>
                        <tr className="bg-[var(--app-pages-bg)] border  border-[var(--app-pages-border)] ">
                            {headers.map(h => (
                                <th key={h} className="px-4 py-2.5 text-left font-semibold text-[var(--app-pages-subhead-text)] text-[11px] whitespace-nowrap select-none tracking-wide">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                            : templates?.length > 0
                            && templates?.map((t, i) => (
                                <TableRow
                                    key={t.id}
                                    t={t}
                                    even={i % 2 === 0}
                                    onEdit={() => onEdit(t)}
                                    onDelete={() => onDelete(t)}
                                    onDuplicate={() => onDuplicate(t)}
                                    onLangClick={handleLangClick}
                                />
                            ))
                        }
                    </tbody>
                </table>
                </div>
            </div>
        </>
    )
}

export default Msg91TemplateTable
