import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  useGetLogsQuery,
  useGetLogStatsQuery,
  useGetWhatsappNumberQuery,
  useExportLogsMutation,
  useSyncLogAnalyticsMutation,
  useGetCampaignsQuery,
  useGetTemplatesQuery,
} from '@/redux/apis/metaWhatsapp.api'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronDown,
  X,
  Loader2,
  Phone,
  MessageSquare,
  FileText,
  Copy,
  Check
} from 'lucide-react'
import dayjs from 'dayjs'

const COLUMNS = [
  { key: 'dateTime', label: 'Date/Time', w: 180 },
  { key: 'whatsappNumber', label: 'Whatsapp Number', w: 140 },
  { key: 'requestId', label: 'Request Id', w: 130 },
  { key: 'messageType', label: 'Message Type', w: 120 },
  { key: 'campaign', label: 'Campaign', w: 130 },
  { key: 'template', label: 'Template', w: 130 },
  { key: 'customerNumber', label: 'Customer Number', w: 140 },
  { key: 'direction', label: 'Direction', w: 110 },
  { key: 'price', label: 'Price', w: 90 },
  // { key: 'billable', label: 'Billable', w: 100 },
  { key: 'deliveryReport', label: 'Status', w: 120 },
  { key: 'errorReason', label: 'Error Reason', w: 180 },
  { key: 'sentAt', label: 'Sent At', w: 180 },
  { key: 'deliveredAt', label: 'Delivered At', w: 180 },
  { key: 'readAt', label: 'Read At', w: 180 },
  { key: 'paymentStatus', label: 'Payment', w: 100 },
  { key: 'content', label: 'Content', w: 220 },
  { key: 'preview', label: 'Preview', w: 90 },
]

