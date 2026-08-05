'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

interface SmartExportButtonProps {
  data: any[]; // The array of data objects to export
  reportTitle?: string;
  filename?: string;
  columns?: { key: string; label: string }[]; // Specify which columns to include and their labels
  theme?: 'dark' | 'light' | 'blue';
}

export default function SmartExportButton({ 
  data = [], 
  reportTitle = 'Analytics Report', 
  filename = 'report',
  columns,
  theme = 'blue'
}: SmartExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- CSV Export Logic ---
  const handleCSV = () => {
    setOpen(false);
    if (!data || data.length === 0) return;

    // Use provided columns or extract keys from the first object
    const exportColumns = columns || Object.keys(data[0]).map(key => ({ key, label: key.toUpperCase() }));
    
    // Create CSV header row
    const headers = exportColumns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
    
    // Create CSV data rows
    const rows = data.map(item => {
      return exportColumns.map(col => {
        const val = item[col.key] !== undefined && item[col.key] !== null ? String(item[col.key]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Dynamic Script Injection for jsPDF ---
  const loadJsPDF = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).jspdf && (window as any).jspdf.jsPDF) {
        resolve((window as any).jspdf.jsPDF);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).jspdf) resolve((window as any).jspdf.jsPDF);
        else reject(new Error('jsPDF loaded but not found on window'));
      };
      script.onerror = () => reject(new Error('Failed to load jsPDF script'));
      document.body.appendChild(script);
    });
  };

  // --- PDF Export Logic ---
  const handlePDF = async () => {
    setOpen(false);
    setIsGenerating(true);
    
    try {
      if (!data || data.length === 0) {
        alert("No data to export");
        return;
      }

      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();
      
      const exportColumns = columns || Object.keys(data[0]).map(key => ({ key, label: key.toUpperCase() }));

      // Theme Colors (Premium Apple/Stripe feel)
      const isDark = theme === 'dark';
      const bgColor = isDark ? [15, 23, 42] : [248, 250, 252];
      const headerBg = [15, 23, 42]; // Always dark ink for headers
      const headerTextColor = [255, 255, 255];
      const textColor = isDark ? [226, 232, 240] : [15, 23, 42];
      const borderColor = isDark ? [51, 65, 85] : [226, 232, 240];
      const zebraBg = isDark ? [30, 41, 59] : [255, 255, 255];
      const zebraAltBg = isDark ? [15, 23, 42] : [241, 245, 249];

      let yPos = 20;
      const margin = 16;
      const pageWidth = doc.internal.pageSize.getWidth();
      const rowHeight = 9;
      
      // Background for whole page
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      
      // Brand Accent Line
      doc.setFillColor(255, 106, 0); // Orange primary
      doc.rect(0, 0, 4, doc.internal.pageSize.getHeight(), 'F');

      // Title
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text("AutoSEO.Pro", margin + 2, yPos);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(reportTitle.toUpperCase(), margin + 2, yPos + 6);
      
      // Decorative Line
      doc.setFillColor(255, 106, 0);
      doc.rect(margin + 2, yPos + 10, 40, 0.8, 'F');
      
      yPos += 20;
      
      // Date
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})}`, margin + 2, yPos);
      yPos += 10;

      // Draw Table Header
      doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
      doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');
      
      doc.setTextColor(headerTextColor[0], headerTextColor[1], headerTextColor[2]);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      
      const colWidth = (pageWidth - (margin * 2)) / exportColumns.length;
      exportColumns.forEach((col, i) => {
        doc.text(col.label, margin + (i * colWidth) + 3, yPos + 6, { maxWidth: colWidth - 6 });
      });
      yPos += rowHeight;

      // Draw Table Rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      
      data.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
          doc.setFillColor(255, 106, 0); // Orange primary
          doc.rect(0, 0, 4, doc.internal.pageSize.getHeight(), 'F');
        }

        // Zebra striping background
        const currentBg = index % 2 === 0 ? zebraBg : zebraAltBg;
        doc.setFillColor(currentBg[0], currentBg[1], currentBg[2]);
        doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');
        
        // Borders
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.2);
        doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'S');

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        exportColumns.forEach((col, i) => {
          const val = item[col.key] !== undefined && item[col.key] !== null ? String(item[col.key]) : '—';
          const textToPrint = doc.splitTextToSize(val, colWidth - 6);
          doc.text(textToPrint[0], margin + (i * colWidth) + 3, yPos + 6);
        });

        yPos += rowHeight;
      });

      doc.save(`${filename}.pdf`);
      
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isGenerating || !data || data.length === 0}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: isGenerating || !data || data.length === 0 ? '#94A3B8' : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          color: isGenerating || !data || data.length === 0 ? '#FFFFFF' : '#0F172A',
          border: isGenerating || !data || data.length === 0 ? 'none' : '1px solid #E2E8F0',
          padding: '0.6rem 1.1rem', borderRadius: '10px',
          fontSize: '0.85rem', fontWeight: 600, cursor: (isGenerating || !data || data.length === 0) ? 'not-allowed' : 'pointer',
          boxShadow: (isGenerating || !data || data.length === 0) ? 'none' : '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', whiteSpace: 'nowrap',
          fontFamily: "'Inter', sans-serif",
          opacity: (!data || data.length === 0) ? 0.6 : 1
        }}
        onMouseEnter={(e) => {
          if(!isGenerating && data && data.length > 0) {
             e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.03)';
             e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if(!isGenerating && data && data.length > 0) {
             e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)';
             e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isGenerating
          ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
          : <><Download size={15} color="#475569" /> <span style={{ color: '#0F172A' }}>Export Report</span></>
        }
      </button>

      <div style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '12px', 
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 10px 20px -5px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
        minWidth: '220px', overflow: 'hidden',
        opacity: open ? 1 : 0,
        visibility: open ? 'visible' : 'hidden',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'top right',
        padding: '6px'
      }}>
        {/* CSV option */}
        <button
          onClick={handleCSV}
          style={menuBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', border: '1px solid #A7F3D0' }}>
            <FileText size={15} color="#059669" />
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.2px' }}>Download CSV</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Raw data for spreadsheets</div>
          </div>
        </button>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.8), transparent)', margin: '4px 0' }} />

        {/* PDF option */}
        <button
          onClick={handlePDF}
          style={menuBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}>
            <Download size={15} color="#2563EB" />
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.2px' }}>Download PDF</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Professional styled report</div>
          </div>
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const menuBtnStyle: React.CSSProperties = {
  width: '100%', padding: '8px',
  background: 'transparent', border: 'none', borderRadius: '8px',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  gap: '12px', transition: 'background 0.2s ease',
  fontFamily: "'Inter', sans-serif"
};
