"use client";

import React, { useState } from "react";
import {
  useEmailCampaigns,
  useEmailTemplates,
  createEmailCampaign,
  updateCampaignStatus,
  deleteCampaign,
  useCampaignLogs,
} from "@/hooks/useEmailCampaign";
import {
  Megaphone,
  Plus,
  Loader2,
  Trash2,
  Pause,
  Play,
  StopCircle,
  ChevronDown,
  ChevronUp,
  Search,
  BarChart3,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_META: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: Clock, label: "Pending" },
  processing: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Loader2, label: "Processing" },
  queued: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock, label: "Queued" },
  sending: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Send, label: "Sending" },
  completed: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2, label: "Completed" },
  failed: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle, label: "Failed" },
  paused: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Pause, label: "Paused" },
  stopped: { color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: StopCircle, label: "Stopped" },
};

function CampaignStats({ c }: { c: any }) {
  const total = c.totalRecipients || 1;
  return (
    <div className="grid grid-cols-4 gap-2 text-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      {[
        { label: "Sent", value: c.sentCount, color: "text-blue-600" },
        { label: "Failed", value: c.failedCount, color: "text-red-500" },
        { label: "Opened", value: c.openedCount, color: "text-emerald-500" },
        { label: "Clicked", value: c.clickedCount, color: "text-purple-500" },
      ].map(({ label, value, color }) => (
        <div key={label}>
          <div className={`text-base font-bold ${color}`}>{value ?? 0}</div>
          <div className="text-[10px] text-slate-400 font-medium">{label}</div>
        </div>
      ))}
    </div>
  );
}

function CampaignLogs({ campaignId }: { campaignId: string }) {
  const { logs, isLoading } = useCampaignLogs(campaignId);
  if (isLoading) return <div className="py-4 text-center"><Loader2 className="animate-spin text-slate-400 mx-auto" size={20} /></div>;
  if (!logs.length) return <p className="text-xs text-slate-400 py-3 text-center">No logs available yet.</p>;
  return (
    <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
      {logs.map((log: any) => (
        <div key={log.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
          <span className="font-mono truncate flex-1 text-slate-600 dark:text-slate-400">{log.recipientEmail}</span>
          <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_META[log.status]?.color ?? "bg-slate-100 text-slate-500"}`}>
            {log.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EmailCampaignsTab() {
  const { campaigns, isLoading, mutate } = useEmailCampaigns();
  const { templates } = useEmailTemplates();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", templateId: "", provider: "google" });

  const dummyEmailCampaigns = [
    {
      id: "email_1",
      name: "Q3 Newsletter",
      provider: "google",
      status: "completed",
      totalRecipients: 5000,
      sentCount: 5000,
      failedCount: 50,
      openedCount: 3200,
      clickedCount: 1100,
      template: { name: "Newsletter Temp" }
    },
    {
      id: "email_2",
      name: "Product Launch",
      provider: "microsoft",
      status: "sending",
      totalRecipients: 15000,
      sentCount: 8000,
      failedCount: 200,
      openedCount: 4500,
      clickedCount: 500,
      template: { name: "Launch Email" }
    },
    {
      id: "email_3",
      name: "Inactive Users Re-engagement",
      provider: "custom",
      status: "failed",
      totalRecipients: 1000,
      sentCount: 100,
      failedCount: 900,
      openedCount: 20,
      clickedCount: 5,
      template: { name: "Re-engagement" }
    }
  ];

  const displayCampaigns = (campaigns && campaigns.length > 0) ? campaigns : dummyEmailCampaigns;

  const filtered = displayCampaigns.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.templateId) {
      toast.error("Campaign name and template are required");
      return;
    }
    setSubmitting(true);
    try {
      await createEmailCampaign(form);
      toast.success("Campaign created!");
      setShowForm(false);
      setForm({ name: "", templateId: "", provider: "google" });
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    setActionId(id);
    try {
      await updateCampaignStatus(id, status);
      toast.success(`Campaign ${status}`);
      mutate();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionId(id);
    try {
      await deleteCampaign(id);
      toast.success("Campaign deleted");
      mutate();
    } catch {
      toast.error("Failed to delete campaign");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="text-blue-500" size={22} />
            Email Campaigns
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create and manage email campaigns with recipient tracking.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search campaigns..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400"
        />
      </div>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white">Create New Campaign</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Campaign Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Summer Promo 2025"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email Template</label>
            <select
              value={form.templateId}
              onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">Select template...</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email Provider</label>
            <select
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="google">Gmail</option>
              <option value="microsoft">Outlook / Microsoft</option>
              <option value="custom">Custom SMTP</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitting ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      )}

      {/* Campaign List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Megaphone size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">{search ? "No campaigns match your search." : "No campaigns yet. Create your first one!"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => {
            const meta = STATUS_META[c.status] ?? STATUS_META.pending;
            const StatusIcon = meta.icon;
            const isExpanded = expandedId === c.id;

            return (
              <div key={c.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">{c.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{c.template?.name ?? "—"} · {c.provider}</p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${meta.color}`}>
                      <StatusIcon size={12} className={c.status === "processing" || c.status === "sending" ? "animate-spin" : ""} />
                      {meta.label}
                    </span>
                  </div>

                  <CampaignStats c={c} />

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-2">
                      {c.status === "sending" || c.status === "processing" ? (
                        <button onClick={() => handleStatus(c.id, "paused")} disabled={actionId === c.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-100">
                          {actionId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Pause size={12} />} Pause
                        </button>
                      ) : c.status === "paused" ? (
                        <button onClick={() => handleStatus(c.id, "pending")} disabled={actionId === c.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100">
                          {actionId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Resume
                        </button>
                      ) : null}
                      <button onClick={() => handleDelete(c.id)} disabled={actionId === c.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-medium hover:bg-red-100">
                        {actionId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                      </button>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100"
                    >
                      <BarChart3 size={12} />
                      Logs
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Logs */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-4">
                    <CampaignLogs campaignId={c.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
