"use client";

import { useState } from "react";
import { Plus, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateCampaignDialog from "@/components/whatsapp/CreateCampaignDialog";

export default function WhatsappCampaignsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="h-full p-6 max-w-7xl mx-auto flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WhatsApp Campaigns</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create and manage your WhatsApp marketing campaigns.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
        <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-sm">
          <Megaphone className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Campaigns Yet</h2>
        <p className="text-slate-500 text-center max-w-md mb-8">
          Launch your first WhatsApp campaign by selecting a template, choosing your audience, and hitting send.
        </p>
        <Button onClick={() => setIsCreateOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Start Your First Campaign
        </Button>
      </div>

      <CreateCampaignDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
