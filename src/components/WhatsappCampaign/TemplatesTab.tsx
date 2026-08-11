"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function TemplatesTab() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedNumberId, setSelectedNumberId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tplRes, numRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/templates`, { withCredentials: true }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/numbers`, { withCredentials: true }),
      ]);
      setTemplates(tplRes.data.templates || []);
      setNumbers(numRes.data.numbers || []);
      if (numRes.data.numbers?.length > 0) {
        setSelectedNumberId(numRes.data.numbers[0].id);
      }
    } catch (err: any) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedNumberId) return toast.error("Please select a number first");
    try {
      setSyncing(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/templates/sync`, { numberId: selectedNumberId }, { withCredentials: true });
      toast.success("Templates synced successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">WhatsApp Templates</h2>
          <p className="text-sm text-slate-500">Sync and preview your approved Meta templates.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={selectedNumberId} 
            onChange={(e) => setSelectedNumberId(e.target.value)}
            className="flex-1 md:w-48 p-2 border rounded-lg bg-transparent dark:border-slate-700"
          >
            {numbers.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <button
            onClick={handleSync}
            disabled={syncing || !selectedNumberId}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            {syncing ? "Syncing..." : "🔄 Sync from Meta"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-4xl">📑</span>
          <p className="mt-4 text-slate-500">No templates found. Sync from Meta to import your templates.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{t.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${t.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 uppercase tracking-wide text-xs">{t.category} • {t.language}</p>
              
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-mono text-slate-600 dark:text-slate-300">
                {/* Mock preview for now */}
                {JSON.stringify(t.components?.[0]?.text || "No preview available").replace(/\"/g, "")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
