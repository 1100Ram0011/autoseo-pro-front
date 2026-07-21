"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { AlertTriangle, CheckCircle, Info, XCircle, Search, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../search-console/page.module.css';

export default function IndexCoverageDashboard() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  
  const [coverageData, setCoverageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Fetch GSC Coverage Data
  const fetchCoverage = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    setCoverageData(null);
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${selectedSiteId}/gsc/coverage`);
      if (res.ok) {
        const data = await res.json();
        // If the backend returned an error object instead of the coverage data
        if (data.error) {
           toast.error(data.error);
        } else {
           setCoverageData(data);
        }
      } else {
        toast.error('Failed to load coverage data');
      }
    } catch (error) {
      toast.error('An error occurred while fetching coverage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverage();
  }, [selectedSiteId]);

  const pieData = useMemo(() => {
    if (!coverageData) return [];
    return [
      { name: 'Indexed', value: coverageData.indexed || 0, color: '#10B981' },
      { name: 'Crawled, Not Indexed', value: coverageData.crawledNotIndexed || 0, color: '#F59E0B' },
      { name: 'Discovered, Not Indexed', value: coverageData.discoveredNotIndexed || 0, color: '#64748B' },
      { name: 'Excluded / Errors', value: coverageData.excluded || 0, color: '#EF4444' }
    ];
  }, [coverageData]);

  // Mock list of affected URLs for demonstration since standard API doesn't list exact URLs without iterating
  const errorPages = [
    { url: '/old-services/plumbing', status: 'Excluded by ‘noindex’ tag', lastCrawled: '2023-10-14' },
    { url: '/temp-promo-2022', status: 'Not found (404)', lastCrawled: '2023-10-12' },
    { url: '/admin-login', status: 'Blocked by robots.txt', lastCrawled: '2023-10-10' },
    { url: '/blog/draft-1', status: 'Crawled - currently not indexed', lastCrawled: '2023-10-09' },
    { url: '/category/uncategorized', status: 'Duplicate without user-selected canonical', lastCrawled: '2023-10-05' },
  ];

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return 0;
    return num.toLocaleString();
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Index Coverage</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            See which pages Google has indexed and which have technical issues.
          </p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Detailed report on which pages Google refuses to index and why. <strong>Example:</strong> Identify pages with 'Crawled - currently not indexed' status and improve their content quality.
          </p>
        </div>
      </div>
  
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {sites.length > 0 && (
            <select className={styles.siteSelector} value={selectedSiteId || ''} onChange={(e) => setSelectedSiteId(e.target.value)}>
              {sites.map(site => <option key={site.id} value={site.id}>{site.url}</option>)}
            </select>
          )}
          <button 
            onClick={fetchCoverage}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Pie Chart Widget */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <Layers size={18} color="#0F172A" /> Coverage Breakdown
          </div>
          <div style={{ height: '300px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
               <div style={{ color: '#64748b' }}>Loading chart...</div>
            ) : coverageData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #0F172A', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div style={{ color: '#64748b' }}>No coverage data available.</div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           <div className={styles.panel} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', marginBottom: '8px' }}>
                <CheckCircle size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Valid & Indexed</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : formatNumber(coverageData?.indexed)}</div>
           </div>
           
           <div className={styles.panel} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', marginBottom: '8px' }}>
                <XCircle size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Errors / Excluded</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : formatNumber(coverageData?.excluded)}</div>
           </div>

           <div className={styles.panel} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', marginBottom: '8px' }}>
                <AlertTriangle size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Crawled, Not Indexed</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : formatNumber(coverageData?.crawledNotIndexed)}</div>
           </div>

           <div className={styles.panel} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '8px' }}>
                <Info size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Discovered, Not Indexed</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : formatNumber(coverageData?.discoveredNotIndexed)}</div>
           </div>
        </div>
      </div>

      {/* Error Pages Table */}
      <div className={styles.panel} style={{ padding: 0, overflow: 'hidden' }}>
        <div className={styles.panelHeader} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)' }}>
          <AlertTriangle size={18} color="#ef4444" /> Pages Needing Attention
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Page URL</th>
              <th>Issue Type</th>
              <th style={{ textAlign: 'right' }}>Last Crawled</th>
            </tr>
          </thead>
          <tbody>
            {errorPages.map((page, i) => (
              <tr key={i}>
                <td style={{ color: '#0F172A', fontWeight: 500 }}>{page.url}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: page.status.includes('Not found') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: page.status.includes('Not found') ? '#ef4444' : '#f59e0b'
                  }}>
                    {page.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right', color: '#64748B' }}>{page.lastCrawled}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
