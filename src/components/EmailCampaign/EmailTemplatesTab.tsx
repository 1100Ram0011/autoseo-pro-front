"use client";

import React, { useState } from "react";
import { useEmailTemplates, createEmailTemplate, deleteEmailTemplate } from "@/hooks/useEmailCampaign";
import {
  LayoutTemplate,
  Plus,
  Loader2,
  Trash2,
  Edit,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

export default function EmailTemplatesTab() {
  const { templates, isLoading, mutate } = useEmailTemplates();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", html: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = templates.filter(
    (t: any) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.subject || !form.html) {
      toast.error("Name, subject and HTML content are required");
      return;
    }
    setSubmitting(true);
    try {
      await createEmailTemplate(form);
      toast.success("Template created!");
      setShowForm(false);
      setForm({ name: "", subject: "", html: "" });
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteEmailTemplate(id);
      toast.success("Template deleted");
      mutate();
    } catch {
      toast.error("Failed to delete template");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutTemplate className="text-blue-500" size={22} />
            Email Templates
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create reusable templates for your campaigns.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400"
        />
      </div>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white">Create New Template</h3>
          {[
            { label: "Template Name", key: "name", placeholder: "e.g. Welcome Email" },
            { label: "Subject Line", key: "subject", placeholder: "e.g. Welcome to {{company}}!" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              HTML Content <span className="text-slate-400">(use {"{{variable}}"} for merge fields)</span>
            </label>
            <textarea
              rows={6}
              value={form.html}
              onChange={(e) => setForm((f) => ({ ...f, html: e.target.value }))}
              placeholder="<p>Hello {{name}},</p>"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitting ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
      )}

      {/* Template List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <LayoutTemplate size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">{search ? "No templates match your search." : "No templates yet. Create your first one!"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tmpl: any) => (
            <div
              key={tmpl.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">{tmpl.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{tmpl.subject}</p>
                </div>
                {tmpl.isAIGenerated && (
                  <span className="ml-2 shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 text-[10px] font-bold">
                    AI
                  </span>
                )}
              </div>
              {tmpl.variables?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tmpl.variables.slice(0, 4).map((v: string) => (
                    <span key={v} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-3">
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors">
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => handleDelete(tmpl.id)}
                  disabled={deleting === tmpl.id}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors"
                >
                  {deleting === tmpl.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
