"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import styles from './autoseo.module.css';
import { Activity, BarChart2, Search, FileText, Key, Zap, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LogEvent {
  step: string;
  status: 'running' | 'completed' | 'failed' | 'connected';
  message: string;
}

export default function AutoSeoPage() {
  const { data: sites } = useSWR('/sites', fetcher);
  const site = sites?.[0]; // Assuming user has at least one site, or we could let them select

  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (site && !url) {
      setUrl(site.url);
    }
  }, [site, url]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const fetchReport = async (id: string) => {
    try {
      const res = await api.get(`/autoseo/report/${id}`);
      setReport(res.data);
    } catch (e) {
      console.error("Failed to fetch report", e);
      toast.error("Failed to load the generated report.");
    }
  };

  const handleScan = async () => {
    if (!site) {
      toast.error("Please add a site first.");
      return;
    }
    if (!url) {
      toast.error("URL is required.");
      return;
    }

    setIsScanning(true);
    setLogs([]);
    setReport(null);
    setReportId(null);

    try {
      // 1. Start the scan
      const res = await api.post('/autoseo/scan', { url, siteId: site.id });
      const id = res.data.reportId;
      setReportId(id);

      // 2. Connect to SSE for live updates
      const eventSource = new EventSource(`${API_BASE}/autoseo/stream/${id}`);

      eventSource.onmessage = (event) => {
        const data: LogEvent = JSON.parse(event.data);
        setLogs(prev => [...prev, data]);

        if (data.status === 'completed' && data.step === 'summary') {
          eventSource.close();
          setIsScanning(false);
          toast.success("Auto SEO Scan Complete!");
          fetchReport(id);
        } else if (data.status === 'failed') {
          eventSource.close();
          setIsScanning(false);
          toast.error("Scan encountered an error.");
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Error:", err);
        eventSource.close();
        setIsScanning(false);
      };

    } catch (error) {
      console.error('Failed to start scan:', error);
      toast.error('Failed to start Auto SEO scan.');
      setIsScanning(false);
    }
  };

  const getIconForStep = (step: string) => {
    switch (step) {
      case 'ga': return <BarChart2 size={24} className="text-blue-400" />;
      case 'gsc': return <Search size={24} className="text-indigo-400" />;
      case 'robots': return <FileText size={24} className="text-green-400" />;
      case 'keywords': return <Key size={24} className="text-yellow-400" />;
      case 'lighthouse': return <Zap size={24} className="text-red-400" />;
      case 'summary': return <CheckCircle2 size={24} className="text-emerald-400" />;
      default: return <Activity size={24} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Auto SEO Engine</h1>
        <p>Run a comprehensive AI-powered scan of your entire web presence.</p>
      </div>

      <div className={styles.scannerCard}>
        <div className={styles.inputGroup}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL to scan (e.g., https://example.com)"
            className={styles.input}
            disabled={isScanning}
          />
          <button 
            onClick={handleScan} 
            className={styles.btnScan}
            disabled={isScanning || !url}
          >
            {isScanning ? 'Scanning...' : '🚀 Start Full Scan'}
          </button>
        </div>

        {/* Terminal/Log View */}
        {(logs.length > 0 || isScanning) && (
          <div className={styles.terminal}>
            {logs.map((log, index) => (
              <div key={index} className={`${styles.terminalLine} ${styles[log.status]}`}>
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                {log.status === 'running' && <span className={styles.loader}></span>}
                <span className="font-semibold uppercase text-xs opacity-70">[{log.step}]</span>
                <span>{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Render the Final Report */}
      {report && (
        <div className={styles.reportContainer}>
          
          <div className={`${styles.reportSection} ${styles.summarySection}`}>
            <h2>{getIconForStep('summary')} Executive Summary</h2>
            <div className={styles.reportContent}>
              <ReactMarkdown>{report.overallSummary}</ReactMarkdown>
            </div>
          </div>

          <div className={styles.reportSection}>
            <h2>{getIconForStep('ga')} Google Analytics Insights</h2>
            <div className={styles.reportContent}>
              <ReactMarkdown>{report.gaReport}</ReactMarkdown>
            </div>
          </div>

          <div className={styles.reportSection}>
            <h2>{getIconForStep('gsc')} Search Console Analysis</h2>
            <div className={styles.reportContent}>
              <ReactMarkdown>{report.gscReport}</ReactMarkdown>
            </div>
          </div>

          <div className={styles.reportSection}>
            <h2>{getIconForStep('robots')} Robots & Sitemap Configuration</h2>
            <div className={styles.reportContent}>
              <ReactMarkdown>{report.robotsReport}</ReactMarkdown>
            </div>
          </div>

          <div className={styles.reportSection}>
            <h2>{getIconForStep('keywords')} Keyword Opportunities</h2>
            <div className={styles.reportContent}>
              <ReactMarkdown>{report.keywordReport}</ReactMarkdown>
            </div>
          </div>

          <div className={styles.reportSection}>
            <h2>{getIconForStep('lighthouse')} Performance & Technical SEO</h2>
            <div className={styles.reportContent}>
              <ReactMarkdown>{report.lighthouseReport}</ReactMarkdown>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
