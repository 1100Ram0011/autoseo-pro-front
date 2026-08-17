"use client";

import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect, useMemo } from 'react';
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
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip, YAxis } from 'recharts';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import SmartActionsFeed from './SmartActionsFeed';
import DateRangePicker, { DateRangeValue } from '@/components/DateRangePicker';
import { Paper, Button, Typography, Chip } from '@mui/material';
import anime from 'animejs';
import { 
  PageTransition, 
  SectionTransition, 
  AnimatedCard,
  getResponsiveGrid,
  getResponsiveContainer,
  fadeInUp,
  staggerContainer
} from '@/components/animations';

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
    anime({
      targets: '.animate-dash',
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(100),
      easing: 'easeOutQuint'
    });
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

  const [dateRange, setDateRange] = useState<DateRangeValue>('30d');
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

  // Build API query string from dateRange
  const dateQuery = useMemo(() => {
    if (typeof dateRange === 'string') return `range=${dateRange}`;
    const from = dateRange.from.toISOString().split('T')[0];
    const to = dateRange.to.toISOString().split('T')[0];
    return `range=custom&from=${from}&to=${to}`;
  }, [dateRange]);

  const { data: dashboardData, isLoading: dashboardLoading } = useSWR(
    activeSiteId ? `/sites/${activeSiteId}/dashboard?${dateQuery}` : null, 
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
    <PageTransition variant="fadeUp">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8 font-sans">
        
        {/* Header */}
        <motion.div 
          className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        <div>
          <Typography variant="h4" className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {greeting || 'Good afternoon'} 👋
          </Typography>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Here's how <span className="text-violet-600 dark:text-violet-400 font-bold">{stats.site}</span> is performing today.
          </p>
          {/* Connection Status Badges */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { label: 'GA4', connected: !!dashboardData?.roadmap?.isGa4Connected },
              { label: 'Search Console', connected: !!dashboardData?.roadmap?.isGscConnected },
              { label: 'Lighthouse', connected: true },
              { label: 'Clarity', connected: !!dashboardData?.clarityConnected },
            ].map((s) => (
              <Chip 
                key={s.label}
                icon={s.connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                label={s.label}
                size="small"
                sx={{ 
                  fontWeight: 700, fontSize: '0.7rem', 
                  backgroundColor: s.connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: s.connected ? '#10B981' : '#EF4444',
                  border: `1px solid ${s.connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  '& .MuiChip-icon': { color: s.connected ? '#10B981' : '#EF4444' }
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button 
            onClick={handleGenerateAnalysis}
            disabled={alertStatus === 'loading' || !dashboardData}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #A78BFA, #5A4AF4)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              padding: '8px 20px',
              boxShadow: '0 4px 14px 0 rgba(167, 139, 250, 0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #8B5CF6, #4C1D95)' }
            }}
            startIcon={alertStatus === 'loading' ? <Activity size={16} className="animate-spin" /> : <Sparkles size={16} />}
          >
            {alertStatus === 'loading' ? 'Analyzing...' : 'AI Analyze'}
          </Button>
          <Button 
            onClick={() => setIsAutoPilotOpen(true)} 
            variant="outlined"
            sx={{
              borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10B981', textTransform: 'none', fontWeight: 700, borderRadius: '10px',
              '&:hover': { borderColor: '#10B981', background: 'rgba(16, 185, 129, 0.05)' }
            }}
            startIcon={<Zap size={14} />}
          >
            Run Auto-Pilot
          </Button>
          <Button 
            href="/dashboard/issues"
            component={Link}
            variant="outlined"
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444', textTransform: 'none', fontWeight: 700, borderRadius: '10px',
              '&:hover': { borderColor: '#EF4444', background: 'rgba(239, 68, 68, 0.05)' }
            }}
            startIcon={<AlertCircle size={14} />}
          >
            Fix {dashboardData?.healthReport?.issues?.length || 0} Issues
          </Button>
        </div>
      </motion.div>

      {/* Phase 2: Premium Welcome Flow (How AutoSEO Works) */}
      {showWelcome && (
        <Paper elevation={0} className="animate-dash mb-10 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-violet-500/10 blur-3xl rounded-full"></div>
          <button onClick={() => setShowWelcome(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X size={16} />
          </button>
          <Typography variant="h6" className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-violet-500" /> How AutoSEO Pro Works
          </Typography>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            4 simple steps — we handle the hard part, you just click "Fix".
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: '1', icon: '🔗', title: 'Connect', desc: 'Link your Google Analytics & Search Console.' },
              { step: '2', icon: '🔍', title: 'Scan', desc: 'AI scans all platforms simultaneously.' },
              { step: '3', icon: '🧠', title: 'AI Analyze', desc: 'Gemini finds correlations in traffic.' },
              { step: '4', icon: '⚡', title: 'One-Click Fix', desc: 'Apply AI fixes with a single button.' },
            ].map((s) => (
              <div key={s.step} className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Step {s.step}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{s.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </Paper>
      )}

      {/* Full Screen Google Connect Requirement */}
      {!isGoogleConnected ? (
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-dash">
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
        <Paper elevation={0} className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={16} className="text-emerald-500"/> SEO HEALTH SCORE
          </div>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3 mb-1">{stats.score}<span className="text-xl text-slate-400">/100</span></div>
          <div className={`text-xs font-bold mb-6 ${stats.score >= 90 ? 'text-emerald-500' : stats.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
            {stats.score >= 90 ? 'Excellent' : stats.score >= 50 ? 'Needs Work' : 'Critical Issues'}
          </div>
          <div className="h-12 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData1}>
                <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        {/* Card 2 */}
        <Paper elevation={0} className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <Users size={16} className="text-blue-500"/> VISITORS THIS WEEK
          </div>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3 mb-1">{stats.visitors.toLocaleString()}</div>
          <div className={`text-xs font-bold mb-6 ${stats.visitorsChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.visitorsChange >= 0 ? '↑' : '↓'} {Math.abs(stats.visitorsChange)}% vs last week
          </div>
          <div className="h-12 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData2}>
                <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        {/* Card 3 */}
        <Paper elevation={0} className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <Globe size={16} className="text-purple-500"/> PAGES ON GOOGLE
          </div>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3 mb-1">{stats.indexed} <span className="text-xl text-slate-400">/ {stats.indexed + stats.notIndexed || 1}</span></div>
          <div className={`text-xs font-bold mb-6 ${stats.notIndexed > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {stats.notIndexed > 0 ? `${stats.notIndexed} pages not indexed yet` : 'All known pages indexed'}
          </div>
          <div className="h-12 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sparklineData3}>
                <Bar dataKey="v" fill="#A855F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        {/* Card 4 */}
        <Paper elevation={0} className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <Key size={16} className="text-amber-500"/> KEYWORDS TRACKED
          </div>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3 mb-1">{stats.keywords}</div>
          <div className="text-xs font-bold mb-6 text-emerald-500">{stats.keywordsTop10} keywords in Top 10</div>
          <div className="h-12 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData4}>
                <defs>
                  <linearGradient id="colorKw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#F59E0B" fillOpacity={1} fill="url(#colorKw)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Paper>
          </>
        )}
      </div>

      {/* Phase 3: AI Health Pulse Card */}
      <Paper elevation={0} className="animate-dash mb-10 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl shrink-0">
            <BrainCircuit size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">AI Health Pulse</span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${stats.score >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : stats.score >= 50 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {stats.score >= 80 ? 'Healthy' : stats.score >= 50 ? 'Needs Attention' : 'Critical'}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed m-0">
              {stats.score >= 80
                ? `Your site is performing well. All systems are green. Keep monitoring for any changes.`
                : stats.score >= 50
                  ? `Your site needs attention. There are optimization opportunities in speed and content that could boost rankings.`
                  : `Critical issues detected across multiple platforms. Immediate action recommended to prevent traffic loss.`
              }
            </p>
          </div>
          <div className="flex gap-6 shrink-0 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.score}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SEO Score</div>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-extrabold text-orange-500">{dashboardData?.healthReport?.issues?.length || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Issues</div>
            </div>
          </div>
          <Button
            href="#ai-feed"
            component={Link}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6366F1, #4338CA)', textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #3730A3)' }
            }}
            startIcon={<Eye size={16} />}
            className="w-full md:w-auto"
          >
            View AI Feed
          </Button>
      </Paper>

      {/* Middle Row (Health & Roadmap) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 animate-dash">
        
        {/* SEO Health Report */}
        <Paper elevation={0} className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex justify-between items-center mb-8">
            <Typography variant="h6" className="font-extrabold text-slate-900 dark:text-white">SEO Health Report</Typography>
            <Link href="/dashboard/issues" className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
              See all issues <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="relative w-[90px] h-[90px]">
              <svg width="90" height="90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="195.8 251.2" strokeLinecap="round" transform="rotate(-90 50 50)"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-amber-500 leading-none">78</span>
                <span className="text-[10px] font-bold text-slate-400">/100</span>
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-500 mb-1">Needs Work</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Your site has a few issues to fix. Solving the <strong className="text-slate-900 dark:text-white">3</strong> critical errors could raise your score to <strong className="text-slate-900 dark:text-white">89/100</strong>.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            {(dashboardData?.healthReport?.issues || []).map((iss: any, i: number) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 px-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: iss.color || '#3B82F6' }} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{iss.text}</span>
                </div>
                <Link href={iss.url ? `/dashboard/lighthouse?url=${encodeURIComponent(iss.url)}` : "/dashboard/issues"} className="text-xs font-bold text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                  View
                </Link>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scan completed: 2 hours ago</span>
            <Button href="/dashboard/lighthouse" component={Link} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>Run Audit Again</Button>
          </div>
        </Paper>

        {/* SEO Journey Roadmap */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
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
      </div>

      {/* Bottom Widgets Grid */}
      <motion.div variants={itemVariants} className="grid-responsive grid-cols-3">
        
        {/* Traffic Overview (Spans 2 columns) */}
        <motion.div {...cardHoverProps} className="glass-card col-span-2" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
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
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={Array.isArray(dashboardData?.trafficTrend) ? dashboardData.trafficTrend : []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
        <motion.div {...cardHoverProps} className="glass-card" style={{ gridColumn: 'span 1', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Top Performing Pages</h3>
             <span style={{ fontSize: '0.75rem', color: '#3B82F6', cursor: 'pointer' }}>View all →</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '400px' }}>
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
          </div>
        </motion.div>

        {/* Keyword Rankings */}
        <motion.div {...cardHoverProps} className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Keyword Rankings</h3>
             <span style={{ fontSize: '0.75rem', color: '#3B82F6', cursor: 'pointer' }}>View all →</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '350px' }}>
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
          </div>
        </motion.div>

        {/* Core Web Vitals */}
        <motion.div {...cardHoverProps} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Core Web Vitals</h3>
             <span style={{ fontSize: '0.75rem', color: '#3B82F6', cursor: 'pointer' }}>View report →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748B' }}>Largest Contentful Paint (LCP)</span>
                <span style={{ display: 'flex', gap: '8px', color: '#0F172A', fontWeight: 600 }}>2.1s <span style={{ background: '#ECFDF5', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>Good</span></span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748B' }}>First Input Delay (FID)</span>
                <span style={{ display: 'flex', gap: '8px', color: '#0F172A', fontWeight: 600 }}>28ms <span style={{ background: '#ECFDF5', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>Good</span></span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748B' }}>Cumulative Layout Shift (CLS)</span>
                <span style={{ display: 'flex', gap: '8px', color: '#0F172A', fontWeight: 600 }}>0.08 <span style={{ background: '#FEF3C7', color: '#F59E0B', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Needs Work</span></span>
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
            <div style={{ width: 100, height: 50, position: 'relative', overflow: 'hidden' }}>
               <ResponsiveContainer width="100%" height="200%">
                 <PieChart>
                   <Pie data={Array.isArray(dashboardData?.cwvGauge) ? dashboardData.cwvGauge : [{name:'Empty',value:100,fill:'var(--card-border)'}]} startAngle={180} endAngle={0} innerRadius={30} outerRadius={45} dataKey="value" stroke="none">
                     {(Array.isArray(dashboardData?.cwvGauge) ? dashboardData.cwvGauge : [{name:'Empty',value:100,fill:'var(--card-border)'}]).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
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
        <motion.div {...cardHoverProps} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
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
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer'
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
      </div>
    </PageTransition>
  );
}
