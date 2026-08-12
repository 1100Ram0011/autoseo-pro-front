import React from 'react';
import { Mail, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function CampaignStats({ campaigns }) {
    const campaignList = Array.isArray(campaigns)
        ? campaigns
        : campaigns?.campaigns || [];

    const totalCampaigns = campaignList.length;
    
    // Aggregated Metrics
    const totalRecipients = campaignList.reduce((a, c) => a + (c.totalRecipients || 0), 0);
    const sent = campaignList.reduce((a, c) => a + (c.sentCount || 0), 0);
    const failed = campaignList.reduce((a, c) => a + (c.failedCount || 0), 0);
    const skipped = campaignList.reduce((a, c) => a + (c.skipCount || 0), 0);
    const processed = sent + failed + skipped;
    
    const scheduledCampaigns = campaignList.filter(c => c.status === 'scheduled' || c.status === 'queued' || c.status === 'pending').length;
    
    // Success Rate
    const successRate = processed > 0 ? Math.round((sent / (sent + failed)) * 100) : 0;

    const OVERVIEW_CARDS = [
        {
            label: "Total Campaigns",
            value: totalCampaigns,
            icon: <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
            iconBg: "bg-blue-50 dark:bg-blue-500/10"
        },
        {
            label: "Emails Sent",
            value: sent,
            icon: <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
            iconBg: "bg-emerald-50 dark:bg-emerald-500/10"
        },
        {
            label: "Failed Emails",
            value: failed,
            icon: <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
            iconBg: "bg-red-50 dark:bg-red-500/10"
        },

        {
            label: "Success Rate",
            value: `${successRate}%`,
            icon: <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
            iconBg: "bg-purple-50 dark:bg-purple-500/10"
        }
    ];

    return (
        <div className="flex flex-wrap items-center gap-3 w-full">
            {OVERVIEW_CARDS.map((s, idx) => (
                <div 
                    key={idx} 
                    className="flex flex-1 min-w-[180px] items-center gap-3 bg-white dark:bg-[#0f111a] border border-slate-200/80 dark:border-white/[0.06] rounded-xl px-4 py-3 shadow-sm hover:border-slate-300 dark:hover:border-white/[0.12] transition-all"
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg}`}>
                        {s.icon}
                    </div>
                    <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
                        {s.label}
                    </span>
                    <span className="text-xl font-bold text-[#0f172a] dark:text-white ml-auto">
                        {s.value}
                    </span>
                </div>
            ))}
        </div>
    );
}