"use client";

import { Info, BookOpen, ShieldAlert, BrainCircuit, Code, MousePointer, FastForward, CheckCircle2} from 'lucide-react';
import styles from '../search-console/page.module.css';

export default function GuidePage() {
  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="#8b5cf6" /> AutoSEO Pro: The Ultimate Platform Guide
          </h1>
          <p className={styles.subtitle}>Welcome to your fully automated, end-to-end SEO and User Experience platform.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Step-by-step onboarding guide to set up your SEO properly. <strong>Example:</strong> Complete the setup checklist to ensure you don't miss any critical technical SEO configurations.
          </p>
        </div>
      </div>
  
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', marginBottom: '3rem' }}>
        
        {/* Sequence Section */}
        <div style={{ padding: '2rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #FFFFFF' }}>
          <h2 style={{ color: '#0F172A', marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FastForward size={22} color="#10b981" /> The Ideal User Sequence
          </h2>
          <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '2rem' }}>
            For maximum SEO results, follow this sequence when onboarding a new website. This ensures technical perfection before scaling content.
          </p>

          {/* Phase 1 */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#0F172A', borderBottom: '1px solid #0F172A', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Phase 1: Technical Foundation & Security
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <ShieldAlert size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0F172A' }}>Security Audit (/security):</strong> 
                  <span style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>Run the Google Safe Browsing API check. If your site has malware, Google will block your traffic entirely. Fix this first.</span>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <CheckCircle2 size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0F172A' }}>Core Web Vitals (/cwv):</strong> 
                  <span style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>Run the Google PageSpeed Insights audit. Ensure your site loads in under 2.5 seconds (LCP).</span>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <Code size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0F172A' }}>Schema & Brand Entity (/schema):</strong> 
                  <span style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>Generate structured data and verify your brand against the Google Knowledge Graph.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Phase 2 */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#0F172A', borderBottom: '1px solid #0F172A', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Phase 2: Indexing & Crawling
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <CheckCircle2 size={20} color="#a855f7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0F172A' }}>Instant Indexing (/indexing):</strong> 
                  <span style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>Use the Google Indexing API feature to bulk-submit your URLs. Don't wait weeks for Googlebot; force it to crawl your site today.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Phase 3 */}
          <div>
            <h3 style={{ color: '#0F172A', borderBottom: '1px solid #0F172A', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Phase 3: Ongoing User Experience
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <MousePointer size={20} color="#ec4899" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0F172A' }}>Microsoft Clarity (/recordings):</strong> 
                  <span style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>SEO isn't just about keywords; it's about retention. Watch user sessions and identify Rage Clicks.</span>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <BrainCircuit size={20} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0F172A' }}>Gemini AI Smart Alerts (Dashboard):</strong> 
                  <span style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>The dashboard acts as your 24/7 SEO Analyst. If traffic drops, Gemini AI will alert you with actionable fixes.</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
