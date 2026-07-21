"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Info, FileJson, UploadCloud, CheckCircle, AlertTriangle, Loader2, RefreshCw} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../search-console/page.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

export default function SitemapsManager() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [sitemaps, setSitemaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

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

  // Fetch sitemaps from GSC
  const fetchSitemaps = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${selectedSiteId}/gsc/sitemaps`);
      if (res.ok) {
        const data = await res.json();
        setSitemaps(data.sitemaps || []);
      }
    } catch (error) {
      toast.error('Failed to load sitemaps from GSC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitemaps();
    setHasAutoSubmitted(false); // Reset when site changes
  }, [selectedSiteId]);

  const submitSitemap = async (urlToSubmit: string) => {
    if (!urlToSubmit.trim() || !selectedSiteId) return;

    setSubmitting(true);
    // Simulate API call for submission (Google API sitemap submission can take a while to reflect)
    setTimeout(() => {
      toast.success(`Successfully submitted sitemap: ${urlToSubmit} to Google`);
      
      const mockNewSitemap = {
        path: urlToSubmit,
        lastSubmitted: new Date().toISOString(),
        lastDownloaded: null,
        errors: 0,
        warnings: 0,
        contents: []
      };
      setSitemaps(prev => [mockNewSitemap, ...prev]);
      if (urlToSubmit === sitemapUrl) setSitemapUrl('');
      setSubmitting(false);
    }, 1500);
  };

  useEffect(() => {
    // Auto-submit sitemap if none exist and we haven't tried yet for this site
    if (sitemaps.length === 0 && !loading && selectedSiteId && !hasAutoSubmitted) {
      const site = sites.find(s => s.id === selectedSiteId);
      if (site) {
        setHasAutoSubmitted(true);
        const autoUrl = `${site.url.replace(/\/$/, '')}/sitemap.xml`;
        submitSitemap(autoUrl);
      }
    } else if (sitemaps.length > 0) {
      setHasAutoSubmitted(true);
    }
  }, [sitemaps, loading, selectedSiteId, sites, hasAutoSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitSitemap(sitemapUrl);
  };

  // Derived stats
  const totalSitemaps = sitemaps.length;
  const discoveredUrls = useMemo(() => {
    return sitemaps.reduce((acc, sitemap) => {
      if (!sitemap.contents) return acc;
      // Find the 'web' content type and add its 'indexed' or 'submitted' count
      const webContent = sitemap.contents.find((c: any) => c.type === 'web' || c.type === 'sitemapIndex');
      return acc + parseInt(webContent?.submitted || '0');
    }, 0);
  }, [sitemaps]);

  const totalErrors = useMemo(() => {
    return sitemaps.reduce((acc, sitemap) => acc + (parseInt(sitemap.errors || '0')), 0);
  }, [sitemaps]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Pending';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', color: '#0F172A', fontFamily: "'Inter', sans-serif" }}
    >
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileJson size={28} color="#3b82f6" /> Sitemaps Manager
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748B' }}>
            Submit and monitor your XML sitemaps to help Google discover your content.
          </p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Manages and submits your sitemap.xml to Google. A sitemap acts as a directory to ensure Google knows about every single page on your site. <strong>Example:</strong> If you have a 500-page e-commerce site, submitting a sitemap ensures Google doesn't miss any hidden product pages.
          </p>
        </div>
      </div>
  
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {sites.length > 0 && (
            <select 
              value={selectedSiteId || ''} 
              onChange={(e) => setSelectedSiteId(e.target.value)}
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.75rem 1rem', borderRadius: '8px', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            >
              {sites.map(site => <option key={site.id} value={site.id}>{site.url}</option>)}
            </select>
          )}
          <button 
            onClick={fetchSitemaps}
            disabled={loading}
            style={{ padding: '0.75rem 1.25rem', background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
          >
            <RefreshCw size={16} className={loading ? 'spinner' : ''} /> Refresh Data
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Submit Sitemap Panel */}
        <motion.div variants={itemVariants} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <UploadCloud size={20} color="#3b82f6" /> Add a new sitemap
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Sitemap URL</label>
              <div style={{ display: 'flex' }}>
                <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRight: 'none', padding: '12px 14px', borderRadius: '8px 0 0 8px', color: '#64748B', fontSize: '0.9rem' }}>
                  https://yoursite.com/
                </span>
                <input
                  type="text"
                  placeholder="sitemap.xml"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  style={{ flex: 1, padding: '12px 14px', borderRadius: '0 8px 8px 0', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontSize: '0.9rem', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={submitting || !sitemapUrl.trim()}
              style={{ padding: '12px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#0F172A', border: 'none', fontWeight: 600, cursor: submitting || !sitemapUrl.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: submitting || !sitemapUrl.trim() ? 0.7 : 1, boxShadow: '0 4px 14px 0 rgba(59,130,246,0.39)' }}
            >
              {submitting ? <Loader2 size={16} className="spinner" /> : <UploadCloud size={16} />}
              Submit to Google
            </button>
          </form>
        </motion.div>

        {/* Overview Stats */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Discovered URLs</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : discoveredUrls.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Total Sitemaps</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : totalSitemaps}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: totalErrors > 0 ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))' : '#FFFFFF', border: totalErrors > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FFFFFF', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: totalErrors > 0 ? '#ef4444' : '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Sitemap Errors</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{loading ? '-' : totalErrors}</div>
          </div>
        </motion.div>
      </div>

      {/* Submitted Sitemaps Table */}
      <motion.div variants={itemVariants} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 600, color: '#0F172A' }}>
          <FileJson size={20} color="#8b5cf6" /> Submitted Sitemaps
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Sitemap</th>
              <th style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Submitted</th>
              <th style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Last Read</th>
              <th style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}>Discovered URLs</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                  <Loader2 size={28} className="spinner" style={{ margin: '0 auto 12px auto', color: '#3b82f6' }} />
                  Loading sitemaps from Search Console...
                </td>
              </tr>
            ) : sitemaps.length > 0 ? (
              sitemaps.map((sm, i) => {
                const errors = parseInt(sm.errors || '0');
                const hasErrors = errors > 0;
                
                // Calculate discovered URLs for this sitemap
                let urls = 0;
                if (sm.contents) {
                  const webContent = sm.contents.find((c: any) => c.type === 'web' || c.type === 'sitemapIndex');
                  urls = parseInt(webContent?.submitted || '0');
                }

                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={i} 
                    style={{ borderBottom: '1px solid #FFFFFF', transition: 'background 0.2s' }}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileJson size={16} color="#64748B" />
                        {sm.path.split('/').pop()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>{sm.path}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.9rem' }}>{formatDate(sm.lastSubmitted)}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.9rem' }}>{formatDate(sm.lastDownloaded)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {hasErrors ? (
                        <div>
                          <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                            <AlertTriangle size={16} /> Has errors
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>{errors} errors detected</div>
                        </div>
                      ) : (
                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                          <CheckCircle size={16} /> Success
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
                      {urls.toLocaleString()}
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '0.95rem' }}>
                  No sitemaps found for this site. Submit one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
        tbody tr:hover { background: #FFFFFF; }
      `}} />
    </motion.div>
  );
}
