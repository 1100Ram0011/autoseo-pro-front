import { useState } from 'react'
import { useMsg91GetMsg91WhatsappLogsQuery } from '../../../../../redux/apis/Templateapi'
import { NumberSelector, SearchBar } from '../template/Msg91TemplateToolbar'

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  delivered: {
    dot: 'bg-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: 'Delivered',
  },
  sent: {
    dot: 'bg-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Sent',
  },
  failed: {
    dot: 'bg-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Failed',
  },
  read: {
    dot: 'bg-purple-500',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    label: 'Read',
  },
  pending: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    label: 'Pending',
  },
}

const getStatusCfg = (status = '') =>
  STATUS_CONFIG[status?.toLowerCase()] ?? {
    dot: 'bg-gray-400',
    text: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-[var(--app-pages-border)]',
    label: status || 'Unknown',
  }

const ALL_FIELDS =
  'requestedAt,requestId,status,sentTime,deliveryTime,customerNumber,templateName,campaignName,messageType,content,failureReason,totalClicked'
const getToday = () => new Date().toISOString().split('T')[0]
const get3DaysAgo = () => {
  const d = new Date()
  d.setDate(d.getDate() - 2)
  return d.toISOString().split('T')[0]
}
const fmt = (v) =>
  v
    ? new Date(v).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '\u2014'
const fmtPhone = (v) => (v ? `+${v}` : '\u2014')

const PAGE_SIZE = 10

