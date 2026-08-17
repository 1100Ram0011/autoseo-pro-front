"use client";

import React, { useState } from "react";
import IntegrationTab from "@/components/WhatsappCampaign/IntegrationTab";
import ContactsTab from "@/components/WhatsappCampaign/ContactsTab";
import TemplatesTab from "@/components/WhatsappCampaign/TemplatesTab";
import CampaignsTab from "@/components/WhatsappCampaign/CampaignsTab";
import { ContactRound, LayoutTemplate, MessageCircleMore, PlugZap, Rocket, ShieldCheck } from "lucide-react";

const tabs = [
  { id: "integration", label: "Integration", description: "Connect your Meta account", icon: PlugZap },
  { id: "contacts", label: "Contact lists", description: "Organize your audience", icon: ContactRound },
  { id: "templates", label: "Templates", description: "Create approved messages", icon: LayoutTemplate },
  { id: "campaigns", label: "Campaigns", description: "Send with confidence", icon: Rocket },
];

const WhatsAppCampaignsPage = () => {
  const [activeTab, setActiveTab] = useState("integration");

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/40 dark:via-slate-950 dark:to-teal-950/30 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"><MessageCircleMore size={24} /></div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Meta WhatsApp Campaigns</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Connect your Meta WhatsApp API, manage templates, contacts, and run campaigns from one focused workspace.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"><ShieldCheck size={15} /> Meta-ready workspace</div>
          </div>
        </header>

        <nav className="mb-7 grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4" aria-label="WhatsApp campaign sections">
          {tabs.map(({ id, label, description, icon: Icon }) => {
            const active = activeTab === id;
            return <button key={id} onClick={() => setActiveTab(id)} className={`flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${active ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"}`}><Icon size={18} /></span>
              <span className="min-w-0"><span className="block truncate text-sm font-semibold">{label}</span><span className={`hidden truncate text-xs sm:block ${active ? "text-emerald-50" : "text-slate-400"}`}>{description}</span></span>
            </button>;
          })}
        </nav>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "integration" && <IntegrationTab />}
          {activeTab === "contacts" && <ContactsTab />}
          {activeTab === "templates" && <TemplatesTab />}
          {activeTab === "campaigns" && <CampaignsTab />}
        </main>
      </div>
    </div>
  );
};

export default WhatsAppCampaignsPage;
