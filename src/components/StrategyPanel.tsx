import React, { useState } from 'react';
import { 
  Monitor, Smartphone, Activity, AlertTriangle, CheckCircle, 
  Info, Zap, FileText, ChevronDown, ChevronRight, X, Clock, Database, Globe, Lock, Code, ShieldCheck, AlertCircle, BarChart2, Server
} from 'lucide-react';

const getScoreColor = (score: number) => {
  if (!score) return '#94a3b8';
  if (score >= 90) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatMs = (ms: number) => {
  if (!ms) return '0 ms';
  if (ms >= 1000) return (ms / 1000).toFixed(1) + ' s';
  return Math.round(ms) + ' ms';
};

const MetricCard = ({ label, metric, isGood }: { label: string, metric: any, isGood?: boolean }) => {
  if (!metric) return <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}><div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>{label}</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#94A3B8' }}>-</div></div>;
  const ratingColor = metric.rating === 'good' ? '#10b981' : metric.rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
  const color = isGood !== undefined ? (isGood ? '#10b981' : '#ef4444') : ratingColor;
  
  return (
    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
        <Activity size={12} color={color} /> {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: color }}>{metric.displayValue || formatMs(metric.value)}</div>
        {metric.value && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatMs(metric.value)}</div>}
      </div>
    </div>
  );
};

