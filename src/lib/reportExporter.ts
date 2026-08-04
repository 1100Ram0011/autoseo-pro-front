/**
 * reportExporter.ts
 * Shared utility for exporting page-specific PDF and CSV reports
 * across all dashboard pages in AutoSEO.Pro
 */

/* ───────── shared helpers ───────── */
export const fmtN = (n: any) => Number(n || 0).toLocaleString();
export const fmtDur = (s: number) => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
export const pct = (a: number, b: number) => (!b ? '0.0' : ((a / b) * 100).toFixed(1));

/* ═══════════════════════════════════════════
   CSV BUILDER
═══════════════════════════════════════════ */
function buildCSV(rows: any[][]): string {
  return rows.map(r =>
    r.map(v => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  ).join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════
   PDF BUILDER (jsPDF lazy-loaded)
═══════════════════════════════════════════ */
async function getJsPDF() {
  if (!(window as any).jspdf) {
    await new Promise<void>((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = () => res();
      s.onerror = () => rej(new Error('jspdf load failed'));
      document.head.appendChild(s);
    });
  }
  return (window as any).jspdf.jsPDF;
}

interface PDFContext {
  doc: any;
  PW: number; PH: number; M: number; COL: number;
  y: number; pg: number;
  P: Record<string, number[]>;
  F: (c: number[]) => void;
  D: (c: number[]) => void;
  C: (c: number[]) => void;
  LW: (w: number) => void;
  setupPage: () => void;
  newPage: () => void;
  need: (h: number) => void;
  H2: (text: string) => void;
  H3: (text: string) => void;
  Body: (text: string) => void;
  Gap: (h?: number) => void;
  KpiCard: (label: string, value: string, sub: string, color: number[], x: number, w: number) => void;
  Table: (headers: string[], rows: any[][], widths: number[], opts?: any) => void;
  save: (filename: string) => void;
}

async function createPDFDoc(websiteName: string, websiteUrl: string, reportTitle: string): Promise<PDFContext> {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210, PH = 297, M = 16, COL = PW - M * 2;
  let y = M, pg = 1;

  const P: Record<string, number[]> = {
    ink: [15, 23, 42], paper: [248, 250, 252], card: [241, 245, 249], border: [203, 213, 225],
    orange: [255, 106, 0], accent: [255, 140, 0],
    green: [22, 163, 74], greenL: [220, 252, 231],
    amber: [217, 119, 6], amberL: [254, 243, 199],
    red: [220, 38, 38], redL: [254, 226, 226],
    blue: [37, 99, 235], blueL: [219, 234, 254],
    purple: [124, 58, 237],
    text: [15, 23, 42], sub: [71, 85, 105], hint: [148, 163, 184], white: [255, 255, 255],
  };

  const F = (c: number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const D = (c: number[]) => doc.setDrawColor(c[0], c[1], c[2]);
  const C = (c: number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const LW = (w: number) => doc.setLineWidth(w);

  function setupPage() {
    F(P.paper); doc.rect(0, 0, PW, PH, 'F');
    F(P.orange); doc.rect(0, 0, 3, PH, 'F');
    F(P.card); doc.rect(0, PH - 10, PW, 10, 'F');
    D(P.border); LW(0.2); doc.line(3, PH - 10, PW, PH - 10);
    C(P.hint); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text('AutoSEO.Pro — ' + reportTitle, M, PH - 4);
    doc.text(`Page ${pg}`, PW - M, PH - 4, { align: 'right' });
    doc.text(websiteUrl || websiteName, PW / 2, PH - 4, { align: 'center' });
  }

  function newPage() { doc.addPage(); pg++; setupPage(); y = M + 6; }
  function need(h: number) { if (y + h > PH - 14) newPage(); }

  function H2(text: string) {
    need(14); C(P.text); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(text, M, y); y += 9;
  }
  function H3(text: string) {
    need(9); C(P.sub); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
    doc.text(text.toUpperCase(), M, y);
    D(P.border); LW(0.3);
    doc.line(M + doc.getTextWidth(text.toUpperCase()) + 3, y - 1, M + COL, y - 1);
    y += 7;
  }
  function Body(text: string) {
    need(6); C(P.sub); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(text, M, y); y += 5;
  }
  function Gap(h = 5) { y += h; }

  function KpiCard(label: string, value: string, sub: string, color: number[], x: number, w: number) {
    const h = 22;
    F(P.white); doc.roundedRect(x, y, w, h, 2, 2, 'F');
    D(color); LW(0.4); doc.roundedRect(x, y, w, h, 2, 2, 'S');
    F(color); doc.roundedRect(x, y, w, 3, 2, 2, 'F'); doc.rect(x, y + 1.5, w, 1.5, 'F');
    C(P.text); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(String(value), x + w / 2, y + 10, { align: 'center' });
    C(P.sub); doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
    doc.text(label, x + w / 2, y + 15, { align: 'center' });
    if (sub) { C(P.hint); doc.setFontSize(6); doc.text(sub, x + w / 2, y + 19, { align: 'center' }); }
  }

  function Table(headers: string[], rows: any[][], widths: number[], opts: any = {}) {
    const rowH = 7, headH = 8;
    need(headH + Math.min(rows.length, 5) * rowH);
    F(P.ink); doc.rect(M, y, COL, headH, 'F');
    let x = M + 2;
    headers.forEach((h, i) => {
      C(P.white); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      const align = opts.rightAlign?.includes(i) ? 'right' : 'left';
      doc.text(h, align === 'right' ? x + widths[i] - 2 : x, y + 5.5, { align });
      x += widths[i];
    });
    y += headH;
    rows.forEach((row, ri) => {
      need(rowH);
      F(ri % 2 === 0 ? P.white : P.card); doc.rect(M, y, COL, rowH, 'F');
      D(P.border); LW(0.1); doc.rect(M, y, COL, rowH, 'S');
      let x2 = M + 2;
      row.forEach((cell, ci) => {
        const txt = String(cell ?? '—');
        const align = opts.rightAlign?.includes(ci) ? 'right' : 'left';
        const cCol = opts.colorCol?.[ci]?.(cell) ?? P.text;
        C(cCol); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
        const maxW = widths[ci] - 3;
        const short = txt.length * 1.8 > maxW ? txt.slice(0, Math.floor(maxW / 1.8) - 1) + '…' : txt;
        doc.text(short, align === 'right' ? x2 + widths[ci] - 2 : x2, y + 5, { align });
        x2 += widths[ci];
      });
      y += rowH;
    });
    D(P.border); LW(0.3);
    doc.rect(M, y - rows.length * rowH - headH, COL, headH + rows.length * rowH, 'S');
    y += 4;
  }

  // Cover page
  setupPage();
  F(P.ink); doc.rect(3, 0, PW - 3, 60, 'F');
  F([30, 41, 59]); doc.circle(PW - 20, 15, 18, 'F');
  F(P.orange); doc.circle(PW - 20, 15, 9, 'F');
  C(P.white); doc.setFontSize(24); doc.setFont('helvetica', 'bold');
  doc.text('AutoSEO.Pro', M + 2, 22);
  C(P.hint); doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(reportTitle, M + 2, 32);
  F(P.orange); doc.rect(M + 2, 36, 40, 1, 'F');
  C(P.hint); doc.setFontSize(8);
  doc.text(`Website: ${websiteUrl || websiteName}`, M + 2, 44);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, M + 2, 51);
  y = 72;

  const ctx: PDFContext = {
    doc, PW, PH, M, COL, y, pg, P,
    F, D, C, LW, setupPage, newPage, need,
    H2, H3, Body, Gap, KpiCard, Table,
    save: (filename: string) => doc.save(filename),
  };

  // Use a proxy so inner functions keep accessing the shared y via ctx
  return new Proxy(ctx, {
    get(target, prop) {
      if (prop === 'y') return y;
      return (target as any)[prop];
    },
    set(target, prop, value) {
      if (prop === 'y') { y = value; return true; }
      (target as any)[prop] = value; return true;
    }
  });
}

/* ═══════════════════════════════════════════
   1. ANALYTICS REPORT
═══════════════════════════════════════════ */
export function exportAnalyticsCSV(data: any, websiteUrl: string, dateLabel: string) {
  const rows: any[][] = [];
  const add = (...c: any[]) => rows.push(c);
  const gap = () => rows.push([]);

  add('AutoSEO.Pro — Google Analytics Report');
  add('Website', websiteUrl);
  add('Period', dateLabel);
  add('Generated', new Date().toLocaleString('en-IN'));
  gap();

  add('OVERVIEW');
  add('Metric', 'Value');
  add('Total Users', fmtN(data.users));
  add('Sessions', fmtN(data.sessions));
  add('Bounce Rate', `${(data.bounceRate || 0).toFixed(1)}%`);
  add('Avg Session', fmtDur(data.avgSessionDuration || 0));
  add('Pages / Session', (data.pagesPerSession || 0).toFixed(1));
  add('Live Users', fmtN(data.realtimeUsers));
  gap();

  if (data.trafficSources && Object.keys(data.trafficSources).length) {
    add('TRAFFIC SOURCES');
    add('Source', 'Sessions', 'Share');
    const tot = Object.values(data.trafficSources as Record<string, number>).reduce((s: number, v: number) => s + v, 0);
    Object.entries(data.trafficSources as Record<string, number>)
      .sort((a, b) => b[1] - a[1])
      .forEach(([src, val]) => add(src, val, `${pct(val, tot)}%`));
    gap();
  }

  if (data.topPages?.length) {
    add('TOP PAGES');
    add('Rank', 'Page', 'Views', 'Share');
    const tot = data.topPages.reduce((s: number, p: any) => s + p.views, 0);
    data.topPages.forEach((p: any, i: number) => add(i + 1, p.page, p.views, `${pct(p.views, tot)}%`));
    gap();
  }

  if (data.countries && Object.keys(data.countries).length) {
    add('TOP COUNTRIES');
    add('Rank', 'Country', 'Users', 'Share');
    const tot = Object.values(data.countries as Record<string, number>).reduce((s: number, v: number) => s + v, 0);
    Object.entries(data.countries as Record<string, number>)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .forEach(([c, v], i) => add(i + 1, c, v, `${pct(v, tot)}%`));
    gap();
  }

  if (data.trend?.length) {
    add('DAILY TREND');
    add('Date', 'Users', 'Sessions');
    data.trend.forEach((t: any) => add(t.date, t.users, t.sessions));
    gap();
  }

  downloadCSV(buildCSV(rows), `analytics-${Date.now()}.csv`);
}

export async function exportAnalyticsPDF(data: any, websiteUrl: string, dateLabel: string) {
  const ctx = await createPDFDoc(websiteUrl, websiteUrl, 'Google Analytics Report');

  ctx.H2('Key Metrics');
  ctx.Body(`Period: ${dateLabel}`);
  ctx.Gap();
  const cw = (ctx.COL - 6) / 4;
  ctx.KpiCard('USERS', fmtN(data.users), 'Unique visitors', ctx.P.orange, ctx.M, cw);
  ctx.KpiCard('SESSIONS', fmtN(data.sessions), 'Total visits', ctx.P.purple, ctx.M + cw + 2, cw);
  ctx.KpiCard('BOUNCE RATE', `${(data.bounceRate || 0).toFixed(1)}%`, 'Lower is better', (data.bounceRate || 0) > 60 ? ctx.P.red : ctx.P.green, ctx.M + 2 * (cw + 2), cw);
  ctx.KpiCard('AVG SESSION', fmtDur(data.avgSessionDuration || 0), 'Time on site', ctx.P.accent, ctx.M + 3 * (cw + 2), cw);
  ctx.y += 26;

  if (data.trafficSources && Object.keys(data.trafficSources).length) {
    ctx.newPage();
    ctx.H2('Traffic Sources');
    const srcEntries = Object.entries(data.trafficSources as Record<string, number>).sort((a, b) => b[1] - a[1]) as [string, number][];
    const srcTot = srcEntries.reduce((s, [, v]) => s + v, 0);
    ctx.Table(['Source', 'Sessions', 'Share'], srcEntries.map(([src, val]) => [src, fmtN(val), `${pct(val, srcTot)}%`]), [70, 50, COL_LAST(ctx.COL, 120)]);
  }

  if (data.topPages?.length) {
    ctx.newPage();
    ctx.H2('Top Pages');
    const tot = data.topPages.reduce((s: number, p: any) => s + p.views, 0);
    ctx.Table(['#', 'Page', 'Views', 'Share'], data.topPages.map((p: any, i: number) => [i + 1, p.page, fmtN(p.views), `${pct(p.views, tot)}%`]), [12, ctx.COL - 80, 36, 32]);
  }

  if (data.countries && Object.keys(data.countries).length) {
    ctx.newPage();
    ctx.H2('Top Countries');
    const geoEntries = Object.entries(data.countries as Record<string, number>).sort((a, b) => b[1] - a[1]).slice(0, 30) as [string, number][];
    const geoTot = geoEntries.reduce((s, [, v]) => s + v, 0);
    ctx.Table(['#', 'Country', 'Users', 'Share'], geoEntries.map(([c, v], i) => [i + 1, c, fmtN(v), `${pct(v, geoTot)}%`]), [12, ctx.COL - 80, 36, 32]);
  }

  if (data.trend?.length) {
    ctx.newPage();
    ctx.H2('Daily Trend');
    ctx.Table(['Date', 'Users', 'Sessions'], data.trend.map((t: any) => [t.date, fmtN(t.users), fmtN(t.sessions)]), [50, 40, ctx.COL - 90], { rightAlign: [1, 2] });
  }

  ctx.save(`analytics-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   2. GOOGLE SEARCH CONSOLE REPORT
═══════════════════════════════════════════ */
export function exportGSCCSV(overview: any, keywords: any[], pages: any[], countries: any[], websiteUrl: string, dateLabel: string) {
  const rows: any[][] = [];
  const add = (...c: any[]) => rows.push(c);
  const gap = () => rows.push([]);

  add('AutoSEO.Pro — Search Console Report');
  add('Website', websiteUrl);
  add('Period', dateLabel);
  add('Generated', new Date().toLocaleString('en-IN'));
  gap();

  add('OVERVIEW');
  add('Metric', 'Value');
  add('Total Clicks', fmtN(overview?.metrics?.clicks));
  add('Total Impressions', fmtN(overview?.metrics?.impressions));
  add('Average CTR', `${((overview?.metrics?.ctr || 0) * 100).toFixed(2)}%`);
  add('Average Position', (overview?.metrics?.position || 0).toFixed(1));
  add('Pages Indexed', fmtN(overview?.metrics?.indexed));
  add('Pages Not Indexed', fmtN(overview?.metrics?.notIndexed));
  gap();

  if (keywords?.length) {
    add('TOP KEYWORDS');
    add('Rank', 'Keyword', 'Clicks', 'Impressions', 'CTR', 'Position');
    keywords.slice(0, 50).forEach((k: any, i: number) => add(
      i + 1, k.query || k.keyword,
      fmtN(k.clicks), fmtN(k.impressions),
      `${((k.ctr || 0) * 100).toFixed(2)}%`,
      (k.position || 0).toFixed(1)
    ));
    gap();
  }

  if (pages?.length) {
    add('TOP PAGES (GSC)');
    add('Rank', 'Page URL', 'Clicks', 'Impressions', 'CTR', 'Position');
    pages.slice(0, 50).forEach((p: any, i: number) => add(
      i + 1, p.page || p.keys?.[0],
      fmtN(p.clicks), fmtN(p.impressions),
      `${((p.ctr || 0) * 100).toFixed(2)}%`,
      (p.position || 0).toFixed(1)
    ));
    gap();
  }

  if (countries?.length) {
    add('COUNTRIES (GSC)');
    add('Rank', 'Country', 'Clicks', 'Impressions', 'CTR');
    countries.slice(0, 30).forEach((c: any, i: number) => add(
      i + 1, c.country || c.keys?.[0],
      fmtN(c.clicks), fmtN(c.impressions),
      `${((c.ctr || 0) * 100).toFixed(2)}%`
    ));
    gap();
  }

  downloadCSV(buildCSV(rows), `gsc-report-${Date.now()}.csv`);
}

export async function exportGSCPDF(overview: any, keywords: any[], pages: any[], websiteUrl: string, dateLabel: string) {
  const ctx = await createPDFDoc(websiteUrl, websiteUrl, 'Search Console Report');
  const m = overview?.metrics || {};

  ctx.H2('Search Console Overview');
  ctx.Body(`Period: ${dateLabel}`);
  ctx.Gap();
  const cw = (ctx.COL - 6) / 4;
  ctx.KpiCard('TOTAL CLICKS', fmtN(m.clicks), 'Organic clicks', ctx.P.blue, ctx.M, cw);
  ctx.KpiCard('IMPRESSIONS', fmtN(m.impressions), 'Search appearances', ctx.P.purple, ctx.M + cw + 2, cw);
  ctx.KpiCard('AVG CTR', `${((m.ctr || 0) * 100).toFixed(1)}%`, 'Click-through rate', ctx.P.green, ctx.M + 2 * (cw + 2), cw);
  ctx.KpiCard('AVG POSITION', (m.position || 0).toFixed(1), 'SERP ranking', ctx.P.amber, ctx.M + 3 * (cw + 2), cw);
  ctx.y += 26;

  if (keywords?.length) {
    ctx.newPage();
    ctx.H2('Top Keywords');
    ctx.Table(
      ['#', 'Keyword', 'Clicks', 'Impressions', 'CTR', 'Position'],
      keywords.slice(0, 40).map((k: any, i: number) => [
        i + 1, k.query || k.keyword,
        fmtN(k.clicks), fmtN(k.impressions),
        `${((k.ctr || 0) * 100).toFixed(1)}%`,
        (k.position || 0).toFixed(1)
      ]),
      [10, ctx.COL - 100, 24, 28, 20, 18],
      { rightAlign: [2, 3, 5] }
    );
  }

  if (pages?.length) {
    ctx.newPage();
    ctx.H2('Top Pages in Search Console');
    ctx.Table(
      ['#', 'Page URL', 'Clicks', 'Impressions', 'Position'],
      pages.slice(0, 40).map((p: any, i: number) => [
        i + 1, p.page || p.keys?.[0] || '/',
        fmtN(p.clicks), fmtN(p.impressions),
        (p.position || 0).toFixed(1)
      ]),
      [10, ctx.COL - 90, 26, 28, 26],
      { rightAlign: [2, 3, 4] }
    );
  }

  ctx.save(`gsc-report-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   3. KEYWORDS REPORT
═══════════════════════════════════════════ */
export function exportKeywordsCSV(keywords: any[], websiteUrl: string) {
  const rows: any[][] = [];
  const add = (...c: any[]) => rows.push(c);
  const gap = () => rows.push([]);

  add('AutoSEO.Pro — Keyword Tracker Report');
  add('Website', websiteUrl);
  add('Generated', new Date().toLocaleString('en-IN'));
  gap();

  add('SUMMARY');
  add('Total Keywords', keywords.length);
  add('In Top 3', keywords.filter(k => (k.position || k.rank) <= 3).length);
  add('In Top 10', keywords.filter(k => (k.position || k.rank) <= 10).length);
  add('In Top 30', keywords.filter(k => (k.position || k.rank) <= 30).length);
  gap();

  add('KEYWORDS');
  add('Rank', 'Keyword', 'Position', 'Volume', 'Difficulty', 'Intent', 'URL');
  keywords.forEach((k: any, i: number) => add(
    i + 1, k.keyword,
    k.position || k.rank || 'N/A',
    k.volume || 0,
    k.difficulty || 0,
    k.intent || 'Unknown',
    k.url || ''
  ));

  downloadCSV(buildCSV(rows), `keywords-${Date.now()}.csv`);
}

export async function exportKeywordsPDF(keywords: any[], websiteUrl: string) {
  const ctx = await createPDFDoc(websiteUrl, websiteUrl, 'Keyword Tracker Report');

  const inTop3 = keywords.filter(k => (k.position || k.rank) <= 3).length;
  const inTop10 = keywords.filter(k => (k.position || k.rank) <= 10).length;
  const below30 = keywords.filter(k => !(k.position || k.rank) || (k.position || k.rank) > 30).length;

  ctx.H2('Keyword Rankings Summary');
  ctx.Gap();
  const cw = (ctx.COL - 6) / 4;
  ctx.KpiCard('TOTAL', String(keywords.length), 'Tracked keywords', ctx.P.orange, ctx.M, cw);
  ctx.KpiCard('TOP 3', String(inTop3), 'First position', ctx.P.green, ctx.M + cw + 2, cw);
  ctx.KpiCard('TOP 10', String(inTop10), 'Page 1 rankings', ctx.P.blue, ctx.M + 2 * (cw + 2), cw);
  ctx.KpiCard('BELOW 30', String(below30), 'Need improvement', ctx.P.amber, ctx.M + 3 * (cw + 2), cw);
  ctx.y += 26;

  ctx.newPage();
  ctx.H2('All Keywords');
  ctx.Table(
    ['#', 'Keyword', 'Position', 'Volume', 'Difficulty', 'Intent'],
    keywords.map((k: any, i: number) => [
      i + 1, k.keyword,
      k.position || k.rank || 'N/A',
      fmtN(k.volume || 0),
      k.difficulty || 0,
      k.intent || '—'
    ]),
    [10, ctx.COL - 110, 22, 28, 24, 26],
    {
      rightAlign: [2, 3, 4],
      colorCol: {
        2: (v: any) => {
          const n = Number(v);
          return n <= 3 ? ctx.P.green : n <= 10 ? ctx.P.blue : n <= 30 ? ctx.P.amber : ctx.P.red;
        }
      }
    }
  );

  ctx.save(`keywords-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   4. LIGHTHOUSE REPORT
═══════════════════════════════════════════ */
export function exportLighthouseCSV(pages: any[], websiteUrl: string) {
  const rows: any[][] = [];
  const add = (...c: any[]) => rows.push(c);
  const gap = () => rows.push([]);

  add('AutoSEO.Pro — Lighthouse Audit Report');
  add('Website', websiteUrl);
  add('Generated', new Date().toLocaleString('en-IN'));
  gap();

  const audited = pages.filter(p => p.lighthouse_data);
  add('SUMMARY');
  add('Total Pages', pages.length);
  add('Audited Pages', audited.length);
  gap();

  add('PAGE SCORES');
  add('Page URL', 'Performance', 'SEO', 'Accessibility', 'Best Practices', 'LCP', 'CLS', 'Status');
  pages.forEach((page: any) => {
    let perf = 'Not audited', seo = '—', acc = '—', bp = '—', lcp = '—', cls = '—';
    if (page.lighthouse_data) {
      try {
        const lh = JSON.parse(page.lighthouse_data);
        perf = Math.round((lh.categories?.performance?.score || 0) * 100).toString();
        seo = Math.round((lh.categories?.seo?.score || 0) * 100).toString();
        acc = Math.round((lh.categories?.accessibility?.score || 0) * 100).toString();
        bp = Math.round((lh.categories?.['best-practices']?.score || 0) * 100).toString();
        lcp = lh.audits?.['largest-contentful-paint']?.displayValue || '—';
        cls = lh.audits?.['cumulative-layout-shift']?.displayValue || '—';
      } catch (e) {}
    }
    add(page.url, perf, seo, acc, bp, lcp, cls, page.lighthouse_data ? 'Audited' : 'Pending');
  });

  downloadCSV(buildCSV(rows), `lighthouse-${Date.now()}.csv`);
}

export async function exportLighthousePDF(pages: any[], websiteUrl: string) {
  const ctx = await createPDFDoc(websiteUrl, websiteUrl, 'Lighthouse Audit Report');

  const audited = pages.filter(p => p.lighthouse_data);
  let avgPerf = 0, avgSeo = 0, avgAcc = 0;
  audited.forEach((p: any) => {
    try {
      const lh = JSON.parse(p.lighthouse_data);
      avgPerf += (lh.categories?.performance?.score || 0) * 100;
      avgSeo += (lh.categories?.seo?.score || 0) * 100;
      avgAcc += (lh.categories?.accessibility?.score || 0) * 100;
    } catch (e) {}
  });
  if (audited.length > 0) { avgPerf /= audited.length; avgSeo /= audited.length; avgAcc /= audited.length; }

  ctx.H2('Lighthouse Audit Summary');
  ctx.Gap();
  const cw = (ctx.COL - 6) / 4;
  ctx.KpiCard('TOTAL PAGES', String(pages.length), 'In your site', ctx.P.blue, ctx.M, cw);
  ctx.KpiCard('AVG PERF', `${Math.round(avgPerf)}`, 'Performance score', avgPerf >= 90 ? ctx.P.green : avgPerf >= 50 ? ctx.P.amber : ctx.P.red, ctx.M + cw + 2, cw);
  ctx.KpiCard('AVG SEO', `${Math.round(avgSeo)}`, 'SEO score', avgSeo >= 90 ? ctx.P.green : avgSeo >= 50 ? ctx.P.amber : ctx.P.red, ctx.M + 2 * (cw + 2), cw);
  ctx.KpiCard('AVG A11Y', `${Math.round(avgAcc)}`, 'Accessibility', avgAcc >= 90 ? ctx.P.green : avgAcc >= 50 ? ctx.P.amber : ctx.P.red, ctx.M + 3 * (cw + 2), cw);
  ctx.y += 26;

  ctx.newPage();
  ctx.H2('Page-by-Page Audit Results');
  ctx.Table(
    ['Page URL', 'Perf', 'SEO', 'Access.', 'Best P.'],
    pages.map((p: any) => {
      let perf = 'N/A', seo = '—', acc = '—', bp = '—';
      if (p.lighthouse_data) {
        try {
          const lh = JSON.parse(p.lighthouse_data);
          perf = Math.round((lh.categories?.performance?.score || 0) * 100).toString();
          seo = Math.round((lh.categories?.seo?.score || 0) * 100).toString();
          acc = Math.round((lh.categories?.accessibility?.score || 0) * 100).toString();
          bp = Math.round((lh.categories?.['best-practices']?.score || 0) * 100).toString();
        } catch (e) {}
      }
      return [p.url, perf, seo, acc, bp];
    }),
    [ctx.COL - 100, 25, 25, 25, 25],
    {
      rightAlign: [1, 2, 3, 4],
      colorCol: {
        1: (v: any) => { const n = Number(v); return n >= 90 ? ctx.P.green : n >= 50 ? ctx.P.amber : ctx.P.red; },
        2: (v: any) => { const n = Number(v); return n >= 90 ? ctx.P.green : n >= 50 ? ctx.P.amber : ctx.P.red; },
      }
    }
  );

  ctx.save(`lighthouse-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   5. SITEMAPS REPORT
═══════════════════════════════════════════ */
export function exportSitemapsCSV(sitemaps: any[], websiteUrl: string) {
  const rows: any[][] = [];
  const add = (...c: any[]) => rows.push(c);
  const gap = () => rows.push([]);

  add('AutoSEO.Pro — Sitemaps Report');
  add('Website', websiteUrl);
  add('Generated', new Date().toLocaleString('en-IN'));
  gap();

  add('SUMMARY');
  add('Total Sitemaps', sitemaps.length);
  const totalUrls = sitemaps.reduce((s: number, sm: any) => {
    const content = sm.contents?.[0];
    return s + (content?.submitted || 0);
  }, 0);
  const totalIndexed = sitemaps.reduce((s: number, sm: any) => {
    const content = sm.contents?.[0];
    return s + (content?.indexed || 0);
  }, 0);
  add('Total URLs Submitted', totalUrls);
  add('Total URLs Indexed', totalIndexed);
  add('Index Rate', `${pct(totalIndexed, totalUrls)}%`);
  gap();

  add('SITEMAPS');
  add('Sitemap URL', 'Last Submitted', 'Submitted URLs', 'Indexed', 'Errors', 'Warnings', 'Status');
  sitemaps.forEach((sm: any) => {
    const content = sm.contents?.[0];
    const lastSub = sm.lastSubmitted ? new Date(sm.lastSubmitted).toLocaleDateString('en-IN') : 'Unknown';
    add(
      sm.path,
      lastSub,
      content?.submitted || 0,
      content?.indexed || 0,
      sm.errors || 0,
      sm.warnings || 0,
      sm.errors > 0 ? 'Has Errors' : sm.warnings > 0 ? 'Has Warnings' : 'Healthy'
    );
  });

  downloadCSV(buildCSV(rows), `sitemaps-${Date.now()}.csv`);
}

export async function exportSitemapsPDF(sitemaps: any[], websiteUrl: string) {
  const ctx = await createPDFDoc(websiteUrl, websiteUrl, 'Sitemaps Report');

  const totalUrls = sitemaps.reduce((s: number, sm: any) => s + (sm.contents?.[0]?.submitted || 0), 0);
  const totalIndexed = sitemaps.reduce((s: number, sm: any) => s + (sm.contents?.[0]?.indexed || 0), 0);
  const totalErrors = sitemaps.reduce((s: number, sm: any) => s + (sm.errors || 0), 0);

  ctx.H2('Sitemaps & Indexing Overview');
  ctx.Gap();
  const cw = (ctx.COL - 6) / 4;
  ctx.KpiCard('SITEMAPS', String(sitemaps.length), 'Submitted to Google', ctx.P.blue, ctx.M, cw);
  ctx.KpiCard('URLS SUBMITTED', fmtN(totalUrls), 'Total in sitemaps', ctx.P.orange, ctx.M + cw + 2, cw);
  ctx.KpiCard('INDEXED', fmtN(totalIndexed), `${pct(totalIndexed, totalUrls)}% indexed`, totalIndexed === totalUrls ? ctx.P.green : ctx.P.amber, ctx.M + 2 * (cw + 2), cw);
  ctx.KpiCard('ERRORS', String(totalErrors), 'Issues found', totalErrors > 0 ? ctx.P.red : ctx.P.green, ctx.M + 3 * (cw + 2), cw);
  ctx.y += 26;

  ctx.newPage();
  ctx.H2('Sitemap Details');
  ctx.Table(
    ['Sitemap URL', 'Submitted', 'Indexed', 'Errors', 'Status'],
    sitemaps.map((sm: any) => {
      const content = sm.contents?.[0];
      const status = sm.errors > 0 ? 'Error' : sm.warnings > 0 ? 'Warning' : 'OK';
      return [sm.path, fmtN(content?.submitted || 0), fmtN(content?.indexed || 0), sm.errors || 0, status];
    }),
    [ctx.COL - 95, 25, 25, 20, 25],
    {
      rightAlign: [1, 2, 3],
      colorCol: {
        4: (v: string) => v === 'OK' ? ctx.P.green : v === 'Warning' ? ctx.P.amber : ctx.P.red,
      }
    }
  );

  ctx.save(`sitemaps-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   6. BACKLINKS REPORT
═══════════════════════════════════════════ */
export function exportBacklinksCSV(links: any[], websiteUrl: string) {
  const rows: any[][] = [];
  const add = (...c: any[]) => rows.push(c);
  const gap = () => rows.push([]);

  add('AutoSEO.Pro — Backlinks Report');
  add('Website', websiteUrl);
  add('Generated', new Date().toLocaleString('en-IN'));
  gap();

  const toxic = links.filter(l => l.toxicityScore >= 60).length;
  const disavowed = links.filter(l => l.isDisavowed).length;
  const safe = links.filter(l => l.toxicityScore < 30).length;

  add('SUMMARY');
  add('Total Backlinks', links.length);
  add('Safe Links', safe);
  add('Toxic Links (score >= 60)', toxic);
  add('Disavowed Links', disavowed);
  gap();

  add('BACKLINKS');
  add('Rank', 'Referring Domain', 'Link URL', 'Target URL', 'Toxicity Score', 'Status', 'Disavowed');
  links.forEach((l: any, i: number) => add(
    i + 1,
    l.domain,
    l.url,
    l.targetUrl || '/',
    l.toxicityScore || 0,
    l.toxicityScore >= 60 ? 'Toxic' : l.toxicityScore >= 30 ? 'Medium' : 'Safe',
    l.isDisavowed ? 'Yes' : 'No'
  ));

  downloadCSV(buildCSV(rows), `backlinks-${Date.now()}.csv`);
}

export async function exportBacklinksPDF(links: any[], websiteUrl: string) {
  const ctx = await createPDFDoc(websiteUrl, websiteUrl, 'Backlinks Report');

  const toxic = links.filter(l => l.toxicityScore >= 60).length;
  const medium = links.filter(l => l.toxicityScore >= 30 && l.toxicityScore < 60).length;
  const safe = links.filter(l => l.toxicityScore < 30).length;
  const disavowed = links.filter(l => l.isDisavowed).length;

  ctx.H2('Backlinks Overview');
  ctx.Gap();
  const cw = (ctx.COL - 6) / 4;
  ctx.KpiCard('TOTAL LINKS', fmtN(links.length), 'Backlinks found', ctx.P.blue, ctx.M, cw);
  ctx.KpiCard('SAFE', String(safe), 'Toxicity < 30', ctx.P.green, ctx.M + cw + 2, cw);
  ctx.KpiCard('TOXIC', String(toxic), 'Toxicity >= 60', toxic > 0 ? ctx.P.red : ctx.P.green, ctx.M + 2 * (cw + 2), cw);
  ctx.KpiCard('DISAVOWED', String(disavowed), 'Blocked links', ctx.P.amber, ctx.M + 3 * (cw + 2), cw);
  ctx.y += 26;

  ctx.newPage();
  ctx.H2('All Backlinks');
  ctx.Table(
    ['#', 'Domain', 'Toxicity', 'Status', 'Disavowed'],
    links.slice(0, 60).map((l: any, i: number) => [
      i + 1, l.domain, l.toxicityScore || 0,
      l.toxicityScore >= 60 ? 'Toxic' : l.toxicityScore >= 30 ? 'Medium' : 'Safe',
      l.isDisavowed ? 'Yes' : 'No'
    ]),
    [12, ctx.COL - 85, 25, 25, 23],
    {
      rightAlign: [2],
      colorCol: {
        3: (v: string) => v === 'Safe' ? ctx.P.green : v === 'Medium' ? ctx.P.amber : ctx.P.red,
        4: (v: string) => v === 'Yes' ? ctx.P.red : ctx.P.hint,
      }
    }
  );

  ctx.save(`backlinks-${Date.now()}.pdf`);
}

/* helper */
function COL_LAST(col: number, used: number) { return col - used; }
