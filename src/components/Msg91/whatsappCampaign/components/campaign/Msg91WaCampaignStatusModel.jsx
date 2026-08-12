import React, { useState, useMemo } from 'react'
import {
  useMsg91GetCampaignStatusQuery,
  useMsg91SyncCampaignLogsMutation,
} from '@/redux/apis/Templateapi'

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  COMPLETED: { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
  QUEUED: { bg: '#dbeafe', color: '#2563eb', label: 'Queued' },
  PROCESSING: { bg: '#fef9c3', color: '#ca8a04', label: 'Processing' },
  SENT: { bg: '#dbeafe', color: '#2563eb', label: 'Sent' },
  DELIVERED: { bg: '#dcfce7', color: '#16a34a', label: 'Delivered' },
  READ: { bg: '#f3e8ff', color: '#7c3aed', label: 'Read' },
  FAILED: { bg: '#fee2e2', color: '#dc2626', label: 'Failed' },
  REJECTED: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  PENDING: { bg: '#fef9c3', color: '#ca8a04', label: 'Pending' },
  HOLD: { bg: '#ffedd5', color: '#ea580c', label: 'Hold' },
}

const StatusBadge = ({ status = '' }) => {
  const cfg = STATUS_CFG[status?.toUpperCase()] ?? {
    bg: '#f3f4f6',
    color: '#6b7280',
    label: status || 'Unknown',
  }
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

const KPI = ({ label, value, color, sub }) => (
  <div className="flex min-w-[100px] flex-1 flex-col gap-0.5 rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
      {label}
    </div>
    <div
      className="text-[22px] font-bold leading-tight"
      style={{ color: color || 'var(--app-pages-text)' }}
    >
      {value ?? 0}
    </div>
    {sub && (
      <div className="text-[11px] text-gray-400 dark:text-zinc-500">{sub}</div>
    )}
  </div>
)

const LivePulse = () => (
  <div className="flex items-center gap-1.5">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
    </span>
    <span className="text-[11px] font-medium text-green-600 dark:text-green-400">
      Live
    </span>
  </div>
)

const fmt = (v) =>
  v
    ? new Date(v).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'
const fmtPhone = (v) => (v ? `+${v}` : '—')

const applyVarsToTemplate = (template = '', variables = {}) =>
  template.replace(
    /{{\s*(\d+)\s*}}/g,
    (_, n) => `<strong>${variables[`body_${n}`] || ''}</strong>`
  )

const renderWhatsappText = (text = '') =>
  text
    .replace(/\*(.*?)\*/g, '<b>$1</b>')
    .replace(/_(.*?)_/g, '<i>$1</i>')
    .replace(/~(.*?)~/g, '<s>$1</s>')
    .replace(/```(.*?)```/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>')

// ── Export ────────────────────────────────────────────────────────────────────
const exportCSV = (campaign, recipientsToExport = null) => {
  const headers = [
    'Phone',
    'Name (body_1)',
    'Status',
    'MSG91 Status',
    'Sent Time',
    'Delivery Time',
    'Template',
    'Clicks',
    'Failure Reason',
    'MSG91 Request ID',
    'UUID',
  ]
  const data = recipientsToExport || campaign.recipients || []
  const rows = data.map((r) => {
    const log = r.msg91Log || {}
    return [
      fmtPhone(r.phone),
      r.variables?.body_1 || '',
      r.status || '',
      log.status || '',
      fmt(log.sentTime),
      fmt(log.deliveryTime),
      log.templateName || campaign.templateName || '',
      log.totalClicked ?? 0,
      log.failureReason || r.error || '',
      r.msg91RequestId || campaign.msg91RequestId || '',
      log.uuid || '',
    ]
  })
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `campaign_${campaign._id}_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const exportJSON = (campaign, recipientsToExport = null) => {
  const data = recipientsToExport
    ? { ...campaign, recipients: recipientsToExport }
    : campaign
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  )
  const a = document.createElement('a')
  a.href = url
  a.download = `campaign_${campaign._id}_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Recipient Details Modal ───────────────────────────────────────────────────
const RecipientDetailsModal = ({ recipient, campaign, onClose }) => {
  if (!recipient) return null
  const log = recipient.msg91Log || {}
  const templateBody = campaign?.templateId?.body || ''
  const finalMessage = applyVarsToTemplate(templateBody, recipient.variables)
  const detailRows = [
    { label: 'Phone', value: fmtPhone(recipient.phone) },
    { label: 'Status', value: <StatusBadge status={recipient.status} /> },
    { label: 'MSG91 Status', value: <StatusBadge status={log.status} /> },
    {
      label: 'Request ID',
      value:
        log.requestId ||
        recipient.msg91RequestId ||
        campaign.msg91RequestId ||
        '—',
    },
    { label: 'UUID', value: log.uuid || '—' },
    { label: 'Sent Time', value: fmt(log.sentTime) },
    { label: 'Delivery Time', value: fmt(log.deliveryTime) },
    { label: 'Requested At', value: fmt(log.requestedAt) },
    // { label: 'Clicks', value: log.totalClicked ?? '—' },
    // { label: 'Price', value: log.price != null ? `Rs. ${log.price}` : '—' },
    {
      label: 'Failure Reason',
      value: log.failureReason || recipient.error || '—',
    },
    { label: 'Message Type', value: log.messageType || '—' },
    // { label: 'Direction', value: log.direction || '—' },
    {
      label: 'Campaign',
      value: log.campaignName || campaign.templateName || '—',
    },
    {
      label: 'Template',
      value: log.templateName || campaign.templateName || '—',
    },
  ]

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--app-pages-border)] px-5 py-4">
          <div>
            <div className="text-[15px] font-semibold text-[var(--app-pages-text)]">
              {fmtPhone(recipient.phone)}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-zinc-400">
              {recipient.variables?.body_1 || 'Recipient Details'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300"
          >
            Close
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-[var(--app-pages-border)]">
            <div className="flex items-center gap-2 bg-[#075e54] px-4 py-3 text-white dark:bg-[#0b3f3a]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366] text-sm font-bold text-black">
                {recipient.variables?.body_1?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-sm font-semibold">
                {fmtPhone(recipient.phone)}
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-end overflow-y-auto bg-[#e5ddd5] p-3 dark:bg-[#0f1117]">
              <div
                className="max-w-[85%] self-end rounded-[8px_8px_0_8px] bg-[#dcf8c6] p-[10px_12px] text-[13px] leading-relaxed text-black shadow dark:bg-[#1f2c34] dark:text-zinc-100"
                dangerouslySetInnerHTML={{
                  __html: renderWhatsappText(finalMessage),
                }}
              />
              <div className="mt-2 self-end">
                <StatusBadge status={recipient.status} />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              MSG91 Delivery Details
            </div>
            <div className="space-y-2.5">
              {detailRows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 border-b border-[var(--app-pages-border)] pb-2.5 last:border-0"
                >
                  <div className="w-[130px] shrink-0 text-[12px] font-medium text-gray-500 dark:text-zinc-400">
                    {label}
                  </div>
                  <div className="flex-1 break-all text-[12px] text-[var(--app-pages-text)]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            {recipient.variables &&
              Object.keys(recipient.variables).length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    Template Variables
                  </div>
                  <div className="space-y-2">
                    {Object.entries(recipient.variables).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-start gap-3 border-b border-[var(--app-pages-border)] pb-2 last:border-0"
                      >
                        <div className="w-[130px] shrink-0 text-[12px] font-medium text-gray-500 dark:text-zinc-400">
                          {k}
                        </div>
                        <div className="flex-1 break-all text-[12px] text-[var(--app-pages-text)]">
                          {String(v)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Export Modal ─────────────────────────────────────────────────────────────
const ExportModal = ({ campaign, enrichedRecipients, onClose }) => {
  const [selectedStatuses, setSelectedStatuses] = useState(['ALL'])

  const statuses = [
    'ALL',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'QUEUED',
    'HOLD',
  ]

  const handleStatusToggle = (s) => {
    if (s === 'ALL') {
      setSelectedStatuses(['ALL'])
    } else {
      const newStatuses = selectedStatuses.includes('ALL')
        ? [s]
        : selectedStatuses.includes(s)
          ? selectedStatuses.filter((x) => x !== s)
          : [...selectedStatuses, s]

      if (newStatuses.length === 0) newStatuses.push('ALL')
      setSelectedStatuses(newStatuses)
    }
  }

  const handleExport = (type) => {
    const dataToExport = selectedStatuses.includes('ALL')
      ? enrichedRecipients
      : enrichedRecipients.filter((r) =>
          selectedStatuses.includes(r.status?.toUpperCase() || '')
        )

    if (type === 'CSV') exportCSV(campaign, dataToExport)
    if (type === 'JSON') exportJSON(campaign, dataToExport)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--app-pages-border)] px-5 py-4">
          <h3 className="text-[16px] font-semibold text-[var(--app-pages-text)]">
            Export Options
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300"
          >
            Close
          </button>
        </div>
        <div className="p-5">
          <div className="mb-3 text-[12px] font-medium text-gray-500 dark:text-zinc-400">
            Select Statuses to Export
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusToggle(s)}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all ${
                  selectedStatuses.includes(s)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-[var(--app-pages-border)] text-[var(--app-pages-text)] hover:border-gray-400'
                }`}
              >
                {s === 'ALL' ? 'All Recipients' : STATUS_CFG[s]?.label || s}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleExport('CSV')}
              className="flex-1 rounded-lg bg-[var(--app-profile-btn-bg)] px-4 py-2.5 text-[13px] font-semibold text-[var(--app-profile-btn-text)] transition hover:opacity-90"
            >
              Download CSV (Excel)
            </button>
            <button
              onClick={() => handleExport('JSON')}
              className="flex-1 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 text-[13px] font-semibold text-[var(--app-pages-text)] transition hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────────────
const Msg91WaCampaignStatusModel = ({ campaignId, onClose }) => {
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const {
    data: campaign,
    isLoading,
    isFetching,
    refetch: refetchCampaign,
  } = useMsg91GetCampaignStatusQuery(campaignId, {
    skip: !campaignId,
    pollingInterval: 8000,
  })

  // ── Live MSG91 logs fetch by requestId ──────────────────────────────────────
  const requestId = campaign?.msg91RequestId

  const [syncCampaignLogs, { isLoading: isSyncing }] = useMsg91SyncCampaignLogsMutation()

  // The backend now returns the merged live logs directly in campaign.recipients
  const enrichedRecipients = useMemo(() => {
    return campaign?.recipients || []
  }, [campaign?.recipients])

  const isLive = !!(campaign?.msg91RequestId && campaign?.status !== 'FAILED')

  const counts = useMemo(() => {
    if (!enrichedRecipients.length)
      return { total: 0, sent: 0, delivered: 0, read: 0, failed: 0 }
    let sent = 0,
      delivered = 0,
      read = 0,
      failed = 0
    enrichedRecipients.forEach((r) => {
      const s = (r.status || '').toUpperCase()
      if (s === 'SENT') sent++
      else if (s === 'DELIVERED') {
        sent++
        delivered++
      } else if (s === 'READ') {
        sent++
        delivered++
        read++
      } else if (s === 'FAILED' || s === 'REJECTED') failed++
    })
    return {
      total: campaign?.totalCount || enrichedRecipients.length,
      sent,
      delivered,
      read,
      failed,
    }
  }, [enrichedRecipients, campaign])

  const deliveryRate = counts.total
    ? Math.round((counts.delivered / counts.total) * 100)
    : 0
  const readRate = counts.total
    ? Math.round((counts.read / counts.total) * 100)
    : 0
  const sentRate = counts.total
    ? Math.round((counts.sent / counts.total) * 100)
    : 0

  const filtered = useMemo(() => {
    if (!enrichedRecipients.length) return []
    return enrichedRecipients.filter((r) => {
      const matchStatus =
        statusFilter === 'ALL' || r.status?.toUpperCase() === statusFilter
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        r.phone?.includes(q) ||
        r.variables?.body_1?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q) ||
        r.msg91Log?.uuid?.toLowerCase().includes(q) ||
        r.msg91Log?.failureReason?.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [enrichedRecipients, statusFilter, search])

  if (!campaignId) return null
  if (isLoading)
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-[var(--app-pages-bg)] p-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-pages-border)] border-t-blue-500" />
          <div className="text-sm text-[var(--app-pages-subhead-text)]">
            Loading campaign...
          </div>
        </div>
      </div>
    )
  if (!campaign) return null

  const statusPills = [
    'ALL',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'QUEUED',
    'HOLD',
  ]

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[16px] font-semibold text-[var(--app-pages-text)]">
                {campaign.templateName}
              </h3>
              <StatusBadge status={campaign.status} />
              {isLive && <LivePulse />}
              {isFetching && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--app-pages-border)] border-t-blue-500" />
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-gray-500 dark:text-zinc-400">
              <span>From: +{campaign.fromNumber}</span>
              <span>Created: {fmt(campaign.createdAt)}</span>
              {campaign.completedAt && (
                <span>Completed: {fmt(campaign.completedAt)}</span>
              )}
              {/* {campaign.msg91RequestId && <span className="font-mono">Request ID: {campaign.msg91RequestId}</span>} */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* MSG91 Sync Button — shown only while campaign is actively processing */}
            {requestId &&
              ['PROCESSING', 'QUEUED', 'SENT', 'COMPLETED'].includes(
                campaign.status?.toUpperCase()
              ) && (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-1.5">
                  <button
                    onClick={async () => {
                      if (!campaignId) return;
                      await syncCampaignLogs(campaignId).unwrap();
                      refetchCampaign();
                    }}
                    disabled={isSyncing}
                    title="Fetch latest delivery logs from MSG91"
                    className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--app-pages-text)] disabled:opacity-50"
                  >
                    <svg
                      className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M23 4v6h-6" />
                      <path d="M1 20v-6h6" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    {isSyncing ? 'Syncing…' : 'Sync Statuses'}
                  </button>
                  {/* {logsLastSynced && (
                  <>
                    <div className="h-3 w-px bg-[var(--app-pages-border)]" />
                    <span className="text-[10px] text-gray-400">
                      {new Date(logsLastSynced).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                    </span>
                  </>
                )} */}
                </div>
              )}
            <div className="relative">
              <button
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 text-[12px] font-medium text-[var(--app-pages-text)] transition hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-3 py-2 text-[12px] text-gray-600 transition hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
          {/* KPIs */}
          <div className="flex flex-wrap gap-3">
            <KPI label="Total" value={counts.total} />
            <KPI
              label="Sent"
              value={counts.sent}
              color="#2563eb"
              sub={`${sentRate}% of total`}
            />
            <KPI
              label="Delivered"
              value={counts.delivered}
              color="#16a34a"
              sub={`${deliveryRate}% rate`}
            />
            <KPI
              label="Read"
              value={counts.read}
              color="#7c3aed"
              sub={`${readRate}% rate`}
            />
            <KPI label="Failed" value={counts.failed} color="#dc2626" />
          </div>

          {/* Progress bars */}
          <div className="space-y-2 rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4">
            {[
              { label: 'Sent', value: sentRate, color: '#2563eb' },
              { label: 'Delivered', value: deliveryRate, color: '#16a34a' },
              { label: 'Read', value: readRate, color: '#7c3aed' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-20 shrink-0 text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                  {label}
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-700">
                  <div
                    style={{
                      width: `${value}%`,
                      background: color,
                      height: '100%',
                      transition: '0.5s ease',
                    }}
                  />
                </div>
                <div
                  className="w-10 text-right text-[11px] font-semibold"
                  style={{ color }}
                >
                  {value}%
                </div>
              </div>
            ))}
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            {statusPills.map((s) => {
              const cfg = STATUS_CFG[s] || {}
              const count =
                s === 'ALL'
                  ? (campaign.recipients?.length ?? 0)
                  : (campaign.recipients?.filter(
                      (r) => r.status?.toUpperCase() === s
                    ).length ?? 0)
              const active = statusFilter === s
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={
                    active
                      ? {
                          background: cfg.bg || '#dbeafe',
                          color: cfg.color || '#2563eb',
                          borderColor: cfg.color || '#93c5fd',
                        }
                      : {}
                  }
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${active ? '' : 'border-[var(--app-pages-border)] text-[var(--app-pages-text)] hover:border-gray-400'}`}
                >
                  {s === 'ALL' ? 'All' : STATUS_CFG[s]?.label || s}
                  <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--app-pages-border)] px-4 py-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phone, name, status, UUID..."
                className="w-full max-w-sm rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 text-[12px] text-[var(--app-pages-text)] outline-none placeholder:text-gray-400"
              />
              <span className="shrink-0 text-[12px] text-gray-400 dark:text-zinc-500">
                {filtered.length} / {campaign.recipients?.length ?? 0}{' '}
                recipients
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead className="border-b border-[var(--app-pages-border)] bg-gray-50 dark:bg-zinc-800/50">
                  <tr>
                    {[
                      '#',
                      'Phone',
                      'Name (body_1)',
                      'Status',
                      'Delivery Time',
                      'Clicks',
                      'Failure Reason',
                      'Details',
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-zinc-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-14 text-center text-[13px] text-gray-400 dark:text-zinc-500"
                      >
                        No recipients match the current filter
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => {
                      const log = r.msg91Log || {}
                      return (
                        <tr
                          key={i}
                          className={`border-t border-[var(--app-pages-border)] ${i % 2 === 0 ? 'bg-[var(--app-pages-bg)]' : 'bg-gray-50/40 dark:bg-zinc-800/20'}`}
                        >
                          <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[var(--app-pages-text)]">
                            +{r.phone}
                          </td>
                          <td className="max-w-[140px] truncate px-4 py-3 text-[var(--app-pages-text)]">
                            {r.variables?.body_1 || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-zinc-400">
                            {fmt(log.deliveryTime)}
                          </td>
                          <td className="px-4 py-3 text-center text-[var(--app-pages-text)]">
                            {log.totalClicked ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            {log.failureReason || r.error ? (
                              <div className="group relative inline-block max-w-[180px]">
                                <div className="flex cursor-default items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1 dark:border-red-900/40 dark:bg-red-950/30">
                                  <svg
                                    className="h-3 w-3 shrink-0 text-red-500"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                  </svg>
                                  <span className="truncate text-[11px] font-medium text-red-600 dark:text-red-400">
                                    {log.failureReason || r.error}
                                  </span>
                                </div>
                                {/* Tooltip on hover */}
                                <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 hidden w-max max-w-[280px] rounded-lg border border-red-200 bg-white p-2.5 text-[11px] leading-relaxed text-red-700 shadow-lg group-hover:block dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400">
                                  {log.failureReason || r.error}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[12px] text-gray-300 dark:text-zinc-600">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedRecipient(r)}
                              className="rounded-lg bg-[var(--app-profile-btn-bg)] px-3 py-1.5 text-[11px] font-semibold text-[var(--app-profile-btn-text)] transition hover:opacity-90"
                            >
                              View
                            </button>
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
      </div>

      <RecipientDetailsModal
        recipient={selectedRecipient}
        campaign={campaign}
        onClose={() => setSelectedRecipient(null)}
      />
      {exportModalOpen && (
        <ExportModal
          campaign={campaign}
          enrichedRecipients={enrichedRecipients}
          onClose={() => setExportModalOpen(false)}
        />
      )}
    </div>
  )
}

export default Msg91WaCampaignStatusModel
