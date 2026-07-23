"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, CheckCircle, BrainCircuit, Play, Info, Clock, Loader2, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const severityConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  Critical: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Critical' },
  High: { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'High' },
  Medium: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Medium' },
  Low: { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Low' },
};

export default function SmartActionsFeed({ siteId }: { siteId: string }) {
  const { data: anomalies, mutate } = useSWR(
    siteId ? `/anomalies/${siteId}` : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  const [executing, setExecuting] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);

  const handleExecute = async (actionId: string) => {
    setExecuting(actionId);
    toast.loading('AI is applying the fix...', { id: actionId });

    try {
      const res = await fetch(`${API_BASE}/anomalies/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId })
      });

      if (!res.ok) throw new Error('Failed to execute');

      toast.success('Fix applied successfully!', { id: actionId });
      mutate();
    } catch (err) {
      toast.error('Failed to apply fix.', { id: actionId });
    } finally {
      setExecuting(null);
    }
  };

  const triggerScan = async () => {
    setIsScanning(true);
    toast.loading('Running Omnichannel AI Scan...', { id: 'scan' });
    try {
      await fetch(`${API_BASE}/anomalies/${siteId}/scan`, { method: 'POST' });
      toast.success('Scan complete! Results are in.', { id: 'scan' });
      setLastScan(new Date());
      mutate();
    } catch (err) {
      toast.error('Scan failed. Please try again.', { id: 'scan' });
    } finally {
      setIsScanning(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!anomalies) {
    return (
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px',
        padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
      }}>
        <Loader2 size={20} color="#3B82F6" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Loading AI Action Feed...</span>
      </div>
    );
  }

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
            padding: '10px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BrainCircuit size={22} color="#4F46E5" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              AI Action Feed
              <span style={{
                background: '#EEF2FF', color: '#4F46E5', fontSize: '0.65rem',
                fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                border: '1px solid #C7D2FE', letterSpacing: '0.5px'
              }}>
                OMNICHANNEL
              </span>
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
              AI analyzes GA4 + GSC + Lighthouse + Clarity together
            </p>
          </div>

          {/* Tooltip */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              style={{
                background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '50%',
                width: 28, height: 28, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}
            >
              <Info size={14} color="#64748B" />
            </button>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute', top: '100%', left: '-120px', marginTop: '8px',
                  background: '#0F172A', color: '#F8FAFC', padding: '12px 16px',
                  borderRadius: '10px', fontSize: '0.8rem', lineHeight: 1.5,
                  width: '280px', zIndex: 100, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
              >
                <strong>How does this work?</strong><br />
                Our AI scans your website data from Google Analytics, Search Console, Lighthouse &amp; Clarity. It finds problems across platforms and suggests one-click fixes.
                <div style={{
                  position: 'absolute', top: '-6px', left: '130px',
                  width: 12, height: 12, background: '#0F172A',
                  transform: 'rotate(45deg)'
                }} />
              </motion.div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastScan && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94A3B8' }}>
              <Clock size={12} /> Last scan: {formatTime(lastScan)}
            </span>
          )}
          <button
            onClick={triggerScan}
            disabled={isScanning}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: isScanning ? '#E2E8F0' : 'linear-gradient(135deg, #4F46E5, #6366F1)',
              color: isScanning ? '#64748B' : '#FFFFFF',
              border: 'none', padding: '0.5rem 1.25rem', borderRadius: '10px',
              fontSize: '0.85rem', fontWeight: 600, cursor: isScanning ? 'not-allowed' : 'pointer',
              boxShadow: isScanning ? 'none' : '0 4px 12px -2px rgba(79, 70, 229, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            {isScanning ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Scanning...
              </>
            ) : (
              <>
                <Play size={16} /> Run Scan Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan Progress Bar */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginBottom: '1rem' }}
        >
          <div style={{
            background: '#F1F5F9', borderRadius: '8px', padding: '12px 16px',
            border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Analyzing all data sources...
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Please wait</span>
              </div>
              <div style={{ height: 6, background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: ['0%', '70%', '90%', '100%'] }}
                  transition={{ duration: 8, ease: 'easeInOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #4F46E5, #7C3AED)', borderRadius: '3px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                {['GA4', 'GSC', 'Lighthouse', 'Clarity', 'Technical'].map((src, i) => (
                  <motion.span
                    key={src}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ delay: i * 1.2, duration: 1.5, repeat: Infinity }}
                    style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}
                  >
                    {src}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {anomalies.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem 2rem',
          background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1'
        }}>
          <div style={{
            width: 64, height: 64, background: '#ECFDF5', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Shield size={32} color="#10B981" />
          </div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
            All Clear — Your Site is Healthy! 🎉
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            No issues detected across all platforms. Our AI will continue monitoring and alert you if anything changes.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {anomalies.map((anomaly: any) => {
              const sev = severityConfig[anomaly.severity] || severityConfig.Medium;
              const isExpanded = expandedAnomaly === anomaly.id;

              return (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: `1px solid ${sev.border}`,
                    borderLeft: `4px solid ${sev.color}`,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {/* Anomaly Header */}
                  <div
                    onClick={() => setExpandedAnomaly(isExpanded ? null : anomaly.id)}
                    style={{
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      transition: 'background 0.2s',
                    }}
                  >
                    {/* Severity Indicator */}
                    <div style={{
                      background: sev.bg, padding: '8px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AlertTriangle size={18} color={sev.color} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                          {anomaly.type.replace(/_/g, ' ')}
                        </span>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                          borderRadius: '100px', background: sev.bg, color: sev.color,
                          border: `1px solid ${sev.border}`, textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {sev.label}
                        </span>
                        {anomaly.actions?.filter((a: any) => !a.isExecuted).length > 0 && (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                            borderRadius: '100px', background: '#EFF6FF', color: '#3B82F6',
                            border: '1px solid #BFDBFE'
                          }}>
                            {anomaly.actions.filter((a: any) => !a.isExecuted).length} fixes available
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                        {anomaly.description}
                      </p>
                    </div>

                    <div style={{ flexShrink: 0, color: '#94A3B8', marginTop: '4px' }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expandable Actions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: '0 1.25rem 1.25rem',
                          borderTop: '1px solid #F1F5F9'
                        }}>
                          <h4 style={{
                            margin: '1rem 0 0.75rem', fontSize: '0.8rem', fontWeight: 700,
                            color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '6px',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                          }}>
                            <Zap size={14} /> AI Recommended Fixes
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {anomaly.actions?.map((action: any) => (
                              <div
                                key={action.id}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  gap: '12px', padding: '12px 16px',
                                  background: action.isExecuted ? '#F0FDF4' : '#F8FAFC',
                                  borderRadius: '10px',
                                  border: `1px solid ${action.isExecuted ? '#BBF7D0' : '#E2E8F0'}`,
                                  transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{
                                    margin: 0, fontSize: '0.85rem', fontWeight: 600,
                                    color: action.isExecuted ? '#16A34A' : '#0F172A',
                                    textDecoration: action.isExecuted ? 'line-through' : 'none'
                                  }}>
                                    {action.task}
                                  </p>
                                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                                    Impact: {action.impact}
                                  </p>
                                </div>
                                <button
                                  disabled={action.isExecuted || executing === action.id}
                                  onClick={(e) => { e.stopPropagation(); handleExecute(action.id); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '0.4rem 1rem', borderRadius: '8px',
                                    fontSize: '0.8rem', fontWeight: 600, border: 'none',
                                    cursor: action.isExecuted ? 'default' : executing === action.id ? 'wait' : 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                    ...(action.isExecuted
                                      ? { background: '#D1FAE5', color: '#059669' }
                                      : executing === action.id
                                        ? { background: '#E2E8F0', color: '#64748B' }
                                        : { background: '#4F46E5', color: '#FFFFFF', boxShadow: '0 2px 8px -2px rgba(79, 70, 229, 0.5)' }
                                    )
                                  }}
                                >
                                  {action.isExecuted ? (
                                    <><CheckCircle size={14} /> Fixed</>
                                  ) : executing === action.id ? (
                                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Fixing...</>
                                  ) : (
                                    <><Zap size={14} /> Apply Fix</>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Spin animation keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
