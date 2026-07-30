"use client";

import { API_BASE } from '@/lib/apiConfig';
import { Info } from "lucide-react";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';

// Inner component that uses useSearchParams — must be inside <Suspense>
function SitesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('add') === 'true');
  const [url, setUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

  const [sites, setSites] = useState<any[]>([]);

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
