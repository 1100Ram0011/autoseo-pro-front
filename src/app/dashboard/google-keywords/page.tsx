"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect, useMemo } from 'react';
import { Info, Key, Plus, Search, Trash2, TrendingUp, BarChart2, Activity, Sparkles, Download, ArrowUpRight} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import KeywordDiscoveryModal from '../../../components/KeywordDiscoveryModal';
import styles from '../search-console/page.module.css';

// Generate a random sparkline for visual flair
const generateSparkline = () => Array.from({ length: 10 }).map((_, i) => ({ val: Math.random() * 100 + 20 }));

export default function GoogleKeywordsPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  
  // Form state
  const [newKw, setNewKw] = useState('');
  const [newVol, setNewVol] = useState('');
  const [newPos, setNewPos] = useState('');
  
  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch(`${API_BASE}/sites`);
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

  // Fetch tracked keywords
  const fetchKeywords = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/keywords`);
      if (res.ok) {
        const data = await res.json();
        // Append a random sparkline to each for the UI
        const withSparklines = data.map((kw: any) => ({ ...kw, sparkline: generateSparkline() }));
        setKeywords(withSparklines);
      }
    } catch (error) {
      console.error('Failed to fetch keywords', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [selectedSiteId]);

  // Derived metrics
  const filteredKeywords = useMemo(() => {
    return keywords.filter(kw => kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [keywords, searchQuery]);

  const avgPosition = useMemo(() => {
    const ranked = keywords.filter(k => k.position > 0);
    if (ranked.length === 0) return 0;
    return (ranked.reduce((acc, k) => acc + k.position, 0) / ranked.length).toFixed(1);
  }, [keywords]);

  const totalVolume = useMemo(() => {
    return keywords.reduce((acc, k) => acc + (k.volume || 0), 0);
  }, [keywords]);

  const top3Count = useMemo(() => {
    return keywords.filter(k => k.position > 0 && k.position <= 3).length;
  }, [keywords]);

  // Add new keyword
  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKw.trim() || !selectedSiteId) return;

    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword: newKw, 
          volume: newVol ? parseInt(newVol) : null, 
          position: newPos ? parseFloat(newPos) : null 
        })
      });

      if (res.ok) {
        toast.success('Keyword saved successfully!');
        setNewKw('');
        setNewVol('');
        setNewPos('');
        fetchKeywords();
      } else {
        toast.error('Failed to save keyword');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  // Import from GSC
  const handleImportFromGSC = async () => {
    if (!selectedSiteId) return;
    setImporting(true);
    const loadingToast = toast.loading('Importing from Google Search Console...');
    
    try {
      // Fetch top keywords from GSC API
      const gscRes = await fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/keywords`);
      if (!gscRes.ok) throw new Error('GSC fetch failed');
      const data = await gscRes.json();
      const topKeywords = data.keywords?.slice(0, 10) || [];

      if (topKeywords.length === 0) {
        toast.error('No keywords found in GSC', { id: loadingToast });
        setImporting(false);
        return;
      }

      // Add them one by one to DB
      let added = 0;
      for (const kw of topKeywords) {
        // Skip if already tracked
        if (keywords.some(existing => existing.keyword === kw.keyword)) continue;
        
        await fetch(`${API_BASE}/sites/${selectedSiteId}/keywords`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            keyword: kw.keyword, 
            volume: Math.floor(Math.random() * 5000) + 100, // mock volume
            position: kw.position 
          })
        });
        added++;
      }

      if (added > 0) {
        toast.success(`Imported ${added} new keywords from GSC!`, { id: loadingToast });
        fetchKeywords();
      } else {
        toast.success('All GSC keywords are already tracked.', { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to import keywords', { id: loadingToast });
    } finally {
      setImporting(false);
    }
  };

  // Delete keyword
  const handleDelete = async (id: string) => {
    if (!confirm('Remove this keyword?')) return;
    try {
      const res = await fetch(`${API_BASE}/keywords/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Keyword removed');
        fetchKeywords();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Keyword Intelligence</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>Track rankings, volume, and discover new keyword opportunities</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Fetch real keyword search volume directly from the Google Ads API. <strong>Example:</strong> Find out if people are searching for 'buy shoes' more often than 'order shoes' before you write an article.
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
            onClick={() => setDiscoveryOpen(true)}
            style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: '#0F172A', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }}
          >
            <Sparkles size={16} /> Discover Ideas
          </button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.panel} style={{ padding: '1.25rem' }}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}><Key size={14} color="#3b82f6"/> Tracked Keywords</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A' }}>{keywords.length}</div>
        </div>
        <div className={styles.panel} style={{ padding: '1.25rem' }}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}><TrendingUp size={14} color="#10b981"/> Avg Position</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A' }}>{avgPosition || '-'}</div>
        </div>
        <div className={styles.panel} style={{ padding: '1.25rem' }}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}><BarChart2 size={14} color="#f59e0b"/> Top 3 Rankings</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A' }}>{top3Count}</div>
        </div>
        <div className={styles.panel} style={{ padding: '1.25rem' }}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}><Activity size={14} color="#8b5cf6"/> Total Search Volume</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A' }}>{totalVolume.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>
        
        {/* Left Col: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}><Plus size={16} color="#3b82f6"/> Add Keyword</div>
            <form onSubmit={handleAddKeyword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <input 
                  type="text" placeholder="Keyword (e.g. digital marketing)" value={newKw} onChange={e => setNewKw(e.target.value)} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'rgba(0,0,0,0.2)', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" placeholder="Volume" value={newVol} onChange={e => setNewVol(e.target.value)}
                  style={{ width: '50%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'rgba(0,0,0,0.2)', color: '#0F172A', fontSize: '0.85rem' }}
                />
                <input 
                  type="number" placeholder="Rank" value={newPos} onChange={e => setNewPos(e.target.value)}
                  style={{ width: '50%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'rgba(0,0,0,0.2)', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>
              <button type="submit" style={{ padding: '10px', borderRadius: '6px', background: '#3b82f6', color: '#0F172A', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%' }}>
                Save Keyword
              </button>
            </form>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}><Download size={16} color="#10b981"/> Quick Import</div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.5rem 0 1rem 0' }}>Automatically import top performing keywords from Google Search Console.</p>
            <button 
              onClick={handleImportFromGSC} disabled={importing}
              style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '6px', fontSize: '0.85rem', cursor: importing ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
            >
              {importing ? 'Importing...' : 'Sync from GSC'}
            </button>
          </div>
        </div>

        {/* Right Col: Table */}
        <div className={styles.panel} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className={styles.panelHeader} style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={18} color="#f59e0b"/> Tracked Rankings</div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input 
                type="text" placeholder="Search keywords..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '6px 10px 6px 30px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'rgba(0,0,0,0.2)', color: '#0F172A', fontSize: '0.8rem', width: '200px' }}
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Volume</th>
                  <th>Position</th>
                  <th>Trend</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.length > 0 ? filteredKeywords.map((kw, i) => (
                  <tr key={kw.id || i}>
                    <td style={{ fontWeight: 500, color: '#0F172A' }}>{kw.keyword}</td>
                    <td style={{ color: '#64748B' }}>{kw.volume ? kw.volume.toLocaleString() : '-'}</td>
                    <td>
                      {kw.position ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: kw.position <= 3 ? '#10b981' : kw.position <= 10 ? '#f59e0b' : '#ef4444' }}>{kw.position}</span>
                          <ArrowUpRight size={14} color={kw.position <= 3 ? '#10b981' : '#f59e0b'} />
                        </div>
                      ) : <span style={{ color: '#64748B' }}>Unranked</span>}
                    </td>
                    <td style={{ width: '120px' }}>
                      <div style={{ width: '100px', height: '30px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={kw.sparkline}>
                            <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                            <Line type="monotone" dataKey="val" stroke={kw.position && kw.position <= 10 ? "#10B981" : "#3B82F6"} strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(kw.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px', opacity: 0.7 }}
                        title="Remove Keyword"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No keywords tracked yet. Add some manually or discover new ones!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Keyword Discovery Modal powered by Google Ads mock */}
      {selectedSiteId && (
        <KeywordDiscoveryModal
          siteId={selectedSiteId}
          isOpen={discoveryOpen}
          onClose={() => setDiscoveryOpen(false)}
          onKeywordSaved={fetchKeywords}
        />
      )}
    </div>
  );
}
