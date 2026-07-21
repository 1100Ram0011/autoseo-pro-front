"use client";
import { Info } from "lucide-react";
import { useState, useEffect } from 'react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(err => console.error("Failed to fetch campaigns", err));
  }, []);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>📧 Email Campaigns</h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>AI writes personalized outreach emails. You just approve and send.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Track your SEO outreach and link-building marketing campaigns. <strong>Example:</strong> Track how many emails you sent to influencers for backlinks and monitor their conversion rate.
          </p>
        </div>
      </div>
  
        </div>
        <button style={{ background: '#5A4AF4', border: 'none', color: '#0F172A', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>+ New Campaign</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {campaigns.map((c,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Subject: <em style={{ color: '#64748B' }}>"{c.subject}"</em></div>
              </div>
              <span style={{ background: c.status==='Active'?'rgba(16,185,129,0.15)':'#FFFFFF', color: c.status==='Active'?'#10B981':'#64748B', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{c.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
              {[{l:'Sent',v:c.sent,c:'#64748B'},{l:'Opened',v:c.opened,c:'#3B82F6'},{l:'Replied',v:c.replied,c:'#A855F7'},{l:'Converted',v:c.converted,c:'#10B981'}].map((m,j)=>(
                <div key={j} style={{ background: '#FFFFFF', borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.c }}>{m.v}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}