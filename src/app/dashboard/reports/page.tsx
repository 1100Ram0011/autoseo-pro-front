"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Info, FileText, CheckCircle, Clock, Download, Search, Filter,
  BarChart2, TrendingUp, Link as LinkIcon, Trophy, Shield, 
  Layout, MapPin, Bot, Eye, MoreVertical, Plus, FileStack,
  ChevronLeft, ChevronRight, Users} from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import styles from './page.module.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ReportTemplate from '@/components/reports/ReportTemplate';


const getReportConfig = (type: string) => {
  switch (type) {
    case 'Monthly': return { icon: <BarChart2 size={20} color="#9333EA" />, bg: '#FAF5FF', tagBg: '#FAF5FF', tagCol: '#9333EA' };
    case 'Weekly': return { icon: <TrendingUp size={20} color="#D97706" />, bg: '#FFFBEB', tagBg: '#FFFBEB', tagCol: '#D97706' };
    case 'Audit': return { icon: <LinkIcon size={20} color="#059669" />, bg: '#ECFDF5', tagBg: '#ECFDF5', tagCol: '#059669' };
    case 'Analysis': return { icon: <Trophy size={20} color="#DC2626" />, bg: '#FEF2F2', tagBg: '#FEF2F2', tagCol: '#DC2626' };
    case 'Performance': return { icon: <Layout size={20} color="#9333EA" />, bg: '#FAF5FF', tagBg: '#FAF5FF', tagCol: '#9333EA' };
    case 'Local SEO': return { icon: <MapPin size={20} color="#0D9488" />, bg: '#F0FDFA', tagBg: '#F0FDFA', tagCol: '#0D9488' };
    case 'Crawling': return { icon: <Bot size={20} color="#CA8A04" />, bg: '#FEFCE8', tagBg: '#FEFCE8', tagCol: '#CA8A04' };
    default: return { icon: <FileText size={20} color="#3B82F6" />, bg: '#EFF6FF', tagBg: '#EFF6FF', tagCol: '#3B82F6' };
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('All Reports');
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ name: '', frequency: 'Monthly', emails: '' });
  const reportRef = useRef<HTMLDivElement>(null);
  const [currentReport, setCurrentReport] = useState<any>(null);

  const { data: sites } = useSWR('/sites', fetcher);
  
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  
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

  const { data: dashboardData } = useSWR(activeSiteId ? `/sites/${activeSiteId}/dashboard?range=30d` : null, fetcher);
  const { data: realReports, mutate: mutateReports } = useSWR(activeSiteId ? `/sites/${activeSiteId}/reports` : null, fetcher);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const reportsList = realReports || [];
  
  const filteredReports = reportsList.filter((r: any) => {
    if (activeTab === 'Scheduled') return r.status === 'Scheduled';
    if (searchQuery) return r.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });
  const generatePDF = async (report: any, action: 'download' | 'preview' = 'download') => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setCurrentReport(report);
    const loadingToast = toast.loading(`${action === 'preview' ? 'Preparing Preview' : 'Generating'} ${report.name}...`);
    
    try {
      // Small delay to ensure React has rendered the ReportTemplate with the new currentReport state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!reportRef.current) throw new Error("Template not mounted");
      
      const pages = reportRef.current.querySelectorAll('.pdf-page');
      if (pages.length === 0) throw new Error("No pages found in template");

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123] // A4 size at 96 DPI
      });

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2, // higher resolution
          useCORS: true,
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        if (i > 0) {
          pdf.addPage([794, 1123], 'portrait');
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
      }

      if (action === 'preview') {
        window.open(pdf.output('bloburl'), '_blank');
        toast.success('Preview opened!', { id: loadingToast });
      } else {
        pdf.save(`${report.name.replace(/[^a-zA-Z0-9 ]/g, '')}.pdf`);
        
        // Only save to backend if it's an actual generation (download), not just a preview
        // And only if it's a new generation (not downloading a previously saved one)
        if (!report.id && activeSiteId) {
          try {
             await fetch(`/api/sites/${activeSiteId}/reports`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('autoseo-token')}` },
               body: JSON.stringify({
                 name: report.name,
                 type: report.type,
                 size: '2.5 MB', // Approximated
                 status: 'Generated'
               })
             });
             mutateReports();
          } catch(e) {
             console.error("Failed to save report to backend", e);
          }
        }
        
        toast.success('Downloaded successfully!', { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF.', { id: loadingToast });
    } finally {
      setIsGenerating(false);
      setCurrentReport(null);
    }
  };

  const handleScheduleReport = async () => {
    if (!scheduleForm.name || !scheduleForm.emails) return toast.error('Name and Emails are required');
    const loadingToast = toast.loading('Scheduling report...');
    try {
      await fetch(`/api/sites/${activeSiteId}/reports/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('autoseo-token')}` },
        body: JSON.stringify(scheduleForm)
      });
      toast.success('Report scheduled successfully!', { id: loadingToast });
      setShowScheduleModal(false);
      setScheduleForm({ name: '', frequency: 'Monthly', emails: '' });
      // You could mutate a scheduled reports endpoint here if we fetched them separately
    } catch(e) {
      toast.error('Failed to schedule report', { id: loadingToast });
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={styles.container}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             📄 Reports
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>White-label PDF reports — share with clients under your own branding</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Generate automated, white-label SEO reports for your clients or team. <strong>Example:</strong> Schedule a monthly PDF report summarizing traffic growth to be automatically emailed to your boss.
          </p>
        </div>
      </div>
  
        </div>
        <button 
          onClick={() => {
            const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            generatePDF({ name: `Monthly SEO Report — ${dateStr}`, type: 'Monthly', scope: sites?.find((s:any) => s.id === activeSiteId)?.url || 'example.com' }, 'download');
          }}
          disabled={isGenerating}
          style={{ background: '#3B82F6', border: 'none', color: '#FFFFFF', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px 0 rgba(59,130,246,0.39)', opacity: isGenerating ? 0.7 : 1 }}>
          <Plus size={16} /> {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </motion.div>

      {/* Top Metrics Row */}
      <motion.div variants={itemVariants} className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#3B82F6" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A' }}>{reportsList.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Reports Generated</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>This Month</div>
          </div>
        </div>

        <div className={styles.metricItem}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} color="#10B981" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A' }}>8</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Successful Exports</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>This Month</div>
          </div>
        </div>

        <div className={styles.metricItem}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="#F59E0B" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A' }}>4</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Scheduled Reports</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Active</div>
          </div>
        </div>

        <div className={styles.metricItem}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={24} color="#3B82F6" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A' }}>128</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Total Downloads</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>All Time</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs and Search Row */}
      <motion.div variants={itemVariants} className={styles.tabsRow}>
        <div className={styles.navTabs}>
          {['All Reports', 'Scheduled', 'Templates', 'Shared With Clients'].map((tab, i) => (
            <div 
              key={i}
              onClick={() => setActiveTab(tab)}
              style={{ 
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', paddingBottom: '0.75rem', position: 'relative',
                color: activeTab === tab ? '#3B82F6' : '#64748B'
              }}
            >
              {i === 0 && <FileText size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />}
              {i === 1 && <Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />}
              {i === 2 && <FileStack size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />}
              {i === 3 && <Users size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />}
              {tab}
              {activeTab === tab && (
                <div style={{ position: 'absolute', bottom: '-0.5rem', left: 0, width: '100%', height: '2px', background: '#3B82F6', borderRadius: '2px' }} />
              )}
            </div>
          ))}
        </div>
        
        <div className={styles.searchAndFilters} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '8px', fontSize: '0.8rem', width: '220px', outline: 'none' }}
            />
          </div>
          <button style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#64748B', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <Filter size={14} /> Filters
          </button>
        </div>
      </motion.div>

      {/* Reports List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {filteredReports.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <FileText size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>No reports found</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Try generating a new report or adjusting your search.</div>
          </div>
        ) : filteredReports.map((r: any, i: number) => {
          const config = getReportConfig(r.type);
          return (
          <motion.div variants={itemVariants} key={r.id || i} className={styles.reportCard}>
            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: '10px', background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {config.icon}
            </div>
            
            {/* Title & Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#0F172A' }}>{r.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {new Date(r.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &nbsp;•&nbsp; {r.size || '2.5 MB'} &nbsp;•&nbsp; PDF
              </div>
            </div>

            {/* Type Badge */}
            <div style={{ width: '120px' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', marginBottom: '4px' }}>Type</div>
              <span style={{ background: config.tagBg, color: config.tagCol, fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                {r.type}
              </span>
            </div>

            {/* Scope Badge */}
            <div style={{ width: '150px' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', marginBottom: '4px' }}>Scope</div>
              <span style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>
                {sites?.find((s:any) => s.id === activeSiteId)?.url || 'example.com'}
              </span>
            </div>

            {/* Actions */}
            <div className={styles.reportActions}>
              <button onClick={() => generatePDF(r, 'preview')} disabled={isGenerating} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#3B82F6', padding: '0.5rem 1rem', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isGenerating ? 0.7 : 1 }}>
                <Eye size={14} /> {isGenerating && currentReport?.name === r.name ? 'Preparing...' : 'Preview'}
              </button>
              <button onClick={() => generatePDF(r, 'download')} disabled={isGenerating} style={{ background: '#3B82F6', border: 'none', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isGenerating ? 0.7 : 1 }}>
                <Download size={14} /> {isGenerating && currentReport?.name === r.name ? 'Generating...' : 'Download PDF'}
              </button>
              <button style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.5rem' }}>
                <MoreVertical size={18} />
              </button>
            </div>
          </motion.div>
        )})}
      </div>

      {/* Bottom CTA Card */}
      <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1px solid #BFDBFE', borderRadius: '16px', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '40%', height: '200%', background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', transform: 'rotate(-45deg)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#1E3A8A', fontSize: '1.3rem', fontWeight: 700 }}>Create Custom Report</h2>
          <p style={{ margin: '0 0 1.5rem', color: '#2563EB', fontSize: '0.85rem', maxWidth: '400px', lineHeight: 1.5 }}>
            Build a custom report or use our templates to generate branded SEO reports for your clients.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => {
                const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                generatePDF({ name: `Monthly SEO Report — ${dateStr}`, type: 'Monthly', scope: sites?.find((s:any) => s.id === activeSiteId)?.url || 'example.com' }, 'download');
              }}
              style={{ background: '#3B82F6', border: 'none', color: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> Generate Now
            </button>
            <button 
              onClick={() => setShowScheduleModal(true)}
              style={{ background: 'transparent', border: '1px solid #93C5FD', color: '#1E3A8A', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} /> Schedule Automated Report
            </button>
          </div>
        </div>

        {/* CSS Illustration Graphic */}
        <div style={{ position: 'relative', width: 220, height: 120, zIndex: 1 }}>
          {/* Back Report Card */}
          <div style={{ position: 'absolute', right: 20, top: 10, width: 140, height: 160, background: '#CBD5E1', borderRadius: '12px', opacity: 0.5, transform: 'rotate(5deg)' }} />
          {/* Main Report Card */}
          <div style={{ position: 'absolute', right: 40, top: 0, width: 150, height: 180, background: '#FFFFFF', borderRadius: '12px', padding: '1rem', boxShadow: '-10px 10px 30px rgba(0,0,0,0.1)' }}>
             <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3B82F6', marginBottom: '1rem' }} />
             <div style={{ width: '80%', height: 8, background: '#0F172A', borderRadius: '4px', marginBottom: '8px' }} />
             <div style={{ width: '60%', height: 8, background: '#0F172A', borderRadius: '4px', marginBottom: '1.5rem' }} />
             <div style={{ width: '100%', height: 40, background: '#10B981', borderRadius: '6px', clipPath: 'polygon(0 100%, 0 60%, 25% 40%, 50% 70%, 75% 20%, 100% 50%, 100% 100%)' }} />
          </div>
          {/* Success Badge */}
          <div style={{ position: 'absolute', right: 20, bottom: -10, width: 36, height: 36, background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #EFF6FF' }}>
            <CheckCircle size={20} color="#0F172A" />
          </div>
        </div>

      </motion.div>

      {/* Pagination */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
          Showing 1 to 8 of 12 reports
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ width: 32, height: 32, background: 'transparent', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          <button style={{ width: 32, height: 32, background: '#3B82F6', border: 'none', color: '#FFFFFF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 600 }}>1</button>
          <button style={{ width: 32, height: 32, background: 'transparent', border: '1px solid #E2E8F0', color: '#3B82F6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 600 }}>2</button>
          <button style={{ width: 32, height: 32, background: 'transparent', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} /></button>
        </div>
      </motion.div>

      {/* Feature Under Development Modal */}
      {showFeatureModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '16px', width: '400px', maxWidth: '90vw', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0', position: 'relative' }}
          >
            <div style={{ width: 48, height: 48, background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <FileText size={24} color="#3B82F6" />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>Report Engine Under Development</h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
              The backend PDF generation engine is scheduled for Phase 5. Currently, this UI serves as a preview of the upcoming white-label reporting capabilities.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowFeatureModal(false)} style={{ background: '#3B82F6', border: 'none', color: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '16px', width: '450px', maxWidth: '90vw', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="#3B82F6" /> Schedule Automated Report
              </h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748B" /></button>
            </div>
            
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
              Set up a recurring report to be generated on the server and emailed automatically to your clients.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>Report Name</label>
                <input type="text" value={scheduleForm.name} onChange={e => setScheduleForm({...scheduleForm, name: e.target.value})} placeholder="e.g. Acme Corp Monthly SEO" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', outline: 'none' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>Frequency</label>
                <select value={scheduleForm.frequency} onChange={e => setScheduleForm({...scheduleForm, frequency: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', outline: 'none', background: '#FFFFFF' }}>
                  <option value="Weekly">Weekly (Every Monday)</option>
                  <option value="Monthly">Monthly (1st of Month)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>Send to Email(s)</label>
                <input type="text" value={scheduleForm.emails} onChange={e => setScheduleForm({...scheduleForm, emails: e.target.value})} placeholder="client@acme.com, boss@acme.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#64748B', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleScheduleReport} style={{ background: '#3B82F6', border: 'none', color: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 14px 0 rgba(59,130,246,0.39)' }}>
                Save Schedule
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hidden PDF Template */}
      {currentReport && (
        <ReportTemplate 
          ref={reportRef} 
          reportName={currentReport.name} 
          date={currentReport.date} 
          scope={currentReport.scope} 
          type={currentReport.type} 
          dashboardData={dashboardData}
        />
      )}

    </motion.div>
  );
}