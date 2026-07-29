"use client";

import { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getSites } from '../lib/api';
import styles from '../app/dashboard/layout.module.css'; // Reuse existing styles

interface Site {
  id: string;
  url: string;
  planId?: string;
}

export default function SiteSelector() {
  const { data: session } = useSession();
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchSites() {
      if (!session?.user?.email) return;
      try {
        const data = await getSites(session.user.email);
        if (data && data.length > 0) {
          setSites(data);
          
          // Try to load saved site from localStorage
          const savedSiteId = localStorage.getItem('autoseo-active-site-id');
          const foundSite = data.find((s: Site) => s.id === savedSiteId);
          
          if (foundSite) {
            setActiveSite(foundSite);
          } else {
            // Default to first site
            setActiveSite(data[0]);
            localStorage.setItem('autoseo-active-site-id', data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sites for selector", err);
      }
    }
    fetchSites();
  }, [session?.user?.email]);

  const handleSelect = (site: Site) => {
    setActiveSite(site);
    localStorage.setItem('autoseo-active-site-id', site.id);
    setIsOpen(false);
    // Reload page to refresh data for the new site
    window.location.reload();
  };

  if (!activeSite) {
    return (
      <div className={styles.websiteSelector} style={{ opacity: 0.5 }}>
        <div className={styles.websiteInfo}>
          <Globe size={18} className={styles.websiteIcon} />
          <div className={styles.websiteNameGroup}>
            <span className={styles.websiteName}>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.websiteSelector} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.websiteInfo}>
          <Globe size={18} className={styles.websiteIcon} />
          <div className={styles.websiteNameGroup}>
            <span className={styles.websiteName}>{activeSite.url.replace(/^https?:\/\//, '')}</span>
            <span className={styles.websitePlan}>{activeSite.planId || 'Pro Plan'}</span>
          </div>
        </div>
        <ChevronDown size={16} color="#64748B" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          marginTop: '-1.5rem',
          marginBottom: '2rem',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {sites.map(site => (
            <div 
              key={site.id}
              onClick={() => handleSelect(site)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: activeSite.id === site.id ? 'var(--primary-light)' : 'transparent',
                borderBottom: '1px solid var(--border-faint)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (activeSite.id !== site.id) {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = activeSite.id === site.id ? 'var(--primary-light)' : 'transparent';
              }}
            >
              <Globe size={14} color={activeSite.id === site.id ? 'var(--primary)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.85rem', fontWeight: activeSite.id === site.id ? 700 : 500, color: 'var(--foreground)' }}>
                {site.url.replace(/^https?:\/\//, '')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
