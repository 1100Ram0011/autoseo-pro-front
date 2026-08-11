"use client";

import React, { useState } from "react";
import {
  useEmailAccounts,
  connectCustomSmtp,
  disconnectEmailAccount,
} from "@/hooks/useEmailCampaign";
import {
  Mail,
  Plus,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Link,
} from "lucide-react";
import toast from "react-hot-toast";

const PROVIDER_ICONS: Record<string, string> = {
  google: "🔴",
  microsoft: "🔵",
  custom: "⚙️",
};

export default function ConnectEmailTab() {
  const { accounts, isLoading, mutate } = useEmailAccounts();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [dailyLimit, setDailyLimit] = useState(500);
  const [submitting, setSubmitting] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const handleConnectCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !appPassword) {
      toast.error("Email and app password are required");
      return;
    }
    setSubmitting(true);
    try {
      await connectCustomSmtp({ email: customEmail, appPassword, dailyLimit });
      toast.success("Custom SMTP connected!");
      setShowCustomForm(false);
      setCustomEmail("");
      setAppPassword("");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to connect");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    try {
      await disconnectEmailAccount(id);
      toast.success("Account disconnected");
      mutate();
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="text-blue-500" size={22} />
          Connected Email Accounts
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Connect Gmail, Outlook, or Custom SMTP to send your email campaigns.
        </p>
      </div>

      {/* Provider Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Google OAuth */}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/email-campaign/auth/google`}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all group"
        >
          <span className="text-3xl">🔴</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gmail / Google</span>
          <span className="text-xs text-slate-400">Connect via OAuth</span>
        </a>

        {/* Microsoft OAuth */}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/email-campaign/auth/microsoft`}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
        >
          <span className="text-3xl">🔵</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Outlook / Microsoft</span>
          <span className="text-xs text-slate-400">Connect via OAuth</span>
        </a>

        {/* Custom SMTP */}
        <button
          onClick={() => setShowCustomForm(true)}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all"
        >
          <span className="text-3xl">⚙️</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Custom SMTP</span>
          <span className="text-xs text-slate-400">Use App Password</span>
        </button>
      </div>

      {/* Custom SMTP Form */}
      {showCustomForm && (
        <form
          onSubmit={handleConnectCustom}
          className="mb-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white">Connect Custom SMTP</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="you@yourdomain.com"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">App Password</label>
            <input
              type="password"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              placeholder="Gmail/Outlook App Password"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Daily Send Limit</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              min={1}
              max={2000}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Link size={16} />}
              {submitting ? "Connecting..." : "Connect"}
            </button>
          </div>
        </form>
      )}

      {/* Connected Accounts List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Mail size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No email accounts connected yet.</p>
          </div>
        ) : (
          accounts.map((account: any) => (
            <div
              key={account.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <span className="text-2xl">{PROVIDER_ICONS[account.provider] ?? "📧"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{account.email}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">
                  {account.provider} · {account.tier?.replace(/_/g, " ")} · Daily limit: {account.dailyLimit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {account.status === "active" ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={16} className="text-amber-500" />
                )}
                <button
                  onClick={() => handleDisconnect(account.id)}
                  disabled={disconnecting === account.id}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors"
                >
                  {disconnecting === account.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
