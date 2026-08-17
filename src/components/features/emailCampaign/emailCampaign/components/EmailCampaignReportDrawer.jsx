import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGetCampaignLogsQuery } from '../../../../redux/apis/emailCampaignApi';
import { getSocket } from '@/services/socket.service';
import { X, RefreshCw, Search, PhoneCall, Mail, CheckCircle, AlertCircle, FileText, CheckCircle2, User, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const formatDateTime = (dateString) => {
    if (!dateString) return { datePart: "--/--/----", timePart: "--:--:--" };
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    return { datePart, timePart };
};

export default function EmailCampaignReportDrawer({ campaign, onClose }) {
    const { data: logsData, isLoading, refetch } = useGetCampaignLogsQuery(campaign._id, {
        skip: !campaign._id,
        pollingInterval: 10000 // auto poll every 10s for real-time logs
    });
    
    const [logSearch, setLogSearch] = useState("");
    const [logStatusFilter, setLogStatusFilter] = useState("");
    
    const socket = getSocket();
    
    useEffect(() => {
        if (!socket || !campaign._id) return;
        const onCampaignUpdated = (data) => {
            if (data && data.campaignId === campaign._id) {
                refetch();
            }
        };
        socket.on('campaign:updated', onCampaignUpdated);
        return () => {
            socket.off('campaign:updated', onCampaignUpdated);
        };
    }, [socket, campaign._id, refetch]);

    const logs = logsData?.logs || [];

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesSearch = 
                (log.recipientEmail && log.recipientEmail.toLowerCase().includes(logSearch.toLowerCase())) ||
                (log.recipientName && log.recipientName.toLowerCase().includes(logSearch.toLowerCase()));
            
            let matchesStatus = true;
            if (logStatusFilter) {
                if (logStatusFilter === 'opened') matchesStatus = !!log.openedAt;
                else if (logStatusFilter === 'clicked') matchesStatus = !!log.clickedAt;
                else matchesStatus = log.status === logStatusFilter;
            }
            return matchesSearch && matchesStatus;
        });
    }, [logs, logSearch, logStatusFilter]);

    if (!campaign) return null;

    const total = campaign.totalRecipients || 0;
    const sent = campaign.sentCount || 0;
    const opened = campaign.openedCount || 0;
    const clicked = campaign.clickedCount || 0;
    const failed = campaign.failedCount || 0;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity">
            <div 
                className="w-full max-w-2xl bg-[var(--app-pages-bg)] border-l border-[var(--app-pages-border)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 h-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
            <div className="p-5 border-b border-[var(--app-pages-border)] flex items-center justify-between bg-[var(--app-pages-bg)]">
                <div>
                    <h3 className="text-base font-extrabold text-[var(--app-pages-text)]">{campaign.name || "Loading Campaign Report..."}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => refetch()} 
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-[#1a1d2d] transition cursor-pointer"
                        title="Force Refresh Logs"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[var(--app-pages-text)] dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-transparent transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Campaign Summary & Stats Grid inside drawer */}
            <div className="p-5 bg-[var(--app-pages-bg)] border-b border-[var(--app-pages-border)] grid grid-cols-5 gap-3 text-center">
                {[
                    { label: "Total", value: total, textCls: "text-[var(--app-pages-text)]" },
                    { label: "Sent", value: sent, textCls: "text-[var(--app-pages-text)]" },
                    { label: "Opened", value: opened, textCls: "text-[var(--app-pages-text)]" },
                    { label: "Clicked", value: clicked, textCls: "text-[var(--app-pages-text)]" },
                    { label: "Failed", value: failed, textCls: "text-[var(--app-pages-text)]" }
                ].map((s) => (
                    <div key={s.label} className="bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-xl p-2.5">
                        <span className="text-[10px] text-[var(--app-pages-text)] block uppercase tracking-wider">{s.label}</span>
                        <span className={`text-lg font-bold mt-1 block ${s.textCls}`}>{s.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>

            {/* Logs Toolbar */}
            <div className="p-4 border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                        type="text"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        placeholder="Search by email or name..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] text-xs placeholder:text-[var(--app-pages-subhead-text)] focus:outline-none focus:border-blue-500/40"
                    />
                </div>
                <select 
                    value={logStatusFilter} 
                    onChange={(e) => setLogStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] text-xs focus:outline-none cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="opened">Opened</option>
                    <option value="clicked">Clicked</option>
                    <option value="failed">Failed</option>
                    <option value="bounced">Bounced</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Recipients Log List */}
            <div className="flex-1 overflow-y-auto p-4 bg-[var(--app-pages-bg)]">
                {isLoading && logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--app-pages-text)] gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="text-xs">Fetching live recipient details...</span>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                        <FileText className="w-10 h-10 mb-2 opacity-30" />
                        <span className="text-xs">No matching recipient logs found</span>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {filteredLogs.map((log) => {
                            const isScheduled = log.status === "scheduled" || log.status === "queued";
                            const hasError = (log.status === "failed" || log.status === "bounced" || log.status === "rejected" || (log.errorReason && !isScheduled));
                            
                            // Determine active step
                            let step = 0;
                            if (log.status === 'sent' || log.status === 'delivered') step = 1;
                            if (log.openedAt) step = 2;
                            if (log.clickedAt) step = 3;
                            if (hasError || isScheduled) step = 1; // Error or Scheduled typically happens on send step

                            return (
                                <div key={log._id} className="p-3 rounded-xl bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] hover:border-slate-300 dark:hover:border-white/[0.08] transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[var(--app-pages-text)] dark:text-slate-400 flex items-center justify-center shrink-0">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                                    {log.recipientName || "Unknown"}
                                                </span>
                                                <span className="text-[11px] text-[var(--app-pages-text)] flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-2.5 h-2.5" /> {log.recipientEmail}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${
                                                log.clickedAt ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                                                log.openedAt ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                                (log.status === "sent" || log.status === "delivered") ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                                hasError ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                                                isScheduled ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                                "bg-[var(--app-pages-text)]/10 text-slate-600 dark:text-slate-400"
                                            }`}>
                                                {hasError ? <AlertCircle className="w-2.5 h-2.5" /> : isScheduled ? <Clock className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                                                {log.clickedAt ? "Clicked" : log.openedAt ? "Opened" : log.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status History Timeline UI (WhatsApp Style) */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                                        <div className="flex items-center gap-1.5 mb-2 text-slate-500 dark:text-slate-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Status History Timeline</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Sent Block */}
                                            {step >= 1 && (
                                                <div className={`flex flex-col px-2.5 py-1.5 rounded-md shadow-sm border ${
                                                    hasError ? 'border-red-200 dark:border-red-500/30 bg-red-50/80 dark:bg-red-900/20' : 
                                                    isScheduled ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-900/20' :
                                                    'border-blue-200 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-900/20'
                                                } min-w-[100px]`}>
                                                    <span className={`text-[11px] font-extrabold tracking-wide uppercase ${
                                                        hasError ? 'text-red-700 dark:text-red-400' : 
                                                        isScheduled ? 'text-amber-700 dark:text-amber-400' :
                                                        'text-blue-800 dark:text-blue-400'
                                                    }`}>
                                                        {hasError ? 'Failed' : isScheduled ? 'Scheduled' : 'Sent'}
                                                    </span>
                                                    <span className={`text-[10px] font-bold mt-0.5 ${
                                                        hasError ? 'text-red-600 dark:text-red-400' : 
                                                        isScheduled ? 'text-amber-600 dark:text-amber-400' :
                                                        'text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                        {formatDateTime(log.sentAt || log.createdAt).timePart}
                                                    </span>
                                                    <span className={`text-[9px] font-medium mt-0.5 ${
                                                        hasError ? 'text-red-500/80 dark:text-red-500/80' : 
                                                        isScheduled ? 'text-amber-500/80 dark:text-amber-500/80' :
                                                        'text-blue-500/80 dark:text-blue-500/80'
                                                    }`}>
                                                        {formatDateTime(log.sentAt || log.createdAt).datePart}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Arrow */}
                                            {step >= 2 && !hasError && <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />}

                                            {/* Opened Block */}
                                            {step >= 2 && !hasError && (
                                                <div className="flex flex-col px-2.5 py-1.5 rounded-md shadow-sm border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-900/20 min-w-[100px]">
                                                    <span className="text-[11px] font-extrabold tracking-wide uppercase text-emerald-800 dark:text-emerald-400">
                                                        Opened
                                                    </span>
                                                    <span className="text-[10px] font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                                                        {formatDateTime(log.openedAt).timePart}
                                                    </span>
                                                    <span className="text-[9px] font-medium mt-0.5 text-emerald-500/80 dark:text-emerald-500/80">
                                                        {formatDateTime(log.openedAt).datePart}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Arrow */}
                                            {step >= 3 && !hasError && <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />}

                                            {/* Clicked Block */}
                                            {step >= 3 && !hasError && (
                                                <div className="flex flex-col px-2.5 py-1.5 rounded-md shadow-sm border border-purple-200 dark:border-purple-500/30 bg-purple-50/80 dark:bg-purple-900/20 min-w-[100px]">
                                                    <span className="text-[11px] font-extrabold tracking-wide uppercase text-purple-800 dark:text-purple-400">
                                                        Clicked
                                                    </span>
                                                    <span className="text-[10px] font-bold mt-0.5 text-purple-600 dark:text-purple-400">
                                                        {formatDateTime(log.clickedAt).timePart}
                                                    </span>
                                                    <span className="text-[9px] font-medium mt-0.5 text-purple-500/80 dark:text-purple-500/80">
                                                        {formatDateTime(log.clickedAt).datePart}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {log.errorReason && (() => {
                                            let displayReason = log.errorReason;
                                            if (displayReason.includes("Scheduled to send on ") && displayReason.includes(" when limits refill.")) {
                                                const isoMatch = displayReason.match(/Scheduled to send on (.*?) when limits refill\./);
                                                if (isoMatch && isoMatch[1]) {
                                                    try {
                                                        const dateObj = new Date(isoMatch[1]);
                                                        if (!isNaN(dateObj)) {
                                                            const { datePart, timePart } = formatDateTime(dateObj);
                                                            displayReason = `Scheduled to send on ${datePart}, ${timePart} when limits refill.`;
                                                        }
                                                    } catch (e) {}
                                                }
                                            }
                                            return (
                                                <div className={`mt-3 p-2 rounded-lg border text-[10px] ${
                                                    isScheduled 
                                                        ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 text-amber-600 dark:text-amber-400"
                                                        : "bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10 text-red-600 dark:text-red-400"
                                                }`}>
                                                    <span className="font-semibold mr-1">{isScheduled ? "Note:" : "Error:"}</span>{displayReason}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
        </div>,
        document.body
    );
}
