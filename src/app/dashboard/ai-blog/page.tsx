"use client";
import { Info } from "lucide-react";
import { useState } from 'react';
import Link from 'next/link';
const blogs = [
  {title:'Best Sofa Sets in Mumbai 2024 — Complete Buyer Guide',kw:'best sofa sets mumbai',words:1240,status:'Published',date:'Jun 28',score:94},
  {title:'Modular Kitchen vs Traditional Kitchen: Which is Better?',kw:'modular kitchen mumbai',words:980,status:'Draft',date:'Jun 27',score:87},
  {title:'How to Choose Office Furniture for Small Offices',kw:'office furniture mumbai',words:1100,status:'Published',date:'Jun 25',score:91},
];
export default function AIBlogPage() {
  const [kw, setKw] = useState('');
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>✍️ AI Blog Writer</h1>
      <p style={{ margin: '0 0 1.75rem', fontSize: '0.88rem', color: '#64748B' }}>Generate a full 1000+ word, Google-optimized blog post in under 60 seconds.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Writes and publishes AI-generated blog posts directly to your WordPress site. <strong>Example:</strong> Automatically post a weekly article about 'SEO Tips' to keep your blog active and rank for long-tail keywords.
          </p>
        </div>
      </div>
  
      <div style={{ background: 'linear-gradient(135deg,rgba(90,74,244,0.12),rgba(168,85,247,0.08))', border: '1px solid rgba(90,74,244,0.3)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#A5B4FC', marginBottom: '1rem' }}>🤖 Generate a New Blog Post</div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input value={kw} onChange={e=>setKw(e.target.value)} placeholder="Enter a topic or keyword, e.g. 'best office chairs mumbai'" style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0.75rem 1rem', color: '#0F172A', fontSize: '0.88rem', outline: 'none' }}/>
          <button style={{ background: '#5A4AF4', border: 'none', color: '#0F172A', padding: '0 1.5rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>Generate ✨</button>
        </div>
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#64748B' }}>AI will write a 1000+ word, E-E-A-T optimized blog with headings, FAQs and meta description.</p>
      </div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem' }}>📝 Generated Blogs</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {blogs.map((b,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0F172A', marginBottom: '0.35rem' }}>{b.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>🔑 {b.kw} · {b.words} words · SEO Score: <span style={{ color: '#10B981', fontWeight: 700 }}>{b.score}/100</span> · {b.date}</div>
            </div>
            <span style={{ background: b.status==='Published'?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)', color: b.status==='Published'?'#10B981':'#F59E0B', padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}