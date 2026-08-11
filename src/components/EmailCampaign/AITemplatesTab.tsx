"use client";

import React, { useState } from "react";
import { useAIEmailTemplates, useAITemplate } from "@/hooks/useEmailCampaign";
import { Sparkles, Loader2, Search, Copy } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  "all", "General", "Welcome", "Newsletter", "Promotional",
  "Transactional", "Event", "Follow-up", "Onboarding", "Feedback", "Other",
];

export default function AITemplatesTab() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [usingId, setUsingId] = useState<string | null>(null);
  const { aiTemplates, isLoading } = useAIEmailTemplates(category, search);

  const handleUse = async (id: string) => {
    setUsingId(id);
    try {
      await useAITemplate(id);
      toast.success("Template copied to your library!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to use template");
    } finally {
      setUsingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-purple-500" size={22} />
          AI Email Templates
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse curated AI-powered templates. Click "Use" to copy to your library.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search AI templates..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                category === cat
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : aiTemplates.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Sparkles size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No AI templates found. Try a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiTemplates.map((tmpl: any) => (
            <div
              key={tmpl.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 hover:shadow-md transition-shadow ${
                tmpl.isFeatured
                  ? "border-purple-300 dark:border-purple-800 ring-1 ring-purple-200 dark:ring-purple-900"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {tmpl.isFeatured && (
                <div className="flex items-center gap-1 mb-2">
                  <Sparkles size={12} className="text-purple-500" />
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Featured</span>
                </div>
              )}
              <div className="mb-3">
                <h3 className="font-semibold text-sm text-slate-800 dark:text-white">{tmpl.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{tmpl.subject}</p>
              </div>
              {tmpl.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{tmpl.description}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1">
                  {tmpl.tags?.slice(0, 2).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleUse(tmpl.id)}
                  disabled={usingId === tmpl.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition disabled:opacity-60"
                >
                  {usingId === tmpl.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {usingId === tmpl.id ? "Copying..." : "Use"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
