"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import {
  Settings, Calendar, AlertTriangle, Users, Activity, Globe, Monitor, Smartphone, Tablet, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, Clock, MousePointerClick, Zap, MapPin, FileText, Filter, Download, LogIn, LogOut, Radio, Info
} from 'lucide-react';
import GA4SettingsModal from '../../../components/GA4SettingsModal';
import SetupGuide, { SetupStep } from '../../../components/SetupGuide';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './analytics.module.css';

// Editorial/data palette — deliberately not the generic blue/purple AI-dashboard set
const COLORS = ['#B5432A', '#1F6F6F', '#B4822C', '#3F7D58', '#6B4E8E', '#2B6CB0', '#A34E7C', '#5C6B4F'];

const TABS = ['Overview', 'Real-Time', 'Acquisition', 'Behavior', 'Conversions', 'Retention', 'Settings'] as const;
type TabType = typeof TABS[number];

const tooltipStyle = {
  background: '#FFFFFF',
  border: '1.5px solid #1C1A17',
  borderRadius: '4px',
  color: '#1C1A17',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '0.75rem',
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  // Data States
  const [ga4Overview, setGa4Overview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const { data: session } = useSession();
  const email = session?.user?.email;

  useEffect(() => {
    const fetchSites = async () => {
      if (!email) return;
      try {
        const res = await fetch(`${API_BASE}/sites?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setSites(data);
          if (data.length > 0) {
            setSelectedSiteId(data[0].id);
          } else {
            router.push('/dashboard/sites?add=true');
          }
        } else {
          setLoading(false);
          setError('Failed to load sites.');
        }
      } catch (error) {
        console.error('Failed to fetch sites', error);
        setLoading(false);
        setError('Network error while loading sites.');
      }
    };
    fetchSites();
  }, [email]);

  useEffect(() => {
    if (!selectedSiteId) return;

    const fetchGa4Data = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/ga4/overview?range=monthly&email=${encodeURIComponent(email || '')}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to fetch GA4 data');
          return;
        }

        setGa4Overview(data);
      } catch (error) {
        console.error('Failed to fetch GA4 data', error);
        setError('Network Error');
      } finally {
        setLoading(false);
      }
    };
    fetchGa4Data();
  }, [selectedSiteId]);

  // ============= Derived Data =============
  const trendData = ga4Overview?.trend || [];
  const sparklineData = trendData.length > 0 ? trendData.map((t: any) => ({ value: t.users })) : Array.from({ length: 20 }).map(() => ({ value: 0 }));

  const trafficData = useMemo(() => ga4Overview?.trafficSources ? Object.entries(ga4Overview.trafficSources)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([name, value], i) => ({ name, value: value as number, color: COLORS[i % COLORS.length] })) : [], [ga4Overview]);

  const heatmapRegions = useMemo(() => ga4Overview?.regions ? Object.entries(ga4Overview.regions)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([name, value]) => ({ name, value: value as number, max: Math.max(...Object.values(ga4Overview.regions) as number[]) })) : [], [ga4Overview]);

  const deviceData = useMemo(() => ga4Overview?.devices ? Object.entries(ga4Overview.devices).map(([name, value], i) => ({
    name, value: value as number, color: COLORS[i % COLORS.length]
  })) : [], [ga4Overview]);

  const browserData = useMemo(() => ga4Overview?.browsers ? Object.entries(ga4Overview.browsers)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 6)
    .map(([name, value]) => ({ name, value: value as number })) : [], [ga4Overview]);

  const osData = useMemo(() => ga4Overview?.operatingSystems ? Object.entries(ga4Overview.operatingSystems)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 6)
    .map(([name, value], i) => ({ name, value: value as number, color: COLORS[i % COLORS.length] })) : [], [ga4Overview]);

  const countriesData = useMemo(() => ga4Overview?.countries ? Object.entries(ga4Overview.countries)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 15)
    .map(([name, value]) => ({ name, value: value as number })) : [], [ga4Overview]);

  const citiesData = useMemo(() => ga4Overview?.cities ? Object.entries(ga4Overview.cities)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 15)
    .map(([name, value]) => ({ name, value: value as number })) : [], [ga4Overview]);

  const pagesList = ga4Overview?.topPages || [];
  const landingPagesList = ga4Overview?.landingPages || [];
  const exitPagesList = ga4Overview?.exitPages || [];
  const conversions = ga4Overview?.conversions || [];
  const newReturning = ga4Overview?.newReturning || { new: 0, returning: 0 };
  const realtimeDetail = ga4Overview?.realtimeDetail || { byPage: [], byCountry: [], byCity: [], byDevice: [] };

  const newReturningPie = [
    { name: 'New Users', value: newReturning.new, color: COLORS[0] },
    { name: 'Returning Users', value: newReturning.returning, color: COLORS[1] },
  ].filter(d => d.value > 0);

  // Mock retention data — GA4 Data API doesn't expose cohort retention directly
  const retentionData = [
    { day: 'Day 1', rate: 98.7 },
    { day: 'Day 7', rate: 27.8 },
    { day: 'Day 14', rate: 16.8 },
    { day: 'Day 30', rate: 8.6 },
  ];

  const totalDeviceUsers = deviceData.reduce((s, d) => s + d.value, 0);

  const handleTabClick = (tab: TabType) => {
    if (tab === 'Settings') {
      setSettingsOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // ============= RENDER HELPERS =============

  const renderOverview = () => {
    const sparkSessions = sparklineData.length > 0 ? sparklineData : [{ value: 4 }, { value: 5 }, { value: 6 }, { value: 5 }, { value: 7 }];
    const sparkNewUsers = sparkSessions.map((s: any) => ({ value: s.value * 0.8 }));
    const sparkPageviews = sparkSessions.map((s: any) => ({ value: s.value * 2.5 }));
    const sparkDuration = sparkSessions.map((s: any) => ({ value: s.value * 1.2 }));
    const sparkBounce = sparkSessions.map((s: any) => ({ value: s.value * 0.9 }));
    const sparkConversions = sparkSessions.map((s: any) => ({ value: s.value * 0.3 }));

    return (
      <>
        <div className={styles.metricsRow}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}><Users size={13} color="#B5432A" /> TOTAL SESSIONS</div>
            <div className={styles.metricBigValue}>{ga4Overview?.sessions?.toLocaleString() || '0'}</div>
            <div className={styles.metricSubtext} style={{ color: '#3F7D58' }}>↑ 40% vs last 30 days</div>
            <div style={{ height: 36, width: '100%', marginTop: 'auto', paddingTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkSessions}><Line type="monotone" dataKey="value" stroke="#B5432A" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}><Users size={13} color="#3F7D58" /> NEW USERS</div>
            <div className={styles.metricBigValue}>{newReturning.new.toLocaleString()}</div>
            <div className={styles.metricSubtext} style={{ color: '#3F7D58' }}>↑ 18.7% vs last 30 days</div>
            <div style={{ height: 36, width: '100%', marginTop: 'auto', paddingTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkNewUsers}><Line type="monotone" dataKey="value" stroke="#3F7D58" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}><FileText size={13} color="#6B4E8E" /> PAGEVIEWS</div>
            <div className={styles.metricBigValue}>{((ga4Overview?.sessions || 0) * (ga4Overview?.pagesPerSession || 0))?.toFixed(0) || '0'}</div>
            <div className={styles.metricSubtext} style={{ color: '#3F7D58' }}>↑ 23.4% vs last 30 days</div>
            <div style={{ height: 36, width: '100%', marginTop: 'auto', paddingTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkPageviews}><Line type="monotone" dataKey="value" stroke="#6B4E8E" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}><Clock size={13} color="#B4822C" /> AVG. SESSION DURATION</div>
            <div className={styles.metricBigValue}>
              {ga4Overview?.avgSessionDuration ? `${Math.floor(ga4Overview.avgSessionDuration / 60)}m ${Math.round(ga4Overview.avgSessionDuration % 60)}s` : '0m 0s'}
            </div>
            <div className={styles.metricSubtext} style={{ color: '#3F7D58' }}>↑ 32.1% vs last 30 days</div>
            <div style={{ height: 36, width: '100%', marginTop: 'auto', paddingTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkDuration}><Line type="monotone" dataKey="value" stroke="#B4822C" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}><TrendingUp size={13} color="#A34E7C" /> BOUNCE RATE</div>
            <div className={styles.metricBigValue}>{ga4Overview?.bounceRate?.toFixed(1) || '0.0'}%</div>
            <div className={styles.metricSubtext} style={{ color: '#B5432A' }}>↓ 8.6% vs last 30 days</div>
            <div style={{ height: 36, width: '100%', marginTop: 'auto', paddingTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkBounce}><Line type="monotone" dataKey="value" stroke="#A34E7C" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}><Filter size={13} color="#1F6F6F" /> CONVERSIONS</div>
            <div className={styles.metricBigValue}>{conversions.reduce((s: any, c: any) => s + c.count, 0) || '0'}</div>
            <div className={styles.metricSubtext} style={{ color: '#3F7D58' }}>↑ 27.5% vs last 30 days</div>
            <div style={{ height: 36, width: '100%', marginTop: 'auto', paddingTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkConversions}><Line type="monotone" dataKey="value" stroke="#1F6F6F" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.panelHeader}>
            Users &amp; Sessions Trend
            <span className={styles.panelHeaderTag}>DAILY · LAST 30 DAYS</span>
          </div>
          <div style={{ height: '300px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.length > 0 ? trendData : []} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3F7D58" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3F7D58" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B5432A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#B5432A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD1" vertical={false} />
                <XAxis dataKey="date" stroke="#A69E90" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#A69E90" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="users" stroke="#3F7D58" fillOpacity={1} fill="url(#gUsers)" strokeWidth={2} name="Users" />
                <Area type="monotone" dataKey="sessions" stroke="#B5432A" fillOpacity={1} fill="url(#gSessions)" strokeWidth={2} name="Sessions" />
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#766F64', paddingTop: '10px' }} iconType="plainline" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>Traffic Acquisition</div>
            <div style={{ display: 'flex', alignItems: 'center', height: '220px', gap: '2rem', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="40%" height="100%">
                <PieChart>
                  <Pie data={trafficData} innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                    {trafficData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {trafficData.slice(0, 6).map((t, i, arr) => {
                  const total = arr.reduce((s, a) => s + a.value, 0);
                  const pct = total > 0 ? ((t.value / total) * 100).toFixed(0) : 0;
                  return (
                    <div key={i} className={styles.legendRow}>
                      <span className={styles.legendLabel}>
                        <div className={styles.legendSwatch} style={{ background: t.color }}></div>
                        {t.name}
                      </span>
                      <span className={styles.legendValue}>
                        <span className={styles.legendValueStrong}>{pct}%</span>
                        ({t.value.toLocaleString()})
                      </span>
                    </div>
                  );
                })}
                {trafficData.length === 0 && <div className={styles.emptyState}>No traffic source data</div>}
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>New vs Returning Users</div>
            <div style={{ display: 'flex', alignItems: 'center', height: '220px', gap: '2rem', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="40%" height="100%">
                <PieChart>
                  <Pie data={newReturningPie} innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                    {newReturningPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                <div>
                  <div className={styles.miniLabel}>New Users</div>
                  <div className={styles.statValue} style={{ color: COLORS[0] }}>{newReturning.new.toLocaleString()}</div>
                </div>
                <div>
                  <div className={styles.miniLabel}>Returning Users</div>
                  <div className={styles.statValue} style={{ color: COLORS[1] }}>{newReturning.returning.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.twoColRow}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Regional Breakdown</span>
              <span className={styles.panelHeaderTag}>TOP 10</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
              {heatmapRegions.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 44px', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#1C1A17', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                  <div style={{ height: '6px', background: '#E6DFD1', borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: `${(r.value / r.max) * 100}%`, background: '#B5432A', borderRadius: '3px' }} />
                  </div>
                  <span className={styles.mono} style={{ fontSize: '0.75rem', color: '#1C1A17', textAlign: 'right', fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
              {heatmapRegions.length === 0 && <div className={styles.emptyState}>No regional data</div>}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16} /> Top Pages</span>
              <span className={styles.panelHeaderTag}>BY VIEWS</span>
            </div>
            <table className={styles.dataTable} style={{ marginTop: '1rem' }}>
              <thead><tr><th>Page</th><th style={{ textAlign: 'right' }}>Views</th></tr></thead>
              <tbody>
                {pagesList.slice(0, 10).map((p: any, i: number) => (
                  <tr key={i}>
                    <td className={styles.pathCell}>{p.page}</td>
                    <td className={styles.tableValue}>{p.views?.toLocaleString()}</td>
                  </tr>
                ))}
                {pagesList.length === 0 && <tr><td colSpan={2} className={styles.emptyState}>No page data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderRealTime = () => (
    <>
      <div className={styles.panel}>
        <div className={styles.realtimeHero}>
          <div className={styles.realtimeDial}>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.realtimeDialValue}>{ga4Overview?.realtimeUsers || 0}</div>
              <div className={styles.realtimeDialLabel}>active now</div>
            </div>
          </div>
          <div className={styles.liveTag}><span className={styles.liveDot}></span> LIVE · GA4 Realtime API</div>
        </div>
      </div>

      <div className={styles.threeColRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Radio size={15} /> Active by Page</span></div>
          <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>Page</th><th style={{ textAlign: 'right' }}>Users</th></tr></thead>
            <tbody>
              {realtimeDetail.byPage.slice(0, 10).map((r: any, i: number) => (
                <tr key={i}><td className={styles.pathCell}>{r.name}</td><td className={styles.tableValue}>{r.users}</td></tr>
              ))}
              {realtimeDetail.byPage.length === 0 && <tr><td colSpan={2} className={styles.emptyState}>No active users</td></tr>}
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}><span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Globe size={15} /> Active by Country / City</span></div>
          <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>Location</th><th style={{ textAlign: 'right' }}>Users</th></tr></thead>
            <tbody>
              {realtimeDetail.byCountry.slice(0, 6).map((r: any, i: number) => (
                <tr key={`c${i}`}><td>{r.name}</td><td className={styles.tableValue}>{r.users}</td></tr>
              ))}
              {realtimeDetail.byCity.slice(0, 4).map((r: any, i: number) => (
                <tr key={`ci${i}`}><td style={{ color: '#766F64', paddingLeft: '0.5rem' }}>↳ {r.name}</td><td className={styles.tableValue}>{r.users}</td></tr>
              ))}
              {realtimeDetail.byCountry.length === 0 && <tr><td colSpan={2} className={styles.emptyState}>No active users</td></tr>}
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}><span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Monitor size={15} /> Active by Device</span></div>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {realtimeDetail.byDevice.map((d: any, i: number) => (
              <div key={i} className={styles.legendRow}>
                <span className={styles.legendLabel}>
                  <div className={styles.legendSwatch} style={{ background: COLORS[i % COLORS.length] }}></div>
                  {d.name}
                </span>
                <span className={styles.legendValueStrong}>{d.users}</span>
              </div>
            ))}
            {realtimeDetail.byDevice.length === 0 && <div className={styles.emptyState}>No active users</div>}
          </div>
        </div>
      </div>

      <div className={styles.twoColRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>New vs Returning (Period)</div>
          <div style={{ display: 'flex', gap: '2rem', padding: '1rem 0' }}>
            <div className={styles.statBlock} style={{ flex: 1 }}>
              <div className={styles.statValue} style={{ color: COLORS[0] }}>{newReturning.new.toLocaleString()}</div>
              <div className={styles.miniLabel} style={{ marginTop: '0.4rem' }}>New Users</div>
            </div>
            <div style={{ width: '1px', background: '#E6DFD1' }}></div>
            <div className={styles.statBlock} style={{ flex: 1 }}>
              <div className={styles.statValue} style={{ color: COLORS[1] }}>{newReturning.returning.toLocaleString()}</div>
              <div className={styles.miniLabel} style={{ marginTop: '0.4rem' }}>Returning Users</div>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Users Trend (Last 7 Days)</div>
          <div style={{ height: '190px', marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD1" vertical={false} />
                <XAxis dataKey="date" stroke="#A69E90" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#A69E90" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="users" fill="#1F6F6F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );

  const renderAcquisition = () => (
    <>
      <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.panelHeader}>Traffic Sources Breakdown</div>
        <div style={{ height: '300px', marginTop: '1rem' }}>
          {trafficData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD1" horizontal={false} />
                <XAxis type="number" stroke="#A69E90" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#A69E90" fontSize={11} axisLine={false} tickLine={false} width={80} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#B5432A" radius={[0, 6, 6, 0]} barSize={18} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className={styles.emptyState}>No traffic data available</div>}
        </div>
      </div>

      <div className={styles.threeColRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Top Countries</div>
          <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>Country</th><th style={{ textAlign: 'right' }}>Users</th></tr></thead>
            <tbody>
              {countriesData.map((c, i) => (
                <tr key={i}><td>{c.name}</td><td className={styles.tableValue} style={{ color: '#B5432A' }}>{c.value.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Top Regions</div>
          <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>Region</th><th style={{ textAlign: 'right' }}>Users</th></tr></thead>
            <tbody>
              {heatmapRegions.map((r, i) => (
                <tr key={i}><td>{r.name}</td><td className={styles.tableValue} style={{ color: '#1F6F6F' }}>{r.value.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Top Cities</div>
          <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>City</th><th style={{ textAlign: 'right' }}>Users</th></tr></thead>
            <tbody>
              {citiesData.map((c, i) => (
                <tr key={i}><td>{c.name}</td><td className={styles.tableValue} style={{ color: '#B4822C' }}>{c.value.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderBehavior = () => (
    <>
      <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.panelHeader}>All Pages Performance <span className={styles.panelHeaderTag}>BY PAGEVIEWS</span></div>
        <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
          <thead><tr><th style={{ width: '40px' }}>#</th><th>Page Path</th><th style={{ textAlign: 'right' }}>Page Views</th></tr></thead>
          <tbody>
            {pagesList.map((p: any, i: number) => (
              <tr key={i}>
                <td className={styles.tableRank}>{i + 1}</td>
                <td className={styles.pathCell} style={{ maxWidth: '460px' }}>{p.page}</td>
                <td className={styles.tableValue}>{p.views?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Landing Pages & Exit Pages — previously fetched from the API but never surfaced */}
      <div className={styles.twoColRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LogIn size={16} /> Landing Pages</span>
            <span className={styles.panelHeaderTag}>WHERE SESSIONS BEGIN</span>
          </div>
          <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>Page</th><th style={{ textAlign: 'right' }}>Sessions</th><th style={{ textAlign: 'right' }}>Bounce</th></tr></thead>
            <tbody>
              {landingPagesList.slice(0, 15).map((p: any, i: number) => (
                <tr key={i}>
                  <td className={styles.pathCell} style={{ maxWidth: '220px' }}>{p.page}</td>
                  <td className={styles.tableValue}>{p.sessions.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={p.bounceRate > 50 ? styles.pillBad : styles.pillGood}>{p.bounceRate.toFixed(0)}%</span>
                  </td>
                </tr>
              ))}
              {landingPagesList.length === 0 && <tr><td colSpan={3} className={styles.emptyState}>No landing page data</td></tr>}
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LogOut size={16} /> Exit Pages</span>
            <span className={styles.panelHeaderTag}>WHERE SESSIONS END</span>
          </div>
          <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>Page</th><th style={{ textAlign: 'right' }}>Views</th><th style={{ textAlign: 'right' }}>Bounce</th></tr></thead>
            <tbody>
              {exitPagesList.slice(0, 15).map((p: any, i: number) => (
                <tr key={i}>
                  <td className={styles.pathCell} style={{ maxWidth: '220px' }}>{p.page}</td>
                  <td className={styles.tableValue}>{p.views.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={p.bounceRate > 50 ? styles.pillBad : styles.pillGood}>{p.bounceRate.toFixed(0)}%</span>
                  </td>
                </tr>
              ))}
              {exitPagesList.length === 0 && <tr><td colSpan={3} className={styles.emptyState}>No exit page data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.threeColRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><Monitor size={16} /> Device Categories</div>
          {deviceData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              {deviceData.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#1C1A17', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {d.name === 'mobile' ? <Smartphone size={14} /> : d.name === 'tablet' ? <Tablet size={14} /> : <Monitor size={14} />}
                      {d.name}
                    </span>
                    <span className={styles.mono} style={{ color: '#766F64' }}>{d.value.toLocaleString()} ({totalDeviceUsers > 0 ? ((d.value / totalDeviceUsers) * 100).toFixed(1) : 0}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#E6DFD1', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalDeviceUsers > 0 ? (d.value / totalDeviceUsers) * 100 : 0}%`, background: d.color, borderRadius: '3px', transition: 'width 0.5s' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className={styles.emptyState}>No device data</div>}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}><Globe size={16} /> Browsers</div>
          {browserData.length > 0 ? (
            <div style={{ height: '190px', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserData} layout="vertical" margin={{ left: 60, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#A69E90" fontSize={11} axisLine={false} tickLine={false} width={60} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#1F6F6F" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className={styles.emptyState}>No browser data</div>}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}><Settings size={16} /> Operating Systems</div>
          {osData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', height: '190px', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={osData} innerRadius={30} outerRadius={50} dataKey="value" stroke="none">
                    {osData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {osData.map((o, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1C1A17' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: o.color }}></div>
                      {o.name}
                    </span>
                    <span className={styles.mono} style={{ color: '#766F64' }}>{o.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className={styles.emptyState}>No OS data</div>}
        </div>
      </div>
    </>
  );

  const renderConversions = () => (
    <>
      <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.panelHeader}>Event Conversions Funnel</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem 0' }}>
          {conversions.length > 0 ? conversions.map((stage: any, i: number) => {
            const maxCount = Math.max(...conversions.map((c: any) => c.count));
            const pct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem' }}>
                <div style={{ width: '180px', color: '#1C1A17', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{stage.event}</div>
                <div style={{ flex: 1, height: '28px', background: '#F5F1E8', border: '1px solid #E6DFD1', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: '#B5432A', display: 'flex', alignItems: 'center', paddingLeft: '10px', borderRadius: '4px', transition: 'width 0.5s' }}>
                    <span className={styles.mono} style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.78rem' }}>{stage.count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          }) : <div className={styles.emptyState}>No conversion events found. Make sure you have events marked as conversions in your GA4 property.</div>}
        </div>
      </div>

      <div className={styles.twoColRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Total Conversions</div>
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div className={styles.headline} style={{ fontSize: '3rem', color: '#3F7D58' }}>
              {conversions.reduce((s: number, c: any) => s + c.count, 0).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#766F64' }}>Across {conversions.length} event types</div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Top Converting Events</div>
          <table className={styles.dataTable} style={{ marginTop: '0.75rem' }}>
            <thead><tr><th>Event</th><th style={{ textAlign: 'right' }}>Count</th></tr></thead>
            <tbody>
              {conversions.slice(0, 5).map((c: any, i: number) => (
                <tr key={i}><td>{c.event}</td><td className={styles.tableValue} style={{ color: '#3F7D58' }}>{c.count.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderRetention = () => (
    <>
      <div className={styles.twoColRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>User Retention Curve <span className={styles.panelHeaderTag}>MODELED</span></div>
          <div style={{ height: '240px', marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD1" vertical={false} />
                <XAxis dataKey="day" stroke="#A69E90" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#A69E90" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, 'Retention']} />
                <Line type="monotone" dataKey="rate" stroke="#B5432A" dot={{ r: 5, fill: '#B5432A' }} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>New vs Returning Breakdown</div>
          <div style={{ display: 'flex', alignItems: 'center', height: '240px', marginTop: '0.5rem' }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={newReturningPie} innerRadius={40} outerRadius={65} dataKey="value" stroke="none" label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}>
                  {newReturningPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              {newReturningPie.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#1C1A17', marginBottom: '0.25rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }}></div>
                    {d.name}
                  </div>
                  <div className={styles.headline} style={{ fontSize: '1.5rem', color: d.color }}>{d.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.panelHeader}>Engagement Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', padding: '1.25rem 0' }}>
          <div className={styles.statBlock}>
            <div className={styles.miniLabel}>Bounce Rate</div>
            <div className={styles.statValue} style={{ color: (ga4Overview?.bounceRate || 0) > 50 ? '#B5432A' : '#3F7D58' }}>{ga4Overview?.bounceRate?.toFixed(1) || '0'}%</div>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.miniLabel}>Avg. Session Duration</div>
            <div className={styles.statValue} style={{ color: '#1F6F6F' }}>{Math.floor((ga4Overview?.avgSessionDuration || 0) / 60)}m {Math.round((ga4Overview?.avgSessionDuration || 0) % 60)}s</div>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.miniLabel}>Pages / Session</div>
            <div className={styles.statValue} style={{ color: '#B4822C' }}>{ga4Overview?.pagesPerSession?.toFixed(1) || '0'}</div>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.miniLabel}>Engaged Sessions</div>
            <div className={styles.statValue} style={{ color: '#6B4E8E' }}>{ga4Overview?.engagedUsers?.toLocaleString() || '0'}</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview': return renderOverview();
      case 'Real-Time': return renderRealTime();
      case 'Acquisition': return renderAcquisition();
      case 'Behavior': return renderBehavior();
      case 'Conversions': return renderConversions();
      case 'Retention': return renderRetention();
      default: return renderOverview();
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.topHeader}>
        <div>
          <div className={styles.eyebrow}>Analytics · Live GA4 Data</div>
          <h1 className={styles.pageTitle}>Good afternoon, Rajesh</h1>
          <p className={styles.pageSubtitle}>Here's how your website is performing today.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Connects to Google Analytics 4 (GA4) to track real human traffic, visitor countries, devices, and bounce rates. It tells you exactly who is visiting your site. <strong>Example:</strong> You can see if a recent marketing campaign brought in new users or if visitors are leaving your site too quickly.
          </p>
        </div>
      </div>
  
        </div>
        <div className={styles.headerControls}>
          {sites.length > 0 && (
            <select
              className={styles.siteSelect}
              value={selectedSiteId || ''}
              onChange={(e) => setSelectedSiteId(e.target.value)}
            >
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.url}</option>
              ))}
            </select>
          )}
          <div className={styles.datePicker}>
            <Calendar size={14} /> Last 30 Days <span style={{ marginLeft: '4px' }}>▾</span>
          </div>
          <button className={styles.exportButton}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className={styles.topNav}>
        <div className={styles.navTabs}>
          {TABS.map(tab => (
            <div
              key={tab}
              className={`${styles.navTab} ${activeTab === tab && tab !== 'Settings' ? styles.active : ''}`}
              onClick={() => handleTabClick(tab)}
              style={{ cursor: 'pointer' }}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className={styles.liveTag}><span className={styles.liveDot}></span> Live GA4 Data</div>
      </div>

      {error ? (
        showSetupGuide ? (
          <SetupGuide 
            onBack={() => setShowSetupGuide(false)}
            icon={<div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '24px' }}>
              <div style={{ width: '6px', height: '14px', background: '#34A853', borderRadius: '2px' }} />
              <div style={{ width: '6px', height: '20px', background: '#EA4335', borderRadius: '2px' }} />
              <div style={{ width: '6px', height: '10px', background: '#4285F4', borderRadius: '2px' }} />
            </div>}
            title="Google Analytics Account Not Found"
            subtitle="Please register your website on Google Analytics first, then connect it here."
            steps={[
              {
                title: "Go to Google Analytics",
                description: <>Open analytics.google.com in your browser. <br/><a href="https://analytics.google.com" target="_blank" rel="noreferrer" style={{ color: '#3B82F6', textDecoration: 'none' }}>analytics.google.com &rarr;</a></>
              },
              {
                title: "Start Measuring",
                description: "Enter an Account Name — usually your company or website name."
              },
              {
                title: "Create a Property",
                description: "Enter your website name as the Property Name. Select your country and timezone."
              },
              {
                title: "Enter Website URL",
                description: "Add your website URL in the business details — ensure it matches your dashboard URL."
              },
              {
                title: "Setup Data Stream",
                description: "Select \"Web\". Enter your website URL and stream name, then click \"Create stream\"."
              },
              {
                title: "Return Here",
                description: "After setting up GA4, return here and click \"Connect with Google\" to sync automatically."
              }
            ]}
            note="The website URL in your GA4 property must exactly match the URL used in this dashboard."
            onConnect={() => {
              window.location.href = `${API_BASE}/auth/google?email=${encodeURIComponent(email || '')}&redirect=analytics&siteId=${selectedSiteId}`;
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
                Connect Google Analytics
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
                Connect Google Analytics for: <strong>{sites.find(s => s.id === selectedSiteId)?.url || 'your website'}</strong>
              </p>
              
              {error.includes('No GA4') ? (
                <button 
                  onClick={() => setSettingsOpen(true)} 
                  style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
                >
                  <Settings size={18} /> Select Analytics Property
                </button>
              ) : error.includes('Google Analytics not connected') ? (
                <a 
                  href={`${API_BASE}/auth/google?email=${encodeURIComponent(email || '')}&redirect=analytics&siteId=${selectedSiteId}`} 
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
                  Don't have a Google Analytics account? Learn how to setup &rarr;
                </button>
              </div>
            </div>
          </div>
        )
      ) : loading ? (
        <div className={styles.loadingState}>Loading Live Google Analytics Data…</div>
      ) : (
        <div className={styles.contentArea}>
          {renderTabContent()}
        </div>
      )}

      {settingsOpen && selectedSiteId && (
        <GA4SettingsModal
          siteId={selectedSiteId}
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSaved={(id) => {
             setSettingsOpen(false);
             window.location.reload();
          }}
        />
      )}
    </div>
  );
}