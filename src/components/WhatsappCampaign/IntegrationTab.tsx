"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function IntegrationTab() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    phoneNumber: "",
    displayName: "",
  });

  useEffect(() => {
    fetchNumbers();
  }, []);

  const fetchNumbers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/numbers`, {
        withCredentials: true,
      });
      setNumbers(res.data.numbers || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load numbers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/numbers`, formData, {
        withCredentials: true,
      });
      toast.success("Number added successfully!");
      setShowAddForm(false);
      setFormData({ label: "", phoneNumberId: "", wabaId: "", accessToken: "", phoneNumber: "", displayName: "" });
      fetchNumbers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add number");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this number?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/meta-whatsapp/numbers/${id}`, {
        withCredentials: true,
      });
      toast.success("Number removed");
      fetchNumbers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove number");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Connected Numbers</h2>
          <p className="text-sm text-slate-500">Manage your WhatsApp Business API numbers.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Number"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddNumber} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label (e.g. Sales)</label>
              <input required value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number (with country code)</label>
              <input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number ID</label>
              <input required value={formData.phoneNumberId} onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WABA ID</label>
              <input required value={formData.wabaId} onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Permanent Access Token</label>
              <input required type="password" value={formData.accessToken} onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })} className="w-full p-2 border rounded-lg bg-transparent dark:border-slate-700" />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg font-medium mt-4">Save Configuration</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : numbers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-4xl">📱</span>
          <p className="mt-4 text-slate-500">No WhatsApp numbers connected yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {numbers.map((n) => (
            <div key={n.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {n.label} 
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">{n.phoneNumber || "Unknown Number"}</p>
                <p className="text-xs text-slate-400 mt-1">ID: {n.phoneNumberId}</p>
              </div>
              <button onClick={() => handleDelete(n.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