// ── Icons ──────────────────────────────────────────────────────────────────────
const RefreshIcon = ({ spinning }) => (
  <svg
    className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

const SearchIcon = () => (
  <svg
    className="h-4 w-4 text-gray-400 dark:text-gray-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

// ── Failure Reason cell with tooltip ──────────────────────────────────────────
function FailureCell({ reason }) {
  const [show, setShow] = useState(false)
  if (!reason)
    return <span className="text-gray-300 dark:text-gray-600">&#8212;</span>
  return (
    <div className="relative inline-flex items-center gap-1">
      <span className="max-w-[140px] truncate text-xs text-red-500 dark:text-red-400">
        {reason.length > 28 ? reason.slice(0, 28) + '\u2026' : reason}
      </span>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="flex-shrink-0 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      {show && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 whitespace-normal rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-xl dark:bg-zinc-700">
          {reason}
          <div className="absolute left-4 top-full border-4 border-transparent border-t-gray-900 dark:border-t-zinc-700" />
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Msg91WhatsappLogs({ integratedNumbers, selectedNumber, onNumberChange }) {
  const [startDate, setStartDate] = useState(get3DaysAgo())
  const [endDate, setEndDate] = useState(getToday())
  const [limit, setLimit] = useState(1000)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [requestId, setRequestId] = useState('')
  const [applied, setApplied] = useState({
    startDate: get3DaysAgo(),
    endDate: getToday(),
    limit: 1000,
    requestId: '',
  })

  const { data, isLoading, isFetching, isError, error, refetch } =
    useMsg91GetMsg91WhatsappLogsQuery(
      {
        startDate: applied.startDate,
        endDate: applied.endDate,
        limit: applied.limit,
        fields: ALL_FIELDS,
        integratedNumber: selectedNumber,
        requestId: applied.requestId || undefined,
      },
      { refetchOnMountOrArgChange: true }
    )

  const rows = Array.isArray(data) ? data : (data?.logs ?? data?.data ?? [])
  const busy = isLoading || isFetching

  const statusCounts = rows.reduce((acc, r) => {
    const k = (r.status || 'unknown').toLowerCase()
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      r.customerNumber?.includes(q) ||
      r.templateName?.toLowerCase().includes(q) ||
      r.campaignName?.toLowerCase().includes(q) ||
      r.requestId?.toLowerCase().includes(q) ||
      r.failureReason?.toLowerCase().includes(q)
    const matchStatus =
      statusFilter === 'ALL' ||
      (r.status || '').toLowerCase() === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <div className="h-full bg-[var(--app-pages-bg)] p-6">
      {/* ── Filters + Refresh row ── */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Number Selector */}
          <div className="mb-0.5">
            <NumberSelector 
              numbers={integratedNumbers} 
              selectedNumber={selectedNumber} 
              onNumberChange={onNumberChange} 
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--app-pages-text)]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="[color-scheme:light] dark:[color-scheme:dark] rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 text-sm text-[var(--app-pages-text)] outline-none transition-all"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--app-pages-text)]">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={getToday()}
              onChange={(e) => setEndDate(e.target.value)}
              className="[color-scheme:light] dark:[color-scheme:dark] rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 text-sm text-[var(--app-pages-text)] outline-none transition-all"
            />
          </div>

          {/* Limit */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--app-pages-text)]">
              Limit
            </label>
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="appearance-none rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 text-sm text-[var(--app-pages-text)] outline-none transition-all"
              >
                {[100, 500, 1000, 5000, 10000].map((v) => (
                  <option key={v} value={v}>
                    {v.toLocaleString()} rows
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Request ID (Optional) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--app-pages-text)]">
              Fetch By Request ID (Optional)
            </label>
            <SearchBar 
              value={requestId} 
              onChange={(e) => setRequestId(e.target.value)} 
              placeholder="Paste MSG91 Request ID..." 
            />
          </div>

          {/* Apply */}
          <button
            onClick={() => {
              setApplied({ startDate, endDate, limit, requestId })
              setCurrentPage(1)
            }}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90"
          >
            Apply
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={refetch}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90"
        >
          <RefreshIcon spinning={busy} />
          {busy ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* ── Status Pills ── */}
      <div className="mb-5 flex flex-wrap gap-2">
        {/* All pill */}
        <button
          onClick={() => {
            setStatusFilter('ALL')
            setCurrentPage(1)
          }}
          className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
            statusFilter === 'ALL'
              ? 'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)]'
              : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:border-gray-400'
          }`}
        >
          All
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
              statusFilter === 'ALL'
                ? 'bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'
                : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:border-gray-400'
            }`}
          >
            {rows.length}
          </span>
        </button>

        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = statusCounts[key] || 0
          const active = statusFilter.toLowerCase() === key
          return (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key)
                setCurrentPage(1)
              }}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                active
                  ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                  : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:border-[var(--app-pages-muted)]'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  active
                    ? 'bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'
                    : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:border-[var(--app-pages-muted)]'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Error Banner ── */}
      {isError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] px-4 py-3 text-sm text-[var(--app-debit-color)]">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error?.data?.message ||
            'Failed to fetch logs from MSG91. Check your date range or auth key.'}
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="overflow-hidden rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-3">
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search phone, template, request ID..."
              className="w-full rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] py-2 pl-9 pr-3 text-sm text-[var(--app-pages-text)] placeholder-[var(--app-pages-subhead-text)] outline-none transition-all"
            />
          </div>
          <p className="text-sm text-[var(--app-pages-subhead-text)]">
            Showing{' '}
            <span className="font-semibold text-[var(--app-pages-text)]">
              {filtered.length === 0
                ? 0
                : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                    currentPage * PAGE_SIZE,
                    filtered.length
                  )}`}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-[var(--app-pages-text)]">
              {filtered.length}
            </span>{' '}
            logs
            {statusFilter !== 'ALL' && (
              <>
                {' '}
                &middot;{' '}
                <span className="font-medium capitalize">{statusFilter}</span>
              </>
            )}
          </p>
        </div>

        {/* Loading state */}
        {busy ? (
          <div className="flex flex-col items-center justify-center gap-3 bg-[var(--app-pages-bg)] py-20 text-[var(--app-pages-subhead-text)]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-pages-border)] border-t-[var(--app-primary-color)]" />
            <p className="text-sm">Fetching logs from MSG91...</p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-2 bg-[var(--app-pages-bg)] py-20 text-[var(--app-pages-subhead-text)]">
            <svg
              className="h-10 w-10 opacity-40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-medium text-[var(--app-pages-text)]">
              No logs found
            </p>
            <p className="text-xs text-[var(--app-pages-subhead-text)]">
              Try adjusting the filters or date range
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
                  {[
                    'Phone Number',
                    'Status',
                    'Template',
                    'Message Type',
                    'Requested At',
                    'Sent At',
                    'Delivered At',
                    'Failure Reason',
                    'Request ID',
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--app-pages-text)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginated.map((row, i) => {
                  const sc = getStatusCfg(row.status)
                  return (
                    <tr
                      key={row.requestId || i}
                      className="bg-[var(--app-pages-bg)] transition-colors hover:bg-[var(--app-pages-bg)]"
                    >
                      {/* Phone */}
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-[var(--app-pages-text)]">
                        {fmtPhone(row.customerNumber)}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text} ${sc.border}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${sc.dot}`}
                          />
                          {sc.label}
                        </span>
                      </td>

                      {/* Template */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-medium text-[var(--app-pages-text)]">
                          {row.templateName || '\u2014'}
                        </span>
                        {row.campaignName && (
                          <p className="mt-0.5 text-xs text-[var(--app-pages-subhead-text)]">
                            {row.campaignName}
                          </p>
                        )}
                      </td>

                      {/* Message Type */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center rounded border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2 py-0.5 text-xs font-medium capitalize text-[var(--app-pages-text)]">
                          {row.messageType || '\u2014'}
                        </span>
                      </td>

                      {/* Requested At */}
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--app-pages-subhead-text)]">
                        {fmt(row.requestedAt)}
                      </td>

                      {/* Sent At */}
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--app-pages-subhead-text)]">
                        {fmt(row.sentTime)}
                      </td>

                      {/* Delivered At */}
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--app-pages-subhead-text)]">
                        {fmt(row.deliveryTime)}
                      </td>

                      {/* Failure Reason */}
                      <td className="px-4 py-3">
                        <FailureCell reason={row.failureReason} />
                      </td>

                      {/* Request ID */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          title={row.requestId}
                          onClick={() =>
                            navigator.clipboard?.writeText(row.requestId)
                          }
                          className="cursor-pointer select-none font-mono text-xs text-[var(--app-pages-subhead-text)] transition-colors hover:text-[var(--app-primary-color)]"
                        >
                          {row.requestId
                            ? row.requestId.slice(0, 12) + '\u2026'
                            : '\u2014'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ── */}
        {!busy && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-3">
            {/* Record count */}
            <p className="text-xs text-[var(--app-pages-subhead-text)]">
              Showing{' '}
              <span className="font-semibold text-[var(--app-pages-text)]">
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-[var(--app-pages-text)]">
                {filtered.length}
              </span>{' '}
              records &nbsp;&middot;&nbsp; {applied.startDate} &#8594;{' '}
              {applied.endDate}
            </p>

            {/* Page controls */}
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-1.5 text-xs font-medium text-[var(--app-pages-text)] transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>

              {/* Page numbers with ellipsis */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-xs text-[var(--app-pages-subhead-text)]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                        currentPage === p
                          ? 'border-transparent bg-[var(--app-profile-btn-bg)] text-[var(--app-profile-btn-text)]'
                          : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:opacity-80'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-1.5 text-xs font-medium text-[var(--app-pages-text)] transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}