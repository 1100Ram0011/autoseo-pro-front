"use client";

import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useSite } from '../lib/SiteContext';
import styles from '../app/dashboard/layout.module.css';

export default function SiteSelector() {
  const { sites, activeSite, setSelectedSite, isLoading } = useSite();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !activeSite) {
    return (
      <div style={{
        opacity: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        background: 'var(--surface-hover)',
        marginBottom: '1.5rem'
      }}>
        <Globe size={18} color="#64748B" />
        <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
      <div className={styles.websiteSelector} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.websiteInfo}>
          <Globe size={18} className={styles.websiteIcon} />
          <div className={styles.websiteNameGroup}>
            <span className={styles.websiteName}>
              {activeSite.url.replace(/^https?:\/\//, '')}
            </span>
            <span className={styles.websitePlan}>
              {activeSite.planId || 'Pro Plan'}
            </span>
          </div>
        </div>
        <ChevronDown
          size={16}
          color="#64748B"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
        />
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
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
          zIndex: 100,
          marginTop: '4px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {sites.map(site => (
            <div
              key={site.id}
              onClick={() => {
                setIsOpen(false);
                if (site.id !== activeSite.id) {
                  setSelectedSite(site);
                }
              }}
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
                e.currentTarget.style.background =
                  activeSite.id === site.id ? 'var(--primary-light)' : 'transparent';
              }}
            >
              <Globe
                size={14}
                color={activeSite.id === site.id ? 'var(--primary)' : 'var(--text-muted)'}
              />
              <span style={{
                fontSize: '0.85rem',
                fontWeight: activeSite.id === site.id ? 700 : 500,
                color: 'var(--foreground)'
              }}>
                {site.url.replace(/^https?:\/\//, '')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
