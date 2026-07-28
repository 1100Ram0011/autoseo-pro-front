"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Globe, Key, AlertCircle, Sparkles, Zap, BrainCircuit,
  CheckCircle, ArrowUpRight, Play, X, Activity, HelpCircle, ChevronDown, Info, Search,
  BarChart3, Link2, Smartphone, MapPin, Eye, FileSearch, Wifi, WifiOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, Tooltip, YAxis
} from 'recharts';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import SmartActionsFeed from './SmartActionsFeed';

// Fallback data removed completely to strictly use real backend API data

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardHoverProps: any = {
  whileHover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" },
  transition: { type: "spring", stiffness: 300, damping: 20 }
};

// Dynamic greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const [activeGuide, setActiveGuide] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Auto-Pilot & Smart Alerts State
  const [isAutoPilotOpen, setIsAutoPilotOpen] = useState(false);
  const [alertStatus, setAlertStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const handleGenerateAnalysis = async () => {
    if (!dashboardData) return;
    setAlertStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/ai/analyze-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl: site?.url, data: dashboardData })
      });
      const json = await res.json();
      if (json.analysis) {
        setAiAnalysis(json.analysis);
        setAlertStatus('done');
      } else {
        setAlertStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setAlertStatus('idle');
    }
  };

  const { data: session, status } = useSession();
  const router = useRouter();

  const [dateRange, setDateRange] = useState('7d');
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);

  // API Fetching using email
  const { data: sites, isLoading: sitesLoading } = useSWR(
    session?.user?.email ? `/sites?email=${encodeURIComponent(session.user.email)}` : null, 
    fetcher
  );
  
  useEffect(() => {
    if (sites && sites.length > 0) {
      const saved = localStorage.getItem('autoseo-active-site-id');
      if (saved && sites.some((s: any) => s.id === saved)) {
        setActiveSiteId(saved);
      } else {
        setActiveSiteId(sites[0].id);
      }
    }
  }, [sites]);
  const site = sites?.find((s: any) => s.id === activeSiteId) || sites?.[0];

  useEffect(() => {
    if (status === 'authenticated' && sites && sites.length === 0) {
      router.push('/onboarding');
    }
  }, [status, sites, router]);

  const { data: dashboardData, isLoading: dashboardLoading } = useSWR(
    activeSiteId ? `/sites/${activeSiteId}/dashboard?range=${dateRange}` : null, 
    fetcher
  );

  const isLoading = status === 'loading' || sitesLoading || dashboardLoading;

  const stats = {
    site: site?.url || 'No Site Selected',
    score: dashboardData?.healthReport?.score || 0,
    visitors: dashboardData?.analytics?.weeklyVisitors || 0,
    indexed: dashboardData?.indexing?.indexed || 0,
    totalPages: dashboardData?.indexing?.total || 0,
    keywords: dashboardData?.rankings?.totalTracked || 0,
    visitorsChange: dashboardData?.metrics?.visitorsChange || 0,
    notIndexed: dashboardData?.metrics?.pagesNotIndexed || 0,
    keywordsTop10: dashboardData?.metrics?.keywordsTop10 || 0,
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const isGoogleConnected = dashboardData?.roadmap?.isGscConnected && dashboardData?.roadmap?.isGa4Connected;

  const sparklineData1 = Array.isArray(dashboardData?.trafficTrend) ? dashboardData.trafficTrend.map((t: any) => ({ v: t.users || 0 })) : [{v:0}];
  const sparklineData2 = Array.isArray(dashboardData?.trafficTrend) ? dashboardData.trafficTrend.map((t: any) => ({ v: t.users || 0 })) : [{v:0}];
  const sparklineData3 = Array.isArray(dashboardData?.keywordTrend) ? dashboardData.keywordTrend.map((t: any) => ({ v: t.impressions || 0 })) : [{v:0}];
  const sparklineData4 = Array.isArray(dashboardData?.keywordTrend) ? dashboardData.keywordTrend.map((t: any) => ({ v: t.clicks || 0 })) : [{v:0}];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ background: 'transparent', minHeight: '100vh', color: 'var(--foreground)', fontFamily: "'Inter', sans-serif", padding: '2rem' }}
    >
      
      {/* Header */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--foreground)' }}>
            {greeting || 'Good afternoon'} 👋
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Here's how <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{stats.site}</span> is performing today.
          </p>
          {/* Connection Status Badges */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'GA4', connected: !!dashboardData?.roadmap?.isGa4Connected },
              { label: 'Search Console', connected: !!dashboardData?.roadmap?.isGscConnected },
              { label: 'Lighthouse', connected: true },
              { label: 'Clarity', connected: !!dashboardData?.clarityConnected },
            ].map((s) => (
              <span key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px',
                borderRadius: '100px',
                background: s.connected ? '#ECFDF5' : '#FEF2F2',
                color: s.connected ? '#059669' : '#DC2626',
                border: `1px solid ${s.connected ? '#A7F3D0' : '#FECACA'}`
              }}>
                {s.connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                {s.label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            onClick={handleGenerateAnalysis}
            disabled={alertStatus === 'loading' || !dashboardData}
            style={{ 
              background: '#0F172A', 
              color: 'white', 
              border: 'none', 
              padding: '0.6rem 1.25rem', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontWeight: 500, 
              fontSize: '0.9rem',
              cursor: (alertStatus === 'loading' || !dashboardData) ? 'not-allowed' : 'pointer',
              opacity: (alertStatus === 'loading' || !dashboardData) ? 0.7 : 1,
              transition: 'background 0.2s'
            }}
          >
            {alertStatus === 'loading' ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Activity size={16} />
              </motion.div>
            ) : (
              <Sparkles size={16} />
            )}
            {alertStatus === 'loading' ? 'Analyzing...' : 'AI Analyze'}
          </button>
          <button onClick={() => setIsAutoPilotOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <Zap size={14} /> Run Auto-Pilot
          </button>
          <Link href="/dashboard/ai-blog" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FAF5FF', border: '1px solid #E9D5FF', color: '#9333EA', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            <Sparkles size={14} /> Write AI Blog
          </Link>
          <Link href="/dashboard/issues" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            <AlertCircle size={14} /> Fix {dashboardData?.healthReport?.issues?.length || 0} Issues
          </Link>
        </div>
      </motion.div>

      {/* Phase 2: Premium Welcome Flow (How AutoSEO Works) */}
      {showWelcome && (
        <motion.div variants={itemVariants} style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 50%, #ECFDF5 100%)',
          border: '1px solid #C7D2FE', borderRadius: '16px', padding: '1.5rem',
          marginBottom: '1.5rem', position: 'relative'
        }}>
          <button onClick={() => setShowWelcome(false)} style={{
            position: 'absolute', top: '12px', right: '12px', background: '#FFFFFF',
            border: '1px solid #E2E8F0', borderRadius: '50%', width: 28, height: 28,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={14} color="#64748B" />
          </button>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#4F46E5" /> How AutoSEO Pro Works
          </h3>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.8rem', color: '#64748B' }}>
            4 simple steps — we handle the hard part, you just click "Fix".
          </p>
          <div className="grid-responsive grid-cols-4">
            {[
              { step: '1', icon: '🔗', title: 'Connect', desc: 'Link your Google Analytics, Search Console & Clarity accounts.' },
              { step: '2', icon: '🔍', title: 'Scan', desc: 'AI scans all platforms simultaneously for cross-platform issues.' },
              { step: '3', icon: '🧠', title: 'AI Analyze', desc: 'Gemini AI finds correlations between traffic, speed & rankings.' },
              { step: '4', icon: '⚡', title: 'One-Click Fix', desc: 'Apply AI-recommended fixes with a single button click.' },
            ].map((s) => (
              <div key={s.step} style={{
                background: '#FFFFFF', borderRadius: '12px', padding: '1rem',
                border: '1px solid #E2E8F0', textAlign: 'center',
                boxShadow: '0 2px 4px -1px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#4F46E5', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Step {s.step}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{s.title}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Full Screen Google Connect Requirement */}
      {!isGoogleConnected ? (
        <motion.div variants={itemVariants} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ width: 80, height: 80, background: '#EFF6FF', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <img src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg" alt="Google Analytics" style={{ width: 32, height: 32, marginRight: '8px' }} />
            <img src="https://www.gstatic.com/images/branding/product/1x/search_console_48dp.png" alt="Search Console" style={{ width: 32, height: 32 }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
            Connect Your Google Accounts
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            To generate real-time SEO insights and traffic reports for <strong>{stats.site}</strong>, we need access to your Google Search Console and Analytics data. We do not use simulated data.
          </p>
          <Link 
            href="/dashboard/integrations"
            style={{ padding: '0.875rem 2rem', background: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)', textDecoration: 'none' }}
          >
            Connect Google Account →
          </Link>
          <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#94A3B8' }}>
            Secure integration via Google OAuth 2.0. We only request read-only access.
          </div>
        </motion.div>
      ) : (
        <>
      {/* AI Smart Actions Feed */}
      <motion.div variants={itemVariants} className="mb-6">
        <SmartActionsFeed siteId={site?.id || ''} />
      </motion.div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#FFFFFF', borderRadius: '16px', padding: '2.5rem', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <button onClick={() => setAiAnalysis(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                <X size={18} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2rem' }}>
                <div style={{ background: '#EEF2FF', padding: '16px', borderRadius: '16px' }}>
                  <Sparkles size={32} color="#4F46E5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#0F172A', fontWeight: 800 }}>Gemini AI Analysis Report</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '1rem' }}>Deep insights generated for {site?.url}</p>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right', background: '#F8FAFC', padding: '12px 24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: aiAnalysis.overallHealthScore >= 80 ? '#10B981' : aiAnalysis.overallHealthScore >= 50 ? '#F59E0B' : '#EF4444', lineHeight: 1 }}>
                    {aiAnalysis.overallHealthScore}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: '4px' }}>Health Score</div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: '#4F46E5' }}></div>
                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={18} color="#4F46E5"/> Executive Summary
                </h3>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.7, fontSize: '1rem' }}>
                  {aiAnalysis.summary}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={20} color="#0F172A" /> Key Findings
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {aiAnalysis.keyFindings?.map((finding: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ background: '#DBEAFE', padding: '8px', borderRadius: '50%', color: '#3B82F6', flexShrink: 0 }}>
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem', marginBottom: '6px' }}>{finding.title}</div>
                          <div style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{finding.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={20} color="#0F172A" /> Recommended Action Plan
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {aiAnalysis.actionPlan?.map((action: any, i: number) => (
                      <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: action.priority === 'High' ? '#EF4444' : action.priority === 'Medium' ? '#F59E0B' : '#10B981' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem', paddingRight: '1rem' }}>{action.task}</div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '100px', background: action.priority === 'High' ? '#FEF2F2' : action.priority === 'Medium' ? '#FFFBEB' : '#ECFDF5', color: action.priority === 'High' ? '#DC2626' : action.priority === 'Medium' ? '#D97706' : '#059669', flexShrink: 0, textTransform: 'uppercase' }}>
                            {action.priority}
                          </span>
                        </div>
                        <div style={{ color: '#64748B', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Activity size={14} /> Impact: {action.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Metric Cards */}
      <motion.div variants={itemVariants} className="grid-responsive grid-cols-4" style={{ marginBottom: '1.5rem' }}>
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
        {/* Card 1 */}
        <motion.div {...cardHoverProps} className="glass-card" style={{ borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            <ShieldCheck size={14} color="#10B981"/> SEO HEALTH SCORE
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '0.5rem' }}>{stats.score}<span style={{ fontSize:'1rem', color:'var(--text-muted)' }}>/100</span></div>
          <div style={{ fontSize: '0.75rem', color: stats.score >= 90 ? '#10B981' : stats.score >= 50 ? '#F59E0B' : '#EF4444', fontWeight: 600, marginBottom: '1rem' }}>
            {stats.score >= 90 ? 'Excellent' : stats.score >= 50 ? 'Needs Work' : 'Critical Issues'}
          </div>
          <div style={{ height: 40, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData1}>
                <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div {...cardHoverProps} className="glass-card" style={{ borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            <Users size={14} color="#3B82F6"/> VISITORS THIS WEEK
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '0.5rem' }}>{stats.visitors.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: stats.visitorsChange >= 0 ? '#10B981' : '#EF4444', fontWeight: 600, marginBottom: '1rem' }}>
            {stats.visitorsChange >= 0 ? '↑' : '↓'} {Math.abs(stats.visitorsChange)}% vs last week
          </div>
          <div style={{ height: 40, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData2}>
                <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div {...cardHoverProps} className="glass-card" style={{ borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            <Globe size={14} color="#A855F7"/> PAGES ON GOOGLE
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '0.5rem' }}>{stats.indexed} / {stats.indexed + stats.notIndexed || 1}</div>
          <div style={{ fontSize: '0.75rem', color: stats.notIndexed > 0 ? '#EF4444' : '#10B981', fontWeight: 600, marginBottom: '1rem' }}>
            {stats.notIndexed > 0 ? `${stats.notIndexed} pages not indexed yet` : 'All known pages indexed'}
          </div>
          <div style={{ height: 40, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sparklineData3}>
                <Bar dataKey="v" fill="#A855F7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div {...cardHoverProps} className="glass-card" style={{ borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            <Key size={14} color="#F59E0B"/> KEYWORDS TRACKED
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '0.5rem' }}>{stats.keywords}</div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginBottom: '1rem' }}>{stats.keywordsTop10} keywords in Top 10</div>
          <div style={{ height: 40, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData4}>
                <defs>
                  <linearGradient id="colorKw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#F59E0B" fillOpacity={1} fill="url(#colorKw)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
          </>
        )}
      </motion.div>

      {/* Phase 3: AI Health Pulse Card */}
      <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{
          borderRadius: '16px',
          padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(90, 74, 244, 0.2), rgba(90, 74, 244, 0.05))',
            padding: '12px', borderRadius: '14px', flexShrink: 0
          }}>
            <BrainCircuit size={24} color="#8C82FA" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>AI Health Pulse</span>
              <span style={{
                fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                background: stats.score >= 80 ? '#ECFDF5' : stats.score >= 50 ? '#FFFBEB' : '#FEF2F2',
                color: stats.score >= 80 ? '#059669' : stats.score >= 50 ? '#D97706' : '#DC2626',
                border: `1px solid ${stats.score >= 80 ? '#A7F3D0' : stats.score >= 50 ? '#FDE68A' : '#FECACA'}`,
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {stats.score >= 80 ? 'Healthy' : stats.score >= 50 ? 'Needs Attention' : 'Critical'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
              {stats.score >= 80
                ? `Your site is performing well. All systems are green. Keep monitoring for any changes.`
                : stats.score >= 50
                  ? `Your site needs attention. There are optimization opportunities in speed and content that could boost rankings.`
                  : `Critical issues detected across multiple platforms. Immediate action recommended to prevent traffic loss.`
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4F46E5' }}>{stats.score}</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>SEO Score</div>
            </div>
            <div style={{ width: 1, background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EA580C' }}>{dashboardData?.healthReport?.issues?.length || 0}</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>Issues</div>
            </div>
          </div>
          <Link href="#ai-feed" style={{
            background: '#4F46E5', color: '#FFFFFF', border: 'none',
            padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem',
            fontWeight: 600, textDecoration: 'none', flexShrink: 0,
            boxShadow: '0 2px 8px -2px rgba(79, 70, 229, 0.4)',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Eye size={14} /> View AI Feed
          </Link>
        </div>
      </motion.div>

      {/* Middle Row (Health & Roadmap) */}
      <motion.div variants={itemVariants} className="grid-responsive grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        
        {/* SEO Health Report */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>SEO Health Report</h3>
            <Link href="/dashboard/issues" style={{ fontSize: '0.8rem', color: '#3B82F6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              See all issues <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: 90, height: 90 }}>
              <svg width="90" height="90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="195.8 251.2" strokeLinecap="round" transform="rotate(-90 50 50)"/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>78</span>
                <span style={{ fontSize: '0.6rem', color: '#64748B' }}>/100</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F59E0B', marginBottom: '0.25rem' }}>Needs Work</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>Your site has a few issues to fix. Solving the <strong style={{color: '#0F172A'}}>3</strong> critical errors could raise your score to <strong style={{color: '#0F172A'}}>89/100</strong>.</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(dashboardData?.healthReport?.issues || []).map((iss: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: iss.color || '#3B82F6' }} />
                  <span style={{ fontSize: '0.85rem', color: '#0F172A' }}>{iss.text}</span>
                </div>
                <Link href={iss.url ? `/dashboard/lighthouse?url=${encodeURIComponent(iss.url)}` : "/dashboard/issues"} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#3B82F6', fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none' }}>View</Link>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Scan completed: 2 hours ago</span>
            <Link href="/dashboard/lighthouse" style={{ background: '#3B82F6', color: '#0F172A', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none' }}>Run Audit Again</Link>
          </div>
        </div>

        {/* SEO Journey Roadmap */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📖 Your SEO Journey
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
                Follow this roadmap. We've broken down complex SEO tasks into simple, guided steps.
              </p>
            </div>
            <div style={{ position: 'relative', width: 50, height: 50, flexShrink: 0 }}>
              <svg width="50" height="50" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray={`${((dashboardData?.roadmap?.isGscConnected ? 33 : 0) + (dashboardData?.roadmap?.isGa4Connected ? 33 : 0) + (dashboardData?.roadmap?.isApiGenerated ? 34 : 0)) * 2.512} 251.2`} strokeLinecap="round" transform="rotate(-90 50 50)"/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F172A' }}>
                  {(dashboardData?.roadmap?.isGscConnected ? 33 : 0) + (dashboardData?.roadmap?.isGa4Connected ? 33 : 0) + (dashboardData?.roadmap?.isApiGenerated ? 34 : 0)}%
                </span>
                <span style={{ fontSize: '0.4rem', color: '#64748B' }}>Completed</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {/* Phase 1 Expanded */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ background: '#EFF6FF', color: '#3B82F6', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>PHASE 1</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>Foundation & Setup</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#64748B' }}>
                  {dashboardData?.roadmap?.isGscConnected ? <CheckCircle size={16} color="#10B981" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}/>}
                  Connect Google Search Console 
                  <span style={{ marginLeft: 'auto', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}><HelpCircle size={10} style={{display:'inline'}}/> How?</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#64748B' }}>
                  {dashboardData?.roadmap?.isGa4Connected ? <CheckCircle size={16} color="#10B981" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}/>}
                  Connect Google Analytics 4
                  <span style={{ marginLeft: 'auto', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}><HelpCircle size={10} style={{display:'inline'}}/> How?</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#0F172A', background: dashboardData?.roadmap?.isApiGenerated ? '#F8FAFC' : '#EFF6FF', border: dashboardData?.roadmap?.isApiGenerated ? '1px solid #E2E8F0' : '1px solid #BFDBFE', padding: '0.5rem', borderRadius: '6px' }}>
                  {dashboardData?.roadmap?.isApiGenerated ? <CheckCircle size={16} color="#10B981" /> : (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F172A' }}/>
                    </div>
                  )}
                  Integrate with WordPress
                  <span style={{ marginLeft: 'auto', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', color: '#64748B', marginRight: '6px' }}><HelpCircle size={10} style={{display:'inline'}}/> How?</span>
                  {!dashboardData?.roadmap?.isApiGenerated && (
                    <Link href="/dashboard/integrations" style={{ background: '#3B82F6', color: '#0F172A', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>Get API Key</Link>
                  )}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ background: 'transparent', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0', borderRadius: '4px' }}>PHASE 2</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Content & Optimization</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>3/5 <ChevronDown size={14} style={{display:'inline', verticalAlign: 'middle'}}/></span>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ background: 'transparent', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0', borderRadius: '4px' }}>PHASE 3</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Authority & Growth</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>1/5 <ChevronDown size={14} style={{display:'inline', verticalAlign: 'middle'}}/></span>
            </div>
          </div>
          
          <button style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', width: '100%', marginTop: '1.5rem', cursor: 'pointer' }}>View Full Roadmap →</button>
        </div>
      </motion.div>

      {/* Bottom Widgets Grid */}
      <motion.div variants={itemVariants} className="grid-responsive grid-cols-3">
        
        {/* Traffic Overview (Spans 2 columns) */}
        <motion.div {...cardHoverProps} className="col-span-2" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Traffic Overview</h3>
               {isGoogleConnected ? (
                 <span style={{ background: '#ECFDF5', color: '#10B981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={10} /> LIVE</span>
               ) : (
                 <span style={{ background: '#FEF2F2', color: '#EF4444', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={10} /> SIMULATED</span>
               )}
             </div>
             <select style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
               <option>Last 7 Days</option>
             </select>
          </div>
          {!isGoogleConnected && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#9A3412' }}><strong>Connect Google Search Console</strong> to see your real traffic data.</span>
              <button style={{ background: '#F97316', color: '#FFFFFF', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Connect Now</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A855F7'}}/> Users</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6'}}/> Sessions</span>
          </div>
          <div style={{ height: 180, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.trafficTrend || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="users" stroke="#A855F7" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                <Area type="monotone" dataKey="sessions" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Users</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>{stats.visitors.toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>↑ 14%</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Sessions</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>9,873 <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>↑ 18%</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Bounce Rate</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>42.1% <span style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 600 }}>↓ 5%</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Avg. Session</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>2m 34s <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>↑ 8%</span></div>
            </div>
          </div>
        </motion.div>

        {/* Top Performing Pages */}
        <motion.div {...cardHoverProps} style={{ gridColumn: 'span 1', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Top Performing Pages</h3>
             <span style={{ fontSize: '0.75rem', color: '#3B82F6', cursor: 'pointer' }}>View all →</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Page</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Clicks</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Impressions</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>CTR</th>
              </tr>
            </thead>
            <tbody>
              {(dashboardData?.topPages || []).map((p: any, i: number) => (
                <tr key={i} style={{ borderBottom: i !== (dashboardData?.topPages?.length || 0) - 1 ? '1px solid var(--card-border)' : 'none' }}>
                  <td style={{ padding: '0.75rem 0', color: 'var(--foreground)', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.path}</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--foreground)' }}>{p.clicks}</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--foreground)' }}>{p.imp}</td>
                  <td style={{ padding: '0.75rem 0', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {p.ctr}% <div style={{ height: 4, width: 24, background: '#D1FAE5', borderRadius: '2px' }}><div style={{ height: '100%', width: `${p.ctr * 4}%`, background: '#10B981', borderRadius: '2px' }}/></div>
                  </td>
                </tr>
              ))}
              {(!dashboardData?.topPages || dashboardData.topPages.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data available. Connect Google Analytics.</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Keyword Rankings */}
        <motion.div {...cardHoverProps} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Keyword Rankings</h3>
             <span style={{ fontSize: '0.75rem', color: '#3B82F6', cursor: 'pointer' }}>View all →</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Keyword</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500, textAlign: 'center' }}>Position</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500, textAlign: 'center' }}>Change</th>
              </tr>
            </thead>
            <tbody>
              {(dashboardData?.kwRankings || []).map((k: any, i: number) => (
                <tr key={i} style={{ borderBottom: i !== (dashboardData?.kwRankings?.length || 0) - 1 ? '1px solid var(--card-border)' : 'none' }}>
                  <td style={{ padding: '0.75rem 0', color: 'var(--foreground)' }}>{k.kw}</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--foreground)', textAlign: 'center' }}>{k.pos}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'center', color: k.change > 0 ? '#10B981' : k.change < 0 ? '#EF4444' : 'var(--text-muted)' }}>
                    {k.change > 0 ? '▲' : k.change < 0 ? '▼' : '—'} {Math.abs(k.change) || ''}
                  </td>
                </tr>
              ))}
              {(!dashboardData?.kwRankings || dashboardData.kwRankings.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data available. Connect Google Search Console.</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Core Web Vitals */}
        <motion.div {...cardHoverProps} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Core Web Vitals</h3>
             <span style={{ fontSize: '0.75rem', color: '#3B82F6', cursor: 'pointer' }}>View report →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748B' }}>Largest Contentful Paint (LCP)</span>
                <span style={{ display: 'flex', gap: '8px', color: '#0F172A', fontWeight: 600 }}>2.1s <span style={{ background: '#ECFDF5', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>Good</span></span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748B' }}>First Input Delay (FID)</span>
                <span style={{ display: 'flex', gap: '8px', color: '#0F172A', fontWeight: 600 }}>28ms <span style={{ background: '#ECFDF5', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>Good</span></span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748B' }}>Cumulative Layout Shift (CLS)</span>
                <span style={{ display: 'flex', gap: '8px', color: '#0F172A', fontWeight: 600 }}>0.08 <span style={{ background: '#FEF3C7', color: '#F59E0B', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>Needs Work</span></span>
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
            <div style={{ width: 100, height: 50, position: 'relative', overflow: 'hidden' }}>
               <ResponsiveContainer width="100%" height="200%">
                 <PieChart>
                   <Pie data={dashboardData?.cwvGauge || [{name:'Empty',value:100,fill:'var(--card-border)'}]} startAngle={180} endAngle={0} innerRadius={30} outerRadius={45} dataKey="value" stroke="none">
                     {(dashboardData?.cwvGauge || [{name:'Empty',value:100,fill:'var(--card-border)'}]).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)' }}>{dashboardData?.healthReport?.score || 0}<span style={{fontSize:'0.6rem', color:'var(--text-muted)'}}>/100</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Overall Score</div>
              <div style={{ fontSize: '0.9rem', color: '#F59E0B', fontWeight: 600 }}>Needs Improvement</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: '1rem', cursor: 'pointer' }}>Improve Core Web Vitals →</div>
        </motion.div>

        {/* Indexing Status */}
        <motion.div {...cardHoverProps} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Indexing Status</h3>
             <span style={{ fontSize: '0.75rem', color: '#3B82F6', cursor: 'pointer' }}>View report →</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            <div style={{ width: 120, height: 120, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={(stats.indexed === 0 && stats.notIndexed === 0) ? [{ name: 'Empty', value: 1, fill: 'var(--card-border)' }] : [
                      { name: 'Indexed', value: stats.indexed || 0, fill: '#10B981' },
                      { name: 'Not Indexed', value: stats.notIndexed || 0, fill: '#EF4444' }
                    ]} 
                    innerRadius={40} 
                    outerRadius={55} 
                    dataKey="value" 
                    stroke="var(--background)" 
                    strokeWidth={2}
                  >
                    {((stats.indexed === 0 && stats.notIndexed === 0) ? [{ name: 'Empty', value: 1, fill: 'var(--card-border)' }] : [
                      { name: 'Indexed', value: stats.indexed || 0, fill: '#10B981' },
                      { name: 'Not Indexed', value: stats.notIndexed || 0, fill: '#EF4444' }
                    ]).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>
                  {stats.indexed + stats.notIndexed > 0 ? Math.round((stats.indexed / (stats.indexed + stats.notIndexed)) * 100) + '%' : '0%'}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Indexed</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '50%' }}>
              {[
                { name: 'Indexed', value: stats.indexed || 0, fill: '#10B981' },
                { name: 'Not Indexed', value: stats.notIndexed || 0, fill: '#EF4444' }
              ].map((d: any, i: number) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}><div style={{ width: 8, height: 8, borderRadius: '2px', background: d.fill }}/> {d.name}</span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{d.value}</span>
                 </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Total Pages</div>
              <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 600 }}>{stats.indexed + stats.notIndexed}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Last Updated</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Today, 10:30 AM <Activity size={10} style={{display:'inline'}}/></div>
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* Phase 4: Reports Available Section */}
      <motion.div variants={itemVariants} style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Reports Available</h3>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Click any report to view details</span>
        </div>
        <div className="grid-responsive grid-cols-4">
          {[
            { icon: <ShieldCheck size={20} color="#10B981" />, title: 'SEO Health', desc: 'Full audit with score breakdown', href: '/dashboard/lighthouse', bg: '#ECFDF5', border: '#A7F3D0' },
            { icon: <BarChart3 size={20} color="#3B82F6" />, title: 'Traffic Analytics', desc: 'GA4 traffic with trends', href: '/dashboard/analytics', bg: '#EFF6FF', border: '#BFDBFE' },
            { icon: <Key size={20} color="#F59E0B" />, title: 'Keyword Rankings', desc: 'GSC keyword positions', href: '/dashboard/google-keywords', bg: '#FFFBEB', border: '#FDE68A' },
            { icon: <Activity size={20} color="#A855F7" />, title: 'Core Web Vitals', desc: 'Page speed & performance', href: '/dashboard/cwv', bg: '#FAF5FF', border: '#E9D5FF' },
            { icon: <BrainCircuit size={20} color="#4F46E5" />, title: 'AI Action Report', desc: 'Anomalies detected & fixed', href: '#ai-feed', bg: '#EEF2FF', border: '#C7D2FE' },
            { icon: <Link2 size={20} color="#EC4899" />, title: 'Backlink Report', desc: 'Link profile analysis', href: '/dashboard/backlinks', bg: '#FDF2F8', border: '#FBCFE8' },
            { icon: <Smartphone size={20} color="#06B6D4" />, title: 'Mobile Usability', desc: 'Mobile optimization score', href: '/dashboard/mobile', bg: '#ECFEFF', border: '#A5F3FC' },
            { icon: <MapPin size={20} color="#EF4444" />, title: 'Indexing Report', desc: 'Pages indexed on Google', href: '/dashboard/indexing', bg: '#FEF2F2', border: '#FECACA' },
          ].map((report) => (
            <Link key={report.title} href={report.href} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.1)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  background: '#FFFFFF', border: `1px solid ${report.border}`,
                  borderRadius: '12px', padding: '1.25rem',
                  cursor: 'pointer', transition: 'border-color 0.2s'
                }}
              >
                <div style={{
                  background: report.bg, width: 40, height: 40, borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}>
                  {report.icon}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{report.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>{report.desc}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
        </>
      )}

    </motion.div>
  );
}
