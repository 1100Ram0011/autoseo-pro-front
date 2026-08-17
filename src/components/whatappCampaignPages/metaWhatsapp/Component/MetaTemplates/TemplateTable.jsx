import React, { useState, useRef, useEffect } from 'react'
import { CopyIcon, CodeIcon, DotsIcon } from './ui/WaIcons'
import { Skeleton } from './ui/WaBaseUI'
import EmptyState from '../EmptyState'
import Button from '../Button'
import { Eye, LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Status Dot ───────────────────────────────────────────────────────────────
const STATUS_CFG = {
    Enabled: { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
    Disabled: { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
    Pending: { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
}

const StatusDot = ({ status }) => {
    const cfg = STATUS_CFG[status] || { dot: 'bg-slate-400', text: 'text-slate-600 dark:text-[#9ca3af]' }
    return (
        <span className={cn('inline-flex items-center gap-[5px] text-[12px] font-medium', cfg.text)}>
            <span className={cn('inline-block h-[7px] w-[7px] rounded-full', cfg.dot)} />
            {status}
        </span>
    )
}

// ─── Category Badge ───────────────────────────────────────────────────────────
const CAT_CFG = {
    MARKETING: { bg: 'bg-purple-100 dark:bg-[#2e1065]', text: 'text-purple-800 dark:text-[#c4b5fd]' },
    UTILITY: { bg: 'bg-blue-100 dark:bg-[#172554]', text: 'text-blue-800 dark:text-[#93c5fd]' },
    AUTHENTICATION: { bg: 'bg-emerald-100 dark:bg-[#052e16]', text: 'text-emerald-800 dark:text-[#86efac]' },
}

const CatBadge = ({ cat }) => {
    const cfg = CAT_CFG[cat] || { bg: 'bg-slate-100 dark:bg-[#1f2937]', text: 'text-slate-700 dark:text-[#9ca3af]' }
    return (
        <span className={cn('inline-block rounded-full px-2 py-px text-[11px] font-semibold', cfg.bg, cfg.text)}>
            {cat}
        </span>
    )
}

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────
const RowActions = ({ onEdit, onDuplicate, onDelete, status }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [open])

    const isPending = status === 'Pending'

    const items = [
        { label: 'Edit', onClick: onEdit, disabled: isPending, tooltip: isPending ? 'Pending templates cannot be edited' : undefined },
        { label: 'Duplicate', onClick: onDuplicate },
        { label: 'Delete', onClick: onDelete, danger: true },
    ]

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex cursor-pointer items-center rounded border-none bg-transparent p-[3px_5px] text-slate-400 dark:text-[#6b7280] transition-colors hover:bg-slate-100 dark:hover:bg-[#1f2937] hover:text-slate-800 dark:hover:text-[#e2e8f0]"
            >
                <DotsIcon size={16} />
            </button>
            {open && (
                <div className="absolute right-0 top-[calc(100%+3px)] z-[300] min-w-[130px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10121a] shadow-xl">
                    {items.map((item, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={item.disabled}
                            onClick={() => { 
                                if (item.disabled) return
                                item.onClick?.()
                                setOpen(false) 
                            }}
                            title={item.tooltip}
                            className={cn(
                                'w-full cursor-pointer border-none bg-transparent px-3.5 py-2 text-left text-[12px] transition-colors',
                                item.disabled 
                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                                    : item.danger 
                                        ? 'text-red-600 dark:text-[#f87171] hover:bg-slate-100 dark:hover:bg-slate-800' 
                                        : 'text-slate-700 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-slate-800'
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
const CopyBtn = ({ text }) => {
    const [copied, setCopied] = useState(false)
    const handle = () => {
        navigator.clipboard?.writeText(text).catch(() => { })
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <button
            type="button"
            onClick={handle}
            title={copied ? 'Copied!' : 'Copy'}
            className={cn(
                'flex cursor-pointer items-center rounded border-none bg-transparent p-[2px_3px] transition-colors',
                copied ? 'text-emerald-600 dark:text-[#22c55e]' : 'text-slate-400 dark:text-[#6b7280] hover:text-slate-700 dark:hover:text-[#94a3b8]'
            )}
        >
            <CopyIcon size={12} color="currentColor" />
        </button>
    )
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <tr className="border-b border-slate-200/60 dark:border-white/[0.04]">
        {[180, 90, 80, 50, 40, 70, 40].map((w, i) => (
            <td key={i} className="px-4 py-[13px]">
                <Skeleton width={w} height={14} />
            </td>
        ))}
    </tr>
)

// ─── Empty State ──────────────────────────────────────────────────────────────
const TableEmptyState = ({ onCreateClick }) => (
    <tr>
        <td colSpan={7} className="px-5 py-8">
            <EmptyState
                variant="fancy"
                icon={<LayoutTemplate size={28} className="text-emerald-600 dark:text-emerald-400" />}
                title="No templates found"
                description="Get started by creating your first WhatsApp message template."
                action={
                    <Button
                        variant="primary"
                        label="Create Template"
                        onClick={onCreateClick}
                    />
                }
            />
        </td>
    </tr>
)

// ─── Table Row ────────────────────────────────────────────────────────────────
const TableRow = ({ t, even, onEdit, onDelete, onDuplicate, onViewTemplate }) => (
    <tr className={cn('group border-b border-slate-200/60 dark:border-white/[0.04] transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-[#141720]', even ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-white/[0.01]')}>
        <td className="px-4 py-[11px] font-medium text-slate-900 dark:text-[#e2e8f0]">
            <div className="flex items-center gap-1">
                {t.name}
                <CopyBtn text={t.name} />
            </div>
        </td>
        <td className="px-4 py-[11px]">
            <CatBadge cat={t.category} />
        </td>
        <td className="px-4 py-[11px]">
            <button type='button' onClick={()=>onViewTemplate(t)} className="inline-flex items-center gap-1 text-[12px] text-slate-700 dark:text-[#cbd5e1] hover:text-emerald-600 dark:hover:text-emerald-400">
                <span className="inline-block h-[7px] w-[7px] rounded-full bg-emerald-500" />
                {t.language}
                <span className="text-slate-400 dark:text-[#475569]">
                    <Eye size={12} />
                </span>
            </button>
        </td>
        <td className="px-4 py-[11px]">
            <StatusDot status={t.status} />
        </td>
        <td className="px-4 py-[11px]">
            <RowActions onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} status={t.status} />
        </td>
    </tr>
)

// ─── Main Table ───────────────────────────────────────────────────────────────
const HEADERS = ['Name', 'Category', 'Language', 'Status', 'Actions']

const TemplateTable = ({ templates, loading, onEdit, onDelete, onDuplicate, onCreateClick, onViewTemplate }) => (
    <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[12px]">
            <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.07] bg-slate-100/60 dark:bg-transparent">
                    {HEADERS.map((h) => (
                        <th
                            key={h}
                            className="select-none whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 dark:text-[#64748b]"
                        >
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                    : templates?.length === 0
                        ? <TableEmptyState onCreateClick={onCreateClick} />
                        : templates?.map((t, i) => (
                            <TableRow
                                key={t.id}
                                t={t}
                                even={i % 2 === 0}
                                onEdit={() => onEdit(t)}
                                onDelete={() => onDelete(t)}
                                onDuplicate={() => onDuplicate(t)}
                                onViewTemplate={() => onViewTemplate(t)}
                            />
                        ))
                }
            </tbody>
        </table>
    </div>
)

export default TemplateTable
