import React, { useState, useMemo } from 'react'
import { useNavigate, useOutletContext } from '@/components/react-router-dom'
import { useGetTemplateLibraryQuery } from '@/redux/apis/metaWhatsapp.api'
import Button from '../Component/Button'
import LoadingSpinner from '../Component/LoadingSpinner'
import EmptyState from '../Component/EmptyState'
import { SearchIcon } from '../Component/MetaTemplates/ui/WaIcons'
import { ChevronDown, ChevronUp, ExternalLink, ArrowRight, Phone, Copy, Reply, SearchX, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import CreateTemplateJsonModal from '../Component/MetaTemplates/CreateTemplateJsonModal.jsx'

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
──────────────────────────────────────────────────────────────────────────────*/
const CATEGORIES = [
  { id: 'ALL', label: 'All' },
  { id: 'AUTHENTICATION', label: 'Authentication' },
  { id: 'UTILITY', label: 'Utility' },
  { id: 'MARKETING', label: 'Marketing' },
]

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'ar', label: 'Arabic' },
]

/* ─────────────────────────────────────────────────────────────────────────────
   INLINE VARIABLE RENDERER
   Renders body text with green {{N}} spans that show tooltips on hover
──────────────────────────────────────────────────────────────────────────────*/
const VariableText = ({ text, samples = [] }) => {
  if (!text) return null

  // Split text by {{N}} pattern, keeping the delimiters
  const parts = text.split(/(\{\{\d+\}\})/g)

  return (
    <span>
      {parts.map((part, i) => {
        const match = part.match(/^\{\{(\d+)\}\}$/)
        if (match) {
          const varNum = parseInt(match[1], 10)
          const sampleValue = samples[varNum - 1] || null
          if (!sampleValue) {
            return (
              <span key={i} className="font-semibold text-emerald-600 dark:text-emerald-400">
                {part}
              </span>
            )
          }
          return (
            <span key={i} className="inline font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="group-hover:hidden">{part}</span>
              <span className="hidden group-hover:inline font-bold text-emerald-700 dark:text-emerald-300 underline underline-offset-2 decoration-emerald-500/40 transition-all">
                {sampleValue}
              </span>
            </span>
          )
        }
        // Render newlines
        return part.split('\n').map((line, li, arr) => (
          <React.Fragment key={`${i}-${li}`}>
            {line}
            {li < arr.length - 1 && <br />}
          </React.Fragment>
        ))
      })}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   COLLAPSIBLE SIDEBAR SECTION
──────────────────────────────────────────────────────────────────────────────*/
const SidebarSection = ({ title, defaultOpen = false, children, badge }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border/40">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {title}
          </span>
          {badge != null && (
            <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-muted-foreground dark:bg-white/10">
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/60" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 pb-3">{children}</div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   RADIO FILTER ROW — compact radio with label
──────────────────────────────────────────────────────────────────────────────*/
const FilterChip = ({ label, selected, onClick, name }) => {
  return (
    <label
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2.5 py-1.5"
    >
      {/* Custom radio circle */}
      <span
        className={cn(
          'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-all duration-150',
          selected
            ? 'border-blue-500 bg-blue-500'
            : 'border-border/40 bg-card'
        )}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span
        className={cn(
          'text-[13px] transition-colors',
          selected
            ? 'font-semibold text-blue-600 dark:text-blue-400'
            : 'font-normal text-muted-foreground hover:text-foreground'
        )}
      >
        {label}
      </span>
    </label>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TEMPLATE CARD
   Simple, clean card matching MSG91 style — no WhatsApp phone mockup
──────────────────────────────────────────────────────────────────────────────*/
const TemplateCard = ({ tpl, onUse }) => {
  const headerText = tpl.header?.text || ''
  const headerFormat = (tpl.header?.format || tpl.header?.type || 'NONE').toUpperCase()
  const body = tpl.body || ''
  const footer = tpl.footer || ''
  const buttons = tpl.buttons || []
  const samples = tpl.body_params || tpl.bodySamples || []

  const categoryColor = {
    MARKETING: {
      badge: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
    },
    UTILITY: {
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    },
    AUTHENTICATION: {
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
  }

  const colors = categoryColor[tpl.category] || categoryColor.UTILITY

  return (
    <div
      onClick={() => onUse(tpl)}
      className="group flex h-[420px] w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-lg dark:border-slate-700/50 dark:bg-[#12141e]"
    >
      {/* ── Card Header: name + action + badges row ── */}
      <div className="flex shrink-0 flex-col gap-2 border-b border-slate-100/60 px-4 pt-3 pb-2.5 dark:border-slate-800/40">
        {/* Template name & Use Button */}
        <div className="flex items-center justify-between gap-2">
          <p
            className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100"
            title={tpl.name}
          >
            {tpl.name
              ?.replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Untitled'}
          </p>
{/* 
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onUse(tpl)
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-[11.5px] font-medium text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95"
          >
            <span>Use</span>
            <ArrowRight className="h-3 w-3" />
          </button> */}
        </div>

        {/* Badges row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                colors.badge
              )}
            >
              {tpl.category}
            </span>
            {headerFormat !== 'NONE' && headerFormat !== 'TEXT' && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                {headerFormat}
              </span>
            )}
          </div>
          {tpl.language && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {tpl.language}
            </span>
          )}
        </div>
      </div>

      {/* ── WhatsApp preview area ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#efeae2]/80 p-3.5 themed-scrollbar dark:bg-[#0b141a]">
        <div className="flex flex-col rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800/80 dark:bg-[#111b21]">
          {headerText && (
            <h4 className="mb-2 text-[13px] font-bold leading-snug text-slate-900 break-words dark:text-white">
              <VariableText text={headerText} samples={samples} />
            </h4>
          )}

          {body && (
            <div className="text-[11.5px] leading-[1.65] text-slate-700 break-words dark:text-slate-300">
              <VariableText text={body} samples={samples} />
            </div>
          )}

          {footer && (
            <div className="mt-2 text-[10.5px] font-medium text-slate-400 break-words dark:text-slate-500">
              <VariableText text={footer} samples={samples} />
            </div>
          )}

          {buttons.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {buttons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white py-2 px-3 text-center text-[12px] font-semibold text-[#1a73e8] shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#111b21] dark:text-[#53bdeb] dark:hover:bg-slate-800/60"
                >
                  {btn.type === 'URL' ? (
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  ) : btn.type === 'PHONE_NUMBER' || btn.type === 'PHONE' ? (
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                  ) : btn.type === 'COPY_CODE' ? (
                    <Copy className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Reply className="h-3.5 w-3.5 shrink-0 scale-x-[-1]" />
                  )}
                  <span className="truncate">{btn.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   NUMBER SELECTOR — modern redesign
──────────────────────────────────────────────────────────────────────────────*/
const NumberSelector = ({ numbers = [], selectedNumber, onNumberChange }) => {
  const numberList = Array.isArray(numbers) ? numbers : numbers?.data || []
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400">
        <Phone className="h-3.5 w-3.5" />
      </span>
      <select
        value={selectedNumber?._id || ''}
        onChange={(e) => {
          const found = numberList.find((n) => n._id === e.target.value)
          if (found) onNumberChange(found)
        }}
        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-border/40 bg-card pl-8 pr-7 text-[12px] font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 dark:focus:border-blue-500/60"
      >
        <option value="">Select Number</option>
        {numberList?.map((n) => (
          <option key={n?._id} value={n?._id}>
            {n?.phoneNumber}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
        <ChevronDown className="h-3.5 w-3.5" />
      </span>
    </div>
  )
}


/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────────────────*/
export default function MetaTemplateLibraryPage() {
  const navigate = useNavigate()
  const { selectedNumber, whatsappNumbers, setSelectedNumber } =
    useOutletContext()

  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedIndustry, setSelectedIndustry] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  const [editingTemplate, setEditingTemplate] = useState(null)
  const [jsonModalOpen, setJsonModalOpen] = useState(false)

  const { data, isLoading } = useGetTemplateLibraryQuery({
    category: selectedCategory,
    search: searchQuery,
    numberId: selectedNumber?._id || '',
    industry: selectedIndustry,
    language: selectedLanguage,
  })

  const industriesList = useMemo(() => {
    const list = data?.industries || []
    return ['ALL', ...list]
  }, [data])

  const templates = useMemo(() => {
    const rawList = data?.data || []
    return rawList.map((tpl) => {
      const title =
        tpl.title ||
        (tpl.name
          ? tpl.name
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())
          : 'Untitled Template')

      // Normalize header
      let header = { format: 'NONE', text: '', mediaUrl: '' }
      let body = tpl.body || ''
      let footer = tpl.footer || ''
      let buttons = []
      let bodySamples =
        tpl.bodySamples ||
        tpl.sampleVariables?.bodySamples ||
        tpl.body_params ||
        []

      if (tpl.components && Array.isArray(tpl.components)) {
        tpl.components.forEach((comp) => {
          if (comp.type === 'HEADER') {
            header.format = comp.format || 'NONE'
            header.text = comp.text || ''
          } else if (comp.type === 'BODY') {
            body = comp.text || ''
            if (comp.example?.body_text)
              bodySamples = comp.example.body_text[0] || []
          } else if (comp.type === 'FOOTER') {
            footer = comp.text || ''
          } else if (comp.type === 'BUTTONS') {
            buttons = (comp.buttons || []).map((b) => ({
              type: b.type || 'QUICK_REPLY',
              text: b.text || '',
              url: b.url || '',
            }))
          }
        })
      } else {
        if (tpl.header) {
          if (typeof tpl.header === 'string') {
            header = { format: 'TEXT', text: tpl.header, mediaUrl: '' }
          } else if (typeof tpl.header === 'object') {
            header = {
              format: tpl.header.format || tpl.header.type || 'NONE',
              text: tpl.header.text || '',
              mediaUrl: tpl.header.mediaUrl || '',
            }
          }
        }
        buttons = (tpl.buttons || []).map((btn) => {
          if (typeof btn === 'string')
            return { type: 'QUICK_REPLY', text: btn }
          return {
            type: btn.type || 'QUICK_REPLY',
            text: btn.text || '',
            url: btn.url || '',
          }
        })
      }

      return {
        ...tpl,
        title,
        header,
        body,
        footer,
        buttons,
        bodySamples,
      }
    })
  }, [data])

  const handleUseTemplate = (tpl) => {
    const initialFormState = {
      name: (tpl.title || tpl.name || 'template')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .substring(0, 30),
      category: tpl.category,
      marketingType: 'CUSTOM',
      utilityType: 'CUSTOM',
      language: tpl.language || 'en_US',
      body: tpl.body,
      footer: tpl.footer || '',
      header: {
        format: tpl.header?.format || 'NONE',
        text: tpl.header?.text || '',
        mediaUrl: tpl.header?.mediaUrl || '',
      },
      buttons: (tpl.buttons || []).map((b) => ({
        type: b.type,
        text: b.text,
        url: b.url || '',
        phoneNumber: b.phoneNumber || '',
      })),
      bodySamples: tpl.bodySamples || tpl.sampleVariables?.bodySamples || [],
      headerSamples: tpl.headerSamples || tpl.sampleVariables?.headerSamples || [],
    }

    setEditingTemplate(initialFormState)
    setJsonModalOpen(true)
  }

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0c0e14] dark:text-slate-100">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="flex h-full w-60 shrink-0 flex-col overflow-hidden border-r border-border/40 bg-card shadow-sm">
        {/* ── SIDEBAR HEADER ── */}
        <div className="shrink-0 border-b border-border/40 px-4 py-[13.5px]">
          <NumberSelector
            numbers={whatsappNumbers}
            selectedNumber={selectedNumber}
            onNumberChange={setSelectedNumber}
          />
        </div>

        {/* ── SCROLLABLE FILTERS ── */}
        <div className="flex-1 overflow-y-auto">
          {/* ── CATEGORY ── */}
          <div className="border-b border-border/40 px-4 py-2.5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Category
            </p>
            <div className="flex flex-col">
              {CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat.id}
                  label={cat.label}
                  selected={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* ── LANGUAGE ── */}
          <SidebarSection title="Language" defaultOpen={true}>
            <div className="flex flex-col gap-0.5">
              {LANGUAGES.map((lang) => (
                <FilterChip
                  key={lang.id}
                  label={lang.label}
                  selected={selectedLanguage === lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                />
              ))}
            </div>
          </SidebarSection>

          {/* ── INDUSTRY ── */}
          <SidebarSection
            title="Industry"
            badge={industriesList.length > 1 ? industriesList.length - 1 : null}
          >
            <div className="flex flex-col gap-0.5">
              {industriesList.map((ind) => (
                <FilterChip
                  key={ind}
                  label={
                    ind === 'ALL'
                      ? 'All Industries'
                      : ind
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                  }
                  selected={selectedIndustry === ind}
                  onClick={() => setSelectedIndustry(ind)}
                />
              ))}
            </div>
          </SidebarSection>

          {/* ── USE CASES ── */}
          <SidebarSection title="Use Cases">
           <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/[0.07] dark:bg-white/[0.03]">
              <span className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
               Select a category to see related use cases.
              </span>
            </div>
          </SidebarSection>

          {/* ── FEATURE ── */}
          <SidebarSection title="Feature">
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/[0.07] dark:bg-white/[0.03]">
              <span className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
                Feature-based filtering coming soon.
              </span>
            </div>
          </SidebarSection>
        </div>

        {/* ── SIDEBAR FOOTER ── */}
        <div className="shrink-0 border-t border-border/40 px-4 py-[12.5px]">
          <button
            onClick={() => {
              setSelectedCategory('ALL')
              setSelectedIndustry('ALL')
              setSelectedLanguage('en')
            }}
            className="w-full rounded-lg border border-border/40 bg-transparent py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-accent-foreground"
          >
            Reset Filters
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="shrink-0 flex justify-center border-b border-border/40 bg-card px-6 py-3.5">
          <div className="relative w-full max-w-xl">
            <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates…"
              className="h-9 w-full rounded-lg border-2 border-gray-300 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-[#0c0e14]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-20">
              <LoadingSpinner text="Loading template library..." />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/60 p-8 text-center shadow-xs">
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <SearchX className="h-7 w-7 shrink-0" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-foreground">
                No templates found
              </h3>
              <p className="max-w-xs text-[12px] leading-relaxed text-muted-foreground">
                We couldn't find any templates matching your search query or selected filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('ALL')
                  setSelectedIndustry('ALL')
                  setSelectedLanguage('en')
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {templates.map((tpl) => (
                <TemplateCard
                  key={
                    tpl._id ||
                    tpl.libraryId ||
                    tpl.id ||
                    `${tpl.name}_${tpl.language}`
                  }
                  tpl={tpl}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Import Template Modal ── */}
      <CreateTemplateJsonModal
        open={jsonModalOpen}
        onClose={() => {
          setJsonModalOpen(false)
          setEditingTemplate(null)
        }}
        onSave={() => {
          setJsonModalOpen(false)
          setEditingTemplate(null)
        }}
        initialData={editingTemplate}
        numberId={selectedNumber?._id || ''}
      />
    </div>
  )
}
