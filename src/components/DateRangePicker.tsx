"use client";

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

export type DateRangeValue =
  | '7d'
  | '30d'
  | '90d'
  | { from: Date; to: Date };

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
}

const PRESETS = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function startOf(d: Date) {
  const r = new Date(d); r.setHours(0,0,0,0); return r;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function addMonths(d: Date, n: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getDisplayLabel(val: DateRangeValue): string {
  if (val === '7d') return 'Last 7 Days';
  if (val === '30d') return 'Last 30 Days';
  if (val === '90d') return 'Last 90 Days';
  return `${formatDate(val.from)} – ${formatDate(val.to)}`;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<Date | null>(null); // first date selected
  const ref = useRef<HTMLDivElement>(null);

  // Calendar view months: show 2 months
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth() - 1, 1));

  // Current range from value (for highlighting)
  const currentFrom: Date | null = typeof value === 'object' ? value.from : null;
  const currentTo: Date | null = typeof value === 'object' ? value.to : null;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSelecting(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePreset = (preset: string) => {
    onChange(preset as DateRangeValue);
    setSelecting(null);
    setOpen(false);
  };

  const handleDayClick = (day: Date) => {
    if (!selecting) {
      // First click — set start
      setSelecting(day);
    } else {
      // Second click — set range
      const from = selecting < day ? selecting : day;
      const to = selecting < day ? day : selecting;
      onChange({ from: startOf(from), to: startOf(to) });
      setSelecting(null);
      setOpen(false);
    }
  };

  const isInRange = (day: Date): boolean => {
    if (selecting) {
      const end = hoveredDay || day;
      const lo = selecting < end ? selecting : end;
      const hi = selecting < end ? end : selecting;
      return day >= lo && day <= hi;
    }
    if (currentFrom && currentTo) {
      return day >= currentFrom && day <= currentTo;
    }
    return false;
  };

  const isStart = (day: Date) => {
    if (selecting) return day.getTime() === selecting.getTime();
    return currentFrom ? day.getTime() === currentFrom.getTime() : false;
  };

  const isEnd = (day: Date) => {
    if (selecting && hoveredDay) {
      const end = hoveredDay;
      const actual = selecting < end ? end : selecting;
      return day.getTime() === actual.getTime();
    }
    return currentTo ? day.getTime() === currentTo.getTime() : false;
  };

  const renderMonth = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = daysInMonth(year, month);

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));

    return (
      <div style={{ flex: 1 }}>
        {/* Month header */}
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', marginBottom: '0.75rem' }}>
          {MONTHS[month]} {year}
        </div>
        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const inRange = isInRange(day);
            const start = isStart(day);
            const end = isEnd(day);
            const isTodayDay = day.toDateString() === today.toDateString();
            const isFuture = day > today;

            return (
              <div
                key={day.toISOString()}
                onClick={() => !isFuture && handleDayClick(startOf(day))}
                onMouseEnter={() => selecting && setHoveredDay(startOf(day))}
                style={{
                  textAlign: 'center',
                  padding: '6px 0',
                  fontSize: '0.82rem',
                  fontWeight: start || end ? 700 : 400,
                  cursor: isFuture ? 'not-allowed' : 'pointer',
                  borderRadius: start || end ? '6px' : inRange ? '0' : '6px',
                  background: start || end
                    ? 'var(--primary, #5A4AF4)'
                    : inRange
                    ? 'rgba(90, 74, 244, 0.1)'
                    : 'transparent',
                  color: start || end
                    ? '#FFFFFF'
                    : isFuture
                    ? '#CBD5E1'
                    : isTodayDay
                    ? 'var(--primary, #5A4AF4)'
                    : '#0F172A',
                  outline: isTodayDay && !start && !end ? '1.5px solid var(--primary, #5A4AF4)' : 'none',
                  transition: 'background 0.15s, color 0.15s',
                  userSelect: 'none',
                }}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} style={{ position: 'relative', fontFamily: "'Inter', sans-serif" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.55rem 1rem',
          border: open ? '1.5px solid var(--primary, #5A4AF4)' : '1px solid #E2E8F0',
          borderRadius: '10px',
          background: '#FFFFFF',
          color: '#0F172A',
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: open ? '0 0 0 3px rgba(90,74,244,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        <Calendar size={14} color={open ? 'var(--primary, #5A4AF4)' : '#64748B'} />
        <span>{getDisplayLabel(value)}</span>
        {typeof value === 'object' && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange('30d'); setSelecting(null); }}
            style={{ marginLeft: '2px', display: 'flex', alignItems: 'center', color: '#94A3B8' }}
          >
            <X size={13} />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          zIndex: 999,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.18)',
          padding: '1.25rem',
          minWidth: '580px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {/* Presets row */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
            {PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => handlePreset(p.value)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  border: value === p.value ? '1.5px solid var(--primary, #5A4AF4)' : '1px solid #E2E8F0',
                  background: value === p.value ? 'rgba(90,74,244,0.06)' : 'transparent',
                  color: value === p.value ? 'var(--primary, #5A4AF4)' : '#64748B',
                  fontSize: '0.82rem',
                  fontWeight: value === p.value ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94A3B8', alignSelf: 'center' }}>
              {selecting ? '📅 Click to set end date' : 'Or pick a custom range below'}
            </div>
          </div>

          {/* Calendars */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            {/* Left month */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <button onClick={() => setViewMonth(addMonths(viewMonth, -1))} style={navBtn}>
                  <ChevronLeft size={16} />
                </button>
                <span />
                <span />
              </div>
              {renderMonth(viewMonth)}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', background: '#F1F5F9' }} />

            {/* Right month */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span />
                <span />
                <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} style={navBtn}>
                  <ChevronRight size={16} />
                </button>
              </div>
              {renderMonth(addMonths(viewMonth, 1))}
            </div>
          </div>

          {/* Footer hint */}
          {typeof value === 'object' && (
            <div style={{
              borderTop: '1px solid #F1F5F9',
              paddingTop: '0.75rem',
              fontSize: '0.8rem',
              color: '#64748B',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>
                <b style={{ color: '#0F172A' }}>{formatDate(value.from)}</b>
                {' → '}
                <b style={{ color: '#0F172A' }}>{formatDate(value.to)}</b>
              </span>
              <button
                onClick={() => { onChange('30d'); setSelecting(null); setOpen(false); }}
                style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid #E2E8F0',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  color: '#475569',
};
