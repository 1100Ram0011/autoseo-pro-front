import React from "react"
import CampaignRow from "../Msg91WaCampaignRow"
import LivePerformanceCell from "../LivePerformanceCell"

const Msg91WaCampaignTable = ({ campaigns = [], loading, onView }) => {
    const campaignRows = Array.isArray(campaigns)
        ? campaigns
        : Array.isArray(campaigns?.data)
            ? campaigns.data
            : Array.isArray(campaigns?.campaigns)
                ? campaigns.campaigns
                : []

    const headers = [
        "Template",
        "From",
        "Recipients",
        "Performance",
        "Status",
        "Created",
        "Actions"
    ]

    return (
        <div className="flex min-h-80 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
            <div className="space-y-3 p-3 md:hidden">
                {loading && (
                    <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                        Loading campaigns...
                    </div>
                )}

                {!loading && campaignRows.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                        No campaigns found
                    </div>
                )}

                {!loading && campaignRows.map((campaign) => {
                    const success = campaign.successRate || 0
                    return (
                        <div key={campaign._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                                        {campaign.templateName || 'Campaign'}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                                        +{campaign.fromNumber}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                                    {campaign.status || 'Status'}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <p className="text-slate-400 dark:text-zinc-500">Recipients</p>
                                    <p className="mt-1 font-semibold text-gray-900 dark:text-zinc-100">
                                        {campaign.totalCount || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-400 dark:text-zinc-500">Created</p>
                                    <p className="mt-1 font-medium text-gray-700 dark:text-zinc-300">
                                        {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <LivePerformanceCell initialCampaign={campaign} />
                            </div>

                            <button
                                type="button"
                                onClick={() => onView(campaign)}
                                className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#38BDF8] to-[#2563EB] px-4 py-2 text-sm font-semibold text-white dark:from-[#FB6218] dark:to-[#FEBC02]"
                            >
                                View Details
                            </button>
                        </div>
                    )
                })}
            </div>

            <div className="hidden flex-1 overflow-x-auto overflow-y-auto md:block">
                <table className="w-full min-w-[880px] border-collapse text-[13px] font-['DM_Sans',sans-serif]" style={{ borderSpacing: 0 }}>

                    {/* HEADER */}
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-700">
                            {headers.map(h => (
                                <th key={h}
                                    className="px-5 py-3.5 text-left font-semibold text-gray-500 dark:text-zinc-400 text-[11px] tracking-wider uppercase sticky top-0 bg-gray-50 dark:bg-zinc-900 z-[5]"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>

                        {loading && (
                            <tr>
                                <td colSpan={7} className="p-10 text-center text-gray-400 dark:text-zinc-500">
                                    Loading campaigns...
                                </td>
                            </tr>
                        )}

                        {!loading && campaignRows.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-16 text-center text-gray-400 dark:text-zinc-500">
                                    No campaigns found
                                </td>
                            </tr>
                        )}

                        {!loading && campaignRows.map((c, i) => (
                            <CampaignRow
                                key={c._id}
                                campaign={c}
                                even={i % 2 === 0}
                                onView={() => onView(c)}
                            />
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Msg91WaCampaignTable
