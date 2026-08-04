"use client";

import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect } from 'react';
import { 
  Monitor, Smartphone, RefreshCw, X, AlertTriangle, CheckCircle, 
  Info, Zap, Activity, ShieldCheck, Search,
  Cpu, Server, LayoutDashboard, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSite } from '@/lib/SiteContext';
import styles from '../search-console/page.module.css';

const CWVPanel = ({ data, strategy }: { data: any, strategy: string }) => {
  const field = data?.coreWebVitals?.field || null;
  const originField = data?.coreWebVitals?.originField || null;

  if (!field && !originField) {
    return (
      <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid #FFFFFF', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: '#0F172A' }}>No Real-World Data Available</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>Google CrUX does not have enough real-user traffic data for this {strategy} URL yet.</p>
      </div>
    );
  }

  const formatMs = (ms: number) => ms >= 1000 ? (ms / 1000).toFixed(1) + ' s' : Math.round(ms) + ' ms';

  const renderMetric = (m: any, title: string) => {
    if (!m) return null;
    const color = m.category === 'FAST' ? '#10b981' : m.category === 'AVERAGE' ? '#f59e0b' : '#ef4444';
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #FFFFFF', padding: '1.25rem', borderRadius: '12px' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{title}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: color }}>{formatMs(m.p75)}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{m.category}</div>
      </div>
    );
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '8px' }}>
          {strategy === 'mobile' ? <Smartphone size={24} color="#3b82f6" /> : <Monitor size={24} color="#3b82f6" />}
        </div>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>{strategy} Field Data</div>
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Real User Experience metrics from Google CrUX</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
        {renderMetric(field?.LCP || originField?.LCP, 'LCP (Largest Contentful Paint)')}
        {renderMetric(field?.FID || originField?.FID, 'FID (First Input Delay)')}
        {renderMetric(field?.CLS || originField?.CLS, 'CLS (Cumulative Layout Shift)')}
      </div>
    </div>
  );
};