const ProgressBar = ({ label, score }: { label: string, score: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
    <div style={{ width: '120px', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{label}</div>
    <div style={{ flex: 1, height: '6px', background: '#E2E8F0', borderRadius: '3px', margin: '0 1rem', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${score || 0}%`, background: getScoreColor(score) }}></div>
    </div>
    <div style={{ width: '30px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: getScoreColor(score) }}>{score || 0}</div>
  </div>
);

const DistributionBar = ({ dist, label, color }: { dist: any, label: string, color: string }) => {
  if (!dist) return null;
  const percent = Math.round(dist.proportion * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: percent, minWidth: percent > 0 ? '20px' : '0' }}>
      <div style={{ height: '8px', background: color, borderRadius: '4px', opacity: percent === 0 ? 0 : 1 }}></div>
      {percent > 0 && <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '4px', textAlign: 'center' }}>{percent}% {label}</div>}
    </div>
  );
};

const FieldDataCard = ({ title, metric, originMetric }: { title: string, metric: any, originMetric?: any }) => {
  if (!metric && !originMetric) return null;
  
  const renderMetric = (m: any, type: string) => {
    if (!m) return null;
    const categoryColor = m.category === 'FAST' ? '#10b981' : m.category === 'AVERAGE' ? '#f59e0b' : '#ef4444';
    return (
      <div style={{ marginTop: '0.5rem', background: type === 'origin' ? 'rgba(255,255,255,0.03)' : 'transparent', padding: type === 'origin' ? '0.5rem' : '0', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{type === 'origin' ? 'Origin (Domain-wide)' : 'This URL'}</span>
          <span style={{ fontWeight: 700, color: categoryColor }}>{title.includes('SCORE') ? m.p75 : formatMs(m.p75)}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
          {m.distributions?.map((d: any, i: number) => {
            const labels = ['Fast', 'Avg', 'Slow'];
            const colors = ['#10b981', '#f59e0b', '#ef4444'];
            return <DistributionBar key={i} dist={d} label={labels[i]} color={colors[i]} />;
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</div>
      {renderMetric(metric, 'url')}
      {renderMetric(originMetric, 'origin')}
    </div>
  );
};

export const StrategyPanel = ({ data, strategy }: { data: any, strategy: string }) => {
  const [reportView, setReportView] = useState<'overview' | 'field' | 'opportunities' | 'seo' | 'a11y' | 'bestpractices' | 'diagnostics'>('overview');
  const [expandedOpp, setExpandedOpp] = useState<string | null>(null);
  const [showPassedAudits, setShowPassedAudits] = useState(false);
  const [metricFilter, setMetricFilter] = useState<'All' | 'FCP' | 'LCP' | 'TBT' | 'CLS'>('All');
  
  if (!data) return <div style={{ padding: '2rem', color: '#0F172A', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>No data for {strategy}</div>;

  const scores = data.scores || {};
  const lab = data.coreWebVitals?.lab || {};
  const field = data.coreWebVitals?.field || null;
  const originField = data.coreWebVitals?.originField || null;
  
  // Mapping of metric to relevant opportunity/diagnostic IDs
  const metricMapping: Record<string, string[]> = {
    'FCP': ['render-blocking-resources', 'server-response-time', 'unminified-css', 'unminified-javascript', 'uses-text-compression'],
    'LCP': ['render-blocking-resources', 'server-response-time', 'uses-optimized-images', 'uses-webp-images', 'uses-responsive-images', 'efficiently-encode-images', 'modern-image-formats'],
    'TBT': ['bootup-time', 'unused-javascript', 'mainthread-work-breakdown', 'third-party-summary', 'dom-size', 'unused-css-rules', 'script-treemap-data'],
    'CLS': ['unsized-images', 'image-aspect-ratio']
  };

  // Sort opportunities by highest wastedBytes first, and filter based on metricFilter
  const opps = [...(data.opportunities || [])]
    .filter(opp => metricFilter === 'All' || metricMapping[metricFilter]?.includes(opp.id))
    .sort((a, b) => (b.wastedBytes || 0) - (a.wastedBytes || 0));
  
  const diag = data.diagnostics || {};
  const audits = data.audits || {};
  
  const countIssues = (category: any[]) => category ? category.filter((a: any) => !a.passed).length : 0;
  
  const perfIssues = opps.length;
  const seoIssues = countIssues(audits.seo);
  const a11yIssues = countIssues(audits.accessibility);
  const bpIssues = countIssues(audits.bestPractices);
  const totalIssues = perfIssues + seoIssues + a11yIssues + bpIssues;

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: '#F1F5F9', padding: '10px', borderRadius: '8px', display: 'flex' }}>
            {strategy === 'mobile' ? <Smartphone size={24} color="#3b82f6" /> : <Monitor size={24} color="#3b82f6" />}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>{strategy}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{totalIssues} issues found</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '60px', height: '60px' }}>
            <svg width="60" height="60" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
              {scores.performance && <circle cx="50" cy="50" r="40" fill="transparent" stroke={getScoreColor(scores.performance)} strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (scores.performance / 100) * 251.2, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />}
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: getScoreColor(scores.performance) }}>
              {scores.performance || '-'}
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Performance</div>
        </div>
      </div>

      {/* Internal Navigation Pills */}
      <div style={{ padding: '0 1.5rem', display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setReportView('overview')} style={{ background: reportView === 'overview' ? '#F1F5F9' : 'transparent', color: reportView === 'overview' ? '#0F172A' : '#64748B', border: '1px solid #E2E8F0', borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
          Overview
        </button>
        <button onClick={() => setReportView('field')} style={{ background: reportView === 'field' ? '#F1F5F9' : 'transparent', color: reportView === 'field' ? '#0F172A' : '#64748B', border: '1px solid #E2E8F0', borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
          Field Data (CrUX)
        </button>
        <button onClick={() => setReportView('opportunities')} style={{ background: reportView === 'opportunities' ? '#F1F5F9' : 'transparent', color: reportView === 'opportunities' ? '#0F172A' : '#64748B', border: '1px solid #E2E8F0', borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
          Opportunities <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '100px' }}>{perfIssues}</span>
        </button>
        <button onClick={() => setReportView('seo')} style={{ background: reportView === 'seo' ? '#F1F5F9' : 'transparent', color: reportView === 'seo' ? '#0F172A' : '#64748B', border: '1px solid #E2E8F0', borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
          SEO <span style={{ background: seoIssues > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: seoIssues > 0 ? '#ef4444' : '#10b981', padding: '2px 6px', borderRadius: '100px' }}>{seoIssues}</span>
        </button>
        <button onClick={() => setReportView('a11y')} style={{ background: reportView === 'a11y' ? '#F1F5F9' : 'transparent', color: reportView === 'a11y' ? '#0F172A' : '#64748B', border: '1px solid #E2E8F0', borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
          Accessibility <span style={{ background: a11yIssues > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: a11yIssues > 0 ? '#ef4444' : '#10b981', padding: '2px 6px', borderRadius: '100px' }}>{a11yIssues}</span>
        </button>
        <button onClick={() => setReportView('bestpractices')} style={{ background: reportView === 'bestpractices' ? '#F1F5F9' : 'transparent', color: reportView === 'bestpractices' ? '#0F172A' : '#64748B', border: '1px solid #E2E8F0', borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
          Best Practices <span style={{ background: bpIssues > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: bpIssues > 0 ? '#ef4444' : '#10b981', padding: '2px 6px', borderRadius: '100px' }}>{bpIssues}</span>
        </button>
        <button onClick={() => setReportView('diagnostics')} style={{ background: reportView === 'diagnostics' ? '#F1F5F9' : 'transparent', color: reportView === 'diagnostics' ? '#0F172A' : '#64748B', border: '1px solid #E2E8F0', borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
          Diagnostics
        </button>
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.5rem', flex: 1, minHeight: '400px' }}>
        
        {/* OVERVIEW */}
        {reportView === 'overview' && (
          <>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', justifyContent: 'center', alignItems: 'center' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <svg width="120" height="120" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
                    {scores.performance && <circle cx="50" cy="50" r="40" fill="transparent" stroke={getScoreColor(scores.performance)} strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (scores.performance / 100) * 251.2, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />}
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600, color: getScoreColor(scores.performance) }}>
                    {scores.performance || '-'}
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0F172A', marginTop: '1rem' }}>Performance</div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', maxWidth: '250px', textAlign: 'center' }}>
                  Values are estimated and may vary. The performance score is calculated directly from these metrics.
                </div>
              </div>

              {data.screenshots?.final && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={data.screenshots.final} alt="Final Screenshot" style={{ maxHeight: '250px', border: '1px solid #E2E8F0', borderRadius: '4px', objectFit: 'contain' }} />
                </div>
              )}
            </div>

            {data.screenshots?.filmstrip?.length > 0 && (
              <div style={{ marginBottom: '2rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#0F172A', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BarChart2 size={14}/> View Treemap
                  </button>
                  <div style={{ flex: 1 }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748B' }}>
                    <span>Show audits relevant to:</span>
                    {['All', 'FCP', 'LCP', 'TBT', 'CLS'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => {
                          setMetricFilter(m as any);
                          if (m !== 'All') setReportView('opportunities');
                        }}
                        style={{ 
                          background: metricFilter === m ? '#3b82f6' : 'transparent', 
                          color: metricFilter === m ? 'white' : '#94a3b8', 
                          border: metricFilter === m ? '1px solid #3b82f6' : '1px solid transparent', 
                          borderRadius: '12px', 
                          padding: '2px 8px', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          textDecoration: metricFilter === m ? 'none' : 'none'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {data.screenshots.filmstrip.map((frame: any, idx: number) => (
                    <img key={idx} src={frame.data} alt={`Frame ${idx}`} style={{ height: '120px', border: '1px solid #E2E8F0', objectFit: 'contain', background: '#0f172a' }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <ProgressBar label="SEO" score={scores.seo} />
              <ProgressBar label="Accessibility" score={scores.accessibility} />
              <ProgressBar label="Best Practices" score={scores.bestPractices} />
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>Lab Data (Core Web Vitals)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <MetricCard label="LCP" metric={lab.lcp} />
              <MetricCard label="INP / FID" metric={lab.inp || lab.fid} />
              <MetricCard label="CLS" metric={lab.cls} />
              <MetricCard label="TBT" metric={lab.tbt} />
              <MetricCard label="FCP" metric={lab.fcp} />
              <MetricCard label="Speed Index" metric={lab.speedIndex} />
              <MetricCard label="TTFB" metric={lab.ttfb} />
            </div>
          </>
        )}

        {/* FIELD DATA */}
        {reportView === 'field' && (
          <>
            {!field && !originField ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '8px' }}>
                <Globe size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                Real user field data (CrUX) is not available for this URL yet. Not enough traffic.
              </div>
            ) : (
              <>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>Real User Experience (CrUX)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FieldDataCard title="LCP (Largest Contentful Paint)" metric={field?.lcp} originMetric={originField?.lcp} />
                  <FieldDataCard title="INP (Interaction to Next Paint)" metric={field?.inp} originMetric={originField?.inp} />
                  <FieldDataCard title="FID (First Input Delay)" metric={field?.fid} originMetric={originField?.fid} />
                  <FieldDataCard title="CLS (Cumulative Layout Shift)" metric={field?.cls} originMetric={originField?.cls} />
                  <FieldDataCard title="FCP (First Contentful Paint)" metric={field?.fcp} originMetric={originField?.fcp} />
                  <FieldDataCard title="TTFB (Time to First Byte)" metric={field?.ttfb} originMetric={originField?.ttfb} />
                </div>
              </>
            )}
          </>
        )}

        {/* OPPORTUNITIES */}
        {reportView === 'opportunities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem' }}>Sorted by Highest Fix Priority (Wasted Bytes/Ms)</div>
            {opps.length > 0 ? opps.map((opp: any, idx: number) => {
              const numItems = opp.items ? opp.items.length : 0;
              return (
                <div key={idx} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', overflow: 'hidden', padding: '12px' }}>
                  <div 
                    onClick={() => setExpandedOpp(expandedOpp === opp.id ? null : opp.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'flex-start' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', marginTop: '6px', flexShrink: 0 }}></div>
                      <div>
                        <div style={{ color: '#0F172A', fontSize: '0.95rem', fontWeight: 700 }}>{opp.title}</div>
                        {(opp.wastedMs > 0 || opp.wastedBytes > 0) && (
                          <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>
                            {opp.wastedMs > 0 ? `Est savings of ${formatMs(opp.wastedMs)}` : ''} 
                            {opp.wastedMs > 0 && opp.wastedBytes > 0 ? ' | ' : ''} 
                            {opp.wastedBytes > 0 ? `Est savings of ${formatBytes(opp.wastedBytes)}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.8rem' }}>
                      {numItems > 0 && <span>{numItems}</span>}
                      {expandedOpp === opp.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </div>
                  
                  {expandedOpp === opp.id && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>What this means</div>
                      <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.5rem', lineHeight: '1.5' }}>{opp.description.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')}</div>
                      
                      {numItems > 0 && (
                        <>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Affected Resources ({numItems})</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {opp.items.map((item: any, i: number) => (
                              <div key={i} style={{ background: '#F8FAFC', borderRadius: '6px', padding: '12px' }}>
                                <div style={{ color: '#3b82f6', fontSize: '0.8rem', wordBreak: 'break-all', marginBottom: '8px', fontFamily: 'monospace' }}>
                                  {item.url || item.node?.snippet || 'Unknown'}
                                </div>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                                  {(item.totalBytes !== undefined || item.total !== undefined) && (
                                    <div>
                                      <span style={{ color: '#64748B' }}>Size: </span>
                                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                                        {item.totalBytes ? formatBytes(item.totalBytes) : item.total ? formatMs(item.total) : ''}
                                      </span>
                                    </div>
                                  )}
                                  {(item.wastedBytes !== undefined || item.wastedMs !== undefined) && (
                                    <div>
                                      <span style={{ color: '#64748B' }}>Save: </span>
                                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                                        {item.wastedBytes ? formatBytes(item.wastedBytes) : item.wastedMs ? formatMs(item.wastedMs) : ''}
                                      </span>
                                    </div>
                                  )}
                                  {item.wastedPercent !== undefined && (
                                    <div>
                                      <span style={{ color: '#64748B' }}>Unused: </span>
                                      <span style={{ color: '#10b981', fontWeight: 600 }}>{item.wastedPercent.toFixed(1)}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            }) : <div style={{ color: '#64748B', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>No performance opportunities found! Great job!</div>}
          </div>
        )}

        {/* AUDITS (SEO, A11Y, BEST PRACTICES) */}
        {['seo', 'a11y', 'bestpractices'].includes(reportView) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(() => {
              const categoryMap = { seo: audits.seo, a11y: audits.accessibility, bestpractices: audits.bestPractices };
              const currentCategory = categoryMap[reportView as keyof typeof categoryMap] || [];
              if (currentCategory.length === 0) return <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No checks extracted.</div>;
              
              const failedAudits = currentCategory.filter((a: any) => !a.passed);
              const passedAudits = currentCategory.filter((a: any) => a.passed);

              const renderAudit = (audit: any, i: number) => (
                <div key={i} style={{ borderBottom: '1px solid #E2E8F0', padding: '1rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {audit.passed ? (
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', marginTop: '4px', flexShrink: 0 }}></div>
                  ) : audit.score === null ? (
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#94a3b8', marginTop: '4px', flexShrink: 0 }}></div>
                  ) : (
                    <div style={{ width: '0', height: '0', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '12px solid #ef4444', marginTop: '4px', flexShrink: 0 }}></div>
                  )}
                  <div>
                    <div style={{ color: '#0F172A', fontSize: '0.9rem' }}>
                      {audit.title}
                      {audit.displayValue && <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#ef4444' }}>{audit.displayValue}</span>}
                    </div>
                    {!audit.passed && audit.description && (
                      <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '8px', lineHeight: '1.4' }}>{audit.description?.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')}</div>
                    )}
                  </div>
                </div>
              );

              return (
                <>
                  {failedAudits.length > 0 && (
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                      <div style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748B', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>FAILED AUDITS ({failedAudits.length})</span>
                      </div>
                      {failedAudits.map(renderAudit)}
                    </div>
                  )}

                  {passedAudits.length > 0 && (
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                      <div 
                        onClick={() => setShowPassedAudits(!showPassedAudits)}
                        style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748B', borderBottom: showPassedAudits ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}
                      >
                        <span>PASSED AUDITS ({passedAudits.length})</span>
                        <span style={{ color: '#0F172A' }}>{showPassedAudits ? 'Hide' : 'Show'}</span>
                      </div>
                      {showPassedAudits && passedAudits.map(renderAudit)}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        
        {/* DIAGNOSTICS */}
        {reportView === 'diagnostics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* DOM Size & RTT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Database size={14} /> DOM Size
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>{diag.domSize?.value?.toLocaleString() || 0}</div>
                {diag.domSize?.details?.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Max Depth: {diag.domSize.details[0]?.value} | Max Child Elements: {diag.domSize.details[1]?.value}
                  </div>
                )}
              </div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Globe size={14} /> Network RTT
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>{formatMs(diag.networkRtt)}</div>
              </div>
            </div>

            {/* Resource Summary */}
            {diag.resourceSummary && diag.resourceSummary.length > 0 && (
              <div style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '8px' }}>
                <div style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart2 size={16} color="#3b82f6" /> Resource Summary by Type
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                  {diag.resourceSummary.map((item: any, i: number) => (
                    <div key={i} style={{ background: '#F8FAFC', padding: '8px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.resourceType} ({item.requestCount})</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>{formatBytes(item.transferSize)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Thread Breakdown */}
            {diag.mainThread && diag.mainThread.length > 0 && (
              <div style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '8px' }}>
                <div style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#8b5cf6" /> Main Thread Breakdown
                </div>
                {diag.mainThread.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    <span>{item.groupLabel}</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatMs(item.duration)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Long Tasks Table */}
            {diag.longTasks && diag.longTasks.length > 0 && (
              <div style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '8px', overflowX: 'auto' }}>
                <div style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} color="#ef4444" /> Long Tasks (50ms+)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 4px', fontWeight: 600 }}>URL</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diag.longTasks.map((item: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 4px', color: '#0F172A', wordBreak: 'break-all', maxWidth: '300px' }}>{item.url}</td>
                        <td style={{ padding: '8px 4px', color: '#ef4444', textAlign: 'right', fontWeight: 600 }}>{formatMs(item.duration)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Network Requests Table */}
            {diag.networkRequests && diag.networkRequests.length > 0 && (
              <div style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '8px', overflowX: 'auto' }}>
                <div style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={16} color="#10b981" /> Network Requests ({diag.networkRequests.length})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 4px', fontWeight: 600 }}>URL</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Transfer Size</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Resource Size</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diag.networkRequests.slice(0, 50).map((item: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 4px', color: '#0F172A', wordBreak: 'break-all', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.url}
                        </td>
                        <td style={{ padding: '8px 4px', color: '#64748B' }}>{item.resourceType}</td>
                        <td style={{ padding: '8px 4px', color: item.statusCode >= 400 ? '#ef4444' : '#10b981' }}>{item.statusCode}</td>
                        <td style={{ padding: '8px 4px', color: '#0F172A', textAlign: 'right', fontWeight: 600 }}>{formatBytes(item.transferSize)}</td>
                        <td style={{ padding: '8px 4px', color: '#64748B', textAlign: 'right' }}>{formatBytes(item.resourceSize)}</td>
                        <td style={{ padding: '8px 4px', color: '#64748B', textAlign: 'right' }}>{formatMs(item.endTime - item.startTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {diag.networkRequests.length > 50 && <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>Showing top 50 requests</div>}
              </div>
            )}
            
            {/* Third Party Summary */}
            {diag.thirdParty && diag.thirdParty.length > 0 && (
              <div style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '8px', overflowX: 'auto' }}>
                <div style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={16} color="#f59e0b" /> Third-Party Scripts Breakdown
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 4px', fontWeight: 600 }}>Third-Party Provider</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Transfer Size</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Main Thread Time</th>
                      <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Blocking Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diag.thirdParty.map((item: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 4px', color: '#0F172A' }}>{item.entity?.text || 'Unknown'}</td>
                        <td style={{ padding: '8px 4px', color: '#64748B', textAlign: 'right' }}>{formatBytes(item.transferSize)}</td>
                        <td style={{ padding: '8px 4px', color: '#64748B', textAlign: 'right' }}>{formatMs(item.mainThreadTime)}</td>
                        <td style={{ padding: '8px 4px', color: '#ef4444', textAlign: 'right', fontWeight: 600 }}>{formatMs(item.blockingTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