const DIRECTION_CFG = {
  outbound: { text: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200', label: 'Outbound' },
  inbound: { text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', label: 'Inbound' },
}

const MSG_TYPE_CFG = {
  template: { text: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-200' },
  text: { text: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-200' },
  image: { text: 'text-cyan-600', bg: 'bg-cyan-50', ring: 'ring-cyan-200' },
  interactive: { text: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200' },
}

const PAYMENT_CFG = {
  paid: { text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  free: { text: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-200' },
  pending: { text: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' },
}

function Badge({ label, cfg }) {
  if (!label) return <span className="text-slate-400 text-xs">-</span>
  const c = cfg || { text: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-200' }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}>
      {label}
    </span>
  )
}

function Cell({ value, monospace }) {
  if (value === null || value === undefined || value === '') return <span className="text-slate-400">-</span>
  return (
    <span className={`block truncate text-[13px] text-slate-600 ${monospace ? 'font-mono text-[12px] text-slate-500' : ''}`} title={String(value)}>
      {String(value)}
    </span>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e) => {
    e.stopPropagation()
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="ml-1.5 inline-flex cursor-pointer items-center justify-center rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600" title="Copy Full ID">
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  )
}

const NumberSelector = ({ numbers = [], selectedNumber, onNumberChange }) => {
  const numberList = Array.isArray(numbers) ? numbers : numbers?.data || []
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400">
        <Phone className="h-3.5 w-3.5" />
      </span>
      <select
        value={selectedNumber || ''}
        onChange={(e) => onNumberChange(e.target.value)}
        className="h-9 min-w-[220px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-7 text-[13px] font-medium text-slate-700 shadow-sm outline-none transition-all hover:border-indigo-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">All Numbers</option>
        {numberList?.map((n) => (
          <option key={n?._id} value={n?._id}>
            {n?.displayName ? `${n.displayName} - ` : ''}{n?.phoneNumber}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
        <ChevronDown className="h-3.5 w-3.5" />
      </span>
    </div>
  )
}

function HeaderFilterPopover({ 
  column, 
  filters, 
  onApply, 
  onClose, 
  numbers = [], 
  campaigns = [], 
  templates = [], 
  setSelectedNumber 
}) {
  const popoverRef = useRef(null)
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const [localFilters, setLocalFilters] = useState({ ...filters })

  const handleClear = (e) => {
    e.stopPropagation()
    let updated = { ...filters }
    if (
      column.key === 'customerNumber' || 
      column.key === 'content' || 
      column.key === 'errorReason' || 
      column.key === 'requestId'
    ) {
      updated.search = ''
    } else if (column.key === 'whatsappNumber') {
      setSelectedNumber('')
      updated.numberId = ''
    } else if (column.key === 'campaign') {
      updated.campaignId = ''
      updated.search = ''
    } else if (column.key === 'template') {
      updated.search = ''
    } else if (column.key === 'messageType') {
      updated.messageType = ''
    } else if (column.key === 'direction') {
      updated.direction = ''
    } else if (column.key === 'paymentStatus') {
      updated.paymentStatus = ''
    } else if (column.key === 'deliveryReport') {
      updated.status = ''
    } else if (
      column.key === 'dateTime' || 
      column.key === 'sentAt' || 
      column.key === 'deliveredAt' || 
      column.key === 'readAt'
    ) {
      updated.dateFrom = ''
      updated.dateTo = ''
    }
    onApply(updated)
  }

  const handleApply = (e) => {
    e.stopPropagation()
    onApply(localFilters)
  }

  const renderFilterContent = () => {
    if (column.key === 'whatsappNumber') {
      return (
        <div className="p-2 space-y-1">
          <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1.5 pb-1">Filter Whatsapp Number</p>
          <div className="space-y-0.5 max-h-[180px] overflow-y-auto overflow-x-hidden wa-logs-scrollbar">
            <button
              onClick={() => {
                setSelectedNumber('')
                setLocalFilters({ ...localFilters, numberId: '' })
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                !localFilters.numberId 
                  ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
              )}
            >
              <span>All Numbers</span>
              {!localFilters.numberId && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
            </button>
            {numbers.map((n) => {
              const isSelected = localFilters.numberId === n?._id
              return (
                <button
                  key={n?._id}
                  onClick={() => {
                    setSelectedNumber(n?._id)
                    setLocalFilters({ ...localFilters, numberId: n?._id })
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                    isSelected 
                      ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <span className="truncate mr-2" title={n?.displayName ? `${n.displayName} (${n.phoneNumber})` : n?.phoneNumber}>
                    {n?.displayName ? `${n.displayName}` : n?.phoneNumber}
                    <br/>
                    {n?.displayName ? `(${n.phoneNumber})` : n?.phoneNumber}
                  </span>
                  {isSelected && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (column.key === 'campaign') {
      return (
        <div className="p-2 space-y-1">
          <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1.5 pb-1">Filter Campaign</p>
          <div className="space-y-0.5 max-h-[180px] overflow-y-auto overflow-x-hidden wa-logs-scrollbar">
            <button
              onClick={() => {
                setLocalFilters({ ...localFilters, campaignId: '', search: '' })
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                !localFilters.campaignId && !localFilters.search
                  ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
              )}
            >
              <span>All Campaigns</span>
              {!localFilters.campaignId && !localFilters.search && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
            </button>
            {campaigns.map((c) => {
              const isSelected = localFilters.campaignId === c?._id || localFilters.search === c?.name
              return (
                <button
                  key={c?._id}
                  onClick={() => {
                    setLocalFilters({ ...localFilters, campaignId: c?._id, search: c?.name || '' })
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                    isSelected 
                      ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <span className="truncate mr-2" title={c?.name}>{c?.name}</span>
                  {isSelected && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (column.key === 'template') {
      return (
        <div className="p-2 space-y-1">
          <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1.5 pb-1">Filter Template</p>
          <div className="space-y-0.5 max-h-[180px] overflow-y-auto overflow-x-hidden wa-logs-scrollbar">
            <button
              onClick={() => {
                setLocalFilters({ ...localFilters, search: '' })
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                !localFilters.search
                  ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
              )}
            >
              <span>All Templates</span>
              {!localFilters.search && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
            </button>
            {templates.map((t) => {
              const isSelected = localFilters.search === t?.name
              return (
                <button
                  key={t?._id}
                  onClick={() => {
                    setLocalFilters({ ...localFilters, search: t?.name || '' })
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                    isSelected 
                      ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <span className="truncate mr-2" title={t?.name}>{t?.name}</span>
                  {isSelected && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (
      column.key === 'customerNumber' || 
      column.key === 'content' || 
      column.key === 'errorReason' || 
      column.key === 'requestId'
    ) {
      return (
        <div className="p-3 space-y-2">
          <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 pb-0.5">Search {column.label}</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-405 h-3.5 w-3.5" />
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
              placeholder={`Search...`}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              autoFocus
            />
          </div>
        </div>
      )
    }

    if (column.key === 'messageType') {
      const options = ['template', 'text', 'image', 'interactive']
      return (
        <div className="p-2 space-y-1">
          <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1.5 pb-1">Filter Message Type</p>
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = localFilters.messageType === opt
              return (
                <button
                  key={opt}
                  onClick={() => setLocalFilters({ ...localFilters, messageType: opt })}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                    isSelected 
                      ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-slate-605 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <span className="capitalize">{opt}</span>
                  {isSelected && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (column.key === 'direction') {
      const options = ['outbound', 'inbound']
      return (
        <div className="p-2 space-y-1">
          <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1.5 pb-1">Filter Direction</p>
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = localFilters.direction === opt
              return (
                <button
                  key={opt}
                  onClick={() => setLocalFilters({ ...localFilters, direction: opt })}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                    isSelected 
                      ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-slate-605 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <span className="capitalize">{opt}</span>
                  {isSelected && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (column.key === 'paymentStatus') {
      const options = ['paid', 'free', 'pending']
      return (
        <div className="p-2 space-y-1">
          <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1.5 pb-1">Filter Payment Status</p>
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = localFilters.paymentStatus === opt
              return (
                <button
                  key={opt}
                  onClick={() => setLocalFilters({ ...localFilters, paymentStatus: opt })}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                    isSelected 
                      ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-slate-605 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <span className="capitalize">{opt}</span>
                  {isSelected && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (column.key === 'deliveryReport') {
      const options = ['sent', 'delivered', 'read', 'failed']
      return (
        <div className="p-2 space-y-1">
          <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1.5 pb-1">Filter Status</p>
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = localFilters.status === opt
              return (
                <button
                  key={opt}
                  onClick={() => setLocalFilters({ ...localFilters, status: opt })}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-all border-none bg-transparent cursor-pointer",
                    isSelected 
                      ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-slate-605 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <span className="capitalize">{opt}</span>
                  {isSelected && <Check size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (
      column.key === 'dateTime' || 
      column.key === 'sentAt' || 
      column.key === 'deliveredAt' || 
      column.key === 'readAt'
    ) {
      return (
        <div className="p-3 space-y-3">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 px-1">Start Date</span>
            <input
              type="date"
              value={localFilters.dateFrom || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-950 rounded-lg outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 px-1">End Date</span>
            <input
              type="date"
              value={localFilters.dateTo || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-950 rounded-lg outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      )
    }

    return (
      <div className="p-3 text-slate-400 text-xs italic">
        No active filters for this column.
      </div>
    )
  }

  return (
    <div
      ref={popoverRef}
      className="absolute top-[100%] left-0 mt-1.5 w-72 rounded-2xl bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/[0.08] shadow-2xl z-[90] text-left normal-case font-normal animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {renderFilterContent()}
      
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-[#131622]/30 px-3 py-2">
        <button
          onClick={handleClear}
          className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer border-none bg-transparent"
        >
          Clear
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-[11px] font-semibold text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200 transition px-2 py-1 rounded cursor-pointer border-none bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer border-none"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MetaWhatsappLogs() {
  const [selectedNumber, setSelectedNumber] = useState('')
  const [showNumberDrop, setShowNumberDrop] = useState(false)
  const [page, setPage] = useState(1)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [filters, setFilters] = useState({
    search: '', direction: '', messageType: '', paymentStatus: '', status: '', dateFrom: '', dateTo: '', campaignId: '',
  })
  const [activeHeaderFilter, setActiveHeaderFilter] = useState(null)

  const isFilterActive = (key) => {
    if (
      key === 'customerNumber' || 
      key === 'content' || 
      key === 'errorReason' || 
      key === 'template' || 
      key === 'requestId'
    ) {
      return !!filters.search
    }
    if (key === 'campaign') {
      return !!filters.campaignId || !!filters.search
    }
    if (key === 'whatsappNumber') {
      return !!filters.numberId || !!selectedNumber
    }
    if (key === 'messageType') {
      return !!filters.messageType
    }
    if (key === 'direction') {
      return !!filters.direction
    }
    if (key === 'paymentStatus') {
      return !!filters.paymentStatus
    }
    if (key === 'deliveryReport') {
      return !!filters.status
    }
    if (
      key === 'dateTime' || 
      key === 'sentAt' || 
      key === 'deliveredAt' || 
      key === 'readAt'
    ) {
      return !!filters.dateFrom || !!filters.dateTo
    }
    return false
  }

  const { data: numbersData } = useGetWhatsappNumberQuery()
  const numbers = numbersData?.data || []

  const { data: campaignsRes } = useGetCampaignsQuery()
  const campaignsList = campaignsRes?.data || []

  const { data: templatesRes } = useGetTemplatesQuery({ numberId: selectedNumber || undefined })
  const templatesList = templatesRes?.data || []

  const { data, isLoading, isFetching, refetch: refetchLogs } = useGetLogsQuery({
    numberId: selectedNumber, page, ...filters,
  })
  const { data: statsData, refetch: refetchStats } = useGetLogStatsQuery({
    numberId: selectedNumber, ...filters,
  })
  const stats = statsData?.data || { total: 0, delivered: 0, read: 0, failed: 0 }

  const [exportLogs, { isLoading: exporting }] = useExportLogsMutation?.() || [() => {}, {}]
  const [syncAnalytics, { isLoading: syncingAnalytics }] = useSyncLogAnalyticsMutation?.() || [() => {}, {}]

  const handleExportAnalytics = async () => {
    try {
      if (!selectedNumber) {
        alert('Please select a specific WhatsApp number first to export its analytics.')
        return
      }
      const res = await syncAnalytics({ numberId: selectedNumber, dateFrom: filters.dateFrom, dateTo: filters.dateTo }).unwrap()
      if (res?.success && res?.data) {
        const convData = res.data.conversationAnalytics?.data?.conversation_analytics?.data?.[0]?.data_points || []
        const msgData = res.data.messageAnalytics?.data?.analytics?.data?.[0]?.data_points || []
        const headers = ['Day/Start Time', 'Total Conversations', 'Paid Conversations', 'Free Conversations', 'Messages Sent', 'Messages Delivered']
        const csvRows = [headers.join(',')]
        const days = new Set([...convData.map((d) => d.start?.split('T')[0]), ...msgData.map((d) => d.start?.split('T')[0])].filter(Boolean))
        for (const day of Array.from(days).sort()) {
          const convPoint = convData.find((c) => c.start?.startsWith(day))
          const msgPoint = msgData.find((m) => m.start?.startsWith(day))
          const totalConv = convPoint?.conversation || 0
          const freeConv = convPoint?.conversation_type === 'FREE_ENTRY_POINT' || convPoint?.conversation_type === 'FREE_TIER' ? totalConv : 0
          const paidConv = totalConv - freeConv
          csvRows.push([day, totalConv, paidConv, freeConv, msgPoint?.sent || 0, msgPoint?.delivered || 0].join(','))
        }
        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `whatsapp-analytics-${dayjs().format('YYYY-MM-DD')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert(res?.message || 'No analytics data available for this range.')
      }
    } catch (err) {
      console.error('Export Analytics error:', err)
      alert(err?.data?.message || err?.message || 'Failed to fetch analytics from Meta.')
    }
  }

  const logs = data?.data || []
  const total = data?.total || 0
  const pageSize = data?.pageSize || 50
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const selectedNum = numbers.find((n) => n._id === selectedNumber)

  const totalPrice = useMemo(() => {
    return logs.reduce((sum, log) => sum + Number(log.price || 0), 0)
  }, [logs])

  const clearNumber = () => { setSelectedNumber(''); setPage(1) }

  function renderCell(col, log) {
    switch (col.key) {
      case 'dateTime':
        return log.createdAt ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
              {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : <span className="text-slate-400">-</span>
      case 'whatsappNumber':
        return <Cell value={log.whatsappNumber || log.numberId?.phoneNumber} />
      case 'requestId': {
        const fullId = log.metaMessageId || log._id
        const displayId = log.metaMessageId?.split(':').pop()?.substring(0, 12) || log._id?.substring(0, 12) || '-'
        if (displayId === '-') return <span className="text-slate-400">-</span>
        return (
          <div className="flex items-center gap-1">
            <span className="font-mono text-[12px] text-slate-500 dark:text-slate-400" title={fullId}>
              {displayId}
            </span>
            <CopyButton text={fullId} />
          </div>
        )
      }
      case 'messageType':
        return <Badge label={log.messageType} cfg={MSG_TYPE_CFG[log.messageType?.toLowerCase()]} />
      case 'campaign':
        return log.campaignName ? <span className="block truncate text-[13px] font-medium text-slate-700 dark:text-slate-300" title={log.campaignName}>{log.campaignName}</span> : <span className="text-slate-400">-</span>
      case 'template':
        return log.templateName ? <span className="block truncate text-[13px] font-medium text-slate-700 dark:text-slate-300" title={log.templateName}>{log.templateName}</span> : <span className="text-slate-400">-</span>
      case 'customerNumber':
        return <Cell value={log.to || log.customerNumber} />
      case 'direction':
        return <Badge label={log.direction} cfg={DIRECTION_CFG[log.direction?.toLowerCase()]} />
      case 'price': {
        let price = log.price;
        let currency = log.currency || 'INR';
        const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '₹';
        const isFree = !price || price === 0;
        return (
          <span className={cn(
            "font-mono text-[12.5px] font-semibold px-2 py-0.5 rounded-full inline-block border",
            isFree 
              ? "bg-slate-50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800/40" 
              : "bg-emerald-50/55 dark:bg-emerald-550/5 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/20"
          )}>
            {symbol}{Number(price || 0).toFixed(3)}
          </span>
        )
      }
      case 'deliveryReport': {
        const statusCfg = {
          sent: { text: 'text-blue-650 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-950/10', ring: 'ring-blue-100 dark:ring-blue-900/20' },
          delivered: { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/10', ring: 'ring-emerald-100 dark:ring-emerald-900/20' },
          read: { text: 'text-cyan-650 dark:text-cyan-400', bg: 'bg-cyan-50/50 dark:bg-cyan-950/10', ring: 'ring-cyan-100 dark:ring-cyan-900/20' },
          failed: { text: 'text-red-655 dark:text-red-400', bg: 'bg-red-50/50 dark:bg-red-950/10', ring: 'ring-red-100 dark:ring-red-900/20' },
          queued: { text: 'text-slate-650 dark:text-slate-400', bg: 'bg-slate-50/50 dark:bg-slate-800/10', ring: 'ring-slate-150 dark:ring-slate-800/25' },
        }
        return <Badge label={log.status} cfg={statusCfg[log.status?.toLowerCase()]} />
      }
      case 'errorReason':
        if (log.status !== 'failed') return <span className="text-slate-400">-</span>
        if (log.errors && log.errors.length > 0) {
          return (
            <span 
              className="block max-w-[160px] truncate text-[11px] font-medium text-red-500" 
              title={`${log.errors[0]?.code ? `Error ${log.errors[0].code}: ` : ''}${log.errors[0]?.error_data?.details || log.errors[0]?.message || log.errors[0]?.title || 'Unknown error'}`}
            >
              {log.errors[0]?.code ? `[${log.errors[0].code}] ` : ''}{log.errors[0]?.error_data?.details || log.errors[0]?.message || log.errors[0]?.title || 'Unknown'}
            </span>
          )
        }
        if (log.errorMessage || log.errorCode) {
          return (
            <span 
              className="block max-w-[160px] truncate text-[11px] font-medium text-red-500" 
              title={`${log.errorCode ? `Error ${log.errorCode}: ` : ''}${log.errorMessage || 'Unknown error'}`}
            >
              {log.errorCode ? `[${log.errorCode}] ` : ''}{log.errorMessage || 'Unknown'}
            </span>
          )
        }
        return <span className="text-slate-400">-</span>
      case 'sentAt':
        return log.sentAt ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-slate-700 dark:text-slate-300">{new Date(log.sentAt).toLocaleDateString()}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : <span className="text-slate-400">-</span>
      case 'deliveredAt':
        return log.deliveredAt ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-slate-700 dark:text-slate-300">{new Date(log.deliveredAt).toLocaleDateString()}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(log.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : <span className="text-slate-400">-</span>
      case 'readAt':
        return log.readAt ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-slate-700 dark:text-slate-300">{new Date(log.readAt).toLocaleDateString()}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(log.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : <span className="text-slate-400">-</span>
      case 'paymentStatus': {
        const ps = log.pricing?.billable ? 'paid' : log.pricing?.category ? 'free' : null
        return <Badge label={ps} cfg={PAYMENT_CFG[ps]} />
      }
      case 'content':
        return log.content ? <span className="block max-w-[200px] truncate text-[12px] text-slate-505 dark:text-slate-400" title={log.content}>{log.content}</span> : <span className="text-slate-400">-</span>
      case 'preview':
        return (
          <button 
            onClick={() => setSelectedLog(log)} 
            className="cursor-pointer rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-transparent px-3 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 shadow-sm transition-all hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-900"
          >
            View
          </button>
        )
      default:
        return <Cell value={log[col.key]} />
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#08090e] transition-colors duration-200">
      <style>{`
        .wa-logs-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .wa-logs-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .wa-logs-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
        .dark .wa-logs-scrollbar::-webkit-scrollbar-thumb { background: #334155; border: 2px solid transparent; background-clip: padding-box; }
        .wa-logs-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; border: 2px solid transparent; background-clip: padding-box; }
        .dark .wa-logs-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; border: 2px solid transparent; background-clip: padding-box; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-205 dark:border-white/[0.04] bg-white dark:bg-[#08090e] px-6 py-4">
        {/* Number selector */}
        <NumberSelector 
          numbers={numbers} 
          selectedNumber={selectedNumber} 
          onNumberChange={(id) => { setSelectedNumber(id); setPage(1); }} 
        />

        {/* Center/Right Controls */}
        <div className="flex items-center gap-4">
          {/* Radio Filters */}
          <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-1 shadow-sm">
            {[
              { id: 'all', label: 'All Logs', active: !filters.paymentStatus && !filters.status, onClick: () => setFilters({ ...filters, status: '', paymentStatus: '', campaignId: '' }) },
              { id: 'billable', label: 'Billable', active: filters.paymentStatus === 'paid', onClick: () => setFilters({ ...filters, paymentStatus: 'paid', status: '', campaignId: '' }) },
              { id: 'failed', label: 'Failed', active: filters.status === 'failed', onClick: () => setFilters({ ...filters, status: 'failed', paymentStatus: '', campaignId: '' }) }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={tab.onClick} 
                className={cn(
                  "cursor-pointer border-none px-4 py-1.5 text-[12.5px] font-semibold transition-all duration-200 rounded-lg", 
                  tab.active 
                    ? "bg-blue-600 text-white shadow" 
                    : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-250 dark:bg-white/[0.08]"></div>

          <button 
            onClick={() => { setPage(1); refetchLogs?.(); refetchStats?.() }} 
            disabled={isFetching} 
            className="flex h-[34px] px-4 cursor-pointer items-center justify-center rounded-lg border border-slate-205 dark:border-white/[0.08] bg-white dark:bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 shadow-sm transition-all disabled:opacity-50 text-xs font-semibold gap-1.5"
          >
            <RefreshCw size={13} className={isFetching && !isLoading ? "animate-spin" : ""} />
            <span>{isFetching && !isLoading ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {/* ── Stats Summary Grid ── */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 shrink-0 bg-slate-50/50 dark:bg-[#0c0e15]/40 border-b border-slate-200 dark:border-white/[0.04]">
        {[
          { label: "Total Logs", value: stats.total || 0, textCls: "text-slate-755 dark:text-slate-300", bg: "bg-white dark:bg-[#0f111a]" },
          { label: "Delivered", value: stats.delivered || 0, textCls: "text-emerald-600 dark:text-emerald-450", bg: "bg-white dark:bg-[#0f111a]" },
          { label: "Read", value: stats.read || 0, textCls: "text-cyan-600 dark:text-cyan-450", bg: "bg-white dark:bg-[#0f111a]" },
          { label: "Failed", value: stats.failed || 0, textCls: "text-red-600 dark:text-red-450", bg: "bg-white dark:bg-[#0f111a]" }
        ].map((s, idx) => (
          <div key={idx} className={cn("border border-slate-200/80 dark:border-white/[0.06] rounded-xl py-2.5 px-4 shadow-sm dark:shadow-none transition-all duration-200 hover:border-slate-305 dark:hover:border-white/[0.12]", s.bg)}>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">{s.label}</span>
            <span className={cn("text-2xl font-extrabold mt-1 block", s.textCls)}>{s.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0f111a] mx-4 mt-4 rounded-xl border border-slate-200 dark:border-white/[0.06] shadow-sm dark:shadow-none">
        <div className="wa-logs-scrollbar flex-1 overflow-auto flex flex-col">
          <table className="border-collapse w-full min-h-full" style={{ minWidth: COLUMNS.reduce((a, c) => a + c.w, 0) + 'px' }}>
            <thead className="sticky top-0 z-10 shadow-sm bg-white dark:bg-[#0f111a]">
              <tr className="bg-white dark:bg-[#0f111a]">
                {COLUMNS.map((col) => {
                  const filterable = [
                    'dateTime', 'sentAt', 'deliveredAt', 'readAt',
                    'customerNumber', 'content', 'errorReason', 'campaign', 'template', 'requestId',
                    'messageType', 'direction', 'paymentStatus', 'deliveryReport', 'whatsappNumber'
                  ].includes(col.key);

                  return (
                    <th 
                      key={col.key} 
                      className="whitespace-nowrap border-b border-r border-slate-200 dark:border-white/[0.05] px-4 py-3 text-left sticky top-0 z-10 bg-slate-50/80 dark:bg-[#131622]/85 backdrop-blur relative group" 
                      style={{ minWidth: col.w, width: col.w }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-450">{col.label}</span>
                        {filterable && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHeaderFilter(activeHeaderFilter === col.key ? null : col.key);
                            }}
                            className={cn(
                              "ml-1.5 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 inline-flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent",
                              isFilterActive(col.key) && "text-blue-500 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            )}
                            title={`Filter by ${col.label}`}
                          >
                            <Filter size={11} className={isFilterActive(col.key) ? "fill-blue-500/10 text-blue-500 dark:text-blue-450" : ""} />
                          </button>
                        )}
                      </div>
                      
                      {activeHeaderFilter === col.key && (
                        <HeaderFilterPopover 
                          column={col} 
                          filters={filters} 
                          numbers={numbers}
                          campaigns={campaignsList}
                          templates={templatesList}
                          setSelectedNumber={setSelectedNumber}
                          onApply={(newFilters) => {
                            setFilters(newFilters);
                            setPage(1);
                            setActiveHeaderFilter(null);
                          }}
                          onClose={() => setActiveHeaderFilter(null)}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-505 dark:text-slate-500">
                      <Loader2 size={32} className="animate-spin text-blue-505" />
                      <span className="text-sm font-semibold">Loading logs...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-white/[0.02]">
                        <MessageSquare size={28} className="text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No logs found</p>
                      <p className="text-xs text-slate-500 dark:text-slate-450">
                        {!selectedNumber ? 'Select a WhatsApp number to view logs' : 'Try adjusting your filters'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log._id || i} className="group border-b border-slate-100 dark:border-white/[0.02] transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.015]">
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="border-r border-slate-100 dark:border-white/[0.02] px-4 py-3 align-middle" style={{ minWidth: col.w, width: col.w }}>
                        {renderCell(col, log)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] bg-slate-50 dark:bg-[#131622]">
              <tr className="bg-slate-50/90 dark:bg-[#131622]/90 backdrop-blur border-t border-slate-200 dark:border-white/[0.05]">
                {COLUMNS.map((col) => {
                  let content = null;
                  if (col.key === 'price') {
                    content = (
                      <span className="font-mono text-[12.5px] font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{totalPrice.toFixed(3)}
                      </span>
                    );
                  } else if (col.key === 'direction') {
                    content = (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Total Cost
                      </span>
                    );
                  } else if (col.key === 'dateTime') {
                    content = (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-450">
                        {logs.length} logs
                      </span>
                    );
                  }

                  return (
                    <td 
                      key={col.key} 
                      className="whitespace-nowrap border-r border-slate-200 dark:border-white/[0.05] px-4 py-2.5 text-center font-bold text-[12px] text-slate-800 dark:text-slate-200" 
                      style={{ minWidth: col.w, width: col.w }}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 dark:border-white/[0.05] bg-slate-50/50 dark:bg-[#0c0e15]/40 px-5 py-3.5">
          <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            {total > 0 ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total.toLocaleString()}` : 'Showing 0 results'}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(1)} disabled={page === 1} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-205 dark:border-white/[0.08] bg-white dark:bg-transparent text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-slate-50 dark:hover:bg-white/[0.02]">«</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-205 dark:border-white/[0.08] bg-white dark:bg-transparent text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-slate-50 dark:hover:bg-white/[0.02]">‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const p = start + i
              if (p > totalPages) return null
              return (
                <button 
                  key={p} 
                  onClick={() => setPage(p)} 
                  className={cn(
                    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-none text-[13px] font-bold transition", 
                    page === p 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "bg-white dark:bg-transparent text-slate-600 dark:text-slate-400 border border-slate-205 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  )}
                >
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-205 dark:border-white/[0.08] bg-white dark:bg-transparent text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-slate-50 dark:hover:bg-white/[0.02]">›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-205 dark:border-white/[0.08] bg-white dark:bg-transparent text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-slate-50 dark:hover:bg-white/[0.02]">»</button>
          </div>
        </div>
      </div>

      {showFilterModal && (
        <FilterExportModal filters={filters} onApply={(f) => { setFilters(f); setPage(1); setShowFilterModal(false) }} onClose={() => setShowFilterModal(false)} onExport={() => exportLogs({ ...filters, numberId: selectedNumber })} exporting={exporting} />
      )}
      {selectedLog && (
        <ViewMessageModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
      {showNumberDrop && <div className="fixed inset-0 z-20" onClick={() => setShowNumberDrop(false)} />}
    </div>
  )
}

function FilterExportModal({ filters, onApply, onClose, onExport, exporting }) {
  const [f, setF] = useState({ ...filters })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0b0c13] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
  const labelCls = "block text-[12px] font-bold text-slate-600 dark:text-slate-400 mb-1.5"

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white dark:bg-[#0f111a] border border-slate-100 dark:border-white/[0.06] shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
              <Filter size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-805 dark:text-slate-100">Filter & Export Logs</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-450">Narrow down your message history</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-slate-50 dark:bg-white/[0.04] text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelCls}>Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input className={cn(inputCls, "pl-9")} value={f.search} onChange={(e) => set('search', e.target.value)} placeholder="Phone number, UUID, message text…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Direction</label>
                <select className={inputCls} value={f.direction} onChange={(e) => set('direction', e.target.value)}>
                  <option value="">All Directions</option>
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Message Type</label>
                <select className={inputCls} value={f.messageType} onChange={(e) => set('messageType', e.target.value)}>
                  <option value="">All Types</option>
                  <option value="template">Template</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="interactive">Interactive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className={labelCls}>Payment Status</label>
                <select className={inputCls} value={f.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="free">Free</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Message Status</label>
                <select className={inputCls} value={f.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="read">Read</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Start Date</label>
                <input type="date" className={inputCls} value={f.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input type="date" className={inputCls} value={f.dateTo} onChange={(e) => set('dateTo', e.target.value)} />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.05] pt-5">
            <button onClick={onExport} disabled={exporting} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-transparent px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-white/[0.02] disabled:opacity-50">
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} {exporting ? 'Exporting CSV…' : 'Export to CSV'}
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="cursor-pointer rounded-lg border-none bg-transparent px-4 py-2 text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition">Cancel</button>
              <button onClick={() => onApply(f)} className="cursor-pointer rounded-lg border-none bg-blue-600 px-6 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function ViewMessageModal({ log, onClose }) {
  const [copied, setCopied] = useState(false)
  const isOutbound = log.direction?.toLowerCase() === 'outbound'
  
  const idToCopy = log.metaMessageId || log._id || 'N/A'

  const handleCopy = () => {
    if (idToCopy === 'N/A') return
    navigator.clipboard.writeText(idToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08090e]/50 p-4 backdrop-blur-sm transition-all">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-[#0f111a] border border-slate-100 dark:border-white/[0.06] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-[#131622]/30 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-900/35">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-805 dark:text-slate-100">Message Details</h3>
              <div className="flex items-center gap-2 mt-0.5 group">
                <p className="text-xs font-semibold text-slate-500 font-mono">ID: {idToCopy}</p>
                {idToCopy !== 'N/A' && (
                  <button 
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent"
                    title="Copy ID"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-[#151929] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm ring-1 ring-slate-200 dark:ring-white/[0.08] transition-all border-none">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row max-h-[75vh] overflow-hidden">
          {/* Left Column: Metadata */}
          <div className="w-full md:w-[45%] bg-slate-50 dark:bg-[#131622]/10 border-r border-slate-100 dark:border-white/[0.04] p-6 overflow-y-auto wa-logs-scrollbar">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Metadata</h4>
            
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-white dark:bg-[#171b2d] p-4 shadow-sm border border-slate-100 dark:border-white/[0.03]">
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Status & Direction</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge label={log.status} cfg={{
                    sent: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10', ring: 'ring-blue-100 dark:ring-blue-900/20' },
                    delivered: { text: 'text-emerald-650 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/10', ring: 'ring-emerald-100 dark:ring-emerald-900/20' },
                    read: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/10', ring: 'ring-cyan-100 dark:ring-cyan-900/20' },
                    failed: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/10', ring: 'ring-red-100 dark:ring-red-900/20' },
                    queued: { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/10', ring: 'ring-slate-150 dark:ring-slate-800/20' },
                  }[log.status?.toLowerCase()]} />
                  <Badge label={log.direction} cfg={DIRECTION_CFG[log.direction?.toLowerCase()]} />
                  <Badge label={log.messageType} cfg={MSG_TYPE_CFG[log.messageType?.toLowerCase()]} />
                </div>
              </div>

              {log.status === 'failed' && ((log.errors && log.errors.length > 0) || log.errorMessage || log.errorCode) && (
                <div className="rounded-xl bg-red-50/50 dark:bg-red-950/10 p-4 border border-red-100 dark:border-red-950/20">
                  <p className="text-[10px] font-bold uppercase text-red-500 mb-1">Failure Reason</p>
                  <p className="text-[13px] font-semibold text-red-700 dark:text-red-400 leading-relaxed">
                    {log.errors && log.errors.length > 0 ? (
                      <>
                        {log.errors[0]?.code ? <span className="font-bold mr-1">[{log.errors[0].code}]</span> : ''}
                        {log.errors[0]?.error_data?.details || log.errors[0]?.message || log.errors[0]?.title || 'Unknown error'}
                      </>
                    ) : (
                      <>
                        {log.errorCode ? <span className="font-bold mr-1">[{log.errorCode}]</span> : ''}
                        {log.errorMessage || 'Unknown error'}
                      </>
                    )}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Created At</p>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</p>
              </div>

              {(log.sentAt || log.deliveredAt || log.readAt) && (
                <div className="rounded-xl bg-slate-100/50 dark:bg-white/[0.02] p-4 border border-slate-200/50 dark:border-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2.5">Delivery Timeline</p>
                  <div className="flex flex-col gap-2">
                    {log.sentAt && (
                      <div className="flex justify-between items-center text-[12.5px]">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Sent</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(log.sentAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                    {log.deliveredAt && (
                      <div className="flex justify-between items-center text-[12.5px]">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Delivered</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-450">{new Date(log.deliveredAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                    {log.readAt && (
                      <div className="flex justify-between items-center text-[12.5px]">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Read</span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-455">{new Date(log.readAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">From Number</p>
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{log.whatsappNumber || log.numberId?.phoneNumber || '-'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">To Customer</p>
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{log.to || log.customerNumber || '-'}</p>
              </div>
              
              {(log.campaignName || log.templateName) && (
                <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 p-4 border border-indigo-100/50 dark:border-indigo-950/20">
                  {log.campaignName && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold uppercase text-indigo-500/80 dark:text-indigo-400 mb-0.5">Campaign</p>
                      <p className="text-[13px] font-bold text-indigo-900 dark:text-indigo-300">{log.campaignName}</p>
                    </div>
                  )}
                  {log.templateName && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-indigo-500/80 dark:text-indigo-400 mb-0.5">Template</p>
                      <p className="text-[13px] font-bold text-indigo-900 dark:text-indigo-300">{log.templateName}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: Content Preview */}
          <div className="w-full md:w-[55%] p-6 overflow-y-auto wa-logs-scrollbar bg-slate-50/30 dark:bg-[#0a0c14]/40 flex flex-col justify-between">
             <div className="mb-4 text-center shrink-0">
              <span className="inline-block rounded-full bg-slate-200/80 dark:bg-slate-800/80 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-655 dark:text-slate-355 shadow-sm backdrop-blur-sm">
                Message Content
              </span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center py-6">
              <div className={cn(
                "relative max-w-[85%] rounded-2xl p-4 shadow-md",
                isOutbound 
                  ? "self-end rounded-tr-none bg-[#e7ffdb] dark:bg-[#1a381f] text-slate-800 dark:text-slate-100 border border-emerald-100/30 dark:border-emerald-950/20" 
                  : "self-start rounded-tl-none bg-white dark:bg-[#161a29] text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-white/[0.03]"
              )}>
                {log.content ? (
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed font-medium">{log.content}</p>
                ) : (
                  <p className="text-[14px] italic text-slate-400 dark:text-slate-500">No text content available.</p>
                )}
                <div className="mt-2.5 flex items-center justify-end gap-1 shrink-0">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
