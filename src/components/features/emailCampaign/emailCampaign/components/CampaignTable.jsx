import React, { useState } from 'react'
import {
  Download,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  FileSpreadsheet,
  Mail,
  Calendar,
  Activity,
  ChevronRight,
  Table,
  X,
  Clock,
  Square,
  MoreVertical,
} from 'lucide-react'
import { useStopEmailCampaignMutation } from '../../../../redux/apis/emailCampaignApi'
import { formatDate } from '@/utils/dateFormat'

// ─── Circular Donut Ring Component ───
function DonutRing({ pct, color, size = 48, isDark }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg
      width={size}
      height={size}
      className="block"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
        strokeWidth="5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

const formatRolloverTime = (resumeAt, defaultText = 'tomorrow') => {
  if (!resumeAt) return defaultText
  try {
    const resumeDate = new Date(resumeAt)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()

    let dayText = ''
    if (isSameDay(resumeDate, today)) {
      dayText = 'Today'
    } else if (isSameDay(resumeDate, tomorrow)) {
      dayText = 'Tomorrow'
    } else {
      dayText = resumeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const timeText = resumeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return `${dayText} at ${timeText}`
  } catch (err) {
    return defaultText
  }
}

export default function CampaignTable({
  campaigns = [],
  loading = false,
  isGuest = false,
  onRequireAuth,
  onViewLogs,
}) {
  const [stopEmailCampaign, { isLoading: isStopping }] = useStopEmailCampaignMutation()
  const [stopConfirmCampaign, setStopConfirmCampaign] = useState(null)
  const [stopError, setStopError] = useState('')
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [rolloverCampaign, setRolloverCampaign] = useState(null)
  const isDark = document.documentElement.classList.contains('dark')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--app-pages-text)]">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--app-pages-border)] border-t-[var(--app-brand-primary)]" />
        <p className="text-sm font-medium">Loading campaigns...</p>
      </div>
    )
  }

  if (!campaigns.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[var(--app-pages-text)]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
          <Mail className="h-8 w-8 text-[var(--app-brand-primary)]" />
        </div>
        <p className="text-base font-semibold text-[var(--app-pages-text)]">
          No campaigns found
        </p>
        <p className="mt-1 text-sm text-[var(--app-pages-subhead-text)]">
          Get started by creating your first email campaign.
        </p>
      </div>
    )
  }

  const STATUS_CFG = {
    'completed': { stripe: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
    'processing': { stripe: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
    'sending': { stripe: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
    'queued': { stripe: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
    'paused': { stripe: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
    'failed': { stripe: '#f43f5e', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/20' },
    'stopped': { stripe: '#71717a', bg: 'bg-zinc-100 dark:bg-zinc-800/40', text: 'text-zinc-700 dark:text-zinc-400', border: 'border-zinc-200 dark:border-zinc-700' },
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[940px]">
          <thead className="sticky top-0 z-10 shadow-sm">
          <tr className="bg-[var(--app-pages-bg)] border-b border-[var(--app-pages-border)] text-[10px] uppercase font-bold text-[var(--app-pages-text)] tracking-wider">
            <th className="font-bold text-[11px] p-4 w-[50px] border-r border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-center">#</th>
            <th className="font-bold text-[11px] p-4 w-[200px] border-r border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">Campaign</th>
            <th className="font-bold text-[11px] p-4 w-[200px] border-r border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-center">Provider & Template</th>
            <th className="font-bold text-[11px] p-4 w-[110px] text-center border-r border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">Progress</th>
            <th className="font-bold text-[11px] p-4 w-[110px] text-center border-r border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">Recipients</th>
            <th className="font-bold text-[11px] p-4 w-[340px] border-r border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">Delivery Status</th>
            <th className="font-bold text-[11px] p-4 w-[130px] text-center bg-[var(--app-pages-bg)]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--app-pages-border)]">
          {campaigns.map((c, idx) => {
            const total = c.totalRecipients || 0
            const sent = c.sentCount || 0
            const opened = c.openedCount || 0
            const clicked = c.clickedCount || 0
            const failed = c.failedCount || 0
            const skipped = c.skipCount || 0

            const processed = sent + failed + skipped
            const progressPercent = total ? Math.round((processed / total) * 100) : 0
            const sentPercent = total ? Math.round((sent / total) * 100) : 0
            const openedPercent = sent ? Math.round((opened / sent) * 100) : 0
            const clickedPercent = opened ? Math.round((clicked / opened) * 100) : 0
            const failedPercent = processed ? Math.round((failed / processed) * 100) : 0

            const cfg = STATUS_CFG[c.status?.toLowerCase()] || STATUS_CFG['queued']
            const isGoogle = c.provider?.toLowerCase() === 'google'
            const isMicrosoft = c.provider?.toLowerCase() === 'microsoft'
            const isMulti = c.provider?.toLowerCase() === 'multi'

            return (
              <tr key={c._id} className="bg-[var(--app-pages-bg)]  hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition group">
                <td className="p-4 align-middle text-center border-r border-[var(--app-pages-border)] text-xs font-semibold text-[var(--app-pages-text)]">
                  {idx + 1}
                </td>
                
                {/* CAMPAIGN */}
                <td className="p-4 align-middle border-r border-[var(--app-pages-border)] ">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className="text-xs font-bold text-[var(--app-pages-text)] max-w-[170px] truncate" title={c.name}>
                      {c.name}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: cfg.stripe }} />
                      {c.status}
                    </span>
                    {c.status === 'paused' && c.remainingQueued > 0 && (
                      <span 
                        onClick={() => setRolloverCampaign(c)}
                        className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-500 cursor-pointer hover:text-amber-600 transition"
                      >
                        <Clock size={10} /> {c.remainingQueued} Rescheduled
                      </span>
                    )}
                  </div>
                </td>

                {/* PROVIDER & TEMPLATE */}
                <td className="p-4 align-middle text-center border-r border-[var(--app-pages-border)] ">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--app-pages-text)]">
                      {isGoogle ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      ) : isMicrosoft ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 21 21">
                          <path fill="#f25022" d="M0 0h10v10H0z"/>
                          <path fill="#7fba00" d="M11 0h10v10H11z"/>
                          <path fill="#00a4ef" d="M0 11h10v10H0z"/>
                          <path fill="#ffb900" d="M11 11h10v10H11z"/>
                        </svg>
                      ) : isMulti ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle cx="9" cy="9" r="6.5" fill="#4F46E5" fillOpacity="0.8" />
                          <circle cx="15" cy="9" r="6.5" fill="#EC4899" fillOpacity="0.8" />
                          <circle cx="12" cy="15" r="6.5" fill="#06B6D4" fillOpacity="0.8" />
                        </svg>
                      ) : (
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      {c.provider?.toUpperCase().slice(0,1) + c.provider?.toLowerCase().slice(1) || 'Unknown'}
                    </span>
                    {/* <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={c.subject}>
                      {c.subject || 'No Subject'}
                    </span> */}
                  </div>
                </td>

                {/* PROGRESS */}
                <td className="p-4 align-middle border-r border-[var(--app-pages-border)] ">
                  <div className="flex flex-col items-center gap-1.5">
                    {c.status === 'queued' || c.status === 'pending' ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-500/5 border border-dashed border-slate-200 dark:border-slate-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Draft</span>
                      </>
                    ) : c.status === 'failed' && progressPercent === 0 ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/5 border border-dashed border-red-200 dark:border-red-500/20 flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Failed</span>
                      </>
                    ) : (
                      <>
                        <div className="relative flex items-center justify-center">
                          <DonutRing pct={progressPercent} color={cfg.stripe || "#3b82f6"} isDark={isDark} />
                          <span className="absolute text-[10px] font-extrabold text-[#0f172a] dark:text-slate-300">{progressPercent}%</span>
                        </div>
                        <span 
                          className="text-[10px] font-extrabold uppercase tracking-wider"
                          style={{ color: cfg.stripe || "#3b82f6" }}
                        >
                          {c.status === "completed" ? "Completed" : 
                           c.status === "stopped" ? "Stopped" : 
                           c.status === "paused" ? "Paused" : 
                           c.status === "failed" ? "Failed" : 
                           "Running"}
                        </span>
                      </>
                    )}
                  </div>
                </td>

                {/* RECIPIENTS */}
                <td className="p-4 align-middle text-center border-r border-[var(--app-pages-border)]">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{total.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
                    {total > 0 && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">{sent.toLocaleString()} Sent</span>
                    )}
                  </div>
                </td>

                {/* DELIVERY STATUS */}
                <td className="p-4 align-middle border-r border-[var(--app-pages-border)]">
                  {total > 0 ? (
                    <div className="flex items-center gap-3">
                      {/* Sent */}
                      <div className="w-[70px] shrink-0">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">{sent.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Sent</span>
                        {/* <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.04] rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${sentPercent}%` }} />
                        </div> */}
                      </div>
                      
                      {/* Opened */}
                      <div className="w-[70px] shrink-0">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">{opened.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Opened</span>
                        {/* <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.04] rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${openedPercent}%` }} />
                        </div> */}
                      </div>

                      {/* Clicked */}
                      <div className="w-[70px] shrink-0">
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">{clicked.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Clicked</span>
                        {/* <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.04] rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${clickedPercent}%` }} />
                        </div> */}
                      </div>

                      {/* Failed */}
                      <div className="w-[70px] shrink-0">
                        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block">{failed.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Failed</span>
                        {/* <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.04] rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${failedPercent}%` }} />
                        </div> */}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 italic pl-10">-</span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-4 align-middle text-right relative">
                  <div className="inline-flex items-center gap-1">
                    <button 
                      onClick={() => onViewLogs && onViewLogs(c._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] hover:opacity-90 whitespace-nowrap"
                    >
                      View Report
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === c._id ? null : c._id)}
                        className="p-1.5 rounded-lg text-[var(--app-pages-subhead-text)]"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeMenuId === c._id && (
                        <div className="absolute right-0 top-8 w-32 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] shadow-xl rounded-xl py-1 z-50">
                          <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--app-pages-text)] uppercase tracking-wider mb-1 border-b border-[var(--app-pages-border)] text-start">Actions</div>
                          {/* {c.status === "processing" || c.status === "sending" ? (
                            <button className="w-full text-left px-3 py-1.5 text-xs text-orange-600 hover:bg-slate-50 dark:hover:bg-white/[0.04] flex items-center gap-2">
                              <Square size={12} /> Pause
                            </button>
                          ) : null} */}
                          {c.excelFileUrl && (
                            <a href={c.excelFileUrl} target="_blank" rel="noreferrer" className="w-full text-left px-3 py-1.5 text-xs text-[var(--app-pages-text)] hover:text-[var(--app-pages-muted)] flex items-center gap-2">
                              <Download size={12} /> Data File
                            </a>
                          )}
                          <button 
                            disabled={progressPercent === 100}
                            onClick={() => {
                              setActiveMenuId(null)
                              setStopConfirmCampaign(c)
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs text-red-600 flex items-center gap-2 ${progressPercent === 100 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 dark:hover:bg-red-500/10'}`}
                          >
                            <X size={12} /> Stop
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>

      {stopConfirmCampaign && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-6 shadow-2xl animate-in zoom-in-95 text-[var(--app-pages-text)]">
            <h3 className="text-base font-bold mb-2">Stop Campaign?</h3>
            <p className="text-xs text-[var(--app-pages-subhead-text)] mb-5">
              Are you sure you want to stop the campaign "{stopConfirmCampaign.name}"? Any remaining emails won't be sent. This action cannot be undone.
            </p>
            {stopError && (
              <p className="text-xs text-rose-500 mb-4 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {stopError}
              </p>
            )}
            <div className="flex justify-end gap-2.5">
              <button
                disabled={isStopping}
                onClick={() => setStopConfirmCampaign(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold hover:bg-[var(--app-pages-border)]/50 transition-colors text-[var(--app-pages-text)] border border-[var(--app-pages-border)]"
              >
                Cancel
              </button>
              <button
                disabled={isStopping}
                onClick={async () => {
                  try {
                    await stopEmailCampaign(stopConfirmCampaign._id).unwrap()
                    setStopConfirmCampaign(null)
                  } catch (err) {
                    setStopError(err?.data?.message || "Failed to stop campaign")
                  }
                }}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {isStopping ? 'Stopping...' : 'Stop Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rolloverCampaign && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-6 shadow-2xl duration-200 animate-in zoom-in-95 text-[var(--app-pages-text)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--app-pages-border)] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
                  <Clock size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--app-pages-text)]">
                    Daily Limit Reached & Rescheduled
                  </h3>
                  <p className="text-xs text-[var(--app-pages-subhead-text)]">
                    Campaign: <span className="font-semibold text-[var(--app-brand-primary)]">{rolloverCampaign.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRolloverCampaign(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Terminal Box UI */}
            <div className="rounded-xl border border-amber-500/30 bg-[var(--app-pages-bg)] p-4 font-mono text-xs text-[var(--app-pages-text)] leading-relaxed mb-5 shadow-inner">
              {/* <p className="text-gray-500 select-none">======================================================================</p> */}
              <p className="font-bold text-amber-400">
                Daily Limit Reached for Campaign "{rolloverCampaign.name}"
              </p>
              <p className="mt-1.5 text-[var(--app-pages-text)]">
                All connected email accounts have reached their daily sending limits.
              </p>
              <p className="mt-1.5 text-[var(--app-pages-text)]">
                <span className='font-bold text-[var(--app-pages-text)]'>{rolloverCampaign.remainingQueued ?? (rolloverCampaign.totalRecipients - (rolloverCampaign.sentCount + rolloverCampaign.failedCount + rolloverCampaign.skipCount))}</span> remaining emails are RESCHEDULED to send on {formatRolloverTime(rolloverCampaign.resumeAt, 'tomorrow')} when limits refill.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--app-pages-border)] w-full">
              <button
                disabled={isStopping}
                onClick={() => {
                  setStopError('');
                  setStopConfirmCampaign(rolloverCampaign);
                  setRolloverCampaign(null);
                }}
                className="flex items-center justify-center h-9 rounded-lg px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
              >
                Stop Campaign
              </button>
              <button
                onClick={() => setRolloverCampaign(null)}
                className="flex items-center justify-center h-9 rounded-lg px-6 text-xs font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] shadow-sm hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
