"use client";

import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, Play, RefreshCw, UploadCloud, 
  Globe, Info, Zap, Search, Activity, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSite } from '@/lib/SiteContext';
import styles from '../search-console/page.module.css';

export default function IndexingDashboard() {
  const { selectedSiteId } = useSite();
  const [pages, setPages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // Single URL Submit/Metadata
  const [singleUrl, setSingleUrl] = useState('');
  const [actionType, setActionType] = useState<'URL_UPDATED' | 'URL_DELETED'>('URL_UPDATED');
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [metadataResult, setMetadataResult] = useState<any>(null);

  const fetchPages = async () => {
    if (!selectedSiteId) return;
    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/pages`);
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch pages', error);
    }
  };

  useEffect(() => { fetchPages(); }, [selectedSiteId]);

  const handleBatchSubmit = async () => {
    if (pages.length === 0) return toast.error('No pages to submit');
    setIsSubmitting(true);
    
    // We submit up to 100 non-indexed pages
    const urlsToSubmit = pages.filter(p => p.indexingStatus !== 'INDEXED').slice(0, 100).map(p => p.url);
    if (urlsToSubmit.length === 0) {
       setIsSubmitting(false);
       return toast.success('All pages are already indexed or submitted!');
    }

    toast.promise(
      fetch(`${API_BASE}/seo/indexing/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToSubmit, type: 'URL_UPDATED', siteId: selectedSiteId })
      }),
      {
        loading: `Batch submitting ${urlsToSubmit.length} URLs...`,
        success: (res) => {
          fetchPages();
          return 'Batch submission complete!';
        },
        error: 'Failed to batch submit URLs'
      }
    ).finally(() => setIsSubmitting(false));
  };

  // Auto-submit unindexed pages on load
  useEffect(() => {
    if (pages.length > 0 && !hasAutoSubmitted) {
      const notIndexed = pages.filter(p => p.indexingStatus !== 'INDEXED');
      if (notIndexed.length > 0) {
        setHasAutoSubmitted(true);
        handleBatchSubmit();
      } else {
        setHasAutoSubmitted(true); // even if 0, mark as checked
      }
    }
  }, [pages, hasAutoSubmitted]);

  const handleVerify = async (pageId: string, url: string) => {
    toast.promise(
      fetch(`${API_BASE}/seo/indexing/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, siteId: selectedSiteId, userId: "1" })
      }),
      {
        loading: 'Verifying Index Status...',
        success: (res) => {
          fetchPages();
          return 'Verification complete!';
        },
        error: 'Verification failed'
      }
    );
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUrl.trim()) return;
    setIsSingleLoading(true);

    try {
      const res = await fetch(`${API_BASE}/seo/indexing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: singleUrl, type: actionType, siteId: selectedSiteId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`URL successfully pushed as ${actionType}`);
        setMetadataResult(data.data?.urlNotificationMetadata || null);
        fetchPages();
      } else throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit URL');
    } finally {
      setIsSingleLoading(false);
    }
  };

  const handleGetMetadata = async () => {
    if (!singleUrl.trim()) return toast.error('Enter URL first');
    setIsSingleLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seo/indexing/metadata?url=${encodeURIComponent(singleUrl)}`);
      const data = await res.json();
      setMetadataResult(data);
      if (data.urlNotificationMetadata) {
        toast.success('Metadata fetched!');
      } else {
        toast.error('No metadata found for this URL');
      }
    } catch (err) {
      toast.error('Failed to fetch metadata');
    } finally {
      setIsSingleLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INDEXED': return '#10b981'; // green
      case 'SUBMITTED': return '#3b82f6'; // blue
      case 'FAILED': return '#ef4444'; // red
      case 'UNKNOWN':
      default: return '#64748B'; // gray
    }
  };

  const notIndexedCount = pages.filter(p => p.indexingStatus !== 'INDEXED').length;

  return (
    <div className={styles.dashboardWrapper}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.header} style={{ marginBottom: 0 }}>
          <div>
            <h1 className={styles.title}>Google Indexing API</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>Push URLs to Google for fast discovery and get actual metadata.</p>
          </div>

        </div>

        {/* Auto-injected Info Block */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
            <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
               Uses the Google Indexing API to push new or updated pages directly to Google so they can be discovered instantly without waiting for natural crawling. <strong>Example:</strong> When you publish a new article, use the Batch Submit button here to force Google to index it within hours instead of weeks.
            </p>
          </div>
        </div>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left Col: Actions & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Submit & Metadata Check */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}><Zap size={18} color="#f59e0b"/> Single URL Actions</div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>Check raw Google Indexing Metadata or push a URL update/delete.</p>
            
            <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  type="url" placeholder="https://example.com/page" value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '0.9rem', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  value={actionType} onChange={(e) => setActionType(e.target.value as any)}
                  style={{ padding: '8px', borderRadius: '6px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}
                >
                  <option value="URL_UPDATED">URL_UPDATED (New/Updated)</option>
                  <option value="URL_DELETED">URL_DELETED (Removed)</option>
                </select>
                <button type="submit" disabled={isSingleLoading || !singleUrl} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#3b82f6', color: '#FFFFFF', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                  <UploadCloud size={14} style={{ display: 'inline', marginRight: '4px' }}/> Push URL
                </button>
                <button type="button" onClick={handleGetMetadata} disabled={isSingleLoading || !singleUrl} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                  <Search size={14} style={{ display: 'inline', marginRight: '4px' }}/> Get Metadata
                </button>
              </div>
            </form>

            {metadataResult && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16}/> Metadata Response
                </div>
                {metadataResult.urlNotificationMetadata?.latestUpdate ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ color: '#64748B' }}>URL: <span style={{ color: '#0F172A', wordBreak: 'break-all' }}>{metadataResult.urlNotificationMetadata.url}</span></div>
                    <div style={{ color: '#64748B' }}>Type: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{metadataResult.urlNotificationMetadata.latestUpdate.type}</span></div>
                    <div style={{ color: '#64748B' }}>Notify Time: <span style={{ color: '#f59e0b' }}>{new Date(metadataResult.urlNotificationMetadata.latestUpdate.notifyTime).toLocaleString()}</span></div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>No notification metadata returned. This means Google hasn't recorded a push for this URL yet.</div>
                )}
              </div>
            )}
          </div>

          {/* Quota Info Box */}
          <div className={styles.panel} style={{ background: '#F0F9FF', borderColor: '#BAE6FD' }}>
            <div className={styles.panelHeader} style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#0284C7' }}><Info size={16} color="#0284C7"/> Indexing API Truths</div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li><strong style={{ color: '#0F172A' }}>Limits:</strong> Default quota is 200 URLs per day per project.</li>
              <li><strong style={{ color: '#0F172A' }}>Batching:</strong> Up to 100 URLs per request.</li>
              <li><strong style={{ color: '#0F172A' }}>Confirmations:</strong> This API only confirms that Google received the notification. It <strong>does not</strong> tell you if the page is actually indexed. Use GSC verify for that.</li>
            </ul>
          </div>
        </div>

        {/* Right Col: DB Pages Table */}
        <div className={styles.panel} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.panelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#10b981"/> 
              Page Tracking
            </div>
            <button 
              onClick={handleBatchSubmit} disabled={isSubmitting || notIndexedCount === 0}
              style={{ background: notIndexedCount > 0 ? '#10b981' : '#E2E8F0', color: '#0F172A', border: 'none', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: notIndexedCount > 0 ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <UploadCloud size={14} /> {isSubmitting ? 'Submitting...' : `Batch Submit (${Math.min(notIndexedCount, 100)})`}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>
            Store notify time and use GSC to verify the actual indexing status below.
          </p>

          <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, maxHeight: '600px', paddingRight: '0.5rem' }}>
            <table className={styles.dataTable} style={{ minWidth: '500px' }}>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Last Push</th>
                  <th style={{ textAlign: 'right' }}>Verify</th>
                </tr>
              </thead>
              <tbody>
                {pages.length > 0 ? pages.map((p, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#0F172A' }} title={p.url}>
                      {p.url.replace(/^https?:\/\//, '')}
                    </td>
                    <td>
                      <span style={{ 
                        background: `${getStatusColor(p.indexingStatus)}15`, 
                        color: getStatusColor(p.indexingStatus),
                        border: `1px solid ${getStatusColor(p.indexingStatus)}30`,
                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600
                      }}>
                        {p.indexingStatus}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {p.lastSubmittedAt ? new Date(p.lastSubmittedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleVerify(p.id, p.url)} style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                        <RefreshCw size={12} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No pages tracked for this site yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
