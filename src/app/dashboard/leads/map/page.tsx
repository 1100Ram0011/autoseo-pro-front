"use client";

import React, { useState } from 'react';
import { useMapLeads } from '@/hooks/useLeads';
import { Loader2, Trash2, MapPin, Search, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '@/components/leads/leads.module.css';
import LinkedInSubTable from '@/components/leads/LinkedInSubTable';

export default function LeadsMapPage() {
  const { leads, stats, isLoading, generateLeads, deleteLead, verifyWhatsApp, checkProgress } = useMapLeads();
  const [targetMarket, setTargetMarket] = useState('');
  const [geographicFocus, setGeographicFocus] = useState('');
  const [numLeads, setNumLeads] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!targetMarket || !geographicFocus) return;
    setIsGenerating(true);
    try {
      const data = await generateLeads(targetMarket, geographicFocus, numLeads);
      if (data.jobId) {
        // Poll for progress (simplified version for UI)
        const interval = setInterval(async () => {
          const progressData = await checkProgress(data.jobId);
          if (progressData?.data?.state === 'completed' || progressData?.data?.state === 'failed') {
            clearInterval(interval);
            setIsGenerating(false);
            window.location.reload(); // Quick refresh to get new leads
          }
        }, 3000);
      }
    } catch (e) {
      setIsGenerating(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1>LinkedIn & Google Map Leads</h1>
          <p>Generate high-quality B2B leads using AI and Maps integration.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Leads</h3>
          <p>{stats?.totalInDb || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Leads With Emails</h3>
          <p>{stats?.leads_with_emails || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Average Rating</h3>
          <p>{stats?.avg_rating || "0.0"} ⭐</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label>Target Market</label>
          <input 
            type="text" 
            placeholder="e.g. IT Companies, Plumbers..." 
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>City / Location</label>
          <input 
            type="text" 
            placeholder="e.g. Mumbai, New York..." 
            value={geographicFocus}
            onChange={(e) => setGeographicFocus(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup} style={{ maxWidth: '100px' }}>
          <label>Count</label>
          <input 
            type="number" 
            min="1" max="50" 
            value={numLeads}
            onChange={(e) => setNumLeads(parseInt(e.target.value))}
          />
        </div>
        <button 
          className={styles.generateBtn} 
          onClick={handleGenerate}
          disabled={!targetMarket || !geographicFocus || isGenerating}
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          {isGenerating ? 'Generating...' : 'Generate Leads'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <table className={styles.leadsTable}>
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No leads found. Generate some to get started!
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => (
                <React.Fragment key={lead.id}>
                  <tr>
                    <td className="font-medium">{lead.name}</td>
                    <td>{lead.business_type}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        {lead.city}
                      </div>
                    </td>
                    <td>{lead.phone}</td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.iconBtn} 
                          title="Verify WhatsApp"
                          onClick={() => verifyWhatsApp(lead.id)}
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button 
                          className={`${styles.iconBtn} ${styles.deleteBtn}`}
                          title="Delete Lead"
                          onClick={() => deleteLead(lead.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          className={styles.iconBtn}
                          onClick={() => toggleExpand(lead.id)}
                        >
                          {expandedId === lead.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === lead.id && (
                    <tr>
                      <td colSpan={5} style={{ padding: 0 }}>
                        <LinkedInSubTable lead={lead} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
