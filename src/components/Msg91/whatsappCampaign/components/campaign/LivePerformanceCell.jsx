import React, { useMemo } from 'react'
import { useMsg91GetCampaignStatusQuery } from '@/redux/apis/Templateapi'

const LivePerformanceCell = ({ initialCampaign }) => {
  const { data: liveCampaign, isLoading } = useMsg91GetCampaignStatusQuery(initialCampaign._id, {
    skip: !initialCampaign._id,
  })

  const activeCampaign = liveCampaign || initialCampaign
  const enrichedRecipients = activeCampaign.recipients || []

  const counts = useMemo(() => {
    if (enrichedRecipients.length > 0) {
      let sent = 0, delivered = 0, read = 0, failed = 0
      enrichedRecipients.forEach((r) => {
        const s = (r.status || '').toUpperCase()
        if (s === 'SENT') sent++
        else if (s === 'DELIVERED') { sent++; delivered++ }
        else if (s === 'READ') { sent++; delivered++; read++ }
        else if (s === 'FAILED' || s === 'REJECTED') failed++
      })
      return {
        total: activeCampaign.totalCount || enrichedRecipients.length || 1,
        sent,
        delivered,
        read,
        failed,
      }
    }
    return {
      total: activeCampaign.totalCount || 1,
      sent: activeCampaign.sentCount || 0,
      delivered: activeCampaign.deliveredCount || 0,
      read: activeCampaign.readCount || 0,
      failed: activeCampaign.failedCount || 0,
    }
  }, [enrichedRecipients, activeCampaign])

  const { total, sent, delivered, read, failed } = counts
  const deliveredExclusive = Math.max(0, delivered - read)
  const sentExclusive = Math.max(0, sent - Math.max(delivered, read))

  if (isLoading) {
    return (
      <div className="flex animate-pulse flex-col gap-2.5">
        <div className="flex gap-2">
            <div className="h-2 w-4 rounded bg-slate-200 dark:bg-zinc-700"></div>
            <div className="h-2 w-4 rounded bg-slate-200 dark:bg-zinc-700"></div>
            <div className="h-2 w-4 rounded bg-slate-200 dark:bg-zinc-700"></div>
            <div className="h-2 w-4 rounded bg-slate-200 dark:bg-zinc-700"></div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-zinc-700"></div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-1.5 flex gap-2 text-[10px] font-medium">
        <span className="text-blue-600 dark:text-blue-400" title="Sent">{sent}S</span>
        <span className="text-green-600 dark:text-green-400" title="Delivered">{delivered}D</span>
        <span className="text-purple-600 dark:text-purple-400" title="Read">{read}R</span>
        <span className="text-red-600 dark:text-red-400" title="Failed">{failed}F</span>
      </div>
      <div className="flex h-[6px] w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
        <div style={{ width: `${(read / total) * 100}%`, background: '#9333ea', transition: 'width 0.3s' }} title="Read" />
        <div style={{ width: `${(deliveredExclusive / total) * 100}%`, background: '#16a34a', transition: 'width 0.3s' }} title="Delivered" />
        <div style={{ width: `${(sentExclusive / total) * 100}%`, background: '#2563eb', transition: 'width 0.3s' }} title="Sent" />
        <div style={{ width: `${(failed / total) * 100}%`, background: '#dc2626', transition: 'width 0.3s' }} title="Failed" />
      </div>
    </>
  )
}

export default LivePerformanceCell
