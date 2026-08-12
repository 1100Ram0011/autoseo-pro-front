import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@/components/global/theme-provider'
import toast from 'react-hot-toast'
import AddCreditsModal from '@/components/global/AddCreditsModal'
import {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useLaunchCampaignMutation,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
  useCancelCampaignMutation,
  useDeleteCampaignMutation,
  useGetWhatsappNumberQuery,
  useGetTemplatesQuery,
} from '@/redux/apis/metaWhatsapp.api'
import DemoAnimatedAuthModal from '@/ReUseAbleComponents/DemoAnimatedAuthModal'
import AuthPage from '@/pages/user/AuthPage'
import DynamicWhatsappCampaignModal from '../Component/DynamicWhatsappCampaignModal'
import {
  Search,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Check,
  X,
  FileText,
  Send,
  CheckCircle,
  Play,
  Pause,
  AlertCircle,
  Clock,
  Eye,
  XCircle,
  SlidersHorizontal,
  PhoneCall,
} from 'lucide-react'

// ─── Status Config for Dynamic Badge Styles ──────────────────────────────────
const STATUS_CFG = {
  // DRAFT: { stripe: "#64748b", textCls: "text-slate-600 dark:text-slate-400", bgCls: "bg-slate-50 dark:bg-slate-500/10", borderCls: "border border-slate-200 dark:border-slate-500/25", label: "Draft" },
  SCHEDULED: {
    stripe: '#4338ca',
    textCls: 'text-[#4338ca] dark:text-indigo-400',
    bgCls: 'bg-[#e0e7ff] dark:bg-indigo-500/10',
    borderCls: 'border border-[#c7d2fe] dark:border-indigo-500/25',
    label: 'Scheduled',
  },
  RUNNING: {
    stripe: '#d97706',
    textCls: 'text-amber-700 dark:text-amber-400',
    bgCls: 'bg-amber-50 dark:bg-amber-500/10',
    borderCls: 'border border-amber-200 dark:border-amber-500/25',
    label: 'Running',
    pulse: true,
  },
  PAUSED: {
    stripe: '#d97706',
    textCls: 'text-yellow-700 dark:text-yellow-400',
    bgCls: 'bg-yellow-50 dark:bg-yellow-500/10',
    borderCls: 'border border-yellow-200 dark:border-yellow-500/25',
    label: 'Paused',
  },
  COMPLETED: {
    stripe: '#059669',
    textCls: 'text-emerald-700 dark:text-emerald-400',
    bgCls: 'bg-emerald-50 dark:bg-emerald-500/10',
    borderCls: 'border border-emerald-200 dark:border-emerald-500/25',
    label: 'Completed',
  },
  FAILED: {
    stripe: '#dc2626',
    textCls: 'text-red-700 dark:text-red-400',
    bgCls: 'bg-red-50 dark:bg-red-500/10',
    borderCls: 'border border-red-200 dark:border-red-500/25',
    label: 'Failed',
  },
  CANCELLED: {
    stripe: '#4b5563',
    textCls: 'text-slate-700 dark:text-slate-400',
    bgCls: 'bg-slate-100 dark:bg-slate-700/10',
    borderCls: 'border border-slate-300 dark:border-slate-700/25',
    label: 'Cancelled',
  },
}

