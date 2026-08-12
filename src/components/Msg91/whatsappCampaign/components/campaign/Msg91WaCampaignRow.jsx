import React from 'react'
import LivePerformanceCell from './LivePerformanceCell'
// ── StatusBadge ── semantic colors kept as inline (these are data-driven, not theme)
const StatusBadge = ({ status }) => {
  const styles = {
    COMPLETED: { bg: '#dcfce7', color: '#15803d' },
    PROCESSING: { bg: '#fef3c7', color: '#b45309' },
    FAILED: { bg: '#fee2e2', color: '#b91c1c' },
    SENT: { bg: '#dcfce7', color: '#15803d' },
  }
  const s = styles[status] || { bg: '#e2e8f0', color: '#475569' }

  return (
    <span
      style={{
        padding: '5px 12px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  )
}

const Msg91CampaignRow = ({ campaign, onView }) => {
  const success = campaign.successRate || 0

  return (
    // ── ROW: removed onMouseEnter/Leave JS handlers — replaced with Tailwind hover ──
    <tr className="cursor-pointer border-b border-slate-100 bg-white transition-colors duration-200 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700">
      {/* TEMPLATE */}
      <td className="px-5 py-[18px]">
        <div className="text-[14px] font-semibold text-gray-900 dark:text-zinc-100">
          {campaign.templateName}
        </div>
      </td>

      {/* FROM */}
      <td className="px-5 py-[18px] text-[13px] text-slate-500 dark:text-zinc-400">
        +{campaign.fromNumber}
      </td>

      {/* VOLUME */}
      <td className="px-5 py-[18px]">
        <div className="text-[14px] font-semibold text-gray-900 dark:text-zinc-100">
          {campaign.totalCount}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-500">
          Sent: {campaign.sentCount} • Failed: {campaign.failedCount}
        </div>
      </td>

      {/* PERFORMANCE */}
      <td className="w-[180px] px-5 py-[18px]">
        <LivePerformanceCell initialCampaign={campaign} />
      </td>

      {/* STATUS */}
      <td className="px-5 py-[18px]">
        <StatusBadge status={campaign.status} />
      </td>

      {/* CREATED */}
      <td className="px-5 py-[18px] text-[12px] text-slate-500 dark:text-zinc-400">
        {new Date(campaign.createdAt).toLocaleString()}
      </td>

      {/* ACTION */}
      <td className="px-5 py-[18px]">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onView()
          }}
          className="rounded-lg text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90 px-4 py-2 text-sm font-semibold"
        >
          View Details
        </button>
      </td>
    </tr>
  )
}

export default Msg91CampaignRow
