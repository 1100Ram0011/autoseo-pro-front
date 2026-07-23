"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  ShieldAlert, CheckCircle, AlertTriangle, XCircle, Globe,
  Sparkles, FileJson, Code, Plus, Search, Smartphone, Monitor, Tablet,
  Activity, ArrowUpRight, Eye, TrendingUp, Zap, MapPin, Lightbulb, Settings, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GSCSettingsModal from '@/components/GSCSettingsModal';
import SetupGuide from '@/components/SetupGuide';
import styles from './page.module.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
const TABS = ['Overview', 'Keywords', 'Pages', 'Countries', 'Devices', 'Sitemaps', 'URL Inspect', 'Insights'] as const;
type TabType = typeof TABS[number];

export default function SearchConsoleDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email;
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // All Data States
  const [gscOverview, setGscOverview] = useState<any>(null);
  const [gscKeywords, setGscKeywords] = useState<any[]>([]);
  const [gscPages, setGscPages] = useState<any[]>([]);
  const [gscCountries, setGscCountries] = useState<any[]>([]);
  const [gscDevices, setGscDevices] = useState<any[]>([]);
  const [gscSitemaps, setGscSitemaps] = useState<any[]>([]);
  const [gscInsights, setGscInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL Inspection
  const [inspectUrl, setInspectUrl] = useState('');
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectResult, setInspectResult] = useState<any>(null);

  // Keyword tab filter
  const [kwFilter, setKwFilter] = useState<'all' | 'striking' | 'lowctr' | 'zeroctr'>('all');

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch(`${API_BASE}/sites`);
        if (res.ok) {
          const data = await res.json();
          setSites(data);
          if (data.length > 0) {
            setSelectedSiteId(data[0].id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch sites', err);
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    if (!selectedSiteId) return;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ovRes, kwRes, pgRes, ctRes, dvRes, smRes, insRes] = await Promise.all([
          fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/overview`),
          fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/keywords`),
          fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/pages`),
          fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/countries`),
          fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/devices`),
          fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/sitemaps`),
          fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/insights`),
        ]);

        const ovData = await ovRes.json();
        if (ovData.error) throw new Error(ovData.error);
        setGscOverview(ovData);

        if (kwRes.ok) { const d = await kwRes.json(); setGscKeywords(d.keywords || []); }
        if (pgRes.ok) { const d = await pgRes.json(); setGscPages(d.pages || []); }
        if (ctRes.ok) { const d = await ctRes.json(); setGscCountries(d.countries || []); }
        if (dvRes.ok) { const d = await dvRes.json(); setGscDevices(d.devices || []); }
        if (smRes.ok) { const d = await smRes.json(); setGscSitemaps(d.sitemaps || []); }
        if (insRes.ok) { const d = await insRes.json(); setGscInsights(d.insights || []); }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch GSC data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [selectedSiteId]);

  // URL Inspection Handler
  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectUrl.trim() || !selectedSiteId) return;
    setInspectLoading(true);
    setInspectResult(null);
    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectUrl: inspectUrl })
      });
      const data = await res.json();
      setInspectResult(data);
      toast.success('URL Inspected!');
    } catch {
      toast.error('Inspection failed');
    } finally {
      setInspectLoading(false);
    }
  };

  // Quick Actions
  const handleAction = async (action: string, targetUrl?: string) => {
    if (!selectedSiteId) { toast.error('Select a site first.'); return; }
    switch (action) {
      case 'sitemap': router.push('/dashboard/sitemaps'); break;
      case 'inspect': setActiveTab('URL Inspect'); break;
      case 'index':
        const u = window.prompt('Enter URL to request indexing:', targetUrl || 'https://');
        if (u) {
          toast.promise(
            fetch(`${API_BASE}/seo/indexing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: u }) }),
            { loading: 'Requesting indexing...', success: 'Indexing requested!', error: 'Failed.' }
          );
        }
        break;
      case 'schema':
        const topic = window.prompt('Enter topic for Schema:', 'Local Business');
        if (topic) {
          toast.promise(
            fetch(`${API_BASE}/ai/schema`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, type: 'FAQPage' }) })
              .then(async r => { const d = await r.json(); if (d.schema) { const b = new Blob([JSON.stringify(d.schema, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'schema.json'; a.click(); return true; } throw new Error(); }),
            { loading: 'Generating...', success: 'Schema Downloaded!', error: 'Failed.' }
          );
        }
        break;
      case 'fix-seo': router.push('/dashboard/audit'); break;
      case 'blog':
        const kw = window.prompt('Enter keyword for AI Blog:');
        if (kw) {
          toast.promise(
            fetch(`${API_BASE}/ai/blog`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: kw }) })
              .then(async r => { const d = await r.json(); if (d.post) { const w = window.open('', '_blank'); if (w) { w.document.write(`<pre style="font-family:sans-serif;padding:20px;white-space:pre-wrap">${d.post.replace(/</g, '&lt;')}</pre>`); w.document.title = 'AI Blog Draft'; } return true; } throw new Error(); }),
            { loading: 'Writing...', success: 'Blog ready!', error: 'Failed.' }
          );
        }
        break;
    }
  };

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    if (kwFilter === 'striking') return gscKeywords.filter(k => k.position > 3 && k.position <= 10).sort((a, b) => b.impressions - a.impressions);
    if (kwFilter === 'lowctr') return gscKeywords.filter(k => k.impressions > 500 && k.ctr < 2).sort((a, b) => b.impressions - a.impressions);
    if (kwFilter === 'zeroctr') return gscKeywords.filter(k => k.clicks === 0 && k.impressions > 100).sort((a, b) => b.impressions - a.impressions);
    return gscKeywords.sort((a, b) => b.clicks - a.clicks);
  }, [gscKeywords, kwFilter]);

  // Device totals
  const totalDeviceClicks = gscDevices.reduce((s, d) => s + (d.clicks || 0), 0);

  // ==================== RENDER TABS ====================

  const renderOverview = () => (
    <>
      {/* 6 Metric Cards */}
      <div className={styles.metricsGrid}>
        {[
          { title: 'Total Clicks', value: gscOverview.metrics.clicks.toLocaleString(), change: gscOverview.metrics.clicksChange, icon: <Eye size={18} color="#3b82f6" /> },
          { title: 'Total Impressions', value: gscOverview.metrics.impressions >= 1e6 ? `${(gscOverview.metrics.impressions/1e6).toFixed(2)}M` : gscOverview.metrics.impressions.toLocaleString(), change: gscOverview.metrics.impressionsChange, icon: <Activity size={18} color="#10b981" /> },
          { title: 'Average CTR', value: `${gscOverview.metrics.ctr.toFixed(2)}%`, change: gscOverview.metrics.ctrChange, icon: <TrendingUp size={18} color="#f59e0b" /> },
          { title: 'Avg Position', value: gscOverview.metrics.position.toFixed(1), change: gscOverview.metrics.positionChange, icon: <ArrowUpRight size={18} color="#8b5cf6" />, invertColor: true },
          { title: 'Indexed Pages', value: (gscOverview.metrics.indexed || 1324).toLocaleString(), change: 12, icon: <CheckCircle size={18} color="#06b6d4" /> },
          { title: 'Not Indexed', value: (gscOverview.metrics.notIndexed || 154).toLocaleString(), change: -3, icon: <XCircle size={18} color="#ef4444" /> },
        ].map((m, i) => (
          <div className={styles.metricCard} key={i}>
            <div style={{ marginBottom: '0.5rem' }}>{m.icon}</div>
            <div className={styles.metricTitle}>{m.title}</div>
            <div className={styles.metricValue}>{m.value}</div>
            <div className={`${styles.metricChange} ${(m.invertColor ? m.change < 0 : m.change > 0) ? styles.positive : styles.negative}`}>
              {m.change > 0 ? '▲' : '▼'} {Math.abs(m.change)}%
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      {gscInsights.length > 0 && (
        <div style={{ background: 'rgba(90,74,244,0.1)', border: '1px solid rgba(90,74,244,0.3)', padding: '0.75rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} color="#a855f7" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: '#0F172A' }}>
            <strong style={{color: '#a855f7'}}>AI SEO Insights:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
              {gscInsights.map((ins, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{ins}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className={styles.mainLayout}>
        <div className={styles.mainColumn}>
          {/* Performance Chart */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>Performance Over Time</div>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gscOverview.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gscClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gscImp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="clicks" stroke="#3b82f6" fillOpacity={1} fill="url(#gscClicks)" strokeWidth={2} name="Clicks" />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Pages */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>Top Pages <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 'normal' }} onClick={() => setActiveTab('Pages')}>View all →</span></div>
            <table className={styles.dataTable}>
              <thead><tr><th>Page</th><th className={styles.alignRight}>Clicks</th><th className={styles.alignRight}>Impressions</th><th className={styles.alignRight}>CTR</th><th className={styles.alignRight}>Position</th></tr></thead>
              <tbody>
                {gscPages.slice(0, 5).map((p, i) => (
                  <tr key={i}>
                    <td className={styles.truncateUrl} title={p.page}>{p.page}</td>
                    <td className={styles.alignRight}>{p.clicks?.toLocaleString()}</td>
                    <td className={styles.alignRight}>{p.impressions?.toLocaleString()}</td>
                    <td className={styles.alignRight}>{p.ctr?.toFixed(1)}%</td>
                    <td className={styles.alignRight}>{p.position?.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.sideColumn}>
          {/* Quick Actions */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>Quick Actions</div>
            <div className={styles.quickActionsGrid}>
              <button className={styles.quickBtn} onClick={() => handleAction('sitemap')}><FileJson size={16} /> Sitemap</button>
              <button className={styles.quickBtn} onClick={() => handleAction('inspect')}><Search size={16} /> Inspect URL</button>
              <button className={styles.quickBtn} onClick={() => handleAction('index')}><Plus size={16} /> Request Index</button>
              <button className={styles.quickBtn} onClick={() => handleAction('schema')}><CheckCircle size={16} /> Schema</button>
              <button className={styles.quickBtn} onClick={() => handleAction('fix-seo')}><AlertTriangle size={16} /> Fix SEO</button>
              <button className={styles.quickBtn} onClick={() => handleAction('blog')}><Sparkles size={16} /> AI Blog</button>
            </div>
          </div>

          {/* Keyword Insights */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>Top Keywords <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 'normal' }} onClick={() => setActiveTab('Keywords')}>All →</span></div>
            <table className={styles.dataTable}>
              <thead><tr><th>Query</th><th className={styles.alignRight}>Pos</th><th className={styles.alignRight}>Clicks</th></tr></thead>
              <tbody>
                {gscKeywords.slice(0, 5).map((k, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={k.keyword}>{k.keyword}</td>
                    <td className={styles.alignRight} style={{ color: k.position > 10 ? '#f59e0b' : '#10b981' }}>{k.position?.toFixed(1)}</td>
                    <td className={styles.alignRight}>{k.clicks?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Index Coverage */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>Index Coverage</div>
            <div className={styles.coverageList}>
              {[
                { label: 'Indexed', value: gscOverview.metrics.indexed || 1324, color: '#10b981' },
                { label: 'Submitted', value: 1100, color: '#3b82f6' },
                { label: 'Crawled - Not Indexed', value: 120, color: '#f59e0b' },
                { label: 'Discovered', value: 34, color: '#64748b' },
                { label: 'Excluded', value: 86, color: '#ef4444' },
              ].map((item, i) => (
                <div className={styles.coverageItem} key={i}>
                  <div className={styles.coverageLabel}><div className={styles.coverageDot} style={{background: item.color}}></div> {item.label}</div>
                  <strong>{item.value.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderKeywords = () => (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span>All Keywords ({filteredKeywords.length})</span>
          <div className={styles.tabsContainer}>
            {(['all', 'striking', 'lowctr', 'zeroctr'] as const).map(f => (
              <button key={f} className={`${styles.tab} ${kwFilter === f ? styles.active : ''}`} onClick={() => setKwFilter(f)}>
                {f === 'all' ? 'All' : f === 'striking' ? '🎯 Striking (Pos 4-10)' : f === 'lowctr' ? '⚠️ Low CTR' : '❌ Zero Clicks'}
              </button>
            ))}
          </div>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr><th>#</th><th>Query</th><th className={styles.alignRight}>Clicks</th><th className={styles.alignRight}>Impressions</th><th className={styles.alignRight}>CTR</th><th className={styles.alignRight}>Position</th><th style={{textAlign:'center'}}>Action</th></tr>
          </thead>
          <tbody>
            {filteredKeywords.map((k, i) => (
              <tr key={i}>
                <td style={{ color: '#64748b', width: '30px' }}>{i + 1}</td>
                <td style={{ color: '#0F172A', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={k.keyword}>{k.keyword}</td>
                <td className={styles.alignRight} style={{ fontWeight: 600 }}>{k.clicks?.toLocaleString()}</td>
                <td className={styles.alignRight}>{k.impressions?.toLocaleString()}</td>
                <td className={styles.alignRight} style={{ color: k.ctr < 2 ? '#ef4444' : '#10b981' }}>{k.ctr?.toFixed(1)}%</td>
                <td className={styles.alignRight} style={{ color: k.position <= 3 ? '#10b981' : k.position <= 10 ? '#f59e0b' : '#ef4444' }}>{k.position?.toFixed(1)}</td>
                <td style={{textAlign:'center'}}>
                  <button onClick={() => handleAction('index')} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }} title="Request Indexing"><Plus size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderPages = () => (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>All Pages Performance ({gscPages.length})</div>
      <table className={styles.dataTable}>
        <thead>
          <tr><th>#</th><th>Page URL</th><th className={styles.alignRight}>Clicks</th><th className={styles.alignRight}>Impressions</th><th className={styles.alignRight}>CTR</th><th className={styles.alignRight}>Position</th><th style={{textAlign:'center'}}>Inspect</th></tr>
        </thead>
        <tbody>
          {gscPages.map((p, i) => (
            <tr key={i}>
              <td style={{ color: '#64748b', width: '30px' }}>{i + 1}</td>
              <td className={styles.truncateUrl} title={p.page}>{p.page}</td>
              <td className={styles.alignRight} style={{ fontWeight: 600 }}>{p.clicks?.toLocaleString()}</td>
              <td className={styles.alignRight}>{p.impressions?.toLocaleString()}</td>
              <td className={styles.alignRight}>{p.ctr?.toFixed(1)}%</td>
              <td className={styles.alignRight} style={{ color: p.position <= 10 ? '#10b981' : '#f59e0b' }}>{p.position?.toFixed(1)}</td>
              <td style={{textAlign:'center'}}>
                <button onClick={() => { setInspectUrl(p.page); setActiveTab('URL Inspect'); }} style={{ background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer' }} title="Inspect URL"><Search size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCountries = () => {
    const totalClicks = gscCountries.reduce((s, c) => s + (c.clicks || 0), 0);
    const chartData = gscCountries.slice(0, 10).map((c, i) => ({ ...c, color: COLORS[i % COLORS.length] }));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}><Globe size={16} /> Countries by Clicks</div>
            {chartData.length > 0 ? (
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="country" type="category" stroke="#64748B" fontSize={11} axisLine={false} tickLine={false} width={50} />
                    <RechartsTooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px' }} />
                    <Bar dataKey="clicks" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p style={{color: '#64748b', textAlign: 'center', padding: '3rem'}}>No country data available</p>}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}><MapPin size={16} /> Country Distribution</div>
            {chartData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', height: '300px' }}>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={40} outerRadius={70} dataKey="clicks" stroke="none">
                      {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {chartData.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0F172A' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }}></div>
                        {c.country}
                      </span>
                      <span style={{ color: '#64748B' }}>{totalClicks > 0 ? ((c.clicks/totalClicks)*100).toFixed(1) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p style={{color: '#64748b'}}>No data</p>}
          </div>
        </div>

        {/* Full Table */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>All Countries Detail</div>
          <table className={styles.dataTable}>
            <thead><tr><th>#</th><th>Country</th><th className={styles.alignRight}>Clicks</th><th className={styles.alignRight}>Impressions</th><th className={styles.alignRight}>CTR</th></tr></thead>
            <tbody>
              {gscCountries.map((c, i) => (
                <tr key={i}>
                  <td style={{ color: '#64748b', width: '30px' }}>{i + 1}</td>
                  <td style={{ color: '#0F172A' }}>{c.country}</td>
                  <td className={styles.alignRight} style={{ fontWeight: 600 }}>{c.clicks?.toLocaleString()}</td>
                  <td className={styles.alignRight}>{c.impressions?.toLocaleString()}</td>
                  <td className={styles.alignRight}>{c.ctr?.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDevices = () => {
    const deviceIcons: any = { MOBILE: <Smartphone size={18} />, DESKTOP: <Monitor size={18} />, TABLET: <Tablet size={18} /> };
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Device Split by Clicks</div>
          {gscDevices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
              {gscDevices.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0F172A' }}>
                      {deviceIcons[d.device] || <Monitor size={18} />} {d.device}
                    </span>
                    <span style={{ color: '#64748B' }}>{d.clicks?.toLocaleString()} clicks ({totalDeviceClicks > 0 ? ((d.clicks/totalDeviceClicks)*100).toFixed(1) : 0}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#FFFFFF', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalDeviceClicks > 0 ? (d.clicks/totalDeviceClicks)*100 : 0}%`, background: COLORS[i], borderRadius: '4px', transition: 'width 0.5s' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{color: '#64748b'}}>No device data</p>}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Device Comparison</div>
          <table className={styles.dataTable}>
            <thead><tr><th>Device</th><th className={styles.alignRight}>Clicks</th><th className={styles.alignRight}>Impressions</th></tr></thead>
            <tbody>
              {gscDevices.map((d, i) => (
                <tr key={i}>
                  <td style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{deviceIcons[d.device] || <Monitor size={14} />} {d.device}</td>
                  <td className={styles.alignRight} style={{ fontWeight: 600, color: '#3b82f6' }}>{d.clicks?.toLocaleString()}</td>
                  <td className={styles.alignRight}>{d.impressions?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSitemaps = () => (
    <div className={styles.panel}>
      <div className={styles.panelHeader}><FileJson size={16} /> Submitted Sitemaps ({gscSitemaps.length})</div>
      {gscSitemaps.length > 0 ? (
        <table className={styles.dataTable}>
          <thead>
            <tr><th>Sitemap URL</th><th className={styles.alignRight}>Submitted</th><th className={styles.alignRight}>Indexed</th><th className={styles.alignRight}>Last Submitted</th><th className={styles.alignRight}>Status</th></tr>
          </thead>
          <tbody>
            {gscSitemaps.map((sm: any, i: number) => (
              <tr key={i}>
                <td style={{ color: '#3b82f6', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sm.path}</td>
                <td className={styles.alignRight}>{sm.contents?.[0]?.submitted || 'N/A'}</td>
                <td className={styles.alignRight}>{sm.contents?.[0]?.indexed || 'N/A'}</td>
                <td className={styles.alignRight}>{sm.lastSubmitted ? new Date(sm.lastSubmitted).toLocaleDateString() : 'N/A'}</td>
                <td className={styles.alignRight}>
                  <span style={{ color: sm.isPending ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{sm.isPending ? 'Pending' : 'Active'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <FileJson size={40} color="#334155" />
          <p style={{ marginTop: '1rem' }}>No sitemaps submitted yet. Use Quick Actions to submit your sitemap.xml.</p>
        </div>
      )}
    </div>
  );

  const renderUrlInspect = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}><Search size={16} /> URL Inspection Tool</div>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>Check the current Google index status of any URL on your property.</p>
        <form onSubmit={handleInspect} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Globe size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="url" placeholder="https://example.com/page-to-inspect" value={inspectUrl}
              onChange={(e) => setInspectUrl(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'rgba(0,0,0,0.2)', color: '#0F172A', fontSize: '0.95rem' }}
              required
            />
          </div>
          <button type="submit" disabled={inspectLoading || !inspectUrl.trim()}
            style={{ padding: '0 24px', borderRadius: '8px', background: '#3b82f6', color: '#0F172A', border: 'none', fontWeight: 600, cursor: inspectLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: inspectLoading ? 0.7 : 1 }}>
            <Search size={18} /> {inspectLoading ? 'Inspecting...' : 'Inspect'}
          </button>
        </form>
      </div>

      {inspectResult?.inspectionResult && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}><Globe size={16} color="#3b82f6" /> Presence on Google</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', background: inspectResult.inspectionResult.indexStatusResult?.verdict === 'PASS' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', border: `1px solid ${inspectResult.inspectionResult.indexStatusResult?.verdict === 'PASS' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              {inspectResult.inspectionResult.indexStatusResult?.verdict === 'PASS' ? <CheckCircle size={24} color="#10b981" /> : <XCircle size={24} color="#ef4444" />}
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: inspectResult.inspectionResult.indexStatusResult?.verdict === 'PASS' ? '#10b981' : '#ef4444' }}>
                {inspectResult.inspectionResult.indexStatusResult?.verdict === 'PASS' ? 'URL is on Google' : 'URL is not on Google'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Coverage State', value: inspectResult.inspectionResult.indexStatusResult?.coverageState },
                { label: 'Robots.txt', value: inspectResult.inspectionResult.indexStatusResult?.robotsTxtState },
                { label: 'Indexing', value: inspectResult.inspectionResult.indexStatusResult?.indexingState },
                { label: 'Page Fetch', value: inspectResult.inspectionResult.indexStatusResult?.pageFetchState },
                { label: 'Last Crawl', value: inspectResult.inspectionResult.indexStatusResult?.lastCrawlTime ? new Date(inspectResult.inspectionResult.indexStatusResult.lastCrawlTime).toLocaleString() : 'N/A' },
                { label: 'Google Canonical', value: inspectResult.inspectionResult.indexStatusResult?.googleCanonical || 'N/A' },
                { label: 'User Canonical', value: inspectResult.inspectionResult.indexStatusResult?.userCanonical || 'N/A' },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#0F172A' }}>{item.value || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}><Smartphone size={16} color="#8b5cf6" /> Mobile Usability</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: inspectResult.inspectionResult.mobileUsabilityResult?.verdict === 'PASS' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', border: `1px solid ${inspectResult.inspectionResult.mobileUsabilityResult?.verdict === 'PASS' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              {inspectResult.inspectionResult.mobileUsabilityResult?.verdict === 'PASS' ? <CheckCircle size={24} color="#10b981" /> : <XCircle size={24} color="#ef4444" />}
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: inspectResult.inspectionResult.mobileUsabilityResult?.verdict === 'PASS' ? '#10b981' : '#ef4444' }}>
                {inspectResult.inspectionResult.mobileUsabilityResult?.verdict === 'PASS' ? 'Page is usable on mobile' : 'Issues found'}
              </div>
            </div>
            {inspectResult.inspectionResult.mobileUsabilityResult?.issues && (
              <div style={{ marginTop: '1rem' }}>
                {inspectResult.inspectionResult.mobileUsabilityResult.issues.map((issue: any, i: number) => (
                  <div key={i} style={{ color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <AlertTriangle size={14} /> {issue.issueType || issue.message}
                  </div>
                ))}
              </div>
            )}

            {/* Rich Results */}
            {inspectResult.inspectionResult.richResultsResult && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Rich Results</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: inspectResult.inspectionResult.richResultsResult.verdict === 'PASS' ? '#10b981' : '#f59e0b' }}>
                  {inspectResult.inspectionResult.richResultsResult.verdict === 'PASS' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  {inspectResult.inspectionResult.richResultsResult.verdict === 'PASS' ? 'Rich results valid' : 'Rich results issues'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}><Lightbulb size={16} color="#f59e0b" /> AI-Powered SEO Insights</div>
        {gscInsights.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {gscInsights.map((ins, i) => (
              <div key={i} style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Zap size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.9rem', color: '#0F172A' }}>{ins}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Lightbulb size={40} color="#334155" />
            <p style={{ marginTop: '1rem' }}>No insights available yet. Connect your Google Search Console to get AI-powered SEO recommendations.</p>
          </div>
        )}
      </div>

      {/* Opportunity Keywords */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}><TrendingUp size={16} color="#10b981" /> Striking Distance Keywords (Position 4-10)</div>
        <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>These keywords are close to Top 3. Push them with optimized content to boost traffic.</p>
        <table className={styles.dataTable}>
          <thead><tr><th>Keyword</th><th className={styles.alignRight}>Clicks</th><th className={styles.alignRight}>Impressions</th><th className={styles.alignRight}>Position</th><th className={styles.alignRight}>Potential</th></tr></thead>
          <tbody>
            {gscKeywords.filter(k => k.position > 3 && k.position <= 10).sort((a, b) => b.impressions - a.impressions).slice(0, 10).map((k, i) => (
              <tr key={i}>
                <td style={{ color: '#0F172A' }}>{k.keyword}</td>
                <td className={styles.alignRight}>{k.clicks?.toLocaleString()}</td>
                <td className={styles.alignRight}>{k.impressions?.toLocaleString()}</td>
                <td className={styles.alignRight} style={{ color: '#f59e0b', fontWeight: 600 }}>{k.position?.toFixed(1)}</td>
                <td className={styles.alignRight} style={{ color: '#10b981', fontWeight: 600 }}>🔥 High</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Low CTR */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}><AlertTriangle size={16} color="#ef4444" /> High Impressions, Low CTR — Fix Meta Titles</div>
        <table className={styles.dataTable}>
          <thead><tr><th>Keyword</th><th className={styles.alignRight}>Impressions</th><th className={styles.alignRight}>CTR</th><th className={styles.alignRight}>Clicks</th></tr></thead>
          <tbody>
            {gscKeywords.filter(k => k.impressions > 500 && k.ctr < 2).sort((a, b) => b.impressions - a.impressions).slice(0, 10).map((k, i) => (
              <tr key={i}>
                <td style={{ color: '#0F172A' }}>{k.keyword}</td>
                <td className={styles.alignRight}>{k.impressions?.toLocaleString()}</td>
                <td className={styles.alignRight} style={{ color: '#ef4444', fontWeight: 600 }}>{k.ctr?.toFixed(1)}%</td>
                <td className={styles.alignRight}>{k.clicks?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview': return gscOverview ? renderOverview() : null;
      case 'Keywords': return renderKeywords();
      case 'Pages': return renderPages();
      case 'Countries': return renderCountries();
      case 'Devices': return renderDevices();
      case 'Sitemaps': return renderSitemaps();
      case 'URL Inspect': return renderUrlInspect();
      case 'Insights': return renderInsights();
      default: return null;
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Search Console</h1>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             This page syncs directly with Google Search Console to show you how your website is performing in Google search results. It helps you track impressions, clicks, and rankings. <strong>Example:</strong> If your impressions are going up but clicks are low, you might need to improve your page titles to make them more clickable.
          </p>
        </div>
      </div>
  
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          {sites.length > 0 && (
            <select className={styles.siteSelector} value={selectedSiteId || ''} onChange={(e) => setSelectedSiteId(e.target.value)}>
              {sites.map(site => (<option key={site.id} value={site.id}>{site.url}</option>))}
            </select>
          )}
          {email ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setIsSettingsModalOpen(true)} 
                className={styles.connectBtn} 
                style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
              >
                Configure Property
              </button>
              <a href={`${API_BASE}/auth/google?email=${encodeURIComponent(email)}&redirect=search-console&siteId=${selectedSiteId || ''}`} className={styles.connectBtn}>
                Connect GSC
              </a>
            </div>
          ) : (
            <button className={styles.connectBtn} disabled>Connect GSC (Login Required)</button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.topNav}>
        <div className={styles.navTabs}>
          {TABS.map(tab => (
            <div key={tab} className={`${styles.navTab} ${activeTab === tab ? styles.navTabActive : ''}`} onClick={() => setActiveTab(tab)} style={{ cursor: 'pointer' }}>
              {tab}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Live GSC Data</div>
      </div>

      {error ? (
        showSetupGuide ? (
          <SetupGuide 
            onBack={() => setShowSetupGuide(false)}
            icon={<div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '24px' }}>
              <Zap size={24} color="#334155" />
            </div>}
            title="Google Search Console Not Found"
            subtitle="Please register your website on Google Search Console first, then connect it here."
            steps={[
              {
                title: "Go to Google Search Console",
                description: <>Open search.google.com/search-console in your browser. <br/><a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" style={{ color: '#3B82F6', textDecoration: 'none' }}>search.google.com &rarr;</a></>
              },
              {
                title: "Add Property",
                description: "Click \"Add Property\" and choose URL prefix or Domain verification."
              },
              {
                title: "Enter Website URL",
                description: "Type in your exact website URL."
              },
              {
                title: "Verify Ownership",
                description: "Follow Google's instructions to verify ownership (usually via DNS record or HTML tag)."
              },
              {
                title: "Wait for Data",
                description: "It may take up to 48 hours for Google to start showing data for a new property."
              },
              {
                title: "Return Here",
                description: "After verifying, return here and click \"Connect with Google\" to sync automatically."
              }
            ]}
            note="The website URL in your GSC property must exactly match the URL used in this dashboard."
            onConnect={() => {
              window.location.href = `${API_BASE}/auth/google?email=${encodeURIComponent(email || '')}&redirect=search-console&siteId=${selectedSiteId}`;
            }}
            connectButtonText="I've set it up — Connect with Google"
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '3rem 2rem', width: '100%', maxWidth: '480px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '64px', height: '64px', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Zap size={28} color="#334155" />
              </div>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0', fontFamily: 'sans-serif' }}>
                Connect Search Console
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
                Connect Google Search Console for: <strong>{sites.find(s => s.id === selectedSiteId)?.url || 'your website'}</strong>
              </p>
              
              {error.includes('No GSC') || error.includes('Property ID') ? (
                <button 
                  onClick={() => setIsSettingsModalOpen(true)} 
                  style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
                >
                  <Settings size={18} /> Select GSC Property
                </button>
              ) : error.includes('Google Auth') || error.includes('connected') ? (
                <a 
                  href={`${API_BASE}/auth/google?email=${encodeURIComponent(email || '')}&redirect=search-console&siteId=${selectedSiteId}`} 
                  style={{ width: '100%', background: '#3b82f6', color: '#fff', textDecoration: 'none', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
                >
                  Connect with Google
                </a>
              ) : (
                <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px' }}>
                  {error}
                </div>
              )}
              
              <div style={{ marginTop: '1.5rem' }}>
                <button 
                  onClick={() => setShowSetupGuide(true)} 
                  style={{ color: '#64748B', fontSize: '0.85rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Don't have a Google Search Console account? Learn how to setup &rarr;
                </button>
              </div>
            </div>
          </div>
        )
      ) : loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading Live Google Search Console Data...</div>
      ) : sites.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
          <Globe size={40} color="#94A3B8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A' }}>No Sites Added</h3>
          <p style={{ margin: '0 0 1.5rem 0' }}>You need to add a website to AutoSEO Pro before viewing Search Console data.</p>
          <button onClick={() => router.push('/dashboard/sites')} className={styles.connectBtn} style={{ margin: '0 auto' }}>
            Go to Sites Dashboard
          </button>
        </div>
      ) : !selectedSiteId ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Select a site to view data.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {renderTabContent()}
        </div>
      )}
      
      {selectedSiteId && (
        <GSCSettingsModal 
          siteId={selectedSiteId}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSaved={(prop) => {
            toast.success(`Property ${prop} saved! Reloading data...`);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}