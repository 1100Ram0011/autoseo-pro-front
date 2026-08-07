"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  Fragment,
} from 'react';
import anime from 'animejs';
import { useMapLeads } from '@/hooks/useLeads';
import { useLeadProgress } from '@/hooks/useLeadProgress';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button, Paper, Typography } from '@mui/material';
import {
  Search, Loader2, Sparkles, MapPin, X, Wifi, WifiOff,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  RefreshCw, Download, Trash2, CheckSquare, Square,
} from 'lucide-react';
import LinkedInSubTable from '@/components/leads/LinkedInSubTable';
import { API_BASE } from '@/lib/apiConfig';

// ─── Helpers ────────────────────────────────────────────────────────────────────
const toTitleCase = (str: string) =>
  str?.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) || '';

// ─── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= full ? 'text-amber-400' : i === full + 1 && half ? 'text-amber-300' : 'text-gray-200 dark:text-gray-600'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
};

// ─── Score Bar ─────────────────────────────────────────────────────────────────
const ScoreBar = ({ score }: { score: number }) => {
  const s = score || 0;
  const color = s >= 90 ? 'bg-emerald-500' : s >= 80 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${s}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{s}%</span>
    </div>
  );
};

// ─── Animated Dots ─────────────────────────────────────────────────────────────
const AnimateDots = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 400);
    return () => clearInterval(t);
  }, []);
  return <>{dots}</>;
};

// ─── Connection Badge ───────────────────────────────────────────────────────────
const ConnectionBadge = ({ socketConnected, isPolling }: { socketConnected: boolean; isPolling: boolean }) => {
  if (socketConnected && !isPolling)
    return <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600"><Wifi size={11} /> Live</span>;
  if (isPolling)
    return <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600"><Wifi size={11} className="animate-pulse" /> Polling</span>;
  return <span className="flex items-center gap-1 text-[10px] font-medium text-red-500"><WifiOff size={11} /> Offline</span>;
};

