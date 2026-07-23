"use client";

import { API_BASE } from '@/lib/apiConfig';
import { Info } from "lucide-react";

import { useState, useEffect } from 'react';
import styles from './links.module.css';

interface Suggestion {
  id: string;
  sourcePageUrl: string;
  targetPageUrl: string;
  suggestedAnchorText: string;
  status: string;
}

export default function InternalLinksPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitesAndSuggestions = async () => {
      try {
        const sitesRes = await fetch(`${API_BASE}/sites`);
        const sites = await sitesRes.json();
        
        if (sites && sites.length > 0) {
          const sId = sites[0].id;
          setSiteId(sId);
          
          const sugRes = await fetch(`${API_BASE}/sites/${sId}/internal-links`);
          if (sugRes.ok) {
            const data = await sugRes.json();
            setSuggestions(data);
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    fetchSitesAndSuggestions();
  }, []);

  const handleGenerate = async () => {
    if (!siteId) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/sites/${siteId}/internal-links/generate`, {
        method: 'POST',
      });

      if (res.ok) {
        // Refresh the list after generating
        const sugRes = await fetch(`${API_BASE}/sites/${siteId}/internal-links`);
        const data = await sugRes.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (suggestionId: string, status: 'Accepted' | 'Rejected') => {
    if (!siteId) return;

    try {
      const res = await fetch(`${API_BASE}/sites/${siteId}/internal-links/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setSuggestions(prev => 
          prev.map(s => s.id === suggestionId ? { ...s, status } : s)
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Automated Internal Linking</h1>
          <p>Discover contextual link opportunities to boost your topical authority.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Analyzes your site's internal linking structure and finds orphan pages. <strong>Example:</strong> Find pages with zero internal links pointing to them and link them from your homepage to boost their authority.
          </p>
        </div>
      </div>
  
        </div>
        
        <button onClick={handleGenerate} className={styles.scanButton} disabled={loading}>
          {loading ? 'Analyzing Content...' : '✨ Run AI Scan'}
        </button>
      </div>

      <div className={styles.grid}>
        {suggestions.length === 0 ? (
          <div className={styles.noData}>
            <h3>No Link Suggestions Found</h3>
            <p>Click "Run AI Scan" to analyze your pages and generate internal link opportunities.</p>
          </div>
        ) : (
          suggestions.map((sug) => (
            <div key={sug.id} className={styles.card}>
              <div className={styles.suggestionInfo}>
                <div className={styles.urls}>
                  <div className={styles.pageBox}>{sug.sourcePageUrl}</div>
                  <div className={styles.arrow}>→</div>
                  <div className={styles.pageBox}>{sug.targetPageUrl}</div>
                </div>
                
                <div className={styles.anchorWrapper}>
                  <span>Suggested Anchor Text:</span>
                  <span className={styles.anchorText}>"{sug.suggestedAnchorText}"</span>
                </div>
              </div>

              <div className={styles.actions}>
                {sug.status === 'Pending' ? (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(sug.id, 'Accepted')}
                      className={styles.btnAccept}
                    >
                      ✓ Accept
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(sug.id, 'Rejected')}
                      className={styles.btnReject}
                    >
                      ✕ Reject
                    </button>
                  </>
                ) : (
                  <span className={`${styles.badge} ${sug.status === 'Accepted' ? styles.badgeAccepted : styles.badgeRejected}`}>
                    {sug.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
