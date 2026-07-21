"use client";
import { Info } from "lucide-react";
import { useState, useEffect } from 'react';

const sc: any = {'Email Sent':'#3B82F6',Replied:'#A855F7','Converted 🎉':'#10B981','Opened':'#F59E0B'};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/leads')
      .then(res => res.json())
      .then(data => setLeads(data))
      .catch(err => console.error("Failed to fetch leads", err));
  }, []);

  const total = leads.length;
  const sent = leads.filter(l => l.status.includes('Email Sent')).length;
  const replied = leads.filter(l => l.status.includes('Replied')).length;
  const converted = leads.filter(l => l.status.includes('Converted')).length;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>🎯 Lead Generation</h1>
      <p style={{ margin: '0 0 1.75rem', fontSize: '0.88rem', color: '#64748B' }}>W1 Agent automatically found local businesses who need SEO help</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Track SEO-generated leads and conversions. <strong>Example:</strong> See how many people filled out your contact form after finding your website on Google.
          </p>
        </div>
      </div>
  
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[{l:'Total Leads Found',v:total,c:'#5A4AF4'},{l:'Emails Sent',v:sent,c:'#3B82F6'},{l:'Replies Received',v:replied,c:'#A855F7'},{l:'Clients Converted',v:converted,c:'#10B981'}].map((m,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.6rem' }}>{m.l}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {leads.map((l,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#0F172A,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{l.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{l.city} · <span style={{ color: '#93C5FD' }}>{l.url}</span> · SEO Score: <span style={{ color: l.score>50?'#F59E0B':'#EF4444', fontWeight: 700 }}>{l.score}/100</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: (sc[l.status.split(' ')[0]]||'#64748B')+'22', color: sc[l.status.split(' ')[0]]||'#64748B', padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>{l.status}</span>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px' }}>{new Date(l.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}