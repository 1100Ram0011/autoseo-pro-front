'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

interface ExportOption {
  label: string;
  icon?: React.ReactNode;
  onExport: () => Promise<void> | void;
}

interface ExportReportButtonProps {
  csvExport: () => void;
  pdfExport: () => Promise<void>;
  disabled?: boolean;
}

export default function ExportReportButton({ csvExport, pdfExport, disabled }: ExportReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCSV = () => {
    setOpen(false);
    csvExport();
  };

  const handlePDF = async () => {
    setOpen(false);
    setIsGenerating(true);
    try {
      await pdfExport();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled || isGenerating}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: disabled || isGenerating ? '#94A3B8' : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          color: disabled || isGenerating ? '#FFFFFF' : '#0F172A',
          border: disabled || isGenerating ? 'none' : '1px solid #E2E8F0',
          padding: '0.6rem 1.1rem', borderRadius: '10px',
          fontSize: '0.85rem', fontWeight: 600, cursor: (disabled || isGenerating) ? 'not-allowed' : 'pointer',
          boxShadow: (disabled || isGenerating) ? 'none' : '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', whiteSpace: 'nowrap',
          fontFamily: "'Inter', sans-serif",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if(!disabled && !isGenerating) {
             e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.03)';
             e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if(!disabled && !isGenerating) {
             e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)';
             e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isGenerating
          ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating PDF…</>
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
