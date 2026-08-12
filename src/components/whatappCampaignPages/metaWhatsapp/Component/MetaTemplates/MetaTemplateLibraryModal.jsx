import React, { useState, useMemo } from 'react'
import Modal from '@/ReUseAbleComponents/Modal'
import { useGetTemplateLibraryQuery } from '@/redux/apis/metaWhatsapp.api'
import WhatsAppPreview from './WhatsAppPreview'
import Button from '@/components/whatappCampaignPages/metaWhatsapp/Component/Button'
import LoadingSpinner from '@/components/whatappCampaignPages/metaWhatsapp/Component/LoadingSpinner'
import EmptyState from '@/components/whatappCampaignPages/metaWhatsapp/Component/EmptyState'
import { SearchIcon } from './ui/WaIcons'
import { BookOpen, CheckCircle2, ArrowRight, Sparkles, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Templates' },
  { id: 'MARKETING', label: 'Marketing' },
  { id: 'UTILITY', label: 'Utility' },
  { id: 'AUTHENTICATION', label: 'Authentication' },
]

const TOPICS = [
  { id: 'ALL', label: 'All Topics' },
  { id: 'ECOMMERCE', label: 'E-Commerce & Retail' },
  { id: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
  { id: 'LEAD_GEN', label: 'Lead Generation' },
  { id: 'RESERVATIONS', label: 'Bookings & Reservations' },
  { id: 'SECURITY', label: 'Security & Auth' },
]

export default function MetaTemplateLibraryModal({
  open,
  onClose,
  onSelectTemplate,
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedTopic, setSelectedTopic] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useGetTemplateLibraryQuery({
    category: selectedCategory,
    topic: selectedTopic,
    search: searchQuery,
  })

  const templates = useMemo(() => data?.data || [], [data])

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-6xl w-full">
      <div className="flex flex-col h-[85vh] bg-slate-50 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-200 rounded-xl overflow-hidden">
        {/* ── Modal Header (consistent close button & structure) ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Meta Official Template Library
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Browse official Meta templates and import them to your setup with one click.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-base leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            ✖
          </button>
        </div>

        {/* ── Filter Bar (Premium Styling replicating Connection Banners & Panels) ── */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-6 py-2.5 dark:border-white/[0.07] dark:bg-[#10121a]">
          {/* Category Selector Tab Group */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  'rounded-md px-3 py-1 text-[11px] font-semibold transition-all duration-200',
                  selectedCategory === tab.id
                    ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Topic Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-48">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-3 w-3 dark:text-[#6b7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-7 pr-2.5 text-[11px] outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 transition-all duration-150 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            <div className="relative flex items-center">
              <SlidersHorizontal className="absolute left-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-7 pr-2 text-[11px] outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 transition-all duration-150 focus:ring-1 focus:ring-emerald-500/20"
              >
                {TOPICS.map((top) => (
                  <option key={top.id} value={top.id}>
                    {top.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Template Library Content Area ── */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0c0e14]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-20">
              <LoadingSpinner text="Fetching Meta Library Templates..." />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 bg-white dark:bg-[#10121a] rounded-2xl border border-slate-200/80 dark:border-white/[0.07]">
              <EmptyState
                title="No Templates Found"
                description="No pre-approved templates matched your category, topic, or search query."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <div
                  key={tpl._id || tpl.libraryId}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-[#141720] dark:border-white/[0.07] dark:bg-[#10121a] hover:border-emerald-500/30"
                >
                  <div>
                    {/* Badges Section */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 font-extrabold px-2.5 py-0.5 rounded-md border text-[10px] tracking-wide uppercase',
                          tpl.category === 'MARKETING' &&
                            'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
                          tpl.category === 'UTILITY' &&
                            'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
                          tpl.category === 'AUTHENTICATION' &&
                            'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                        )}
                      >
                        {tpl.category}
                      </span>
                      <span className="inline-flex items-center font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-white/[0.04] dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06] text-[9px] tracking-wide uppercase">
                        {tpl.topic.replace('_', ' ')}
                      </span>
                    </div>

                     {/* Title & Description */}
                    <h3 className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
                      {tpl.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* Phone Preview container with matching styles */}
                    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/50 p-2.5 dark:border-slate-800/80 dark:bg-[#090b10]">
                      <WhatsAppPreview form={tpl} compact />
                    </div>
                  </div>

                  {/* Footer Actions Panel */}
                  <div className="mt-2 pt-3 border-t border-slate-200/70 dark:border-white/[0.04] flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Meta Pre-Approved
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      label="Use Template"
                      icon={<ArrowRight className="h-3 w-3" />}
                      onClick={() => {
                        onSelectTemplate(tpl)
                        onClose()
                      }}
                      className="px-3.5 py-1.5 text-[11px] font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
