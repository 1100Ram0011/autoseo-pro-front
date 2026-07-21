"use client";

import { useState, useEffect, useMemo } from 'react';
import { Info, FileText, TrendingUp, MousePointerClick, Eye, BarChart2, Search, ExternalLink, RefreshCw, Loader2} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../search-console/page.module.css';

export default function TopPagesDashboard() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [pagesData, setPagesData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sites on load
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

  // Fetch GSC Pages Data
  const fetchPages = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${selectedSiteId}/gsc/pages`);
      if (res.ok) {
        const data = await res.json();
        setPagesData(data.pages || []);
      } else {
        toast.error('Failed to load page data');
      }
    } catch (error) {
      toast.error('An error occurred while fetching pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [selectedSiteId]);

  // Derived calculations
  const filteredPages = useMemo(() => {
    return pagesData.filter(p => p.page.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [pagesData, searchQuery]);

  const totals = useMemo(() => {
    if (pagesData.length === 0) return { totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0, maxImpressions: 1 };
    const totalClicks = pagesData.reduce((acc, p) => acc + (p.clicks || 0), 0);
    const totalImpressions = pagesData.reduce((acc, p) => acc + (p.impressions || 0), 0);
    const avgPosition = pagesData.reduce((acc, p) => acc + (p.position || 0), 0) / pagesData.length;
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    // Find the max impressions for rendering progress bars
    const maxImpressions = Math.max(...pagesData.map(p => p.impressions || 0), 1);

    return { totalClicks, totalImpressions, avgCtr, avgPosition, maxImpressions };
  }, [pagesData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Top Performing Pages</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Analyze which pages drive the most organic traffic and impressions from Google Search.
          </p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Monitors the most popular pages on your website based on traffic and engagement. It helps you identify your winning content. <strong>Example:</strong> If a specific blog post is getting 80% of your traffic, you should add more internal links from that post to your product pages.
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
            onClick={fetchPages}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.panel} style={{ padding: '1.5rem', borderTop: '4px solid #3b82f6', transition: 'all 0.3s ease', cursor: 'default', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}><MousePointerClick size={14} color="#3b82f6"/> Total Clicks</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : formatNumber(totals.totalClicks)}</div>
        </div>
        <div className={styles.panel} style={{ padding: '1.5rem', borderTop: '4px solid #8b5cf6', transition: 'all 0.3s ease', cursor: 'default', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}><Eye size={14} color="#8b5cf6"/> Total Impressions</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : formatNumber(totals.totalImpressions)}</div>
        </div>
        <div className={styles.panel} style={{ padding: '1.5rem', borderTop: '4px solid #10b981', transition: 'all 0.3s ease', cursor: 'default', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}><TrendingUp size={14} color="#10b981"/> Avg CTR</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : `${totals.avgCtr.toFixed(2)}%`}</div>
        </div>
        <div className={styles.panel} style={{ padding: '1.5rem', borderTop: '4px solid #f59e0b', transition: 'all 0.3s ease', cursor: 'default', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}><BarChart2 size={14} color="#f59e0b"/> Avg Position</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : totals.avgPosition.toFixed(1)}</div>
        </div>
      </div>

      {/* Pages Table */}
      <div className={styles.panel} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
        <div className={styles.panelHeader} style={{ justifyContent: 'space-between', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#0F172A" /> Page Performance Breakdown
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input 
              type="text" 
              placeholder="Filter pages..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '0.85rem', width: '250px', outline: 'none', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
            />
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table className={styles.dataTable} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Page URL</th>
                <th>Clicks</th>
                <th style={{ width: '25%' }}>Impressions</th>
                <th>CTR</th>
                <th style={{ textAlign: 'right' }}>Avg Position</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <Loader2 size={32} className="spinner" style={{ margin: '0 auto 16px auto', color: '#3b82f6' }} />
                    Crunching page data from Google Search Console...
                  </td>
                </tr>
              ) : filteredPages.length > 0 ? (
                filteredPages.map((page, i) => {
                  // Calculate width for impression bar
                  const barWidth = Math.max((page.impressions / totals.maxImpressions) * 100, 2);
                  
                  return (
                    <tr key={i} className="pro-table-row">
                      <td style={{ fontWeight: 500 }}>
                        <a href={page.page.startsWith('http') ? page.page : `https://${page.page}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}>
                          {page.page.replace('https://', '').replace('http://', '')}
                          <ExternalLink size={12} style={{ opacity: 0.5 }} />
                        </a>
                      </td>
                      <td style={{ color: '#0F172A', fontWeight: 600 }}>
                        {page.clicks.toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 500 }}>{page.impressions.toLocaleString()}</span>
                          <div style={{ height: '5px', width: '100%', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${barWidth}%`, background: '#8b5cf6', borderRadius: '2px' }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: parseFloat(page.ctr) > 5 ? 'rgba(16, 185, 129, 0.1)' : parseFloat(page.ctr) > 2 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: parseFloat(page.ctr) > 5 ? '#10b981' : parseFloat(page.ctr) > 2 ? '#3b82f6' : '#f59e0b'
                        }}>
                          {typeof page.ctr === 'string' && page.ctr.includes('%') ? page.ctr : `${page.ctr}%`}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: page.position <= 3 ? '#10b981' : page.position <= 10 ? '#f59e0b' : '#ef4444' }}>
                            {typeof page.position === 'number' ? page.position.toFixed(1) : parseFloat(page.position).toFixed(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    No page data found. Your site might not have enough Google Search traffic yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
        
        .pro-table-row {
          transition: background-color 0.2s ease;
        }
        .pro-table-row:hover {
          background-color: #F8FAFC !important;
        }
      `}} />
    </div>
  );
}
