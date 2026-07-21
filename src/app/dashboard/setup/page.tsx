"use client";
import { Info, CheckCircle, Circle, ChevronRight, Globe, Search, Code, Zap, CreditCard} from 'lucide-react';
import Link from 'next/link';

const steps = [
  { icon: Globe, color: '#10B981', title: 'Connect Your Website', desc: 'We crawled rajeshfurniture.com and found 5 pages.', done: true, detail: 'Completed June 28' },
  { icon: Search, color: '#3B82F6', title: 'Submit to Google Search Console', desc: 'Your sitemap.xml was submitted. Google is now indexing your site.', done: true, detail: 'Completed June 28' },
  { icon: Code, color: '#A855F7', title: 'Install Tracking Script', desc: 'Paste our script in your website head to track live visitors.', done: false, cta: 'Get Script', link: '/dashboard/visitors' },
  { icon: Zap, color: '#F59E0B', title: 'Write Your First AI Blog Post', desc: 'Generate an SEO blog post in under 60 seconds with AI.', done: false, cta: 'Write Blog', link: '/dashboard/ai-blog' },
  { icon: CreditCard, color: '#EF4444', title: 'Upgrade to Pro', desc: 'Unlock autonomous agents, white-label reports, and more.', done: false, cta: 'Upgrade', link: '#' },
];

export default function SetupPage() {
  const done = steps.filter(s => s.done).length;
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>Setup Wizard</h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>Complete {done} of {steps.length} steps to get the most out of AutoSEO Pro.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Advanced technical configuration and API keys. <strong>Example:</strong> Add your OpenAI API key here to unlock all AI generation features.
          </p>
        </div>
      </div>
  
          <div style={{ marginTop: '1rem', height: 6, background: '#FFFFFF', borderRadius: 4 }}>
            <div style={{ height: '100%', width: (done/steps.length*100)+'%', background: 'linear-gradient(90deg,#5A4AF4,#10B981)', borderRadius: 4, transition: 'width 0.5s' }} />
          </div>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>{Math.round(done/steps.length*100)}% Complete</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: s.done ? 'rgba(16,185,129,0.05)' : '#FFFFFF', border: '1px solid ' + (s.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'), borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={s.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: s.done ? '#64748B' : '#0F172A', textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</span>
                    {s.done && <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 20 }}>DONE</span>}
                  </div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748B' }}>{s.desc}</p>
                  {s.done && s.detail && <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#10B981' }}>{s.detail}</p>}
                </div>
                {!s.done && s.cta && (
                  <Link href={s.link || '#'} style={{ background: '#5A4AF4', color: '#0F172A', padding: '0.5rem 1rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {s.cta}
                  </Link>
                )}
                {s.done && <CheckCircle size={20} color="#10B981" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}