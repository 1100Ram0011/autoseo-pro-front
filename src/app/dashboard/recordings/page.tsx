"use client";

import { API_BASE } from '@/lib/apiConfig';
import { Info } from "lucide-react";
import { useState, useEffect } from 'react';
import { fetcher } from '../../../lib/api';

interface UxIssue {
  url: string;
  rageClicks: number;
  deadClicks: number;
  sessions: number;
}

export default function RecordingsPage() {
  const [issues, setIssues] = useState<UxIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    try {
      // Fetch sites first to get a valid siteId
      const sites = await fetcher(`${API_BASE}/sites?userId=1`);
      if (sites.length > 0) {
        const siteId = sites[0].id;
        const data = await fetcher(`${API_BASE}/sites/${siteId}/clarity/issues?days=7`);
        setIssues(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch(`${API_BASE}/clarity/sync`, { method: 'POST' });
      // Wait a few seconds for the background sync to populate the DB
      setTimeout(() => {
        loadData();
        setSyncing(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setSyncing(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>🎬 UX Issues & Frustration Signals</h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>Identify where users are getting stuck based on Microsoft Clarity data.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Watch session recordings of real users navigating your site. <strong>Example:</strong> See exactly where a user got frustrated and left your checkout page so you can fix the UX.
          </p>
        </div>
      </div>
  
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          style={{ background: 'rgba(90,74,244,0.15)', border: '1px solid rgba(90,74,244,0.3)', color: '#A5B4FC', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: syncing ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {syncing ? '🔄 Syncing Data...' : '🔄 Pull Latest Data'}
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#64748B', fontSize: '0.9rem' }}>Loading UX issues...</div>
      ) : issues.length === 0 ? (
        <div style={{ background: '#FFFFFF', border: '1px dashed #E2E8F0', borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#0F172A', fontSize: '1.1rem' }}>No data found</h3>
          <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.85rem' }}>We don't have any Clarity data for the last 7 days yet.</p>
          <button onClick={handleSync} style={{ background: '#5A4AF4', border: 'none', color: '#0F172A', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Sync Now</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {issues.map((issue, i) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>😡</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>{issue.url}</span>
                  {issue.rageClicks > 10 && <span style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 4 }}>HIGH RAGE CLICKS</span>}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  <strong style={{ color: '#F87171' }}>{issue.rageClicks}</strong> Rage Clicks · <strong style={{ color: '#FBBF24' }}>{issue.deadClicks}</strong> Dead Clicks
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>Based on {issue.sessions} recorded sessions</div>
              </div>

              <a href={`https://clarity.microsoft.com/projects/view/`} target="_blank" rel="noreferrer" style={{ background: 'rgba(90,74,244,0.2)', border: '1px solid rgba(90,74,244,0.4)', color: '#A5B4FC', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                View Recordings →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}