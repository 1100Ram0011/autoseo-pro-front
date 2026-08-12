import { useState } from "react";
import { useMsg91GetMsg91WhatsappLogsQuery } from "../../../../redux/apis/Templateapi";

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    delivered: { dot: "bg-green-500", text: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "Delivered" },
    sent:      { dot: "bg-blue-500",  text: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200",  label: "Sent"      },
    failed:    { dot: "bg-red-500",   text: "text-red-600",   bg: "bg-red-50",   border: "border-red-200",   label: "Failed"    },
    read:      { dot: "bg-purple-500",text: "text-purple-600",bg: "bg-purple-50",border: "border-purple-200",label: "Read"      },
    pending:   { dot: "bg-yellow-500",text: "text-yellow-600",bg: "bg-yellow-50",border: "border-yellow-200",label: "Pending"   },
};

const getStatusCfg = (status = "") =>
    STATUS_CONFIG[status?.toLowerCase()] ?? {
        dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", label: status || "Unknown",
    };

const ALL_FIELDS = "requestedAt,requestId,status,sentTime,deliveryTime,customerNumber,templateName,campaignName,messageType,content,failureReason,totalClicked";
const getToday    = () => new Date().toISOString().split("T")[0];
const get3DaysAgo = () => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0]; };
const fmt      = (v) => v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "\u2014";
const fmtPhone = (v) => v ? `+${v}` : "\u2014";

// ── Icons ──────────────────────────────────────────────────────────────────────
const RefreshIcon = ({ spinning }) => (
    <svg className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// ── Failure Reason cell with tooltip ──────────────────────────────────────────
function FailureCell({ reason }) {
    const [show, setShow] = useState(false);
    if (!reason) return <span className="text-gray-300 dark:text-gray-600">&#8212;</span>;
    return (
        <div className="relative inline-flex items-center gap-1">
            <span className="text-red-500 dark:text-red-400 text-xs truncate max-w-[140px]">
                {reason.length > 28 ? reason.slice(0, 28) + "\u2026" : reason}
            </span>
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 flex-shrink-0"
            >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            </button>
            {show && (
                <div className="absolute z-50 bottom-full left-0 mb-2 w-72 bg-gray-900 dark:bg-zinc-700 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed whitespace-normal">
                    {reason}
                    <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900 dark:border-t-zinc-700" />
                </div>
            )}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Msg91WhatsappLogs() {
    const [startDate, setStartDate]   = useState(get3DaysAgo());
    const [endDate, setEndDate]       = useState(getToday());
    const [limit, setLimit]           = useState(1000);
    const [search, setSearch]         = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [applied, setApplied]       = useState({ startDate: get3DaysAgo(), endDate: getToday(), limit: 1000 });

    const { data, isLoading, isFetching, isError, error, refetch } =
        useMsg91GetMsg91WhatsappLogsQuery(
            { startDate: applied.startDate, endDate: applied.endDate, limit: applied.limit, fields: ALL_FIELDS },
            { refetchOnMountOrArgChange: true }
        );

    const rows = Array.isArray(data) ? data : data?.logs ?? data?.data ?? [];
    const busy = isLoading || isFetching;

    const statusCounts = rows.reduce((acc, r) => {
        const k = (r.status || "unknown").toLowerCase();
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});

    const filtered = rows.filter((r) => {
        const q = search.toLowerCase();
        const matchSearch = !search
            || r.customerNumber?.includes(q)
            || r.templateName?.toLowerCase().includes(q)
            || r.campaignName?.toLowerCase().includes(q)
            || r.requestId?.toLowerCase().includes(q)
            || r.failureReason?.toLowerCase().includes(q);
        const matchStatus = statusFilter === "ALL" || (r.status || "").toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">



            {/* ── Status Pills ── */}
            <div className="flex flex-wrap gap-2 mb-5">
                {/* All pill */}
                <button
                    onClick={() => setStatusFilter("ALL")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        statusFilter === "ALL"
                            ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-800 dark:border-gray-200"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                >
                    All
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        statusFilter === "ALL"
                            ? "bg-white/20 text-white dark:bg-black/10 dark:text-gray-900"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}>
                        {rows.length}
                    </span>
                </button>

                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count  = statusCounts[key] || 0;
                    const active = statusFilter.toLowerCase() === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                active
                                    ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                active
                                    ? "bg-white/60 dark:bg-black/10"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Error Banner ── */}
            {isError && (
                <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8"  x2="12"    y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error?.data?.message || "Failed to fetch logs from MSG91. Check your date range or auth key."}
                </div>
            )}

            {/* ── Table Card ── */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <SearchIcon />
                        </span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search phone, template, request ID..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{filtered.length}</span>
                        {" "}of {rows.length} logs
                        {statusFilter !== "ALL" && (
                            <> &middot; <span className="font-medium capitalize">{statusFilter}</span></>
                        )}
                    </p>
                </div>

                {/* Loading state */}
                {busy ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500">
                        <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-blue-500 animate-spin" />
                        <p className="text-sm">Fetching logs from MSG91...</p>
                    </div>

                /* Empty state */
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-20 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600">
                        <svg className="w-10 h-10 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No logs found</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Try adjusting the filters or date range</p>
                    </div>

                /* Table */
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    {["Phone Number","Status","Template","Message Type","Requested At","Sent At","Delivered At","Failure Reason","Request ID"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filtered.map((row, i) => {
                                    const sc = getStatusCfg(row.status);
                                    return (
                                        <tr
                                            key={row.requestId || i}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-white dark:bg-gray-900"
                                        >
                                            {/* Phone */}
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                {fmtPhone(row.customerNumber)}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                                                    {sc.label}
                                                </span>
                                            </td>

                                            {/* Template */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-gray-700 dark:text-gray-200 font-medium">
                                                    {row.templateName || "\u2014"}
                                                </span>
                                                {row.campaignName && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{row.campaignName}</p>
                                                )}
                                            </td>

                                            {/* Message Type */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 capitalize">
                                                    {row.messageType || "\u2014"}
                                                </span>
                                            </td>

                                            {/* Requested At */}
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                                {fmt(row.requestedAt)}
                                            </td>

                                            {/* Sent At */}
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                                {fmt(row.sentTime)}
                                            </td>

                                            {/* Delivered At */}
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                                {fmt(row.deliveryTime)}
                                            </td>

                                            {/* Failure Reason */}
                                            <td className="px-4 py-3">
                                                <FailureCell reason={row.failureReason} />
                                            </td>

                                            {/* Request ID */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span
                                                    title={row.requestId}
                                                    onClick={() => navigator.clipboard?.writeText(row.requestId)}
                                                    className="text-xs font-mono text-gray-400 dark:text-gray-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors select-none"
                                                >
                                                    {row.requestId ? row.requestId.slice(0, 12) + "\u2026" : "\u2014"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {!busy && filtered.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {applied.startDate} &#8594; {applied.endDate}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}