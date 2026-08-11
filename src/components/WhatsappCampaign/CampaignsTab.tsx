"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [numbers, setNumbers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    numberId: "",
    templateId: "",
    listId: "",
    scheduleAt: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, numRes, tplRes, listRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/campaigns`, { withCredentials: true }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/numbers`, { withCredentials: true }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/templates`, { withCredentials: true }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/lists`, { withCredentials: true }),
      ]);
      setCampaigns(campRes.data.campaigns || []);
      setNumbers(numRes.data.numbers || []);
      setTemplates(tplRes.data.templates || []);
      setLists(listRes.data.lists || []);
    } catch (err: any) {
      toast.error("Failed to load campaigns data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/campaigns`, formData, {
        withCredentials: true,
      });
      toast.success("Campaign created successfully!");
      setShowCreateForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create campaign");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">WhatsApp Campaigns</h2>
          <p className="text-sm text-slate-500">Launch and monitor your bulk message campaigns.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          {showCreateForm ? "Cancel" : "+ New Campaign"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700" placeholder="e.g. Diwali Offer 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sending Number</label>
              <select required value={formData.numberId} onChange={(e) => setFormData({ ...formData, numberId: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700">
                <option value="">Select a number...</option>
                {numbers.map(n => <option key={n.id} value={n.id}>{n.label} ({n.phoneNumber})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message Template</label>
              <select required value={formData.templateId} onChange={(e) => setFormData({ ...formData, templateId: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700">
                <option value="">Select a template...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact List (Audience)</label>
              <select required value={formData.listId} onChange={(e) => setFormData({ ...formData, listId: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700">
                <option value="">Select a list...</option>
                {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.count} contacts)</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg font-medium mt-4">Launch Campaign</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-4xl">🚀</span>
          <p className="mt-4 text-slate-500">No campaigns found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {c.name}
                  <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">{c.status}</span>
                </h3>
                <div className="flex gap-4 text-sm text-slate-500 mt-2">
                  <span>List: {c.list?.name || "N/A"}</span>
                  <span>Template: {c.template?.name || "N/A"}</span>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{c.total}</div>
                  <div className="text-xs text-slate-400">Total</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">{c.sent}</div>
                  <div className="text-xs text-slate-400">Sent</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{c.delivered}</div>
                  <div className="text-xs text-slate-400">Deliv.</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
