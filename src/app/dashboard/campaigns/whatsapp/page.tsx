"use client";
import React, { useState } from "react";
import IntegrationTab from "@/components/WhatsappCampaign/IntegrationTab";
import ContactsTab from "@/components/WhatsappCampaign/ContactsTab";
import TemplatesTab from "@/components/WhatsappCampaign/TemplatesTab";
import CampaignsTab from "@/components/WhatsappCampaign/CampaignsTab";

const WhatsAppCampaignsPage = () => {
  const [activeTab, setActiveTab] = useState("integration");

  const tabs = [
    { id: "integration", label: "WhatsApp Integration", icon: "🔗" },
    { id: "contacts", label: "Contact Lists", icon: "👥" },
    { id: "templates", label: "Templates", icon: "📑" },
    { id: "campaigns", label: "Campaigns", icon: "🚀" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
            💬
          </span>
          Meta WhatsApp Campaigns
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Connect your Meta WhatsApp API, manage templates, contacts, and run campaigns.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 mb-8 pb-px no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-green-600 dark:text-green-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 dark:bg-green-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "integration" && <IntegrationTab />}
        {activeTab === "contacts" && <ContactsTab />}
        {activeTab === "templates" && <TemplatesTab />}
        {activeTab === "campaigns" && <CampaignsTab />}
      </div>
    </div>
  );
};

export default WhatsAppCampaignsPage;
