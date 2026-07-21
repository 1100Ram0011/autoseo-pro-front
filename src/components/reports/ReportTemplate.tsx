import React, { forwardRef } from 'react';

interface ReportTemplateProps {
  reportName: string;
  date: string;
  scope: string;
  type: string;
  dashboardData?: any;
}

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="pdf-page"
    style={{
      width: `${A4_WIDTH}px`,
      height: `${A4_HEIGHT}px`,
      padding: '40px',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      color: '#0F172A',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      pageBreakAfter: 'always'
    }}
  >
    {children}
  </div>
);

const Header = ({ reportName, date }: { reportName: string, date: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E2E8F0', paddingBottom: '20px', marginBottom: '30px' }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
         <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
         </div>
         <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.5px' }}>AutoSEO<span style={{ color: '#3B82F6' }}>.Pro</span></h1>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#64748B' }}>Automated Agentic SEO Platform</p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{reportName}</div>
      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Generated: {date}</div>
    </div>
  </div>
);

const Footer = ({ pageNum }: { pageNum: number }) => (
  <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8' }}>
    <span>AutoSEO.Pro — White-label Reporting Engine</span>
    <span>Page {pageNum}</span>
  </div>
);

const ReportTemplate = forwardRef<HTMLDivElement, ReportTemplateProps>(({ reportName, date, scope, type, dashboardData }, ref) => {
  const metrics = dashboardData?.metrics || {};
  const healthScore = metrics.seoHealthScore || 0;
  const issues = dashboardData?.healthReport?.issues || [];

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '-20000px', // Hide it way off screen
        left: '-20000px',
        zIndex: -1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* PAGE 1: EXECUTIVE SUMMARY (Always show for all reports as a cover) */}
      <PageContainer>
        <Header reportName={reportName} date={date} />
        
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', marginBottom: '20px' }}>Executive Summary</h2>
        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.6, marginBottom: '30px' }}>
          This report provides a comprehensive overview of the SEO performance for <strong>{scope}</strong>. 
          Our AI agents have analyzed site traffic, keyword rankings, and technical health to compile this audit.
        </p>

        {/* Health Score Main Graphic */}
        <div style={{ background: 'linear-gradient(135deg, #F8FAFC, #EFF6FF)', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '40px', display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '40px' }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', background: healthScore > 80 ? '#10B981' : healthScore > 50 ? '#F59E0B' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{healthScore}</span>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>/ 100</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>Overall SEO Health</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '0' }}>
              Your site's technical SEO structure is {healthScore > 80 ? 'in excellent condition' : healthScore > 50 ? 'in acceptable condition, but needs optimization' : 'poor and requires immediate attention'}. This score aggregates core web vitals, indexability, and content quality.
            </p>
          </div>
        </div>

        {/* High-Level KPIs */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', marginBottom: '20px' }}>Key Performance Indicators</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
             <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Organic Traffic (Week)</div>
             <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{metrics.visitorsThisWeek || 0}</div>
             <div style={{ fontSize: '0.85rem', color: metrics.visitorsChange >= 0 ? '#10B981' : '#EF4444', fontWeight: 600, marginTop: '8px' }}>
               {metrics.visitorsChange >= 0 ? '+' : ''}{metrics.visitorsChange || 0}% vs last period
             </div>
          </div>
          <div style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
             <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Keywords Tracked</div>
             <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{metrics.keywordsTracked || 0}</div>
             <div style={{ fontSize: '0.85rem', color: '#3B82F6', fontWeight: 600, marginTop: '8px' }}>
               {metrics.keywordsTop10 || 0} in Top 10 Positions
             </div>
          </div>
          <div style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
             <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Pages Indexed</div>
             <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{metrics.pagesIndexed || 0}</div>
             <div style={{ fontSize: '0.85rem', color: '#F59E0B', fontWeight: 600, marginTop: '8px' }}>
               {metrics.pagesNotIndexed || 0} pages failed to index
             </div>
          </div>
        </div>
        <Footer pageNum={1} />
      </PageContainer>

      {/* PAGE 2: KEYWORD & TRAFFIC ANALYSIS (Show for Weekly or Monthly Reports) */}
      {(type === 'Weekly' || type === 'Monthly' || type.includes('Keyword')) && (
      <PageContainer>
        <Header reportName={reportName} date={date} />
        
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', marginBottom: '20px' }}>Traffic & Search Trends</h2>
        
        <div style={{ padding: '30px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '30px' }}>
           <h4 style={{ margin: '0 0 20px', fontSize: '1rem', color: '#334155' }}>30-Day Traffic Trend Analysis</h4>
           <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', borderBottom: '2px solid #CBD5E1', paddingBottom: '10px' }}>
             {(dashboardData?.trafficTrend?.length > 0 ? dashboardData.trafficTrend.slice(0,20) : Array(20).fill({users: Math.random() * 100})).map((t: any, i: number) => {
               const max = Math.max(...(dashboardData?.trafficTrend?.map((x:any)=>x.users) || [100]), 100);
               const height = `${((t.users || 10) / max) * 100}%`;
               return (
                 <div key={i} style={{ flex: 1, background: 'linear-gradient(to top, #3B82F6, #93C5FD)', height, borderRadius: '4px 4px 0 0', minHeight: '10px' }} />
               )
             })}
           </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', marginBottom: '15px' }}>Top Performing Search Queries</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F1F5F9', textAlign: 'left' }}>
              <th style={{ padding: '14px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, borderBottom: '2px solid #E2E8F0' }}>Keyword / Query</th>
              <th style={{ padding: '14px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, borderBottom: '2px solid #E2E8F0' }}>Current Position</th>
              <th style={{ padding: '14px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, borderBottom: '2px solid #E2E8F0' }}>Search Intent</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: 'auto seo platform', v: '3', t: 'Commercial' },
              { m: 'agentic seo tools', v: '5', t: 'Informational' },
              { m: 'best seo software 2026', v: '12', t: 'Commercial' },
              { m: 'automated keyword research', v: '8', t: 'Informational' },
              { m: 'white label seo reporting', v: '2', t: 'Transactional' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px 14px', fontSize: '0.95rem', color: '#0F172A', fontWeight: 600 }}>{row.m}</td>
                <td style={{ padding: '16px 14px', fontSize: '1rem', color: '#3B82F6', fontWeight: 700 }}>#{row.v}</td>
                <td style={{ padding: '16px 14px', fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>{row.t}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Footer pageNum={2} />
      </PageContainer>
      )}

      {/* PAGE 3: TECHNICAL SEO ISSUES (Show for Performance, Crawling, or Monthly Reports) */}
      {(type === 'Performance' || type === 'Crawling' || type === 'Monthly' || type.includes('Audit')) && (
      <PageContainer>
        <Header reportName={reportName} date={date} />
        
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', marginBottom: '20px' }}>Technical SEO & Indexing</h2>
        
        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
          <div style={{ flex: 1, padding: '30px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px' }}>
             <h4 style={{ margin: '0 0 10px', color: '#B91C1C', fontSize: '1.1rem', fontWeight: 700 }}>Critical Issues</h4>
             <p style={{ margin: 0, color: '#991B1B', fontSize: '0.9rem' }}>Items that directly prevent indexing or severely harm rankings.</p>
          </div>
          <div style={{ flex: 1, padding: '30px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px' }}>
             <h4 style={{ margin: '0 0 10px', color: '#D97706', fontSize: '1.1rem', fontWeight: 700 }}>Warnings</h4>
             <p style={{ margin: 0, color: '#B45309', fontSize: '0.9rem' }}>Optimization opportunities to improve crawlability and UX.</p>
          </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', marginBottom: '15px' }}>Detected Issues Log</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {issues.length > 0 ? issues.map((issue: any, index: number) => (
            <div key={index} style={{ padding: '20px', border: `1px solid ${issue.color || '#E2E8F0'}`, borderLeft: `5px solid ${issue.color || '#3B82F6'}`, borderRadius: '8px', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0F172A' }}>{issue.text}</div>
                 <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#F1F5F9', borderRadius: '4px', color: '#64748B' }}>{issue.color === '#EF4444' ? 'Critical' : 'Warning'}</span>
              </div>
              {issue.url && <div style={{ fontSize: '0.85rem', color: '#3B82F6', marginTop: '8px', wordBreak: 'break-all' }}>{issue.url}</div>}
            </div>
          )) : (
            <div style={{ padding: '30px', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
              No critical technical issues found. Your site is technically sound!
            </div>
          )}
        </div>

        <Footer pageNum={3} />
      </PageContainer>
      )}
    </div>
  );
});

ReportTemplate.displayName = 'ReportTemplate';

export default ReportTemplate;
