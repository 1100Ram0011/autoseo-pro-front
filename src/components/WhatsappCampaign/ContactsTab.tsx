"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function ContactsTab() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/lists`, {
        withCredentials: true,
      });
      setLists(res.data.lists || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load contact lists");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/lists`, formData, {
        withCredentials: true,
      });
      toast.success("List created successfully!");
      setShowCreateForm(false);
      setFormData({ name: "", description: "" });
      fetchLists();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create list");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Contact Lists</h2>
          <p className="text-sm text-slate-500">Manage audiences for your WhatsApp campaigns.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {showCreateForm ? "Cancel" : "+ Create List"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateList} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">List Name</label>
            <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700" placeholder="e.g. Q3 Sales Leads" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700" rows={2} />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">Save List</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : lists.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-4xl">👥</span>
          <p className="mt-4 text-slate-500">No contact lists found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {lists.map((l) => (
            <div key={l.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">{l.name}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-1">{l.description || "No description"}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-semibold text-blue-600">{l.count}</span>
                <span className="text-xs text-slate-400">Contacts</span>
              </div>
              <button className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                Manage Contacts
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