export default function Dashboard() {
  const { selectedSiteId } = useSite();
  
  const [pages, setPages] = useState<any[]>([]);
  const [siteUrl, setSiteUrl] = useState('');
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState<string | null>(null);
  const [isAuditingAll, setIsAuditingAll] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const fetchSiteDetails = async () => {
      if (!selectedSiteId) return;
      try {
        const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/pages`);
        if (res.ok) {
          const data = await res.json();
          setPages(data.pages || []);
          setSiteUrl(data.url);
        }
      } catch (error) {
        toast.error('Failed to fetch pages');
      }
    };
    fetchSiteDetails();
  }, [selectedSiteId]);

  const syncGA4 = async () => {
    if (!selectedSiteId) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/ga4/pages`);
      if (res.ok) {
        const data = await res.json();
        toast.success(`Synced ${data.addedCount || 0} new pages from Google Analytics!`);
        const pageRes = await fetch(`${API_BASE}/sites/${selectedSiteId}/pages`);
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

  const crawlSiteUrls = async () => {
    if (!siteUrl) return;
    setIsSyncing(true);
    toast.success('Starting site crawl... This may take a moment.');
    try {
      const res = await fetch(`${API_BASE}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: siteUrl, userId: '1' })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Crawled successfully! Found ${data.pagesFound || 0} pages.`);
        const pageRes = await fetch(`${API_BASE}/sites/${selectedSiteId}/pages`);
        if (pageRes.ok) {
          const pageData = await pageRes.json();
          setPages(pageData.pages);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to crawl site');
      }
    } catch (error) {
      toast.error('Network error during crawl');
    } finally {
      setIsSyncing(false);
    }
  };

  const runAllAudits = async () => {
    if (pages.length === 0) return;
    setIsAuditingAll(true);
    let successCount = 0;
    toast.success(`Starting audits for ${pages.length} URLs...`);
    
    for (const page of pages) {
      try {
        const res = await fetch(`${API_BASE}/seo/pagespeed/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: page.id })
        });
        if (res.ok) {
          successCount++;
          const data = await res.json();
          setPages(prev => prev.map(p => p.id === page.id ? { ...p, psi_data: JSON.stringify(data.data) } : p));
        }
      } catch (err) {
        console.error('Audit failed for', page.url);
      }
    }
    
    setIsAuditingAll(false);
    toast.success(`Completed audits for ${successCount} URLs!`);
  };

  const runAudit = async (pageId: string) => {
    setIsAuditing(pageId);
    try {
      const res = await fetch(`${API_BASE}/seo/pagespeed/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId })
      });
      if (res.ok) {
        toast.success('Audit complete');
        const data = await res.json();
        setPages(pages.map(p => p.id === pageId ? { ...p, psi_data: JSON.stringify(data.data) } : p));
        if (selectedPageUrl === pages.find(p => p.id === pageId)?.url) {
          setSelectedData(data.data);
        }
      } else {
        toast.error('Audit failed');
      }
    } catch (error) {
      toast.error('Error running audit');
    } finally {
      setIsAuditing(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (!score) return '#64748B';
    if (score >= 90) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMs = (ms: number) => {
    if (!ms) return '0 ms';
    if (ms >= 1000) return (ms / 1000).toFixed(1) + ' s';
    return Math.round(ms) + ' ms';
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.header} style={{ marginBottom: 0 }}>
          <div>
            <h1 className={styles.title}>Core Web Vitals</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>Real User Experience (CrUX Field Data)</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>

            <button onClick={syncGA4} disabled={isSyncing} className={styles.btnSecondary} style={{ background: '#E2E8F0', color: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <RefreshCw size={14} className={isSyncing ? "spin" : ""} /> {isSyncing ? 'Syncing...' : 'Sync Analytics'}
            </button>
            <button onClick={crawlSiteUrls} disabled={isSyncing} className={styles.btnSecondary} style={{ background: '#E2E8F0', color: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <Search size={14} /> Crawl URLs
            </button>
            <button onClick={runAllAudits} disabled={isAuditingAll || pages.length === 0} className={styles.btnPrimary} style={{ background: '#10b981', color: '#0F172A', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', whiteSpace: 'nowrap' }}>
              {isAuditingAll ? <RefreshCw size={14} className="spin" /> : <Activity size={14} />} 
              {isAuditingAll ? 'Fetching...' : 'Fetch Field Data'}
            </button>
          </div>
        </div>

        {/* Auto-injected Info Block */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
            <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
               Analyzes Core Web Vitals (CWV) - Google's official speed and user experience metrics. Fast sites rank higher in search results. <strong>Example:</strong> If your LCP (Largest Contentful Paint) is high, it means your main image or text is loading too slowly and you should compress your images.
            </p>
          </div>
        </div>
      </div>

      {!selectedData ? (
        <div className={styles.panel} style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>Select Page to View Field Data</h2>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>{pages.length} pages available</div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className={styles.dataTable} style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>URL</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id} style={{ cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => {
                  if (page.psi_data) {
                    setSelectedData(JSON.parse(page.psi_data));
                    setSelectedPageUrl(page.url);
                  }
                }}>
                  <td>
                    {page.psi_data ? <CheckCircle size={16} color="#10b981"/> : <Activity size={16} color="#475569"/>}
                  </td>
                  <td style={{ color: '#0F172A', fontWeight: 500 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{new URL(page.url).pathname || '/'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{page.url}</span>
                    </div>
                  </td>
                  <td>
                    {page.psi_data ? (
                      <span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Audited</span>
                    ) : (
                      <span style={{ padding: '4px 8px', background: '#FFFFFF', color: '#64748B', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Not Audited</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={(e) => { e.stopPropagation(); runAudit(page.id); }}
                      disabled={isAuditing === page.id}
                      style={{ padding: '6px 12px', background: '#E2E8F0', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.8rem', cursor: isAuditing === page.id ? 'not-allowed' : 'pointer' }}
                    >
                      {isAuditing === page.id ? 'Fetching...' : (page.psi_data ? 'Refresh Data' : 'Fetch Vitals')}
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No pages found. Use the sync button above to fetch URLs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Report Header */}
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid #FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '50%', color: '#10b981' }}>
                <CheckCircle size={16} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A' }}>Core Web Vitals Fetched</div>
                <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{selectedPageUrl?.replace(/^https?:\/\//, '')}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => toast.success('Exporting PDF...')} style={{ padding: '8px 16px', background: '#0F172A', color: '#0F172A', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <FileText size={14}/> Export PDF
              </button>
              <button onClick={() => setSelectedData(null)} style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <X size={14}/> Clear
              </button>
            </div>
          </div>

          {/* Side-by-Side Mobile and Desktop Field Data */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ flex: '1 1 300px' }}><CWVPanel data={selectedData.mobile} strategy="mobile" /></div>
            <div style={{ flex: '1 1 300px' }}><CWVPanel data={selectedData.desktop} strategy="desktop" /></div>
          </div>
        </div>
      )}
    </div>
  );
}