// ─── Sparkline Component for Trend Graphs ────────────────────────────────────
function Sparkline({ data, stroke = '#3b82f6' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 110
  const height = 30
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * height - 2
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg
      width={width}
      height={height}
      className="mt-2 shrink-0 overflow-visible"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// ─── Circular Donut Ring Component ──────────────────────────────────────────
function DonutRing({ pct, color, isDark }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg
      width="48"
      height="48"
      className="animate-fade-in block"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
        strokeWidth="4"
      />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

// ─── Status Badge Component ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const key = String(status || '').toUpperCase()
  const cfg = STATUS_CFG[key] || {
    stripe: '#64748b',
    textCls: 'text-slate-600 dark:text-slate-400',
    bgCls: 'bg-slate-50 dark:bg-slate-500/10',
    borderCls: 'border border-slate-200 dark:border-slate-500/25',
    label: status || 'Draft',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${cfg.bgCls} ${cfg.textCls} ${cfg.borderCls}`}
    >
      {cfg.pulse ? (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ background: cfg.stripe }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: cfg.stripe }}
          />
        </span>
      ) : (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: cfg.stripe }}
        />
      )}
      {cfg.label}
    </span>
  )
}

// ─── Live Campaign Report & Log Drawer ───────────────────────────────────────
function CampaignReportDrawer({ campaignId, onClose, isDark }) {
  const {
    data: campaignData,
    isLoading,
    refetch,
  } = useGetCampaignByIdQuery(campaignId)
  const [logSearch, setLogSearch] = useState('')
  const [logStatusFilter, setLogStatusFilter] = useState('')

  const campaign = campaignData?.data

  const drawerStats = useMemo(() => {
    if (!campaign?.recipients) {
      return (
        campaign?.stats || {
          total: 0,
          sent: 0,
          delivered: 0,
          read: 0,
          failed: 0,
        }
      )
    }

    let total = campaign.recipients.length
    let sCount = 0,
      dCount = 0,
      rCount = 0,
      fCount = 0

    for (const r of campaign.recipients) {
      const hasError =
        r.status === 'FAILED' || Boolean(r.errorCode) || Boolean(r.errorMessage)
      const lastHistoryItem =
        Array.isArray(r.statusHistory) && r.statusHistory.length > 0
          ? (
              r.statusHistory[r.statusHistory.length - 1]?.status || ''
            ).toUpperCase()
          : r.logId &&
              Array.isArray(r.logId.statusHistory) &&
              r.logId.statusHistory.length > 0
            ? (
                r.logId.statusHistory[r.logId.statusHistory.length - 1]
                  ?.status || ''
              ).toUpperCase()
            : null

      const effectiveStatus = hasError
        ? 'FAILED'
        : lastHistoryItem ||
          (r.status ? String(r.status).toUpperCase() : 'PENDING')

      if (hasError || effectiveStatus === 'FAILED') {
        fCount++
      } else if (effectiveStatus === 'READ') {
        sCount++
        dCount++
        rCount++
      } else if (effectiveStatus === 'DELIVERED') {
        sCount++
        dCount++
      } else if (effectiveStatus === 'SENT') {
        sCount++
      }
    }

    return {
      total,
      sent: sCount,
      delivered: dCount,
      read: rCount,
      failed: fCount,
    }
  }, [campaign])

  const filteredRecipients = useMemo(() => {
    if (!campaign?.recipients) return []
    return campaign.recipients.filter((r) => {
      const matchesSearch =
        (r.phoneNumber && r.phoneNumber.includes(logSearch)) ||
        (r.name && r.name.toLowerCase().includes(logSearch.toLowerCase())) ||
        (r.metaMessageId && r.metaMessageId.includes(logSearch))

      const hasError =
        r.status === 'FAILED' || Boolean(r.errorCode) || Boolean(r.errorMessage)
      const lastHistoryItem =
        Array.isArray(r.statusHistory) && r.statusHistory.length > 0
          ? (
              r.statusHistory[r.statusHistory.length - 1]?.status || ''
            ).toUpperCase()
          : r.logId &&
              Array.isArray(r.logId.statusHistory) &&
              r.logId.statusHistory.length > 0
            ? (
                r.logId.statusHistory[r.logId.statusHistory.length - 1]
                  ?.status || ''
              ).toUpperCase()
            : null

      const effectiveStatus = hasError
        ? 'FAILED'
        : lastHistoryItem ||
          (r.status ? String(r.status).toUpperCase() : 'PENDING')

      const matchesStatus = logStatusFilter
        ? effectiveStatus === logStatusFilter.toUpperCase()
        : true
      return matchesSearch && matchesStatus
    })
  }, [campaign?.recipients, logSearch, logStatusFilter])

  if (!campaignId) return null

  return (
    <div className="animate-slide-in fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#0f111a]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-[#131622]">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            {campaign?.name || 'Loading Campaign Report...'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="cursor-pointer rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-orange-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-[#1a1d2d] dark:hover:text-orange-400"
            title="Force Refresh Logs"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-transparent dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Campaign Summary & Stats Grid inside drawer */}
      {campaign && (
        <div className="grid grid-cols-5 gap-2 border-b border-slate-200/80 bg-slate-50/50 p-5 text-center dark:border-white/[0.06] dark:bg-[#121420]">
          {[
            {
              label: 'Total',
              value: drawerStats.total || 0,
              textCls: 'text-slate-700 dark:text-slate-300',
            },
            {
              label: 'Sent',
              value: drawerStats.sent || 0,
              textCls: 'text-orange-600 dark:text-orange-400',
            },
            {
              label: 'Delivered',
              value: drawerStats.delivered || 0,
              textCls: 'text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'Read',
              value: drawerStats.read || 0,
              textCls: 'text-sky-600 dark:text-sky-400',
            },
            {
              label: 'Failed',
              value: drawerStats.failed || 0,
              textCls: 'text-red-600 dark:text-red-400',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/[0.04] dark:bg-white/[0.02] dark:shadow-none"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {s.label}
              </span>
              <span className={`mt-1 block text-base font-bold ${s.textCls}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Logs Toolbar */}
      <div className="flex flex-col gap-2.5 border-b border-slate-200 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-[#0c0e15]">
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Search by name, phone or message ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-white/[0.08] dark:bg-[#151824] dark:text-slate-200"
            />
            {logSearch && (
              <button
                onClick={() => setLogSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <select
            value={logStatusFilter}
            onChange={(e) => setLogStatusFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/[0.08] dark:bg-[#151824] dark:text-slate-200"
          >
            <option value="">
              All Statuses ({campaign?.recipients?.length || 0})
            </option>
            <option value="PENDING">⚪ Pending</option>
            <option value="SENT">🟠 Sent</option>
            <option value="DELIVERED">🟢 Delivered</option>
            <option value="READ">🔵 Read</option>
            <option value="FAILED">🔴 Failed</option>
          </select>
        </div>

        {/* Active filter count & clear action */}
        {(logSearch || logStatusFilter) && (
          <div className="flex items-center justify-between px-1 pt-0.5 text-[11px] text-slate-500">
            <span>
              Showing{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {filteredRecipients.length}
              </strong>{' '}
              of {campaign?.recipients?.length || 0} recipients
            </span>
            <button
              onClick={() => {
                setLogSearch('')
                setLogStatusFilter('')
              }}
              className="cursor-pointer text-[10px] font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Recipients Log List */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 dark:bg-[#0a0c12]">
        {isLoading && !campaign ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-xs">Fetching live recipient details...</span>
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <FileText className="mb-2 h-10 w-10 opacity-30" />
            <span className="text-xs">No matching recipient logs found</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredRecipients.map((r, idx) => {
              const hasError =
                r.status === 'FAILED' ||
                Boolean(r.errorCode) ||
                Boolean(r.errorMessage)

              const lastHistoryItem =
                Array.isArray(r.statusHistory) && r.statusHistory.length > 0
                  ? (
                      r.statusHistory[r.statusHistory.length - 1]?.status || ''
                    ).toUpperCase()
                  : null

              const latestStatus = hasError
                ? 'FAILED'
                : (lastHistoryItem || r.status || 'PENDING').toUpperCase()

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 dark:border-white/[0.04] dark:bg-[#121420] dark:shadow-none dark:hover:border-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        {r.name || 'Unknown'}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                        <PhoneCall className="h-2.5 w-2.5" /> {r.phoneNumber}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                          latestStatus === 'READ'
                            ? 'border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                            : latestStatus === 'DELIVERED'
                              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : latestStatus === 'SENT'
                                ? 'border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                : latestStatus === 'FAILED'
                                  ? 'border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                                  : 'border border-slate-500/20 bg-slate-500/10 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {latestStatus}
                      </span>
                    </div>
                  </div>

                  {/* Prominent Status History Timeline */}
                  {(() => {
                    let rawSteps = []
                    if (
                      r.logId &&
                      Array.isArray(r.logId.statusHistory) &&
                      r.logId.statusHistory.length > 0
                    ) {
                      rawSteps = r.logId.statusHistory
                    } else if (
                      Array.isArray(r.statusHistory) &&
                      r.statusHistory.length > 0
                    ) {
                      rawSteps = r.statusHistory
                    } else {
                      if (r.sentAt)
                        rawSteps.push({ status: 'SENT', timestamp: r.sentAt })
                      if (r.deliveredAt)
                        rawSteps.push({
                          status: 'DELIVERED',
                          timestamp: r.deliveredAt,
                        })
                      if (r.readAt)
                        rawSteps.push({ status: 'READ', timestamp: r.readAt })
                      if (r.failedAt || hasError)
                        rawSteps.push({
                          status: 'FAILED',
                          timestamp: r.failedAt || r.updatedAt,
                        })
                    }

                    // Deduplicate consecutive identical statuses
                    const steps = rawSteps.reduce((acc, current) => {
                      const last = acc[acc.length - 1]
                      if (
                        !last ||
                        (last.status || '').toUpperCase() !==
                          (current.status || '').toUpperCase()
                      ) {
                        acc.push(current)
                      }
                      return acc
                    }, [])

                    if (steps.length === 0) return null

                    return (
                      <div className="mt-3 border-t border-slate-100 pt-3 dark:border-white/[0.04]">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Status History Timeline
                          </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {steps.map((step, sIdx) => {
                            const sUpper = (step.status || '').toUpperCase()
                            const isLast = sIdx === steps.length - 1

                            const styleMap = {
                              SENT: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                              DELIVERED:
                                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                              READ: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                              FAILED:
                                'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                              QUEUED:
                                'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                            }

                            return (
                              <div
                                key={sIdx}
                                className="flex shrink-0 items-center gap-2"
                              >
                                <div
                                  className={`flex flex-col gap-0.5 rounded-lg border px-2.5 py-1 ${styleMap[sUpper] || styleMap.QUEUED}`}
                                >
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                    {sUpper}
                                  </span>
                                  <span className="font-mono text-[10px] font-bold">
                                    {step.timestamp
                                      ? new Date(
                                          step.timestamp
                                        ).toLocaleTimeString()
                                      : 'N/A'}
                                  </span>
                                </div>
                                {!isLast && (
                                  <span className="shrink-0 text-xs font-bold text-slate-400 dark:text-slate-600">
                                    →
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Error Details (Dual Error Display: Raw Meta Error + Our Solution Guidance) */}
                  {hasError && (
                    <div className="mt-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[11px] leading-relaxed text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                      <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Error Code: {r.errorCode || 'Unknown'}</span>
                      </div>

                      {/* 1. Raw Meta API Error */}
                      <div className="mt-2 rounded-lg border border-red-500/20 bg-white/70 p-2 dark:border-red-500/30 dark:bg-[#1a0f14]">
                        <span className="block text-[9px] font-extrabold uppercase tracking-wider text-red-500 dark:text-red-400">
                          🔹 Raw Meta API Error:
                        </span>
                        <p className="mt-0.5 font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                          {r.errorMessage || 'In order to maintain a healthy ecosystem engagement, the message failed to be delivered.'}
                        </p>
                      </div>

                      {/* 2. Our Platform Solution & Guidance */}
                      <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-900 dark:border-amber-500/20 dark:text-amber-200">
                        <span className="block text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          💡 Our Platform Solution & Guidance:
                        </span>
                        <p className="mt-0.5 font-sans text-[10px] font-medium leading-normal">
                          {String(r.errorCode) === '131049'
                            ? 'Auto-scheduled 24-hour retry hold. Recipient hit Meta frequency cap. Recipient can also send "Hi" to your WhatsApp number to unblock delivery immediately.'
                            : String(r.errorCode) === '130429'
                            ? 'Rate limit hit. Campaign queue auto-paused and will resume after exponential backoff.'
                            : String(r.errorCode) === '131026'
                            ? 'Message undeliverable. Recipient phone number is not registered on WhatsApp or is inactive.'
                            : String(r.errorCode) === '131047'
                            ? '24-hour customer service window expired. Please send an approved template message.'
                            : String(r.errorCode) === '190' || String(r.errorCode) === '100'
                            ? 'Meta Access Token expired. Please re-authenticate your WhatsApp Business account in settings.'
                            : String(r.errorCode) === '132015'
                            ? 'Template paused by Meta due to low quality rating. Please review template content in WhatsApp Manager.'
                            : 'Message delivery failed via Meta Cloud API. Check campaign logs for details.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Meta Message ID */}
                  {/* {r.metaMessageId && (
                                        <div className="mt-1.5 text-[9px] text-slate-400 dark:text-slate-600 font-mono truncate">
                                            wamid: {r.metaMessageId}
                                        </div>
                                    )} */}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Whatsapp Campaigns Redesigned ──────────────────────────────────────
export default function MetaWhatsappCampaigns() {
  const { isDark } = useTheme()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modal states
  const [showDynamicCreateCampaign, setShowDynamicCreateCampaign] =
    useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeReportId, setActiveReportId] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  const reduxUser = useSelector((state) => state.auth?.user)
  const isGuest = Boolean(reduxUser?.isGuest)
  const openAuthModal = () => setShowAuthModal(true)

  const { data, isLoading, refetch, isFetching } = useGetCampaignsQuery({
    search,
    status: statusFilter,
  })
  const { data: numbersData } = useGetWhatsappNumberQuery()

  const [launchCampaign] = useLaunchCampaignMutation()
  const [pauseCampaign] = usePauseCampaignMutation()
  const [resumeCampaign] = useResumeCampaignMutation()
  const [cancelCampaign] = useCancelCampaignMutation()
  const [deleteCampaign] = useDeleteCampaignMutation()

  const rawCampaigns = data?.data || []
  const numbers = numbersData?.data || []

  // Filter campaigns by Channel local filter (if selected) and date range
  const campaigns = useMemo(() => {
    let filtered = rawCampaigns
    if (channelFilter) {
      filtered = filtered.filter((c) => c.numberId?._id === channelFilter)
    }
    if (dateFrom) {
      const fromTime = new Date(dateFrom).setHours(0, 0, 0, 0)
      filtered = filtered.filter((c) => {
        const date = c.scheduledAt
          ? new Date(c.scheduledAt)
          : new Date(c.createdAt)
        return date.getTime() >= fromTime
      })
    }
    if (dateTo) {
      const toTime = new Date(dateTo).setHours(23, 59, 59, 999)
      filtered = filtered.filter((c) => {
        const date = c.scheduledAt
          ? new Date(c.scheduledAt)
          : new Date(c.createdAt)
        return date.getTime() <= toTime
      })
    }
    return filtered
  }, [rawCampaigns, channelFilter, dateFrom, dateTo])

  // Summary calculation
  const totals = useMemo(() => {
    return rawCampaigns.reduce(
      (acc, c) => ({
        sent: acc.sent + (c.stats?.sent || 0),
        delivered: acc.delivered + (c.stats?.delivered || 0),
      }),
      { sent: 0, delivered: 0 }
    )
  }, [rawCampaigns])

  const OVERVIEW_CARDS = [
    {
      label: 'Total Campaigns',
      value: rawCampaigns.length,
      subtext: 'All time',
      icon: <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      iconBg:
        'bg-[#e0e7ff] dark:bg-blue-500/10 border border-[#c7d2fe] dark:border-blue-500/20',
      sparkline: [10, 15, 8, 12, 18, 14, rawCampaigns.length || 20],
      color: '#3b82f6',
    },
    {
      label: 'Running',
      value: rawCampaigns.filter((c) => c.status === 'RUNNING').length,
      subtext: 'Live campaigns',
      icon: (
        <Play
          className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
          fill="currentColor"
        />
      ),
      iconBg:
        'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20',
      sparkline: [
        1,
        2,
        1,
        3,
        2,
        4,
        rawCampaigns.filter((c) => c.status === 'RUNNING').length || 3,
      ],
      color: '#22c55e',
    },
    {
      label: 'Messages Sent',
      value: totals.sent.toLocaleString(),
      subtext: 'All campaigns',
      icon: (
        <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
      ),
      iconBg:
        'bg-[#e0e7ff] dark:bg-[#e0e7ff]/10 border border-[#c7d2fe] dark:border-[#e0e7ff]/20',
      sparkline: [2000, 5000, 2000, 12000, 8000, 15000, totals.sent || 59336],
      color: '#8b5cf6',
    },
    {
      label: 'Delivered',
      value: totals.delivered.toLocaleString(),
      subtext: totals.sent
        ? `Delivery rate ${Math.round((totals.delivered / totals.sent) * 100)}%`
        : 'Delivery rate 0%',
      icon: (
        <Check
          className="h-5 w-5 text-sky-600 dark:text-sky-400"
          strokeWidth={3}
        />
      ),
      iconBg:
        'bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20',
      sparkline: [
        1200,
        3800,
        2400,
        10000,
        7200,
        13000,
        totals.delivered || 37542,
      ],
      color: '#0ea5e9',
    },
  ]

  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false)
  const [topupAmount, setTopupAmount] = useState(100)

  const handleAction = async (fn, id, msg) => {
    if (msg && !confirm(msg)) return
    try {
      await fn(id).unwrap()
      refetch()
      setActiveMenuId(null)
      toast.success('Action completed successfully')
    } catch (err) {
      console.error('Campaign Action Error:', err)
      const errMsg =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        'Action failed'
      toast.error(errMsg)

      if (err?.data?.insufficientCredits || err?.status === 403) {
        const shortfall = err?.data?.data?.shortfall || 100
        setTopupAmount(Math.max(100, Math.ceil(shortfall)))
        setShowAddCreditsModal(true)
      }
    }
  }

  // Pagination calculations
  const paginatedCampaigns = useMemo(() => {
    const start = (page - 1) * pageSize
    return campaigns.slice(start, start + pageSize)
  }, [campaigns, page, pageSize])

  const totalPages = Math.ceil(campaigns.length / pageSize) || 1

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f8fafc] font-sans text-slate-800 transition-colors duration-200 dark:bg-[#08090e] dark:text-slate-200">
      <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in {
                    animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

      {/* Add Credits Modal */}
      {showAddCreditsModal && (
        <AddCreditsModal
          isOpen={showAddCreditsModal}
          onClose={() => setShowAddCreditsModal(false)}
          defaultAmount={topupAmount}
        />
      )}

      {/* Create Campaign Modal */}
      {showDynamicCreateCampaign && (
        <DynamicWhatsappCampaignModal
          onClose={() => {
            setShowDynamicCreateCampaign(false)
            refetch()
          }}
          isGuest={isGuest}
          onRequireAuth={openAuthModal}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <DemoAnimatedAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        >
          <AuthPage onSuccess={() => setShowAuthModal(false)} />
        </DemoAnimatedAuthModal>
      )}

      {/* Live Log Report Side Drawer */}
      {activeReportId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity dark:bg-black/60"
            onClick={() => setActiveReportId(null)}
          />
          <CampaignReportDrawer
            campaignId={activeReportId}
            onClose={() => setActiveReportId(null)}
            isDark={isDark}
          />
        </>
      )}

      {/* ── Page Header ── */}
      <div className="my-2 shrink-0 border-b border-slate-200 bg-white px-6 pb-2 pt-2 dark:border-white/[0.04] dark:bg-[#08090e]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-[#0f172a] dark:text-white">
              WhatsApp Campaigns
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Send bulk WhatsApp messages to your contacts
            </p>
          </div>
          <button
            onClick={() => setShowDynamicCreateCampaign(true)}
            className="flex cursor-pointer shrink-0 whitespace-nowrap items-center gap-2 rounded-lg border-none bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all duration-150 hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </button>
        </div>

        {/* Executive Summary Stats Cards */}
        <div className="mb-4 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {OVERVIEW_CARDS.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm transition-all hover:border-slate-300 dark:border-white/[0.06] dark:bg-[#0f111a] dark:shadow-none dark:hover:border-white/[0.12]"
            >
              <div className="flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {s.label}
                </span>
                <span className="mt-2 block text-3xl font-bold text-[#0f172a] dark:text-white">
                  {s.value}
                </span>
                <span className="mt-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {s.subtext}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${s.iconBg}`}
                >
                  {s.icon}
                </span>
                <Sparkline data={s.sparkline} stroke={s.color} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Table & Filter Panel ── */}
      <div className="relative mx-4 mb-4 flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.06] dark:bg-[#0c0e15] dark:shadow-none">
        {/* Search & Select Filters */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-white/[0.06] dark:bg-[#0f111a]">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by campaign name, template or number..."
              className="w-64 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-white/[0.08] dark:bg-[#141724] dark:text-slate-200 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none dark:border-white/[0.08] dark:bg-[#141724] dark:text-slate-300"
            >
              <option value="">All</option>
              {/* <option value="DRAFT">Draft</option> */}
              <option value="SCHEDULED">Scheduled</option>
              {/* <option value="RUNNING">Running</option> */}
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Channel Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>From Phone:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none dark:border-white/[0.08] dark:bg-[#141724] dark:text-slate-300"
            >
              <option value="">All</option>
              {numbers.map((num) => (
                <option key={num._id} value={num._id}>
                  {num.displayName || num.phoneNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-sm transition-all hover:border-blue-500/50 dark:border-white/[0.08] dark:bg-[#141724] dark:text-slate-300">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-500 pointer-events-none" />
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    setPage(1)
                  }}
                  className="w-[100px] cursor-pointer border-none bg-transparent p-0 text-xs font-medium text-slate-800 outline-none focus:ring-0 dark:text-slate-200 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  style={{ colorScheme: isDark ? 'dark' : 'light' }}
                />
              </div>
              <span className="px-0.5 text-xs font-semibold text-slate-400 pointer-events-none">to</span>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    setPage(1)
                  }}
                  className="w-[100px] cursor-pointer border-none bg-transparent p-0 text-xs font-medium text-slate-800 outline-none focus:ring-0 dark:text-slate-200 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  style={{ colorScheme: isDark ? 'dark' : 'light' }}
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                    setPage(1)
                  }}
                  className="ml-1 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                  title="Clear dates"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Refresh & Reset Buttons */}
          <div className="ml-auto flex items-center gap-2">
            {/* <button 
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("");
                                setChannelFilter("");
                                setDateFrom("");
                                setDateTo("");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-transparent border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                            <SlidersHorizontal className="w-3 h-3" />
                            Filters
                        </button> */}
            <button
              onClick={() => refetch()}
              className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition hover:border-orange-500/30 hover:text-orange-500 dark:border-white/[0.08] dark:bg-transparent dark:text-slate-400"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-orange-500' : ''}`}
              />{' '}
              {isFetching ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>

        {/* Combined Pagination & Status Tabs Bar */}
        <div className="flex shrink-0 items-center justify-between gap-4 overflow-x-auto border-b border-slate-200 bg-white px-4 dark:border-white/[0.05] dark:bg-[#0a0c12]">
          {/* Left: Pagination Controls */}
          <div className="flex shrink-0 items-center gap-4 py-2 text-xs text-slate-600 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="cursor-pointer rounded border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:outline-none dark:border-white/[0.08] dark:bg-[#141724] dark:text-slate-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              {/* <span>campaigns per page</span> */}
            </div>

            <div className="font-semibold text-slate-500 dark:text-slate-400">
              Showing {campaigns.length > 0 ? (page - 1) * pageSize + 1 : 0}-
              {Math.min(page * pageSize, campaigns.length)} of{' '}
              {campaigns.length.toLocaleString()} results
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="cursor-pointer rounded border border-slate-200 bg-white p-1 text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.08] dark:bg-[#141724] dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const p = start + i
                if (p > totalPages) return null
                const isActive = page === p
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border-none text-[11px] font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="cursor-pointer rounded border border-slate-200 bg-white p-1 text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.08] dark:bg-[#141724] dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Status Tabs */}
          {/* <div className="flex items-center gap-4 shrink-0">
                        {[
                            { key: "", label: "All", count: rawCampaigns.length },
                            // { key: "DRAFT", label: "Draft", count: rawCampaigns.filter(c => c.status === "DRAFT").length },
                            { key: "SCHEDULED", label: "Scheduled", count: rawCampaigns.filter(c => c.status === "SCHEDULED").length },
                            // { key: "RUNNING", label: "Running", count: rawCampaigns.filter(c => c.status === "RUNNING").length },
                            { key: "PAUSED", label: "Paused", count: rawCampaigns.filter(c => c.status === "PAUSED").length },
                            { key: "COMPLETED", label: "Completed", count: rawCampaigns.filter(c => c.status === "COMPLETED").length },
                            { key: "FAILED", label: "Failed", count: rawCampaigns.filter(c => c.status === "FAILED").length },
                            { key: "CANCELLED", label: "Cancelled", count: rawCampaigns.filter(c => c.status === "CANCELLED").length },
                        ].map(tab => {
                            const active = statusFilter === tab.key;
                            return (
                                <button 
                                    key={tab.key} 
                                    onClick={() => {
                                        setStatusFilter(tab.key);
                                        setPage(1);
                                    }}
                                    className={`py-3 px-1 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-transparent border-t-0 border-x-0 border-b-2 -mb-[1px] outline-none ${
                                        active 
                                            ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 font-bold" 
                                            : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                        active ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-600"
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div> */}
        </div>

        {/* Table Data View */}
        <div className="flex-1 overflow-auto bg-white dark:bg-[#0b0c13]">
          <table className="w-full min-w-[1100px] table-fixed border-collapse text-left">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="border-b border-slate-200 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/[0.06] dark:bg-[#0f111a]">
                <th className="w-[50px] border-r border-slate-200 bg-white p-4 text-center text-[11px] font-bold dark:border-white/[0.06] dark:bg-[#0f111a]">
                  #
                </th>
                <th className="w-[200px] border-r border-slate-200 bg-white p-4 text-[11px] font-bold dark:border-white/[0.06] dark:bg-[#0f111a]">
                  Campaign
                </th>
                <th className="w-[200px] border-r border-slate-200 bg-white p-4 text-[11px] font-bold dark:border-white/[0.06] dark:bg-[#0f111a]">
                  From Phone & Template
                </th>
                <th className="w-[110px] border-r border-slate-200 bg-white p-4 text-center text-[11px] font-bold dark:border-white/[0.06] dark:bg-[#0f111a]">
                  Progress
                </th>
                <th className="w-[110px] border-r border-slate-200 bg-white p-4 text-center text-[11px] font-bold dark:border-white/[0.06] dark:bg-[#0f111a]">
                  Recipients
                </th>
                <th className="w-[280px] border-r border-slate-200 bg-white p-4 text-[11px] font-bold dark:border-white/[0.06] dark:bg-[#0f111a]">
                  Delivery Status
                </th>
                <th className="w-[160px] border-r border-slate-200 bg-white p-4 text-[11px] font-bold dark:border-white/[0.06] dark:bg-[#0f111a]">
                  Schedule
                </th>
                <th className="w-[130px] bg-white p-4 text-center text-[11px] font-bold dark:bg-[#0f111a]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="p-16 text-center text-slate-500">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-blue-500/20 border-t-blue-500" />
                    <span className="text-xs">
                      Loading WhatsApp campaigns...
                    </span>
                  </td>
                </tr>
              ) : paginatedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-slate-200 dark:border-white/[0.06]">
                      <Send className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      No campaigns found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Create a new WhatsApp campaign to start sending bulk
                      templates.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCampaigns.map((c, idx) => {
                  let totalRecipients = c.stats?.total || 0
                  let sentRecipients = c.stats?.sent || 0
                  let deliveredRecipients = c.stats?.delivered || 0
                  let readRecipients = c.stats?.read || 0
                  let failedRecipients = c.stats?.failed || 0
                  let skippedRecipients =
                    c.stats?.skipped || c.stats?.skippedUserLimit || 0

                  if (Array.isArray(c.recipients) && c.recipients.length > 0) {
                    totalRecipients = c.recipients.length
                    let sCount = 0,
                      dCount = 0,
                      rCount = 0,
                      fCount = 0,
                      skCount = 0

                    for (const r of c.recipients) {
                      const hasError =
                        r.status === 'FAILED' ||
                        Boolean(r.errorCode) ||
                        Boolean(r.errorMessage)
                      const lastHistoryItem =
                        Array.isArray(r.statusHistory) &&
                        r.statusHistory.length > 0
                          ? (
                              r.statusHistory[r.statusHistory.length - 1]
                                ?.status || ''
                            ).toUpperCase()
                          : r.logId &&
                              Array.isArray(r.logId.statusHistory) &&
                              r.logId.statusHistory.length > 0
                            ? (
                                r.logId.statusHistory[
                                  r.logId.statusHistory.length - 1
                                ]?.status || ''
                              ).toUpperCase()
                            : null

                      const effectiveStatus = hasError
                        ? 'FAILED'
                        : lastHistoryItem ||
                          (r.status
                            ? String(r.status).toUpperCase()
                            : 'PENDING')

                      if (hasError || effectiveStatus === 'FAILED') {
                        fCount++
                      } else if (effectiveStatus === 'READ') {
                        sCount++
                        dCount++
                        rCount++
                      } else if (effectiveStatus === 'DELIVERED') {
                        sCount++
                        dCount++
                      } else if (effectiveStatus === 'SENT') {
                        sCount++
                      } else if (
                        effectiveStatus === 'SKIPPED' ||
                        effectiveStatus === 'SKIPPED_USER_LIMIT'
                      ) {
                        skCount++
                      }
                    }

                    sentRecipients = sCount
                    deliveredRecipients = dCount
                    readRecipients = rCount
                    failedRecipients = fCount
                    skippedRecipients = skCount
                  }

                  const hasStats = totalRecipients > 0

                  const progressPercent =
                    c.progressPercent ??
                    (totalRecipients > 0
                      ? Math.min(
                          100,
                          Math.round(
                            ((sentRecipients +
                              failedRecipients +
                              skippedRecipients) /
                              totalRecipients) *
                              100
                          )
                        )
                      : 0)

                  const deliveryPercent =
                    c.deliveryRate ??
                    (sentRecipients > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (deliveredRecipients / sentRecipients) * 100
                          )
                        )
                      : 0)

                  const readPercent =
                    c.readRate ??
                    (deliveredRecipients > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (readRecipients / deliveredRecipients) * 100
                          )
                        )
                      : sentRecipients > 0
                        ? Math.min(
                            100,
                            Math.round((readRecipients / sentRecipients) * 100)
                          )
                        : 0)

                  const failurePercent =
                    totalRecipients > 0
                      ? Math.min(
                          100,
                          Math.round((failedRecipients / totalRecipients) * 100)
                        )
                      : 0

                  return (
                    <tr
                      key={c._id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/[0.04] dark:hover:bg-white/[0.01]"
                    >
                      {/* Column 0: Number Sequence */}
                      <td className="border-r border-slate-100 p-4 text-center align-middle text-xs font-bold text-slate-400 dark:border-white/[0.04] dark:text-slate-600">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      {/* Column 1: Campaign details */}
                      <td className="border-r border-slate-100 p-4 align-middle dark:border-white/[0.04]">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className="block cursor-pointer truncate text-xs font-bold text-[#0f172a] transition hover:text-blue-600 dark:text-slate-100"
                            onClick={() => setActiveReportId(c._id)}
                          >
                            {c.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <StatusBadge status={c.status} />
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Channel & template */}
                      <td className="border-r border-slate-100 p-4 align-middle dark:border-white/[0.04]">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 truncate text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                              w
                            </span>
                            {c.numberId?.displayName || 'Connected Number'}
                          </span>
                          <span className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            {c.templateId?.name || 'No Template'} (
                            {c.templateId?.category || 'Utility'})
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {c.templateId?.language || 'English'}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Circular progress */}
                      <td className="border-r border-slate-100 p-4 text-center align-middle dark:border-white/[0.04]">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {c.status === 'DRAFT' ? (
                            <>
                              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 dark:border-slate-500/20 dark:bg-slate-500/5">
                                <FileText className="h-5 w-5 text-slate-500" />
                              </div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Draft
                              </span>
                            </>
                          ) : c.status === 'SCHEDULED' ? (
                            <>
                              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full border border-dashed border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/5">
                                <Clock className="h-5 w-5 text-blue-500" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                                Scheduled
                              </span>
                            </>
                          ) : c.status === 'FAILED' ? (
                            <>
                              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5">
                                <XCircle className="h-5 w-5 text-red-500" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                                Failed
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="relative flex items-center justify-center">
                                <DonutRing
                                  pct={progressPercent}
                                  color={
                                    STATUS_CFG[c.status]?.stripe || '#3b82f6'
                                  }
                                  isDark={isDark}
                                />
                                <span className="absolute text-[10px] font-extrabold text-[#0f172a] dark:text-slate-300">
                                  {progressPercent}%
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                  c.status === 'COMPLETED'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : c.status === 'RUNNING'
                                      ? 'animate-pulse font-bold text-amber-600 dark:text-amber-400'
                                      : c.status === 'PAUSED'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : c.status === 'FAILED'
                                          ? 'text-red-600 dark:text-red-400'
                                          : 'text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {STATUS_CFG[c.status]?.label || c.status}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Recipients totals */}
                      <td className="border-r border-slate-100 p-4 text-left align-middle dark:border-white/[0.04]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {totalRecipients.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total
                          </span>
                          {hasStats && (
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                              {sentRecipients.toLocaleString()} Sent
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Delivery Status (Sent, Delivered, Read, Failed) */}
                      <td className="border-r border-slate-100 p-4 align-middle dark:border-white/[0.04]">
                        {hasStats ? (
                          <div className="flex items-center gap-5">
                            {/* Sent */}
                            <div className="flex min-w-[50px] flex-col gap-0.5">
                              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                                {sentRecipients.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Sent
                              </span>
                            </div>

                            {/* Delivered */}
                            <div className="flex min-w-[50px] flex-col gap-0.5">
                              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                {deliveredRecipients.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Delivered
                              </span>
                            </div>

                            {/* Read */}
                            <div className="flex min-w-[50px] flex-col gap-0.5">
                              <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400">
                                {readRecipients.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Read
                              </span>
                            </div>

                            {/* Failed */}
                            <div className="flex min-w-[50px] flex-col gap-0.5">
                              <span className="text-xs font-extrabold text-red-600 dark:text-red-400">
                                {failedRecipients.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Failed
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400 dark:text-slate-600">
                            -
                          </span>
                        )}
                      </td>

                      {/* Column 6: Schedule */}
                      <td className="border-r border-slate-100 p-4 align-middle dark:border-white/[0.04]">
                        <div className="flex flex-col gap-1">
                          {c.scheduledAt ? (
                            <>
                              <span className="flex items-center gap-1 text-[11px] font-bold text-[#0f172a] dark:text-slate-100">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                {new Date(c.scheduledAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: 'numeric',
                                  }
                                )}
                              </span>
                              <span className="pl-4 font-mono text-[10px] text-slate-500">
                                {new Date(c.scheduledAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  }
                                )}
                              </span>
                              <span
                                className={`mt-0.5 flex items-center gap-1 text-[9px] font-bold ${
                                  c.status === 'COMPLETED'
                                    ? 'text-emerald-500'
                                    : c.status === 'RUNNING'
                                      ? 'text-orange-500'
                                      : 'text-blue-500'
                                }`}
                              >
                                {c.status === 'COMPLETED' ? (
                                  <>✔ Completed</>
                                ) : c.status === 'RUNNING' ? (
                                  <>⏱ Running</>
                                ) : (
                                  <>⏱ In 1 day</>
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="pl-2 text-[10px] italic text-slate-400 dark:text-slate-500">
                              Not scheduled
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 7: Action Controls */}
                      <td className="relative p-4 text-right align-middle">
                        <div className="inline-flex items-center gap-1">
                          {/* Primary Button */}
                          {['COMPLETED', 'FAILED', 'CANCELLED'].includes(
                            c.status
                          ) ? (
                            <button
                              onClick={() => setActiveReportId(c._id)}
                              className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                            >
                              View Report
                            </button>
                          ) : c.status === 'RUNNING' ? (
                            <button
                              onClick={() => handleAction(pauseCampaign, c._id)}
                              className="cursor-pointer whitespace-nowrap rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 dark:border-orange-500/20 dark:bg-transparent dark:text-orange-400 dark:hover:bg-orange-500/5"
                            >
                              Pause
                            </button>
                          ) : c.status === 'PAUSED' ? (
                            <button
                              onClick={() =>
                                handleAction(resumeCampaign, c._id)
                              }
                              className="cursor-pointer whitespace-nowrap rounded-lg border-none bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700"
                            >
                              Resume
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleAction(launchCampaign, c._id)
                              }
                              className="cursor-pointer whitespace-nowrap rounded-lg border-none bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700"
                            >
                              Launch
                            </button>
                          )}

                          {/* Three dot dropdown toggle */}
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setActiveMenuId(
                                  activeMenuId === c._id ? null : c._id
                                )
                              }
                              className="cursor-pointer rounded-lg border-none p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/[0.04] dark:hover:text-slate-300"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>

                            {activeMenuId === c._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveMenuId(null)}
                                />
                                <div className="animate-slide-in absolute right-0 z-20 mt-1.5 w-36 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-xl dark:border-white/[0.08] dark:bg-[#141622]">
                                  {[
                                    'DRAFT',
                                    'SCHEDULED',
                                    'RUNNING',
                                    'PAUSED',
                                  ].includes(c.status) && (
                                    <button
                                      onClick={() =>
                                        handleAction(
                                          cancelCampaign,
                                          c._id,
                                          'Cancel this campaign?'
                                        )
                                      }
                                      className="w-full cursor-pointer rounded-lg border-none bg-transparent px-2.5 py-1.5 text-left text-[11px] text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200"
                                    >
                                      Cancel Campaign
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setActiveReportId(c._id)}
                                    className="w-full cursor-pointer rounded-lg border-none bg-transparent px-2.5 py-1.5 text-left text-[11px] text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200"
                                  >
                                    View Live Logs
                                  </button>
                                  {[
                                    'COMPLETED',
                                    'FAILED',
                                    'CANCELLED',
                                    'DRAFT',
                                  ].includes(c.status) && (
                                    <button
                                      onClick={() =>
                                        handleAction(
                                          deleteCampaign,
                                          c._id,
                                          'Delete this campaign permanently?'
                                        )
                                      }
                                      className="w-full cursor-pointer rounded-lg border-none bg-transparent px-2.5 py-1.5 text-left text-[11px] text-red-600 hover:bg-red-500/5 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      Delete Campaign
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
