"use client";

import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect, useMemo } from 'react';
import { Info, Key, Plus, Search, Trash2, TrendingUp, BarChart2, Activity, Sparkles, Download, ArrowUpRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useSite } from '@/lib/SiteContext';
import DateRangePicker, { DateRangeValue } from '@/components/DateRangePicker';
import styles from '../search-console/page.module.css';

export default function GoogleKeywordsPage() {
  const { selectedSiteId } = useSite();
  const [dateRange, setDateRange] = useState<DateRangeValue>('30d');
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);
  
  // Keyword Discovery state
  const [seed, setSeed] = useState("");
  const [ideas, setIdeas] = useState<any[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [savingKw, setSavingKw] = useState<string | null>(null);
  
  // Form state
  const [newKw, setNewKw] = useState('');
  const [newVol, setNewVol] = useState('');
  const [newPos, setNewPos] = useState('');
  
  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Build date query string
  const dateQuery = useMemo(() => {
    if (typeof dateRange === 'string') return `range=${dateRange}`;
    const from = dateRange.from.toISOString().split('T')[0];
    const to = dateRange.to.toISOString().split('T')[0];
    return `range=custom&from=${from}&to=${to}`;
  }, [dateRange]);

  // Fetch tracked keywords
  const fetchKeywords = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/keywords?${dateQuery}`);
      if (res.ok) {
        const data = await res.json();
        const withHistory = data.map((kw: any) => {
          let sparkline = [];
          if (kw.history && kw.history.length > 0) {
            sparkline = kw.history.map((h: any) => ({ val: h.position || 100 }));
          } else {
            sparkline = [{ val: kw.position || 100 }, { val: kw.position || 100 }];
          }
          return { ...kw, sparkline };
        });
        setKeywords(withHistory);
      }
    } catch (error) {
      console.error('Failed to fetch keywords', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [selectedSiteId, dateQuery]);

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

  // Keyword Discovery Handlers
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim() || !selectedSiteId) return;

    setDiscoveryLoading(true);
    setIdeas([]);
    
    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/keyword-ideas?seed=${encodeURIComponent(seed)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setIdeas(data.ideas || []);
      if (data.ideas?.length === 0) {
        toast.error("No ideas found for this keyword.");
      }
    } catch (err) {
      toast.error("Failed to fetch keyword ideas");
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const handleSaveIdea = async (idea: any) => {
    if (!selectedSiteId) return;
    setSavingKw(idea.keyword);
    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: idea.keyword,
          volume: idea.searchVolume,
          position: null
        }),
      });
      
      if (!res.ok) throw new Error("Save failed");
      
      toast.success(`Tracked: ${idea.keyword}`);
      fetchKeywords(); // Refresh table
    } catch (err) {
      toast.error("Failed to save keyword");
    } finally {
      setSavingKw(null);
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.header} style={{ marginBottom: 0 }}>
          <div>
            <h1 className={styles.title}>Keyword Intelligence</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>Track rankings, volume, and discover new keyword opportunities</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Auto-injected Info Block */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
            <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
               Fetch real keyword search volume directly from the Google Ads API. <strong>Example:</strong> Find out if people are searching for 'buy shoes' more often than 'order shoes' before you write an article.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className={styles.metricsGrid} style={{ marginBottom: '1.5rem' }}>
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        
        {/* Left Col: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1 1 300px' }}>
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

          <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, minHeight: '300px' }}>
            <table className={styles.dataTable} style={{ minWidth: '600px' }}>
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
                            <YAxis reversed={true} domain={['dataMin', 'dataMax']} hide />
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

      {/* Embedded Keyword Discovery Section */}
      <div className={styles.panel} style={{ marginTop: '1.5rem', width: '100%', overflow: 'hidden', padding: 0 }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A' }}>Discover New Keywords</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Powered by Google Ads Keyword Planner</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Enter a seed keyword (e.g. 'seo agency')"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '1rem' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={discoveryLoading || !seed.trim()}
              style={{ padding: '0 24px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: discoveryLoading || !seed.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: discoveryLoading || !seed.trim() ? 0.7 : 1 }}
            >
              {discoveryLoading ? <Loader2 size={18} className="spinner" /> : <Search size={18} />}
              Generate Ideas
            </button>
          </form>
        </div>

        {/* Results */}
        <div style={{ padding: '0', background: '#FFFFFF' }}>
          {discoveryLoading && ideas.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
               <Loader2 size={32} className="spinner" style={{ margin: '0 auto 16px auto', color: '#3b82f6' }} />
               <p>Mining Google Ads database for opportunities...</p>
            </div>
          ) : ideas.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #E2E8F0' }}>Keyword Idea</th>
                    <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #E2E8F0' }}>Volume</th>
                    <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #E2E8F0' }}>Competition</th>
                    <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #E2E8F0' }}>CPC (Low - High)</th>
                    <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ideas.map((idea, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 24px', color: '#0F172A', fontWeight: 500 }}>{idea.keyword}</td>
                      <td style={{ padding: '16px 24px', color: '#64748B' }}>{idea.searchVolume.toLocaleString()}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                          backgroundColor: idea.competition === 'LOW' ? 'rgba(16, 185, 129, 0.1)' : idea.competition === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: idea.competition === 'LOW' ? '#10b981' : idea.competition === 'MEDIUM' ? '#f59e0b' : '#ef4444'
                        }}>
                          {idea.competition}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.9rem' }}>
                        ${idea.cpcLow} - ${idea.cpcHigh}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleSaveIdea(idea)}
                          disabled={savingKw === idea.keyword}
                          style={{ 
                            background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', 
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          {savingKw === idea.keyword ? <Loader2 size={14} className="spinner" /> : <Plus size={14} />}
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              <p>Type a seed keyword above to generate data-driven ideas.</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
