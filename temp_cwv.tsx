"use client";

import { useState, useEffect } from 'react';
import { 
  Monitor, Smartphone, RefreshCw, X, AlertTriangle, CheckCircle, 
  Info, Zap, Activity, ShieldCheck, Search,
  Cpu, Server, LayoutDashboard, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../search-console/page.module.css';

export default function CoreWebVitalsDashboard() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  
  const [pages, setPages] = useState<any[]>([]);
  const [siteUrl, setSiteUrl] = useState('');
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [isAuditing, setIsAuditing] = useState<string | null>(null);
  const [isAuditingAll, setIsAuditingAll] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // For sub-navigation within the report
  const [reportView, setReportView] = useState<'overview' | 'opportunities' | 'audits' | 'diagnostics'>('overview');
  const [auditCategory, setAuditCategory] = useState<'seo' | 'accessibility' | 'bestPractices'>('seo');

  // Fetch sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/sites');
        if (res.ok) {
          const data = await res.json();
          setSites(data);
          if (data.length > 0) setSelectedSiteId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch sites', error);
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    if (!selectedSiteId) return;
    const fetchSiteDetails = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/sites/${selectedSiteId}/pages`);
        if (res.ok) {
          const data = await res.json();
          setSiteUrl(data.url);
          setPages(data.pages);
          setSelectedData(null); // Reset view when changing sites
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSiteDetails();
  }, [selectedSiteId]);

  const syncGA4 = async () => {
    if (!selectedSiteId) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${selectedSiteId}/ga4/pages`);
      if (res.ok) {
        const data = await res.json();
        toast.success(`Synced ${data.addedCount || 0} new pages from Google Analytics!`);
        // Refetch pages
        const pageRes = await fetch(`http://localhost:4000/api/sites/${selectedSiteId}/pages`);
        if (pageRes.ok) {
          const pageData = await pageRes.json();
          setPages(pageData.pages);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to sync GA4 pages');
      }
    } catch (error) {
      toast.error('Network error during sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const runAllAudits = async () => {
    if (pages.length === 0) return;
    setIsAuditingAll(true);
    let successCount = 0;
    for (const page of pages) {
      setIsAuditing(page.id);
      try {
        const res = await fetch('http://localhost:4000/api/seo/pagespeed/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: page.id })
        });
        if (res.ok) {
          const data = await res.json();
          setPages(prev => prev.map(p => p.id === page.id ? { ...p, psi_data: JSON.stringify(data.data) } : p));
          successCount++;
        }
      } catch (error) {
        console.error('Audit failed for', page.id, error);
      }
    }
    setIsAuditing(null);
    setIsAuditingAll(false);
    if (successCount > 0) toast.success(`Audited ${successCount} of ${pages.length} pages successfully!`);
  };

  const runAudit = async (pageId: string) => {
    setIsAuditing(pageId);
    try {
      const res = await fetch('http://localhost:4000/api/seo/pagespeed/analyze', {
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
    if (score === null || score === undefined) return '#94a3b8'; 
    if (score >= 90) return '#10b981'; 
    if (score >= 50) return '#f59e0b'; 
    return '#ef4444'; 
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
    if (!d) return <div style={{ padding: '2rem', color: 'white' }}>No data found for {activeTab}</div>;

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              {score && <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: c, strokeDashoffset: o, transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s' }} />}
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{score || '-'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>
            <Icon size={16} style={{ color: '#94a3b8' }}/> {label}
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
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{metric.displayValue || formatMs(metric.value)}</div>
        </div>
      );
    };

    return (
      <div className={styles.dashboardWrapper}>
        <div className={styles.header} style={{ marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <button onClick={() => setSelectedData(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <X size={14}/> Close Report
              </button>
            </div>
            <h1 className={styles.title} style={{ fontSize: '1.5rem' }}>Core Web Vitals Audit</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPageUrl}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px' }}>
              <button 
                onClick={() => setActiveTab('desktop')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: activeTab === 'desktop' ? '#2563eb' : 'transparent', color: activeTab === 'desktop' ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                <Monitor size={16}/> Desktop
              </button>
              <button 
                onClick={() => setActiveTab('mobile')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: activeTab === 'mobile' ? '#2563eb' : 'transparent', color: activeTab === 'mobile' ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                <Smartphone size={16}/> Mobile
              </button>
            </div>
            <button 
              onClick={() => { const pageId = pages.find(p => p.url === selectedPageUrl)?.id; if(pageId) runAudit(pageId); }}
              style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
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
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
          {[
            { id: 'overview', label: 'Web Vitals & Overview', icon: LayoutDashboard },
            { id: 'opportunities', label: 'Opportunities (Speed)', icon: Zap },
            { id: 'audits', label: 'Detailed Audits', icon: CheckCircle },
            { id: 'diagnostics', label: 'Diagnostics', icon: Cpu }
          ].map(view => (
            <button 
              key={view.id}
              onClick={() => setReportView(view.id as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: reportView === view.id ? 'rgba(255,255,255,0.1)' : 'transparent', color: reportView === view.id ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600 }}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                  {field.lcp && <MetricCard label="LCP (Largest Contentful Paint)" metric={{ value: field.lcp, rating: field.lcp < 2500 ? 'good' : field.lcp > 4000 ? 'poor' : 'needs-improvement', displayValue: field.lcp < 2500 ? 'Good' : 'Needs Work' }} />}
                  {field.inp && <MetricCard label="INP (Interaction to Next Paint)" metric={{ value: field.inp, rating: field.inp < 200 ? 'good' : field.inp > 500 ? 'poor' : 'needs-improvement', displayValue: field.inp < 200 ? 'Good' : 'Needs Work' }} />}
                  {field.cls && <MetricCard label="CLS (Cumulative Layout Shift)" metric={{ value: field.cls * 1000, displayValue: (field.cls / 100).toFixed(2), rating: (field.cls / 100) < 0.1 ? 'good' : (field.cls / 100) > 0.25 ? 'poor' : 'needs-improvement' }} />}
                  {field.fcp && <MetricCard label="FCP (First Contentful Paint)" metric={{ value: field.fcp, rating: field.fcp < 1800 ? 'good' : field.fcp > 3000 ? 'poor' : 'needs-improvement', displayValue: field.fcp < 1800 ? 'Good' : 'Needs Work' }} />}
                  {field.fid && <MetricCard label="FID (First Input Delay)" metric={{ value: field.fid, rating: field.fid < 100 ? 'good' : field.fid > 300 ? 'poor' : 'needs-improvement', displayValue: field.fid < 100 ? 'Good' : 'Needs Work' }} />}
                  {field.ttfb && <MetricCard label="TTFB (Time to First Byte)" metric={{ value: field.ttfb, rating: field.ttfb < 800 ? 'good' : field.ttfb > 1800 ? 'poor' : 'needs-improvement', displayValue: field.ttfb < 800 ? 'Good' : 'Needs Work' }} />}
                </div>
              </div>
            )}

            <div className={styles.panel}>
              <div className={styles.panelHeader}><Activity size={18} color="#f59e0b"/> Lab Data (Simulated Page Load)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
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
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>These suggestions can help your page load faster. They don't directly affect the Performance score.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {opps.length > 0 ? opps.map((opp: any, idx: number) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: opp.items && opp.items.length > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlertTriangle size={18} color="#f59e0b" />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0' }}>{opp.title}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{opp.description.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')}</p>
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
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '8px', fontSize: '0.75rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.url || item.node?.snippet || 'Resource'}
                              </td>
                              <td style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'right', color: '#94a3b8' }}>{formatBytes(item.totalBytes || item.transferSize || 0)}</td>
                              <td style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{formatBytes(item.wastedBytes || 0)}</td>
                            </tr>
                          ))}
                          {opp.items.length > 5 && (
                            <tr><td colSpan={3} style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'center', color: '#94a3b8' }}>+ {opp.items.length - 5} more items...</td></tr>
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
              <button onClick={() => setAuditCategory('seo')} style={{ padding: '8px 16px', borderRadius: '20px', background: auditCategory === 'seo' ? '#10b981' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Search Engine Optimization</button>
              <button onClick={() => setAuditCategory('accessibility')} style={{ padding: '8px 16px', borderRadius: '20px', background: auditCategory === 'accessibility' ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Accessibility</button>
              <button onClick={() => setAuditCategory('bestPractices')} style={{ padding: '8px 16px', borderRadius: '20px', background: auditCategory === 'bestPractices' ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Best Practices</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {audits[auditCategory] && audits[auditCategory].length > 0 ? audits[auditCategory].map((audit: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `4px solid ${audit.passed ? '#10b981' : audit.score === null ? '#94a3b8' : '#ef4444'}` }}>
                  <div style={{ marginTop: '2px' }}>
                    {audit.passed ? <CheckCircle size={18} color="#10b981"/> : audit.score === null ? <Info size={18} color="#94a3b8"/> : <AlertTriangle size={18} color="#ef4444"/>}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {audit.title}
                      {audit.displayValue && <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 400 }}>{audit.displayValue}</span>}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{audit.description.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')}</p>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No audits available for this category.</div>
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
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>DOM Elements Size</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{diag.domSize ? diag.domSize.toLocaleString() : 'N/A'} elements</span>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}><Cpu size={18} color="#8b5cf6"/> Main Thread Work Breakdown</div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {diag.mainThread && diag.mainThread.length > 0 ? diag.mainThread.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#e2e8f0' }}>{item.groupLabel}</span>
                      <span style={{ color: '#94a3b8' }}>{formatMs(item.duration)}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (item.duration / Math.max(...diag.mainThread.map((t:any)=>t.duration))) * 100)}%`, background: '#8b5cf6' }}></div>
                    </div>
                  </div>
                )) : <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No main thread data available.</div>}
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
                        <td style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#e2e8f0', fontSize: '0.8rem' }} title={req.url}>{req.url}</td>
                        <td><span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.7rem' }}>{req.resourceType}</span></td>
                        <td style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem' }}>{formatBytes(req.transferSize)}</td>
                        <td style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem' }}>{formatMs(req.endTime - req.startTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}><Activity size={18} color="#f59e0b"/> Third-Party Summary</div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {diag.thirdParty && diag.thirdParty.length > 0 ? diag.thirdParty.slice(0, 10).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#e2e8f0' }}>{item.entity?.text || 'Unknown'}</span>
                    <span style={{ color: '#94a3b8' }}>{formatBytes(item.transferSize)} | {formatMs(item.blockingTime)}</span>
                  </div>
                )) : <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No third-party data available.</div>}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}><Activity size={18} color="#ef4444"/> Long Tasks</div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {diag.longTasks && diag.longTasks.length > 0 ? diag.longTasks.slice(0, 10).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#e2e8f0', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</span>
                    <span style={{ color: '#94a3b8' }}>{formatMs(item.duration)}</span>
                  </div>
                )) : <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No long tasks found.</div>}
              </div>
            </div>

            <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.panelHeader}><FileText size={18} color="#3b82f6"/> Resource Summary</div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {diag.resourceSummary && diag.resourceSummary.map((item: any, i: number) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', flex: '1 1 150px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{item.resourceType}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>{item.requestCount}</span>
                      <span style={{ fontSize: '0.85rem', color: '#10b981' }}>{formatBytes(item.transferSize)}</span>
                    </div>
                  </div>
                ))}
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
          <h1 className={styles.title}>Core Web Vitals & Audits</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.25rem' }}>Monitor lab and field performance data for your pages.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {sites.length > 0 && (
            <select className={styles.siteSelector} value={selectedSiteId || ''} onChange={(e) => setSelectedSiteId(e.target.value)}>
              {sites.map(site => <option key={site.id} value={site.id}>{site.url}</option>)}
            </select>
          )}
          <button 
            onClick={syncGA4} 
            disabled={isSyncing} 
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: isSyncing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSyncing ? 0.7 : 1 }}
          >
            <RefreshCw size={14} className={isSyncing ? "spin" : ""} /> 
            {isSyncing ? 'Syncing...' : 'Sync Analytics URLs'}
          </button>
          <button 
            onClick={runAllAudits} 
            disabled={isAuditingAll || pages.length === 0} 
            style={{ padding: '8px 16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: (isAuditingAll || pages.length === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: (isAuditingAll || pages.length === 0) ? 0.7 : 1 }}
          >
            {isAuditingAll ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />} 
            {isAuditingAll ? 'Auditing All...' : 'Run All Audits'}
          </button>
        </div>
      </div>

      <div className={styles.panel} style={{ overflow: 'hidden', padding: 0 }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Page URL</th>
              <th>Last Audited</th>
              <th>Mobile Score</th>
              <th>Desktop Score</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pages.length > 0 ? pages.map((p, i) => {
              const psi = getLighthouseData(p);
              const mobPerf = psi?.mobile?.scores?.performance;
              const deskPerf = psi?.desktop?.scores?.performance;
              return (
                <tr key={i}>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#e2e8f0', fontWeight: 500 }} title={p.url}>{p.url}</td>
                  <td style={{ color: '#94a3b8' }}>{p.last_audited ? new Date(p.last_audited).toLocaleDateString() : 'Never'}</td>
                  <td>
                    {mobPerf ? <span style={{ color: getScoreColor(mobPerf), fontWeight: 700 }}>{mobPerf} / 100</span> : <span style={{ color: '#64748b' }}>-</span>}
                  </td>
                  <td>
                    {deskPerf ? <span style={{ color: getScoreColor(deskPerf), fontWeight: 700 }}>{deskPerf} / 100</span> : <span style={{ color: '#64748b' }}>-</span>}
                  </td>
                  <td>
                    {isAuditing === p.id ? (
                      <span style={{ color: '#3b82f6', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><RefreshCw size={12} className="spin" /> Auditing...</span>
                    ) : psi ? (
                      <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>Audited</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {psi && (
                        <button 
                          onClick={() => { setSelectedData(psi); setSelectedPageUrl(p.url); }} 
                          style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          View Report
                        </button>
                      )}
                      <button 
                        onClick={() => runAudit(p.id)} 
                        disabled={isAuditing !== null || isAuditingAll} 
                        style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: (isAuditing || isAuditingAll) ? 'not-allowed' : 'pointer', opacity: (isAuditing || isAuditingAll) ? 0.7 : 1 }}
                      >
                        {psi ? 'Re-Audit' : 'Run Audit'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                  No pages found for this site.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
