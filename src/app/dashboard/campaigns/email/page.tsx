"use client";

import React, { useState, lazy, Suspense } from "react";
import {
  Mail,
  LayoutTemplate,
  Megaphone,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import dynamic from "next/dynamic";
const EmailTemplatesTab = dynamic(() => import("@/components/features/emailTemplate/EmailTemplatesPage"), { ssr: false }) as any;
const EmailCampaignsTab = dynamic(() => import("@/components/features/emailCampaign/EmailCampaignPage"), { ssr: false }) as any;
const ConnectEmailTab = dynamic(() => import("@/components/features/connectEmails/ConnectMails"), { ssr: false }) as any;
const AITemplatesTab = dynamic(() => import("@/components/features/emailTemplate/components/AIGeneratedEmailTemplates"), { ssr: false }) as any;

const TABS = [
  {
    key: "connectmails",
    label: "Connect Email",
    description: "Connect your Gmail, Outlook, or Custom SMTP to send campaigns.",
    icon: Mail,
  },
  {
    key: "templates",
    label: "Custom Templates",
    description: "Create and manage your custom email templates.",
    icon: LayoutTemplate,
  },
  {
    key: "aiTemplates",
    label: "AI Templates",
    description: "Browse AI-generated email template library.",
    icon: Sparkles,
  },
  {
    key: "campaigns",
    label: "Campaigns",
    description: "Schedule and manage your email campaigns.",
    icon: Megaphone,
  },
];

export default function EmailCampaignPage() {
  const [activeTab, setActiveTab] = useState("connectmails");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-full bg-slate-50/70 dark:bg-slate-950">
      {/* ───── LEFT SIDEBAR ───── */}
      <aside
        className={`hidden sm:flex relative flex-col border-r border-slate-200 dark:border-slate-800 bg-white/95 shadow-sm dark:bg-slate-950 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div
          className={`flex h-20 shrink-0 items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 ${
            isSidebarOpen ? "justify-start" : "justify-center px-0"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25 ${
              !isSidebarOpen && "mx-auto"
            }`}
          >
            <Mail size={18} className="text-blue-500" />
          </div>
          {isSidebarOpen && (
            <span className="truncate text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Email Studio
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 ${isSidebarOpen ? "p-3" : "p-2"}`} aria-label="Email campaign sections">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`group relative flex w-full items-center gap-3 rounded-lg font-medium transition-all duration-200 ${
                  isSidebarOpen
                    ? "justify-start px-4 py-2.5 text-sm"
                    : "justify-center p-3"
                } ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 border-l-4 border-blue-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
                }`}
              >
                <Icon
                  className={`flex-shrink-0 ${isSidebarOpen ? "h-4 w-4" : "h-5 w-5"} ${
                    isActive ? "text-white" : ""
                  }`}
                />
                {isSidebarOpen && <span className="truncate">{label}</span>}

                {/* Tooltip for collapsed state */}
                {!isSidebarOpen && (
                  <div className="pointer-events-none absolute left-full ml-3 hidden sm:group-hover:flex z-50 items-center rounded-md bg-slate-800 dark:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl whitespace-nowrap">
                    {label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`group flex w-full items-center gap-3 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
              isSidebarOpen ? "justify-start px-4 py-2.5 text-sm" : "justify-center p-3"
            }`}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            {isSidebarOpen && <span className="truncate text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ───── MAIN CONTENT ───── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="hidden shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:flex">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Email studio</p><h1 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{TABS.find(tab => tab.key === activeTab)?.label}</h1></div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"><ShieldCheck size={14} /> Campaign-ready</div>
        </header>
        {/* Mobile Tabs */}
        <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex overflow-x-auto bg-white dark:bg-slate-900">
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`whitespace-nowrap flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5">
          <div className="min-h-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              </div>
            }
          >
            {activeTab === "connectmails" && <ConnectEmailTab />}
            {activeTab === "campaigns" && <EmailCampaignsTab />}
            {activeTab === "templates" && <EmailTemplatesTab />}
            {activeTab === "aiTemplates" && <AITemplatesTab />}
          </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
