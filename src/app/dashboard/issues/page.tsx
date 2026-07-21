"use client";
import { Info } from "lucide-react";
import Link from 'next/link';
const issues = [
  {sev:'error',emoji:'🔴',title:'3 pages missing meta description',detail:'Google uses meta descriptions to show page summaries in search results. Missing these can hurt your click-through rate.',pages:['/products','/contact','/about'],fix:'Write a unique 150-160 character description for each page.'},
  {sev:'error',emoji:'🔴',title:'12 product images have no alt text',detail:'Alt text helps Google understand your images. It also helps visually impaired users.',pages:['/products'],fix:'Add short descriptive alt text like "wooden sofa set mumbai" to each image.'},
  {sev:'warning',emoji:'🟡',title:'Mobile page speed is 62/100',detail:'Google ranks slower mobile sites lower. 53% of mobile users leave if a page takes more than 3 seconds to load.',pages:['/products'],fix:'Compress images to WebP format and remove unused JavaScript.'},
  {sev:'warning',emoji:'🟡',title:'2 pages missing H1 heading tag',detail:'H1 is the main title of your page. Google uses it to understand what the page is about.',pages:['/about','/contact'],fix:'Add a single H1 tag that includes your target keyword.'},
  {sev:'info',emoji:'🔵',title:'Duplicate title tags found',detail:'Two pages share the same title tag, which can confuse Google about which page to rank.',pages:['/blog','/products'],fix:'Ensure each page has a unique, keyword-focused title.'},
];
const sColors: Record<string, string> = {error:'#EF4444',warning:'#F59E0B',info:'#3B82F6'};
export default function IssuesPage() {
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>🚨 SEO Issues</h1>
      <p style={{ margin: '0 0 1.75rem', fontSize: '0.88rem', color: '#64748B' }}>Fixing these issues could raise your score from 78 → 92/100</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             A centralized dashboard for all technical SEO and crawling errors. <strong>Example:</strong> Quickly find out if you have broken 404 links or duplicate title tags that are harming your rankings.
          </p>
        </div>
      </div>
  
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[{l:'Critical Errors',v:'2',c:'#EF4444'},{l:'Warnings',v:'2',c:'#F59E0B'},{l:'Info',v:'1',c:'#3B82F6'}].map((m,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 0.6rem 0' }}>{m.l}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {issues.map((issue,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: 16, padding: '1.5rem', borderLeft: '3px solid '+sColors[issue.sev] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0 0 0.75rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{issue.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>{issue.title}</span>
              </div>
              <span style={{ background: sColors[issue.sev]+'1A', color: sColors[issue.sev], padding: '0.15rem 0.6rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>{issue.sev}</span>
            </div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.83rem', color: '#64748B', lineHeight: 1.6 }}>{issue.detail}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: '0 0 0.75rem 0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Affected pages:</span>
              {issue.pages.map((p,j)=><span key={j} style={{ background: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', color: '#3B82F6' }}>{p}</span>)}
            </div>
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#059669' }}>
              💡 <strong>How to fix:</strong> {issue.fix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}