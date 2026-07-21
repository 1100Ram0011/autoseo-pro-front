"use client";
import { useState } from 'react';
import { Info, Download, RefreshCw, CheckCircle, Globe} from 'lucide-react';

const urls = [
  { url: 'https://rajeshfurniture.com/', lastmod: '2026-06-30', priority: '1.0', freq: 'Daily', indexed: true },
  { url: 'https://rajeshfurniture.com/products', lastmod: '2026-06-29', priority: '0.9', freq: 'Weekly', indexed: true },
  { url: 'https://rajeshfurniture.com/blog', lastmod: '2026-06-28', priority: '0.8', freq: 'Daily', indexed: true },
  { url: 'https://rajeshfurniture.com/about', lastmod: '2026-06-20', priority: '0.7', freq: 'Monthly', indexed: false },
  { url: 'https://rajeshfurniture.com/contact', lastmod: '2026-06-20', priority: '0.7', freq: 'Monthly', indexed: false },
  { url: 'https://rajeshfurniture.com/blog/sofa-guide', lastmod: '2026-06-28', priority: '0.8', freq: 'Weekly', indexed: true },
];

export default function SitemapPage() {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>🗺️ Sitemap</h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>Auto-generated sitemap.xml for rajeshfurniture.com — 6 URLs</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             View and manage your XML sitemaps. <strong>Example:</strong> Ensure your newly published pages are instantly added to your sitemap so Google finds them faster.
          </p>
        </div>
      </div>
  
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            <RefreshCw size={14} /> Regenerate
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#5A4AF4', border: 'none', color: '#0F172A', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            <Download size={14} /> Download XML
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[{l:'Total URLs',v:'6',c:'#5A4AF4'},{l:'Indexed by Google',v:'4',c:'#10B981'},{l:'Not Indexed',v:'2',c:'#F59E0B'}].map((m,i) => (
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>{m.l}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#FFFFFF' }}>
          {['URL','Last Modified','Priority','Change Freq','Status'].map(h => (
            <div key={h} style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>
        {urls.map((u, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr', padding: '0.9rem 1.25rem', borderBottom: i < urls.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
            <div style={{ fontSize: '0.82rem', color: '#93C5FD', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' }}>{u.url}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{u.lastmod}</div>
            <div><span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>{u.priority}</span></div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{u.freq}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: u.indexed ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: u.indexed ? '#10B981' : '#F59E0B' }} />
              {u.indexed ? 'Indexed' : 'Pending'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}