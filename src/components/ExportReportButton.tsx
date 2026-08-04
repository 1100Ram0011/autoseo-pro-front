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
          display: 'flex', alignItems: 'center', gap: '6px',
          background: isGenerating ? '#94A3B8' : '#3B82F6',
          color: '#FFFFFF', border: 'none',
          padding: '0.5rem 1rem', borderRadius: '8px',
          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}
      >
        {isGenerating
          ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating PDF…</>
          : <><Download size={14} /> Export Report</>
        }
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 1000,
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: '12px', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.15)',
          minWidth: '190px', overflow: 'hidden',
        }}>
          {/* CSV option */}
          <button
            onClick={handleCSV}
            style={menuBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = '#F0FDF4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: '#ECFDF5' }}>
              <FileText size={14} color="#10B981" />
            </span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#0F172A' }}>Download CSV</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Raw data for Excel/Sheets</div>
            </div>
          </button>

          <div style={{ height: '1px', background: '#F1F5F9', margin: '0 10px' }} />

          {/* PDF option */}
          <button
            onClick={handlePDF}
            style={menuBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: '#EFF6FF' }}>
              <Download size={14} color="#3B82F6" />
            </span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#0F172A' }}>Download PDF</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Professional report</div>
            </div>
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const menuBtnStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.85rem',
  background: '#FFFFFF', border: 'none',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  gap: '10px', transition: 'background 0.15s',
};