// ─── WhatsApp Verify Button ─────────────────────────────────────────────────────
const VerifyWhatsAppBtn = ({ lead, onVerified }: { lead: any; onVerified: () => void }) => {
  const [loading, setLoading] = useState(false);
  const handleVerify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/leads/map/${lead.id}/verify-wa`, { phone: lead.phone });
      if (res.data.isWhatsAppNumber) {
        toast.success('Number is registered on WhatsApp!');
      } else {
        toast.error('Number is NOT registered on WhatsApp!');
      }
      onVerified();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify WhatsApp');
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="ml-1.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Checking…' : 'Verify'}
    </button>
  );
};

// ─── Contact Cell ───────────────────────────────────────────────────────────────
const ContactCell = ({ lead, onVerified }: { lead: any; onVerified: () => void }) => {
  const [showAll, setShowAll] = useState(false);
  const all = [
    ...(lead.phone && lead.phone !== 'N/A' ? [lead.phone] : []),
    ...(Array.isArray(lead.additionalPhones) ? lead.additionalPhones : []),
  ];
  const visible = showAll ? all : all.slice(0, 2);
  const extra = all.length - 2;
  return (
    <div className="space-y-1">
      {visible.map((ph: string, i: number) => (
        <div key={i} className="flex items-center gap-1 text-xs font-medium text-gray-800 dark:text-gray-200">
          <span className={`h-3 w-3 flex items-center justify-center text-[10px] ${lead.isWhatsAppNumber ? 'text-green-500' : 'text-gray-400'}`}>
            💬
          </span>
          {ph}
          <VerifyWhatsAppBtn lead={{ ...lead, phone: ph }} onVerified={onVerified} />
        </div>
      ))}
      {!showAll && extra > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setShowAll(true); }} className="text-[11px] text-indigo-500 hover:underline">+{extra} more</button>
      )}
      {showAll && extra > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setShowAll(false); }} className="text-[11px] text-gray-400 hover:underline">Show less</button>
      )}
      {lead.emails?.[0] && (
        <a href={`mailto:${lead.emails[0]}`} onClick={(e) => e.stopPropagation()} className="block text-[11px] text-gray-500 hover:text-indigo-500 max-w-[160px] truncate">
          {lead.emails[0]}
        </a>
      )}
    </div>
  );
};

// ─── Progress Banner ─────────────────────────────────────────────────────────────
const LeadProgressBanner = ({ progress, socketConnected, isPolling, onDismiss }: any) => {
  const isError = progress.event === 'lead:failed';
  const isComplete = progress.event === 'lead:completed';
  return (
    <div className={`mb-5 overflow-hidden rounded-2xl border shadow-sm ${isError ? 'border-red-100 bg-white dark:border-red-900/40 dark:bg-[#111]' : 'border-indigo-100 bg-white dark:border-indigo-900/30 dark:bg-[#111]'}`}>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full transition-all duration-500 ${isError ? 'bg-red-500' : isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {!isError && !isComplete && (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
              </span>
            )}
            <div>
              <p className={`text-xs font-semibold ${isError ? 'text-red-600' : isComplete ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                {isError ? 'Lead generation failed' : isComplete ? 'Lead generation complete!' : <><span>Generating leads</span><AnimateDots /></>}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {progress.label}
                {progress.error && <span className="ml-1 text-red-500">{progress.error}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionBadge socketConnected={socketConnected} isPolling={isPolling} />
            <span className={`text-lg font-bold tabular-nums ${isError ? 'text-red-500' : isComplete ? 'text-emerald-500' : 'text-indigo-600'}`}>
              {progress.percent}%
            </span>
            {(isError || isComplete) && (
              <button onClick={onDismiss} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><X size={14} /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Page Size Dropdown ─────────────────────────────────────────────────────────
const PageSizeDropdown = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative flex items-center gap-1.5">
      <span className="hidden text-xs text-gray-400 sm:inline">Rows per page:</span>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex min-w-[52px] items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white"
      >
        {value} <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[64px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#1a1a1a]">
          {[5, 10, 20, 50].map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors ${opt === value ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── FilterChip ────────────────────────────────────────────────────────────────
const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
      active
        ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm'
        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-300'
    }`}
  >
    {label}
  </button>
);

// ─── Select Dropdown ────────────────────────────────────────────────────────────
const SelectFilter = ({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-indigo-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-200"
      >
        {value} <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-52 min-w-[160px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#1a1a1a]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-xs transition-colors ${opt === value ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-900/20' : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Generate Modal ─────────────────────────────────────────────────────────────
const GenerateModal = ({ onClose, onGenerate, isGenerating }: { onClose: () => void; onGenerate: (tm: string, gf: string, n: number) => void; isGenerating: boolean }) => {
  const [form, setForm] = useState({ targetMarket: '', geographicFocus: '', numLeads: 10 });
  const [errors, setErrors] = useState<any>({});
  const [locationInput, setLocationInput] = useState('');
  const [autocomplete, setAutocomplete] = useState<any[]>([]);
  const [showDrop, setShowDrop] = useState(false);

  useEffect(() => {
    if (!locationInput.trim()) { setAutocomplete([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE}/leads/map/autocomplete?input=${encodeURIComponent(locationInput)}`);
        setAutocomplete(res.data.predictions || []);
        setShowDrop(true);
      } catch { setAutocomplete([]); }
    }, 400);
    return () => clearTimeout(t);
  }, [locationInput]);

  const handleSubmit = () => {
    const err: any = {};
    if (!form.targetMarket.trim()) err.targetMarket = 'Target Market is required';
    if (!form.geographicFocus.trim()) err.geographicFocus = 'Location is required';
    if (form.numLeads < 1 || form.numLeads > 60) err.numLeads = 'Must be between 1 and 60';
    setErrors(err);
    if (Object.keys(err).length === 0) onGenerate(form.targetMarket, form.geographicFocus, form.numLeads);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111] dark:border dark:border-gray-800">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Generate New Leads</h2>
        <p className="mb-5 text-sm text-gray-500">Find qualified local businesses using AI + Maps.</p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Target Market *</label>
            <input
              type="text"
              placeholder="e.g. HR Services, IT Companies, Plumbers"
              className={`w-full rounded-xl border p-3 text-sm outline-none transition-colors dark:bg-[#1a1a1a] dark:text-white ${errors.targetMarket ? 'border-red-500' : 'border-gray-200 focus:border-indigo-500 dark:border-gray-700'}`}
              value={form.targetMarket}
              onChange={(e) => { setForm((f) => ({ ...f, targetMarket: e.target.value })); setErrors((er: any) => ({ ...er, targetMarket: '' })); }}
            />
            {errors.targetMarket && <p className="mt-1 text-xs text-red-500">{errors.targetMarket}</p>}
          </div>

          <div className="relative">
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Location *</label>
            <input
              type="text"
              placeholder="Search city, state, country…"
              className={`w-full rounded-xl border p-3 text-sm outline-none transition-colors dark:bg-[#1a1a1a] dark:text-white ${errors.geographicFocus ? 'border-red-500' : 'border-gray-200 focus:border-indigo-500 dark:border-gray-700'}`}
              value={locationInput}
              onChange={(e) => { setLocationInput(e.target.value); setForm((f) => ({ ...f, geographicFocus: e.target.value })); setErrors((er: any) => ({ ...er, geographicFocus: '' })); }}
              onFocus={() => setShowDrop(true)}
            />
            {showDrop && autocomplete.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#1a1a1a] max-h-52 overflow-y-auto">
                {autocomplete.map((p) => (
                  <button
                    key={p.place_id}
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 flex items-center gap-2"
                    onMouseDown={(e) => { e.preventDefault(); const gf = p.structured_formatting?.main_text || p.description; setLocationInput(gf); setForm((f) => ({ ...f, geographicFocus: gf })); setShowDrop(false); }}
                  >
                    <MapPin size={12} className="text-gray-400" /> {p.description}
                  </button>
                ))}
              </div>
            )}
            {errors.geographicFocus && <p className="mt-1 text-xs text-red-500">{errors.geographicFocus}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Number of Leads * (max 60)</label>
            <input
              type="number" min={1} max={60}
              className={`w-full rounded-xl border p-3 text-sm outline-none dark:bg-[#1a1a1a] dark:text-white ${errors.numLeads ? 'border-red-500' : 'border-gray-200 focus:border-indigo-500 dark:border-gray-700'}`}
              value={form.numLeads}
              onChange={(e) => { setForm((f) => ({ ...f, numLeads: parseInt(e.target.value) || 0 })); setErrors((er: any) => ({ ...er, numLeads: '' })); }}
            />
            {errors.numLeads && <p className="mt-1 text-xs text-red-500">{errors.numLeads}</p>}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGenerating ? 'Starting…' : 'Generate Leads →'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { leads, stats, isLoading, generateLeads, deleteLead, verifyWhatsApp, mutate } = useMapLeads();
  const { progress, socketConnected, isPolling, dismissProgress } = useLeadProgress(() => { mutate(); });

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [whatsappFilter, setWhatsappFilter] = useState(false);
  const [noWhatsappFilter, setNoWhatsappFilter] = useState(false);
  const [linkedinFilter, setLinkedinFilter] = useState(false);
  const [noLinkedinFilter, setNoLinkedinFilter] = useState(false);
  const [dataExtractedFilter, setDataExtractedFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sort & Pagination
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: '.animate-in',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(50),
      easing: 'easeOutQuint'
    });
  }, []);

  // ── Build filter options ────────────────────────────────────────────────────
  const allTypes = useMemo(() => {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const l of leads) {
      const t = (l.business_type || '').trim();
      if (!t) continue;
      const k = t.toLowerCase();
      if (!seen.has(k)) { seen.add(k); unique.push(toTitleCase(t)); }
    }
    return ['All Types', ...unique];
  }, [leads]);

  const allLocations = useMemo(() => {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const l of leads) {
      const loc = (l.location_name || l.city || '').trim();
      if (!loc) continue;
      const k = loc.toLowerCase();
      if (!seen.has(k)) { seen.add(k); unique.push(toTitleCase(loc)); }
    }
    return ['All Locations', ...unique];
  }, [leads]);

  // ── Filtered & sorted leads ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...leads];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((l: any) => l.name?.toLowerCase().includes(q) || l.address?.toLowerCase().includes(q) || l.phone?.toLowerCase().includes(q));
    }
    if (typeFilter !== 'All Types') r = r.filter((l: any) => toTitleCase(l.business_type || '') === typeFilter);
    if (locationFilter !== 'All Locations') r = r.filter((l: any) => (l.location_name || l.city || '').toLowerCase().trim() === locationFilter.toLowerCase().trim());
    if (whatsappFilter) r = r.filter((l: any) => l.isWhatsAppNumber === true);
    if (noWhatsappFilter) r = r.filter((l: any) => !l.isWhatsAppNumber);
    if (linkedinFilter) r = r.filter((l: any) => l.linkedin && l.linkedin !== 'N/A');
    if (noLinkedinFilter) r = r.filter((l: any) => !l.linkedin || l.linkedin === 'N/A');
    if (dataExtractedFilter) r = r.filter((l: any) => l.hasLinkedinExtracted);
    if (startDate || endDate) {
      r = r.filter((l: any) => {
        if (!l.createdAt) return false;
        const d = new Date(l.createdAt);
        if (startDate && d < new Date(startDate)) return false;
        if (endDate && d > new Date(endDate)) return false;
        return true;
      });
    }
    r.sort((a: any, b: any) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
    return r;
  }, [leads, search, typeFilter, locationFilter, whatsappFilter, noWhatsappFilter, linkedinFilter, noLinkedinFilter, dataExtractedFilter, startDate, endDate, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: string }) =>
    sortKey !== k ? <span className="ml-1 text-gray-300">↕</span> : <span className="ml-1 text-indigo-400">{sortDir === 'asc' ? '↑' : '↓'}</span>;

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = async (tm: string, gf: string, n: number) => {
    setIsGenerating(true);
    try {
      await generateLeads(tm, gf, n);
      setShowModal(false);
    } catch { /* toast handled */ } finally { setIsGenerating(false); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await deleteLead(id);
    setDeleteConfirm(null);
    if (expandedRow === id) setExpandedRow(null);
  };

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!filtered.length) { alert('No leads to export.'); return; }
    const h = ['Name', 'Type', 'Location', 'Rating', 'Phone', 'Email', 'Website', 'Score', 'Created'];
    const rows = filtered.map((l: any) => [
      `"${l.name || ''}"`, `"${l.business_type || ''}"`, `"${l.location_name || l.city || ''}"`,
      l.rating || 0, `"${l.phone || ''}"`, `"${l.emails?.[0] || ''}"`,
      `"${l.website || ''}"`, l.match_score || 0, `"${l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''}"`,
    ]);
    const csv = [h, ...rows].map((r) => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'leads.csv'; a.click();
    toast.success('Export successful!');
  };

  const showBanner = progress.active || progress.event === 'lead:completed' || progress.event === 'lead:failed';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 font-sans">
      <div className="mx-auto max-w-[1500px]">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-in">
          <div>
            <Typography variant="h4" className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              📍 Business Leads Dashboard
            </Typography>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate, track, and convert quality leads faster</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400">{filtered.length} leads · {typeFilter !== 'All Types' || locationFilter !== 'All Locations' || whatsappFilter || linkedinFilter || search ? 'Filters applied' : 'No filters applied'}</span>
            <button onClick={() => mutate()} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#111] dark:text-gray-300 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 transition-colors">
              <Download size={13} /> Export Extracted Data
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#111] dark:text-gray-300">
              <Download size={13} /> Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              disabled={progress.active}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Sparkles size={13} /> + Generate Leads
            </button>
          </div>
        </div>

        {/* ── Progress Banner ─────────────────────────────────────────────────── */}
        {showBanner && (
          <LeadProgressBanner progress={progress} socketConnected={socketConnected} isPolling={isPolling} onDismiss={dismissProgress} />
        )}

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Leads', value: stats?.totalInDb ?? leads.length },
            { label: 'Avg Rating', value: stats?.avg_rating ? `★ ${stats.avg_rating}` : '★ 0.0' },
            { label: 'With Emails', value: stats?.leads_with_emails ?? 0 },
            { label: 'Avg Score', value: leads.length ? `${Math.round(leads.reduce((s: number, l: any) => s + (l.match_score || 0), 0) / leads.length)}%` : '0%' },
          ].map((stat, i) => (
            <Paper elevation={0} key={i} className="animate-in rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{stat.label}</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
            </Paper>
          ))}
        </div>

        {/* ── Search ─────────────────────────────────────────────────────────── */}
        <div className="mb-4 animate-in">
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search name, address or phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ── Filters Row ─────────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-3 animate-in">
          <SelectFilter value={typeFilter} options={allTypes} onChange={(v) => { setTypeFilter(v); setPage(1); }} />
          <SelectFilter value={locationFilter} options={allLocations} onChange={(v) => { setLocationFilter(v); setPage(1); }} />
          <FilterChip label="WhatsApp" active={whatsappFilter} onClick={() => { setWhatsappFilter((v) => !v); setNoWhatsappFilter(false); setPage(1); }} />
          <FilterChip label="Non-WhatsApp" active={noWhatsappFilter} onClick={() => { setNoWhatsappFilter((v) => !v); setWhatsappFilter(false); setPage(1); }} />
          <FilterChip label="Has LinkedIn" active={linkedinFilter} onClick={() => { setLinkedinFilter((v) => !v); setNoLinkedinFilter(false); setPage(1); }} />
          <FilterChip label="No LinkedIn" active={noLinkedinFilter} onClick={() => { setNoLinkedinFilter((v) => !v); setLinkedinFilter(false); setPage(1); }} />
          <FilterChip label="Data Extracted" active={dataExtractedFilter} onClick={() => { setDataExtractedFilter((v) => !v); setPage(1); }} />

          {/* Date Range */}
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white" />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white" />

          {(typeFilter !== 'All Types' || locationFilter !== 'All Locations' || whatsappFilter || noWhatsappFilter || linkedinFilter || noLinkedinFilter || dataExtractedFilter || startDate || endDate) && (
            <button onClick={() => { setTypeFilter('All Types'); setLocationFilter('All Locations'); setWhatsappFilter(false); setNoWhatsappFilter(false); setLinkedinFilter(false); setNoLinkedinFilter(false); setDataExtractedFilter(false); setStartDate(''); setEndDate(''); setPage(1); }}
              className="text-xs text-red-500 hover:underline">Clear all</button>
          )}
        </div>

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div ref={tableRef} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#111]">

          {/* Table top bar */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-xs text-gray-500">Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} results</p>
            <PageSizeDropdown value={perPage} onChange={(v) => { setPerPage(v); setPage(1); }} />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
              <p className="text-sm text-gray-400">Loading leads…</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16">
              <Sparkles size={28} className="text-gray-300 mb-3" />
              <p className="font-medium text-gray-600 dark:text-gray-300">No leads found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting filters or generate new leads.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-[#1a1a1a]/50">
                    <th className="w-8 px-4 py-3 text-center"><span className="text-gray-400">#</span></th>
                    <th className="cursor-pointer px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 select-none" onClick={() => handleSort('name')}>Business <SortIcon k="name" /></th>
                    <th className="cursor-pointer px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 select-none" onClick={() => handleSort('business_type')}>Type <SortIcon k="business_type" /></th>
                    <th className="cursor-pointer px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 select-none" onClick={() => handleSort('city')}>Location <SortIcon k="city" /></th>
                    <th className="cursor-pointer px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 select-none" onClick={() => handleSort('rating')}>Rating <SortIcon k="rating" /></th>
                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">LinkedIn</th>
                    <th className="cursor-pointer px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 select-none" onClick={() => handleSort('createdAt')}>Created At <SortIcon k="createdAt" /></th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.map((lead: any, idx: number) => (
                    <Fragment key={lead.id || lead._id}>
                      <tr
                        onClick={() => setExpandedRow(expandedRow === (lead.id || lead._id) ? null : (lead.id || lead._id))}
                        className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#161616]"
                      >
                        <td className="px-4 py-3 text-center text-gray-400">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{lead.name}</div>
                          {lead.website && lead.website !== 'N/A' && (
                            <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="block truncate text-[10px] text-indigo-500 hover:underline mt-0.5 max-w-[180px]">
                              {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          )}
                          {lead.match_score != null && (
                            <div className="mt-1.5 max-w-[140px]"><ScoreBar score={lead.match_score} /></div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {lead.business_type || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <MapPin size={11} className="shrink-0" />
                            <span className="max-w-[120px] truncate">{lead.city || lead.location_name || 'Unknown'}</span>
                          </div>
                          {lead.reviews ? <div className="mt-0.5 text-[10px] text-gray-400">{lead.reviews} reviews</div> : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Stars rating={lead.rating} />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{lead.rating || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <ContactCell lead={lead} onVerified={() => mutate()} />
                        </td>
                        <td className="px-4 py-3">
                          {lead.linkedin && lead.linkedin !== 'N/A' ? (
                            <a href={lead.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                              🔗 View Profile
                            </a>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-gray-400">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(lead.id || lead._id); }}
                              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                            <button onClick={() => setExpandedRow(expandedRow === (lead.id || lead._id) ? null : (lead.id || lead._id))}
                              className="text-gray-400 hover:text-gray-600 p-1">
                              {expandedRow === (lead.id || lead._id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRow === (lead.id || lead._id) && (
                        <tr className="bg-gray-50/50 dark:bg-[#1a1a1a]/50">
                          <td colSpan={9} className="p-0 border-b border-gray-100 dark:border-gray-800">
                            <div className="border-l-4 border-indigo-500 px-6 py-4">
                              {/* Lead details */}
                              <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
                                {lead.address && <span>📍 {lead.address}</span>}
                                {lead.additionalPhones?.length > 0 && <span>📞 All Phones: {[lead.phone, ...lead.additionalPhones].filter(Boolean).join(', ')}</span>}
                                {lead.emails?.length > 0 && <span>✉️ All Emails: {lead.emails.join(', ')}</span>}
                                {lead.website && lead.website !== 'N/A' && <span>🌐 <a href={lead.website} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">{lead.website}</a></span>}
                              </div>
                              <LinkedInSubTable lead={lead} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
              <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pg = i + 1;
                  if (totalPages > 5) {
                    if (page <= 3) pg = i + 1;
                    else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                    else pg = page - 2 + i;
                  }
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`min-w-[30px] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${pg === page ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Generate Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <GenerateModal onClose={() => setShowModal(false)} onGenerate={handleGenerate} isGenerating={isGenerating} />
      )}

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111] dark:border dark:border-gray-800">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Delete Lead?</h3>
            <p className="mb-6 text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}