"use client";

import { useState } from 'react';
import { Globe, ChevronDown, Settings, Edit2, Trash2, Plus } from 'lucide-react';
import { useSite } from '../lib/SiteContext';
import { API_BASE } from '../lib/apiConfig';
import { useSession } from 'next-auth/react';
import GA4SettingsModal from './GA4SettingsModal';
import GSCSettingsModal from './GSCSettingsModal';
import styles from '../app/dashboard/layout.module.css';

export default function SiteSelector() {
  const { sites, activeSite, setSelectedSite, isLoading } = useSite();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isGA4Open, setIsGA4Open] = useState(false);
  const [isGSCOpen, setIsGSCOpen] = useState(false);

  const handleAddSite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newUrl = window.prompt("Enter new site URL (e.g. https://example.com):");
    if (!newUrl) return;
    
    try {
      const res = await fetch(`${API_BASE}/sites?email=${encodeURIComponent(session?.user?.email || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      });
      if (res.ok) window.location.reload();
      else alert("Failed to add site");
    } catch (err) {
      console.error(err);
      alert("Error adding site");
    }
  };

  const handleEditSite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeSite) return;
    const newUrl = window.prompt("Edit Site URL:", activeSite.url);
    if (!newUrl || newUrl === activeSite?.url) return;
    
    try {
      const res = await fetch(`${API_BASE}/sites/${activeSite.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      });
      if (res.ok) window.location.reload();
      else alert("Failed to update site");
    } catch (err) {
      console.error(err);
      alert("Error updating site");
    }
  };

  const handleDeleteSite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeSite) return;
    if (!window.confirm(`Are you sure you want to delete ${activeSite.url}?\n\nThis will remove all associated data permanently.`)) return;
    
    try {
      const res = await fetch(`${API_BASE}/sites/${activeSite.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        window.location.href = '/dashboard/setup';
      } else {
        alert("Failed to delete site");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting site");
    }
  };

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
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-faint)', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--surface)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Active Site Config</div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsGA4Open(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', textAlign: 'left', fontWeight: 500 }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}
            >
              <Settings size={14} color="#3b82f6" /> Configure Google Analytics
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsGSCOpen(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', textAlign: 'left', fontWeight: 500 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}
            >
              <Settings size={14} color="#10b981" /> Configure Search Console
            </button>
            <button 
              onClick={handleEditSite}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', textAlign: 'left', fontWeight: 500 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f59e0b'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}
            >
              <Edit2 size={14} color="#f59e0b" /> Edit Site URL
            </button>
            <button 
              onClick={handleDeleteSite}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', textAlign: 'left', fontWeight: 500, marginTop: '2px' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}
            >
              <Trash2 size={14} color="#ef4444" /> Delete Site
            </button>
            <div style={{ height: '1px', background: 'var(--border-faint)', margin: '4px 0' }} />
            <button 
              onClick={handleAddSite}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', textAlign: 'left', fontWeight: 500 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}
            >
              <Plus size={14} color="#8b5cf6" /> Add New Site
            </button>
          </div>
        </div>
      )}

      {activeSite && (
        <>
          <GA4SettingsModal siteId={activeSite.id} isOpen={isGA4Open} onClose={() => setIsGA4Open(false)} onSaved={() => window.location.reload()} />
          <GSCSettingsModal siteId={activeSite.id} isOpen={isGSCOpen} onClose={() => setIsGSCOpen(false)} onSaved={() => window.location.reload()} />
        </>
      )}
    </div>
  );
}
