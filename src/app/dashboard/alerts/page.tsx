'use client';

import { useState, useEffect } from 'react';
import { Info, Bell, AlertTriangle, TrendingDown, ArrowDownRight, ShieldAlert,
  Link as LinkIcon, Activity, CheckCircle, Clock, Trash2, Settings, Zap} from 'lucide-react';
import styles from '../search-console/page.module.css';

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  source: string;
  isRead: boolean;
  createdAt: string;
}

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitesAndAlerts = async () => {
      try {
        const sitesRes = await fetch('http://localhost:4000/api/sites');
        const sites = await sitesRes.json();
        
        if (sites && sites.length > 0) {
          const sId = sites[0].id;
          setSiteId(sId);
          
          const alertsRes = await fetch(`http://localhost:4000/api/sites/${sId}/alerts`);
          if (alertsRes.ok) {
            const data = await alertsRes.json();
            setAlerts(data);
          }
        }
      } catch (error) {
        console.error('Failed to load alerts:', error);
      }
    };

    fetchSitesAndAlerts();
  }, []);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const markAllRead = async () => {
    if (!siteId) return;
    try {
      await fetch(`http://localhost:4000/api/sites/${siteId}/alerts/mark-read`, { method: 'POST' });
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const clearAll = () => {
    setAlerts([]);
  };

  const markAsRead = async (id: string, isRead: boolean) => {
    if (isRead || !siteId) return;
    try {
      await fetch(`http://localhost:4000/api/sites/${siteId}/alerts/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: id })
      });
      setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (e) { console.error(e); }
  };

  const simulateUptimeCheck = async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${siteId}/alerts/simulate-uptime`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts([data.alert, ...alerts]);
        alert(data.message);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getIconForAlert = (type: string, source: string) => {
    if (source === 'UPTIME') return <ShieldAlert size={20} color="#EF4444" />;
    if (type === 'critical') return <TrendingDown size={20} color="#EF4444" />;
    if (type === 'warning') return <Activity size={20} color="#F59E0B" />;
    return <Bell size={20} color="#3B82F6" />;
  };

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}>
            <Bell size={24} color="#F59E0B" /> SEO Alerts & Notifications
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Stay on top of critical changes to your traffic, rankings, and website health.
          </p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             This page continuously monitors your website's uptime and critical SEO health. It sends you instant notifications if anything goes wrong. <strong>Example:</strong> If your server goes down (503 error), you'll get an immediate alert here so you can fix it before Google drops your rankings.
          </p>
        </div>
      </div>
  
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={simulateUptimeCheck}
            disabled={loading}
            style={{ 
              padding: '0.6rem 1rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
              color: '#0F172A', border: 'none', borderRadius: '6px', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 
            }}>
            {loading ? 'Checking...' : <><Zap size={16} /> Run Uptime Check</>}
          </button>
          <button style={{ padding: '0.6rem 1rem', background: '#F8FAFC', color: '#0F172A', border: '1px solid #0F172A', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Settings size={16} /> Configure
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        {/* MAIN ALERTS LIST */}
        <div className={styles.panel} style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #0F172A' }}>
          <div className={styles.panelHeader} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Inbox</span>
              {unreadCount > 0 && (
                <span style={{ background: '#EF4444', color: '#0F172A', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  {unreadCount} New
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: '#3B82F6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Mark all read
              </button>
              <button onClick={clearAll} style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={14} /> Clear all
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>
                <CheckCircle size={48} color="#10B981" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A' }}>You're all caught up!</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No new alerts or notifications at this time.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  onClick={() => markAsRead(alert.id, alert.isRead)}
                  style={{ 
                    padding: '1.25rem 1.5rem', 
                    borderBottom: '1px solid #0F172A', 
                    display: 'flex', 
                    gap: '1rem', 
                    alignItems: 'flex-start',
                    background: alert.isRead ? 'transparent' : '#EFF6FF',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: alert.type === 'critical' ? '#FEF2F2' : alert.type === 'warning' ? '#FFFBEB' : '#EFF6FF'
                  }}>
                    {getIconForAlert(alert.type, alert.source)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: alert.isRead ? '#FFFFFF' : '#1E3A8A', fontWeight: alert.isRead ? 500 : 700 }}>
                        {alert.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                      {alert.description}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#3B82F6', marginTop: '16px' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className={styles.panel} style={{ background: '#FFFFFF', border: '1px solid #0F172A' }}>
            <div className={styles.panelHeader} style={{ marginBottom: '1rem', color: '#0F172A' }}>
              Alert Summary
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#FEF2F2', borderRadius: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}><AlertTriangle size={16}/> Critical</span>
                <span style={{ color: '#EF4444', fontWeight: 700 }}>{criticalCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#FFFBEB', borderRadius: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontSize: '0.85rem', fontWeight: 600 }}><Activity size={16}/> Warnings</span>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>{warningCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#EFF6FF', borderRadius: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontSize: '0.85rem', fontWeight: 600 }}><Bell size={16}/> Info</span>
                <span style={{ color: '#3B82F6', fontWeight: 700 }}>{infoCount}</span>
              </div>
            </div>
          </div>

          <div className={styles.panel} style={{ background: '#FFFFFF', border: '1px solid #0F172A' }}>
            <div className={styles.panelHeader} style={{ marginBottom: '1rem', color: '#0F172A' }}>
              Pro Tip
            </div>
            <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              Uptime checks run every 5 minutes. Critical alerts like Server Down (503) or Not Found (404) are dispatched to your phone via WhatsApp immediately.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
