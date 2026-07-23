"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  Monitor, Smartphone, RefreshCw, X, AlertTriangle, CheckCircle, 
  Info, Zap, Activity, ShieldCheck, Search, Image as ImageIcon,
  Cpu, Server, FileCode, LayoutDashboard
} from 'lucide-react';
import styles from './page.module.css';

export default function SiteDetailsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  
  const [pages, setPages] = useState<any[]>([]);
  const [siteUrl, setSiteUrl] = useState('');
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [isAuditing, setIsAuditing] = useState<string | null>(null);

  // For sub-navigation within the report
  const [reportView, setReportView] = useState<'overview' | 'opportunities' | 'audits' | 'diagnostics'>('overview');
  const [auditCategory, setAuditCategory] = useState<'seo' | 'accessibility' | 'bestPractices'>('seo');

  useEffect(() => {
    if (!siteId) return;
    const fetchSiteDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/sites/${siteId}/pages`);
        if (res.ok) {
          const data = await res.json();
          setSiteUrl(data.url);
          setPages(data.pages);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSiteDetails();
  }, [siteId]);

  const runAudit = async (pageId: string) => {
    setIsAuditing(pageId);
    try {
      const res = await fetch(`${API_BASE}/seo/pagespeed/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId })
      });
      if (res.ok) {
        const data = await res.json();
        const newPages = pages.map(p => p.id === pageId ? { ...p, psi_data: JSON.stringify(data.data) } : p);
        setPages(newPages);
        setSelectedData(data.data);
        setSelectedPageUrl(pages.find(p => p.id === pageId)?.url || '');
      }
    } catch (error) {
      console.error('Audit failed', error);
    } finally {
      setIsAuditing(null);
    }
  };

  const getLighthouseData = (page: any) => {
    if (!page.psi_data) return null;
    try { return typeof page.psi_data === 'string' ? JSON.parse(page.psi_data) : page.psi_data; } catch { return null; }
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '#64748B'; // gray
    if (score >= 90) return '#10b981'; // green
    if (score >= 50) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMs = (ms: number) => {
    if (ms >= 1000) return (ms / 1000).toFixed(1) + ' s';
    return Math.round(ms) + ' ms';
  };

  // --- REPORT VIEW COMPONENT ---
  if (selectedData) {
    const d = selectedData[activeTab];
    if (!d) return <div style={{ padding: '2rem', color: '#0F172A' }}>No data found for {activeTab}</div>;

    const scores = d.scores || {};
    const lab = d.coreWebVitals?.lab || {};
    const field = d.coreWebVitals?.field || null;
    const opps = d.opportunities || [];
    const diag = d.diagnostics || {};
    const audits = d.audits || {};

    const ScoreDial = ({ label, score, icon: Icon }: { label: string, score: number, icon: any }) => {
      const r = 40; const c = 2 * Math.PI * r; const o = score ? c - (score / 100) * c : c;
      const color = getScoreColor(score);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #FFFFFF' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
              {score && <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: c, strokeDashoffset: o, transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s' }} />}
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{score || '-'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}>
            <Icon size={16} style={{ color: '#64748B' }}/> {label}
          </div>
        </div>
      );
    };

    const MetricCard = ({ label, metric, isGood }: { label: string, metric: any, isGood?: boolean }) => {
      if (!metric) return null;
      const ratingColor = metric.rating === 'good' ? '#10b981' : metric.rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
      const color = isGood !== undefined ? (isGood ? '#10b981' : '#ef4444') : ratingColor;
      
      return (
        <div style={{ background: 'rgba(0,0,0,0.2)', borderLeft: `4px solid ${color}`, padding: '1rem', borderRadius: '0 8px 8px 0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{metric.displayValue || formatMs(metric.value)}</div>
        </div>
      );
    };

    return (
      <div className={styles.dashboardWrapper}>
        <div className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <button onClick={() => setSelectedData(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <X size={14}/> Close Report
              </button>
            </div>
            <h1 className={styles.title} style={{ fontSize: '1.5rem' }}>PageSpeed Insights Audit</h1>
            <p style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPageUrl}</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             This page provides tools and insights to manage a specific aspect of your website's SEO and performance. <strong>Example:</strong> Use the data shown here to optimize your content, fix technical issues, and rank higher on Google.
          </p>
        </div>
      </div>
  
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px' }}>
              <button 
                onClick={() => setActiveTab('desktop')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: activeTab === 'desktop' ? '#2563eb' : 'transparent', color: activeTab === 'desktop' ? '#0F172A' : '#64748B', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                <Monitor size={16}/> Desktop
              </button>
              <button 
                onClick={() => setActiveTab('mobile')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: activeTab === 'mobile' ? '#2563eb' : 'transparent', color: activeTab === 'mobile' ? '#0F172A' : '#64748B', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                <Smartphone size={16}/> Mobile
              </button>
            </div>
            <button className={styles.btnPrimary} onClick={() => runAudit(pages.find(p => p.url === selectedPageUrl)?.id)}>
              <RefreshCw size={16}/> Re-run
            </button>
          </div>
        </div>

        {/* 1. FOUR MAIN SCORES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <ScoreDial label="Performance" score={scores.performance} icon={Activity} />
          <ScoreDial label="Accessibility" score={scores.accessibility} icon={Info} />
          <ScoreDial label="Best Practices" score={scores.bestPractices} icon={ShieldCheck} />
          <ScoreDial label="SEO" score={scores.seo} icon={Search} />
        </div>

        {/* SUB NAVIGATION */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
          {[
            { id: 'overview', label: 'Web Vitals & Overview', icon: LayoutDashboard },
            { id: 'opportunities', label: 'Opportunities (Speed)', icon: Zap },
            { id: 'audits', label: 'Detailed Audits', icon: CheckCircle },
            { id: 'diagnostics', label: 'Diagnostics', icon: Cpu }
          ].map(view => (
            <button 
              key={view.id}
              onClick={() => setReportView(view.id as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: reportView === view.id ? '#E2E8F0' : 'transparent', color: reportView === view.id ? '#0F172A' : '#64748B', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              <view.icon size={16}/> {view.label}
            </button>
          ))}
        </div>

        {/* --- VIEW: OVERVIEW / CORE WEB VITALS --- */}
        {reportView === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {field && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}><CheckCircle size={18} color="#10b981"/> Field Data (Real Users - CrUX 28 Days)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {field.lcp && <MetricCard label="LCP (Largest Contentful Paint)" metric={{ value: field.lcp, rating: field.lcp < 2500 ? 'good' : field.lcp > 4000 ? 'poor' : 'needs-improvement' }} />}
                  {field.inp && <MetricCard label="INP (Interaction to Next Paint)" metric={{ value: field.inp, rating: field.inp < 200 ? 'good' : field.inp > 500 ? 'poor' : 'needs-improvement' }} />}
                  {field.cls && <MetricCard label="CLS (Cumulative Layout Shift)" metric={{ value: field.cls * 1000, displayValue: (field.cls / 100).toFixed(2), rating: (field.cls / 100) < 0.1 ? 'good' : (field.cls / 100) > 0.25 ? 'poor' : 'needs-improvement' }} />}
                  {field.fcp && <MetricCard label="FCP (First Contentful Paint)" metric={{ value: field.fcp, rating: field.fcp < 1800 ? 'good' : field.fcp > 3000 ? 'poor' : 'needs-improvement' }} />}
                  {field.fid && <MetricCard label="FID (First Input Delay)" metric={{ value: field.fid, rating: field.fid < 100 ? 'good' : field.fid > 300 ? 'poor' : 'needs-improvement' }} />}
                  {field.ttfb && <MetricCard label="TTFB (Time to First Byte)" metric={{ value: field.ttfb, rating: field.ttfb < 800 ? 'good' : field.ttfb > 1800 ? 'poor' : 'needs-improvement' }} />}
                </div>
              </div>
            )}

            <div className={styles.panel}>
              <div className={styles.panelHeader}><Activity size={18} color="#f59e0b"/> Lab Data (Simulated Page Load)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <MetricCard label="LCP (Largest Contentful Paint)" metric={lab.lcp} />
                <MetricCard label="TBT (Total Blocking Time)" metric={lab.tbt} />
                <MetricCard label="CLS (Cumulative Layout Shift)" metric={lab.cls} />
                <MetricCard label="FCP (First Contentful Paint)" metric={lab.fcp} />
                <MetricCard label="Speed Index" metric={lab.speedIndex} />
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: OPPORTUNITIES --- */}
        {reportView === 'opportunities' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}><Zap size={18} color="#f59e0b"/> Performance Opportunities</div>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>These suggestions can help your page load faster. They don't directly affect the Performance score.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {opps.length > 0 ? opps.map((opp: any, idx: number) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #FFFFFF', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: opp.items && opp.items.length > 0 ? '1px solid #FFFFFF' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlertTriangle size={18} color="#f59e0b" />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0F172A' }}>{opp.title}</h4>
                        {/* Remove markdown links from description if any */}
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>{opp.description.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '1rem' }}>
                      {opp.wastedMs > 0 && <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>Save {formatMs(opp.wastedMs)}</span>}
                      {opp.wastedBytes > 0 && <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>Save {formatBytes(opp.wastedBytes)}</span>}
                    </div>
                  </div>
                  
                  {opp.items && opp.items.length > 0 && (
                    <div style={{ padding: '0 1rem 1rem 1rem', background: 'rgba(0,0,0,0.1)' }}>
                      <table className={styles.dataTable} style={{ marginTop: '0.5rem', background: 'transparent' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '8px', fontSize: '0.75rem', background: 'transparent' }}>Resource</th>
                            <th style={{ padding: '8px', fontSize: '0.75rem', background: 'transparent', textAlign: 'right' }}>Transfer Size</th>
                            <th style={{ padding: '8px', fontSize: '0.75rem', background: 'transparent', textAlign: 'right' }}>Potential Savings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {opp.items.slice(0, 5).map((item: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #FFFFFF' }}>
                              <td style={{ padding: '8px', fontSize: '0.75rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.url || item.node?.snippet || 'Resource'}
                              </td>
                              <td style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'right', color: '#64748B' }}>{formatBytes(item.totalBytes || item.transferSize || 0)}</td>
                              <td style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{formatBytes(item.wastedBytes || 0)}</td>
                            </tr>
                          ))}
                          {opp.items.length > 5 && (
                            <tr><td colSpan={3} style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'center', color: '#64748B' }}>+ {opp.items.length - 5} more items...</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}>
                  <CheckCircle size={24} style={{ display: 'block', margin: '0 auto 8px auto' }}/>
                  No significant performance opportunities found! Great job.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: AUDITS --- */}
        {reportView === 'audits' && (
          <div className={styles.panel}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button onClick={() => setAuditCategory('seo')} style={{ padding: '8px 16px', borderRadius: '20px', background: auditCategory === 'seo' ? '#10b981' : '#E2E8F0', color: '#0F172A', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Search Engine Optimization</button>
              <button onClick={() => setAuditCategory('accessibility')} style={{ padding: '8px 16px', borderRadius: '20px', background: auditCategory === 'accessibility' ? '#3b82f6' : '#E2E8F0', color: '#0F172A', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Accessibility</button>
              <button onClick={() => setAuditCategory('bestPractices')} style={{ padding: '8px 16px', borderRadius: '20px', background: auditCategory === 'bestPractices' ? '#8b5cf6' : '#E2E8F0', color: '#0F172A', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Best Practices</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {audits[auditCategory] && audits[auditCategory].length > 0 ? audits[auditCategory].map((audit: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `4px solid ${audit.passed ? '#10b981' : audit.score === null ? '#64748B' : '#ef4444'}` }}>
                  <div style={{ marginTop: '2px' }}>
                    {audit.passed ? <CheckCircle size={18} color="#10b981"/> : audit.score === null ? <Info size={18} color="#64748B"/> : <AlertTriangle size={18} color="#ef4444"/>}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {audit.title}
                      {audit.displayValue && <span style={{ padding: '2px 6px', background: '#E2E8F0', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 400 }}>{audit.displayValue}</span>}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>{audit.description.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')}</p>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No audits available for this category.</div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: DIAGNOSTICS --- */}
        {reportView === 'diagnostics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}><Server size={18} color="#3b82f6"/> Document Diagnostics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <span style={{ color: '#64748B', fontSize: '0.9rem' }}>DOM Elements Size</span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{diag.domSize ? diag.domSize.toLocaleString() : 'N/A'} elements</span>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}><Cpu size={18} color="#8b5cf6"/> Main Thread Work Breakdown</div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {diag.mainThread && diag.mainThread.length > 0 ? diag.mainThread.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#0F172A' }}>{item.groupLabel}</span>
                      <span style={{ color: '#64748B' }}>{formatMs(item.duration)}</span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (item.duration / Math.max(...diag.mainThread.map((t:any)=>t.duration))) * 100)}%`, background: '#8b5cf6' }}></div>
                    </div>
                  </div>
                )) : <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No main thread data available.</div>}
              </div>
            </div>

            <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.panelHeader}><Activity size={18} color="#10b981"/> Network Requests Summary</div>
              <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th>Resource Type</th>
                      <th style={{ textAlign: 'right' }}>Transfer Size</th>
                      <th style={{ textAlign: 'right' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diag.networkRequests && diag.networkRequests.slice(0, 15).map((req: any, i: number) => (
                      <tr key={i}>
                        <td style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#0F172A', fontSize: '0.8rem' }} title={req.url}>{req.url}</td>
                        <td><span style={{ padding: '2px 6px', background: '#E2E8F0', borderRadius: '4px', fontSize: '0.7rem' }}>{req.resourceType}</span></td>
                        <td style={{ textAlign: 'right', color: '#64748B', fontSize: '0.8rem' }}>{formatBytes(req.transferSize)}</td>
                        <td style={{ textAlign: 'right', color: '#64748B', fontSize: '0.8rem' }}>{formatMs(req.endTime - req.startTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN SITE DETAILS LIST ---
  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Site Pages & PSI Audits</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>{siteUrl}</p>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Page URL</th>
                <th>Last Audited</th>
                <th>Mobile Perf</th>
                <th>Desktop Perf</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p, i) => {
                const psi = getLighthouseData(p);
                const mobPerf = psi?.mobile?.scores?.performance;
                const deskPerf = psi?.desktop?.scores?.performance;
                return (
                  <tr key={i}>
                    <td className={styles.truncateUrl} title={p.url} style={{ maxWidth: '300px' }}>{p.url}</td>
                    <td style={{ color: '#64748B' }}>{p.last_audited ? new Date(p.last_audited).toLocaleDateString() : 'Never'}</td>
                    <td>
                      {mobPerf ? <span style={{ color: getScoreColor(mobPerf), fontWeight: 700 }}>{mobPerf} / 100</span> : '-'}
                    </td>
                    <td>
                      {deskPerf ? <span style={{ color: getScoreColor(deskPerf), fontWeight: 700 }}>{deskPerf} / 100</span> : '-'}
                    </td>
                    <td>
                      {isAuditing === p.id ? (
                        <span style={{ color: '#3b82f6', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={12} className="spin" /> Auditing...</span>
                      ) : psi ? (
                        <span style={{ color: '#10b981', fontSize: '0.8rem' }}>Audited</span>
                      ) : (
                        <span style={{ color: '#64748B', fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {psi && (
                          <button onClick={() => { setSelectedData(psi); setSelectedPageUrl(p.url); }} className={styles.btnSecondary} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                            View Report
                          </button>
                        )}
                        <button onClick={() => runAudit(p.id)} disabled={isAuditing !== null} className={styles.btnPrimary} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                          Run PSI
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
