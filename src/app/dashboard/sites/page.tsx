"use client";

import { API_BASE } from '@/lib/apiConfig';
import { Info } from "lucide-react";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import styles from './page.module.css';

// Inner component that uses useSearchParams — must be inside <Suspense>
function SitesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(searchParams?.get('add') === 'true');
  const [url, setUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [sites, setSites] = useState<any[]>([]);

  const email = session?.user?.email;
  const { data: status } = useSWR(email ? `/auth/google/status?email=${encodeURIComponent(email)}` : null, fetcher);
  const isGoogleConnected = status?.connected || false;

  const handleConnectGsc = () => {
    if (!email) return;
    setLoadingGoogle(true);
    window.location.href = `${API_BASE}/auth/google?email=${encodeURIComponent(email)}&redirect=sites`;
  };

  const handleConnectGa4 = () => {
    if (!email) return;
    setLoadingGoogle(true);
    window.location.href = `${API_BASE}/auth/google?email=${encodeURIComponent(email)}&redirect=sites`;
  };

  useEffect(() => {
    fetchSites();
  }, [session]);

  const fetchSites = async () => {
    try {
      const res = await fetch(`${API_BASE}/sites?userId=${(session?.user as any)?.id || '1'}`);
      if (res.ok) {
        const data = await res.json();
        setSites(data);
      }
    } catch (error) {
      console.error('Failed to fetch sites', error);
    }
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsCrawling(true);
    
    try {
      const email = session?.user?.email || '';
      let formattedUrl = url.trim().toLowerCase();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const endpoint = editingSiteId 
        ? `${API_BASE}/sites/${editingSiteId}/settings` 
        : `${API_BASE}/sites?email=${encodeURIComponent(email)}`;
        
      const method = editingSiteId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl })
      });
      
      if (res.ok) {
        toast.success(editingSiteId ? 'Site updated successfully!' : 'Site added successfully!');
        await fetchSites();
        setIsModalOpen(false);
        setUrl('');
        setEditingSiteId(null);
      } else {
        const data = await res.json();
        toast.error(data.error || (editingSiteId ? 'Failed to update site' : 'Failed to add site'));
      }
    } catch (error) {
      console.error('Failed to add site', error);
      toast.error('Something went wrong');
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>My Websites</h1>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Manage all the websites and projects you are tracking in AutoSEO Pro. <strong>Example:</strong> Switch from your main business site to your personal blog to view its individual stats.
          </p>
        </div>
      </div>
  
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          + Add New Site
        </button>
      </div>

      <div className={styles.sitesGrid}>
        {sites.map((site: any) => (
          <div key={site.id} className={styles.siteCard}>
            <div className={styles.siteUrl}>{site.url}</div>
            <div className={styles.siteMeta}>
              <p>Pages Indexed: {site.pages?.length || 0}</p>
              <p>Last Crawled: {site.lastCrawled}</p>
            </div>
            <div className={styles.siteActions}>
              <button 
                className={styles.actionBtn} 
                onClick={() => {
                  setEditingSiteId(site.id);
                  setUrl(site.url);
                  setIsModalOpen(true);
                }}
                style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}
              >
                Edit URL
              </button>
              <Link href={`/dashboard/sites/${site.id}`} className={styles.actionBtn}>View SEO Files</Link>
              <button className={styles.actionBtn} onClick={() => alert('Recrawling...')}>Re-Crawl</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingSiteId ? 'Edit Website URL' : 'Add Website'}</h2>
            <form onSubmit={handleCrawl}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Website URL</label>
                <input 
                  type="url" 
                  className={styles.input} 
                  placeholder="https://yourwebsite.com" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => { setIsModalOpen(false); setEditingSiteId(null); setUrl(''); }}>Cancel</button>
                <button type="submit" className={styles.addBtn} disabled={isCrawling}>
                  {isCrawling ? 'Saving...' : (editingSiteId ? 'Update Site' : 'Add Site')}
                </button>
              </div>
            </form>

            {/* Google Integrations embedded directly in the modal */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Optional Connections (Account Wide)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* GSC */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '40px', height: '40px', background: '#0F172A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 48 48" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0F172A' }}>Google Search Console</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>Sync keyword rankings & coverage.</p>
                  </div>
                  <button 
                    onClick={handleConnectGsc}
                    disabled={loadingGoogle}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: isGoogleConnected ? 'rgba(16, 185, 129, 0.1)' : '#3b82f6', 
                      color: isGoogleConnected ? '#10b981' : '#FFFFFF', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: isGoogleConnected ? 'default' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isGoogleConnected ? '✓ Connected' : 'Connect'}
                  </button>
                </div>

                {/* GA4 */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '40px', height: '40px', background: '#F59E0B', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#FFF" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-5h2v5zm4 0h-2V7h2v10zm4 0h-2v-3h2v3z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0F172A' }}>Google Analytics 4</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>Track live traffic and user behavior.</p>
                  </div>
                  <button 
                    onClick={handleConnectGa4}
                    disabled={loadingGoogle}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: isGoogleConnected ? 'rgba(16, 185, 129, 0.1)' : '#FFFFFF', 
                      color: isGoogleConnected ? '#10b981' : '#0F172A', 
                      border: isGoogleConnected ? 'none' : '1px solid #E2E8F0', 
                      borderRadius: '6px', 
                      cursor: isGoogleConnected ? 'default' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isGoogleConnected ? '✓ Authorized' : 'Authorize via Google'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Default export wraps the inner component in Suspense (required by Next.js for useSearchParams)
export default function SitesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: '#64748B' }}>Loading...</div>}>
      <SitesContent />
    </Suspense>
  );
}
