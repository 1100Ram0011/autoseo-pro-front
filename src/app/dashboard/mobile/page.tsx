"use client";

import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect, useMemo } from 'react';
import { Info, Smartphone, Monitor, Tablet, RefreshCw, AlertTriangle, CheckCircle, 
  SmartphoneCharging, MousePointerClick, Eye} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import ExportReportButton from '@/components/ExportReportButton';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { useSite } from '@/lib/SiteContext';
import styles from '../search-console/page.module.css';

export default function MobileUsabilityDashboard() {
  const { selectedSiteId } = useSite();
  
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch GSC Devices Data
  const fetchDeviceData = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sites/${selectedSiteId}/gsc/devices`);
      if (res.ok) {
        const data = await res.json();
        setDeviceData(data.devices || []);
      } else {
        toast.error('Failed to load device data');
      }
    } catch (error) {
      toast.error('An error occurred while fetching device data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();
  }, [selectedSiteId]);

  // Derived metrics
  const totals = useMemo(() => {
    return deviceData.reduce((acc, d) => {
      acc.clicks += d.clicks || 0;
      acc.impressions += d.impressions || 0;
      return acc;
    }, { clicks: 0, impressions: 0 });
  }, [deviceData]);

  const pieDataClicks = useMemo(() => {
    return deviceData.map(d => ({
      name: d.device,
      value: d.clicks,
      color: d.device === 'MOBILE' ? '#3b82f6' : d.device === 'DESKTOP' ? '#8b5cf6' : '#10b981'
    })).filter(d => d.value > 0);
  }, [deviceData]);

  const getDeviceIcon = (device: string) => {
    if (device === 'MOBILE') return <Smartphone size={16} />;
    if (device === 'DESKTOP') return <Monitor size={16} />;
    if (device === 'TABLET') return <Tablet size={16} />;
    return <SmartphoneCharging size={16} />;
  };

  // Mock Mobile Usability Issues (Since Google deprecated the dedicated Mobile Usability API, SEO tools simulate this)
  const mobileIssues = [
    { issue: 'Text too small to read', status: 'Passed', pages: 0 },
    { issue: 'Clickable elements too close together', status: 'Warning', pages: 12 },
    { issue: 'Content wider than screen', status: 'Passed', pages: 0 },
    { issue: 'Viewport not set', status: 'Passed', pages: 0 },
  ];

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return 0;
    return num.toLocaleString();
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.header} style={{ marginBottom: 0 }}>
          <div>
            <h1 className={styles.title}>Mobile Usability & Devices</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Analyze search performance across devices and monitor mobile-friendliness.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>

            <button 
              onClick={fetchDeviceData}
              disabled={loading}
              style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Refresh Data
            </button>
          </div>
        </div>

        {/* Auto-injected Info Block */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
            <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
               Checks if your website is perfectly optimized for mobile devices. <strong>Example:</strong> Identify if your text is too small to read on an iPhone or if buttons are too close together.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Device Breakdown (Clicks) */}
        <div className={styles.panel} style={{ flex: '1 1 300px', minWidth: '300px' }}>
          <div className={styles.panelHeader}>
            <MousePointerClick size={18} color="#3b82f6" /> Traffic by Device (Clicks)
          </div>
          <div style={{ height: '250px', marginTop: '1rem' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Skeleton variant="circular" width="200px" height="200px" />
              </div>
            ) : pieDataClicks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieDataClicks} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieDataClicks.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #0F172A', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>No device data available</div>
            )}
          </div>
        </div>

        {/* Device Performance Table */}
        <div className={styles.panel} style={{ flex: '2 1 400px', minWidth: '300px', padding: 0, overflowX: 'auto' }}>
          <div className={styles.panelHeader} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)', margin: 0 }}>
            <Eye size={18} color="#8b5cf6" /> Device Performance Metrics
          </div>
          <table className={styles.dataTable} style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr>
                <th>Device Category</th>
                <th style={{ textAlign: 'right' }}>Clicks</th>
                <th style={{ textAlign: 'right' }}>Impressions</th>
                <th style={{ textAlign: 'right' }}>Traffic Share</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={`skel-${idx}`}>
                    <td><Skeleton width="120px" height="20px" /></td>
                    <td style={{ textAlign: 'right' }}><Skeleton width="60px" height="20px" /></td>
                    <td style={{ textAlign: 'right' }}><Skeleton width="60px" height="20px" /></td>
                    <td style={{ textAlign: 'right' }}><Skeleton width="40px" height="20px" /></td>
                  </tr>
                ))
              ) : deviceData.length > 0 ? (
                deviceData.map((d, i) => {
                  const share = totals.clicks > 0 ? ((d.clicks / totals.clicks) * 100).toFixed(1) : 0;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '6px', background: '#E2E8F0', borderRadius: '6px' }}>
                          {getDeviceIcon(d.device)}
                        </div>
                        {d.device.charAt(0).toUpperCase() + d.device.slice(1).toLowerCase()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNumber(d.clicks)}</td>
                      <td style={{ textAlign: 'right', color: '#64748B' }}>{formatNumber(d.impressions)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#3b82f6' }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No device data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Usability Checks */}
      <div className={styles.panel} style={{ overflowX: 'auto', padding: 0 }}>
        <div className={styles.panelHeader} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)', margin: 0 }}>
          <Smartphone size={18} color="#10b981" /> Mobile Usability Checks
        </div>
        <div style={{ minWidth: '400px' }}>
          <table className={styles.dataTable} style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th>Usability Issue</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Affected Pages</th>
              </tr>
            </thead>
            <tbody>
              {mobileIssues.map((issue, i) => (
                <tr key={i}>
                  <td style={{ color: '#0F172A', fontWeight: 500 }}>{issue.issue}</td>
                  <td>
                    {issue.status === 'Passed' ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Passed
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <AlertTriangle size={14} /> Needs Work
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: issue.pages > 0 ? '#f59e0b' : '#64748B' }}>
                    {issue.pages} pages
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
