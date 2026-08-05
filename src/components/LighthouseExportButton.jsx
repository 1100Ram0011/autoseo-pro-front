// ExportButtonlighthouse.jsx
// FIXED: Desktop + all 4 categories (Perf/SEO/A11y/BP) render correctly
// FIXED: Data structure handling — supports both flat and nested audits
// FIXED: Audit title truncation bug ("Document has a `")

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'

const sc = (s) => s >= 90 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626'
const badgeTxt = (s) => s >= 0.9 ? 'PASS' : s >= 0.5 ? 'WARN' : 'FAIL'

const SOLUTIONS = {
  'render-blocking-resources': {
    why: 'CSS/JS files block rendering — browser must download them before showing anything.',
    fixes: [
      { text: 'Add defer to non-critical scripts', code: '<script defer src="app.js"></script>' },
      { text: 'Add async for independent scripts', code: '<script async src="analytics.js"></script>' },
      { text: 'Preload critical CSS, lazy-load the rest', code: "<link rel='preload' href='critical.css' as='style' onload=\"this.rel='stylesheet'\">" },
    ],
  },
  'unused-javascript': {
    why: 'JS is downloaded but never executed, wasting bandwidth and CPU time.',
    fixes: [
      { text: 'Code splitting with dynamic imports', code: "const module = await import('./heavy-module.js');" },
      { text: 'Enable tree-shaking in Vite/Webpack', code: "// vite.config.js\nexport default { build: { rollupOptions: { treeshake: true } } }" },
    ],
  },
  'unused-css-rules': {
    why: 'CSS rules loaded but never applied, inflating stylesheet size.',
    fixes: [
      { text: 'Use PurgeCSS to remove unused styles', code: "// postcss.config.js\nmodule.exports = { plugins: [require('@fullhuman/postcss-purgecss')({ content: ['./src/**/*.{html,jsx,tsx}'] })] };" },
      { text: 'Tailwind JIT mode', code: '// tailwind.config.js\nmodule.exports = { content: ["./src/**/*.{js,jsx,ts,tsx}"] };' },
    ],
  },
  'uses-optimized-images': {
    why: 'Images not compressed — the #1 cause of slow websites.',
    fixes: [
      { text: 'Compress with Sharp (Node.js)', code: "const sharp = require('sharp');\nawait sharp('input.jpg').resize(800).jpeg({ quality: 80 }).toFile('output.jpg');" },
      { text: 'Add lazy loading', code: '<img src="photo.jpg" loading="lazy" width="800" height="600" alt="...">' },
    ],
  },
  'uses-webp-images': {
    why: 'WebP images are 25-35% smaller than JPEG/PNG with identical quality.',
    fixes: [{ text: 'Use picture element with WebP fallback', code: '<picture>\n  <source srcset="image.webp" type="image/webp">\n  <img src="image.jpg" loading="lazy" alt="...">\n</picture>' }],
  },
  'offscreen-images': {
    why: 'Images outside viewport load immediately, wasting bandwidth.',
    fixes: [{ text: 'Add loading=lazy to all below-fold images', code: '<img src="photo.jpg" loading="lazy" width="800" height="450" alt="...">' }],
  },
  'server-response-time': {
    why: 'Server takes too long to send first byte (high TTFB), delaying everything.',
    fixes: [{ text: 'Add Redis caching for DB queries', code: "const cached = await client.get(key);\nif (cached) return JSON.parse(cached);\nconst data = await db.query(...);\nawait client.setEx(key, 3600, JSON.stringify(data));" }],
  },
  'uses-long-cache-ttl': {
    why: 'Static assets not cached — returning visitors re-download everything.',
    fixes: [
      { text: 'Set long cache headers in Express', code: 'app.use(express.static("public", { maxAge: "1y", immutable: true }));' },
      { text: 'Nginx cache headers', code: 'location ~* \\.(js|css|png|jpg|webp|woff2)$ {\n  expires 1y;\n  add_header Cache-Control "public, immutable";\n}' },
    ],
  },
  'total-blocking-time': {
    why: 'Long JS tasks block the main thread, making the page unresponsive.',
    fixes: [
      { text: 'Break up long tasks', code: "for (let i = 0; i < items.length; i++) {\n  processItem(items[i]);\n  if (i % 50 === 0) await new Promise(r => setTimeout(r, 0));\n}" },
      { text: 'Move heavy work to Web Workers', code: 'const worker = new Worker("worker.js");\nworker.postMessage(data);\nworker.onmessage = e => console.log(e.data);' },
    ],
  },
  'uses-text-compression': {
    why: 'HTML/CSS/JS not compressed — compression reduces transfer by 60-80%.',
    fixes: [
      { text: 'Enable Gzip in Express', code: 'const compression = require("compression");\napp.use(compression({ level: 6 }));' },
      { text: 'Enable Gzip + Brotli in Nginx', code: 'gzip on; gzip_types text/css application/javascript;\nbrotli on; brotli_comp_level 6;' },
    ],
  },
  'largest-contentful-paint': {
    why: 'The largest visible element takes too long to appear. LCP is a Core Web Vital.',
    fixes: [
      { text: 'Preload the LCP image', code: '<link rel="preload" as="image" href="hero.jpg" fetchpriority="high">' },
      { text: 'Add fetchpriority=high to LCP image', code: '<img src="hero.jpg" fetchpriority="high" loading="eager" width="1200" height="600" alt="...">' },
    ],
  },
  'cumulative-layout-shift': {
    why: 'Elements shift position while loading. CLS is a Core Web Vital.',
    fixes: [
      { text: 'Always set width & height on images', code: '<img src="photo.jpg" width="800" height="600" alt="...">' },
      { text: 'Reserve space for dynamic content', code: '.ad-container { min-height: 250px; contain: layout; }' },
    ],
  },
  'font-display': {
    why: 'Fonts block text rendering — users see blank text while fonts load.',
    fixes: [{ text: 'Use font-display: swap', code: "@font-face {\n  font-family: 'MyFont';\n  src: url('font.woff2') format('woff2');\n  font-display: swap;\n}" }],
  },
  'dom-size': {
    why: 'Too many DOM elements slow rendering. Target < 1,500 nodes.',
    fixes: [{ text: 'Use virtual scrolling for long lists', code: "import { FixedSizeList } from 'react-window';\n\n<FixedSizeList height={500} itemCount={10000} itemSize={50}>\n  {({ index, style }) => <div style={style}>Row {index}</div>}\n</FixedSizeList>" }],
  },
  'document-title': {
    why: 'Missing title tag — search engines use this as the headline in results.',
    fixes: [{ text: 'Add unique title to every page', code: '<title>Primary Keyword - Secondary | Brand Name</title>' }],
  },
  'meta-description': {
    why: 'Missing meta description — shows as snippet in search results.',
    fixes: [{ text: 'Add unique meta description', code: '<meta name="description" content="150-160 char description with main keyword">' }],
  },
  'image-alt': {
    why: 'Images missing alt text — screen readers cannot describe them.',
    fixes: [{ text: 'Add descriptive alt text', code: '<img src="logo.png" alt="Acme Corp logo">' }],
  },
  'color-contrast': {
    why: 'Text/background contrast too low. Minimum: 4.5:1 for normal text.',
    fixes: [{ text: 'Fix low-contrast colors', code: '/* Bad */ .text { color: #aaa; }\n/* Good */ .text { color: #595959; }' }],
  },
  'is-on-https': {
    why: "Site not on HTTPS — browsers show 'Not Secure'. Google penalizes HTTP.",
    fixes: [{ text: "Get free SSL with Let's Encrypt", code: 'sudo certbot --nginx -d yourdomain.com' }],
  },
  'tap-targets': {
    why: 'Buttons/links too small on mobile — minimum 48x48px tap area needed.',
    fixes: [{ text: 'Set minimum tap target size', code: 'button, a { min-height: 48px; min-width: 48px; padding: 12px 16px; }' }],
  },
  'no-vulnerable-libraries': {
    why: 'JS libraries with known security vulnerabilities detected.',
    fixes: [{ text: 'Audit and fix vulnerable packages', code: 'npm audit\nnpm audit fix' }],
  },
  'link-name': {
    why: 'Links have no accessible name — screen readers just say "link".',
    fixes: [{ text: 'Add descriptive text or aria-label to links', code: '<a href="/about" aria-label="Learn more about us">Learn more</a>' }],
  },
  'button-name': {
    why: 'Buttons have no accessible name.',
    fixes: [{ text: 'Add aria-label to icon buttons', code: '<button aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>' }],
  },
  'heading-order': {
    why: 'Headings skip levels (H1→H3), breaking screen reader navigation.',
    fixes: [{ text: 'Use headings in sequential order', code: '<h1>Page Title</h1>\n  <h2>Section</h2>\n    <h3>Sub-section</h3>' }],
  },
}

/* ─────────────────────────────────────────────
   KEY FIX: Safe audit array extractor
   Handles both { audits: { performance: [...] } }
   and flat structures
───────────────────────────────────────────── */
function getAuditArray(metrics, category) {
  if (!metrics) return []
  // Try nested: metrics.audits.performance
  if (metrics.audits && Array.isArray(metrics.audits[category])) {
    return metrics.audits[category]
  }
  // Try flat: metrics.performance (array)
  if (Array.isArray(metrics[category])) {
    return metrics[category]
  }
  return []
}

function getCwv(metrics) {
  if (!metrics) return {}
  return metrics.coreWebVitals || metrics.cwv || {}
}

function getScore(metrics, key) {
  if (!metrics) return 0
  return metrics[key] || 0
}

/* ─────────────────────────────────────────────
   HTML ESCAPE
───────────────────────────────────────────── */
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* ─────────────────────────────────────────────
   AUDIT GROUP BUILDER
───────────────────────────────────────────── */
function buildAuditGroup(emoji, title, audits) {
  if (!audits || !Array.isArray(audits) || audits.length === 0) {
    return `
<div class="ag">
  <div class="ag-hd">
    <span class="ag-emoji">${emoji}</span>
    <span class="ag-title">${title}</span>
    <span class="ag-badges"><span class="badge pass">No audits found</span></span>
  </div>
</div>`
  }

  const failed = audits.filter(a => (a.score ?? 1) < 0.5)
  const warned = audits.filter(a => (a.score ?? 1) >= 0.5 && (a.score ?? 1) < 0.9)
  const passed = audits.filter(a => (a.score ?? 1) >= 0.9)
  const sorted = [...failed, ...warned, ...passed]

  return `
<div class="ag">
  <div class="ag-hd">
    <span class="ag-emoji">${emoji}</span>
    <span class="ag-title">${title}</span>
    <span class="ag-badges">
      ${failed.length > 0 ? `<span class="badge fail">${failed.length} Failed</span>` : ''}
      ${warned.length > 0 ? `<span class="badge warn">${warned.length} Warning</span>` : ''}
      ${passed.length > 0 ? `<span class="badge pass">${passed.length} Passed</span>` : ''}
    </span>
  </div>
  ${sorted.map(a => {
    const score = a.score ?? 1
    const sol = SOLUTIONS[a.id]
    const bc  = score >= 0.9 ? 'pass' : score >= 0.5 ? 'warn' : 'fail'
    // FIX: Safely get title — avoid truncation with backtick
    const auditTitle = esc(a.title || a.id || 'Unknown audit')
    const auditDesc  = esc(a.description || '')
    const auditVal   = esc(a.displayValue || '')
    const items      = Array.isArray(a.items) ? a.items : []
    const itemCount  = a.itemCount || items.length

    return `
    <div class="ai ai-${bc}">
      <div class="ai-top">
        <div class="ai-left">
          <span class="dot dot-${bc}"></span>
          <div>
            <div class="ai-name">${auditTitle}</div>
            ${auditVal ? `<div class="ai-val">${auditVal}</div>` : ''}
          </div>
        </div>
        <span class="badge ${bc}">${badgeTxt(score)}</span>
      </div>
      ${auditDesc ? `<div class="ai-desc">${auditDesc}</div>` : ''}
      ${sol && score < 0.9 ? `
        <div class="why-box"><strong>Why this matters:</strong> ${esc(sol.why)}</div>
        <div class="fix-box">
          <div class="fix-hd">How to Fix</div>
          ${sol.fixes.map((f, i) => `
            <div class="fix-step">${i + 1}. ${esc(f.text)}</div>
            ${f.code ? `<pre class="code">${esc(f.code)}</pre>` : ''}
          `).join('')}
        </div>
      ` : ''}
      ${items.length > 0 ? `
        <div class="res-box">
          <div class="res-hd">Affected Resources (${itemCount})</div>
          ${items.slice(0, 5).map(item => `
            <div class="res-row">
              ${item.url ? `<div class="res-url">${esc(item.url.length > 100 ? '...' + item.url.slice(-98) : item.url)}</div>` : ''}
              <div class="res-meta">
                ${item.size    ? `Size: <b>${esc(item.size)}</b>` : ''}
                ${item.savings ? ` &middot; Save: <b>${esc(item.savings)}</b>` : ''}
                ${item.time    ? ` &middot; Wasted: <b>${esc(item.time)}</b>` : ''}
              </div>
            </div>
          `).join('')}
          ${itemCount > 5 ? `<div class="res-more">+ ${itemCount - 5} more items</div>` : ''}
        </div>
      ` : ''}
    </div>`
  }).join('')}
</div>`
}

/* ─────────────────────────────────────────────
   DEVICE BLOCK BUILDER
   KEY FIX: Uses getAuditArray() for safe extraction
───────────────────────────────────────────── */
function buildDeviceBlock(emoji, label, metrics, auditedUrl) {
  // FIX: Check if metrics exists and has any useful data
  if (!metrics) {
    return `
<div class="db">
  <div class="db-hd">
    <span class="db-emoji">${emoji}</span>
    <div>
      <div class="db-title">${label} Analysis</div>
      <div class="db-sub" style="color:#dc2626">No ${label.toLowerCase()} data available — audit may not have included ${label.toLowerCase()} results.</div>
    </div>
  </div>
</div>`
  }

  // FIX: Extract audits safely regardless of structure
  const perfAudits = getAuditArray(metrics, 'performance')
  const seoAudits  = getAuditArray(metrics, 'seo')
  const a11yAudits = getAuditArray(metrics, 'accessibility')
  const bpAudits   = getAuditArray(metrics, 'bestPractices')
  const cwv        = getCwv(metrics)

  const perf = getScore(metrics, 'performance')
  const seo  = getScore(metrics, 'seo')
  const a11y = getScore(metrics, 'accessibility')
  const bp   = getScore(metrics, 'bestPractices')

  const allAudits  = [...perfAudits, ...seoAudits, ...a11yAudits, ...bpAudits]
  const totalIssues = allAudits.filter(a => (a.score ?? 1) < 0.9).length

  return `
<div class="db">
  <div class="db-hd">
    <span class="db-emoji">${emoji}</span>
    <div class="db-info">
      <div class="db-title">${label} Analysis</div>
      <div class="db-sub">${esc(auditedUrl || '')} &middot; ${totalIssues} issues found</div>
    </div>
  </div>

  <!-- Score Cards -->
  <div class="sc-grid">
    ${[['Performance', perf], ['SEO', seo], ['Accessibility', a11y], ['Best Practices', bp]].map(([lbl, val]) => `
    <div class="sc-card">
      <div class="sc-num" style="color:${sc(val)}">${val}</div>
      <div class="sc-lbl">${lbl}</div>
      <div class="sc-bar-wrap"><div class="sc-bar" style="width:${val}%;background:${sc(val)}"></div></div>
      <div class="sc-status">${val >= 90 ? '&#10003; Good' : val >= 50 ? '&#9888; Needs Work' : '&#10007; Poor'}</div>
    </div>`).join('')}
  </div>

  <!-- Core Web Vitals -->
  <div class="cwv-wrap">
    <div class="cwv-title">Core Web Vitals</div>
    <div class="cwv-grid">
      ${[
        ['LCP',         cwv.LCP         || cwv.lcp,         '&le; 2.5s',  'Largest Contentful Paint'],
        ['CLS',         cwv.CLS         || cwv.cls,         '&le; 0.1',   'Cumulative Layout Shift'],
        ['TBT',         cwv.TBT         || cwv.tbt,         '&le; 200ms', 'Total Blocking Time'],
        ['FCP',         cwv.FCP         || cwv.fcp,         '&le; 1.8s',  'First Contentful Paint'],
        ['TTFB',        cwv.TTFB        || cwv.ttfb,        '&le; 800ms', 'Time to First Byte'],
        ['Speed Index', cwv.SpeedIndex  || cwv.speedIndex,  '&le; 3.4s',  'Speed Index'],
      ].map(([k, v, good, full]) => `
      <div class="cwv-card">
        <div class="cwv-key">${k}</div>
        <div class="cwv-val">${v ? esc(String(v)) : '&mdash;'}</div>
        <div class="cwv-good">${good}</div>
        <div class="cwv-full">${full}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- All 4 Audit Groups -->
  ${buildAuditGroup('&#9889;', 'Performance',    perfAudits)}
  ${buildAuditGroup('&#128269;', 'SEO',          seoAudits)}
  ${buildAuditGroup('&#9855;', 'Accessibility',  a11yAudits)}
  ${buildAuditGroup('&#128737;', 'Best Practices', bpAudits)}
</div>`
}

/* ─────────────────────────────────────────────
   FULL REPORT HTML
───────────────────────────────────────────── */
function generateReport({ pageData, auditedUrl, websiteName, websiteUrl }) {
  const ts      = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
  const mobile  = pageData?.mobile  || null
  const desktop = pageData?.desktop || null

  const mPerf = getScore(mobile,  'performance')
  const mSeo  = getScore(mobile,  'seo')
  const mA11y = getScore(mobile,  'accessibility')
  const mBp   = getScore(mobile,  'bestPractices')
  const dPerf = getScore(desktop, 'performance')
  const dSeo  = getScore(desktop, 'seo')
  const dA11y = getScore(desktop, 'accessibility')
  const dBp   = getScore(desktop, 'bestPractices')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lighthouse Report &mdash; ${esc(websiteName || websiteUrl || auditedUrl || 'Website')}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#f0f4f8;color:#1a2332;font-size:13px;line-height:1.6}
@media print{
  body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .no-print{display:none!important}
  .db{page-break-before:always}
  .ag{page-break-inside:avoid}
  .ai{page-break-inside:avoid}
}
.print-btn{
  position:fixed;top:20px;right:20px;z-index:1000;
  background:#1d4ed8;color:#fff;border:none;padding:11px 22px;
  border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;gap:6px;font-family:inherit;letter-spacing:0.3px;
}
@media(max-width:500px){.print-btn{bottom:16px;top:auto;right:50%;transform:translateX(50%)}}
.wrap{max-width:1020px;margin:0 auto;padding:32px 20px 100px}

/* HERO */
.hero{background:#0f172a;border-radius:24px;padding:40px;color:#fff;margin-bottom:28px}
.hero-eyebrow{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);padding:4px 14px;border-radius:50px;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#a5f3fc;margin-bottom:16px}
.hero-name{font-size:30px;font-weight:900;margin-bottom:6px;line-height:1.15;letter-spacing:-0.5px}
.hero-url{color:#60a5fa;font-size:13px;word-break:break-all;margin-bottom:4px}
.hero-meta{color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:24px}
.hero-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
@media(max-width:580px){.hero-summary{grid-template-columns:repeat(2,1fr)}}
.hs-card{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:16px;text-align:center}
.hs-num{font-size:32px;font-weight:900;line-height:1;margin-bottom:4px}
.hs-lbl{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.45);margin-bottom:2px}
.hs-device{font-size:10px;color:rgba(255,255,255,0.3)}

/* TOC */
.toc{background:#fff;border-radius:16px;padding:24px 28px;margin-bottom:28px;border:1px solid #e2e8f0}
.toc-title{font-size:14px;font-weight:800;color:#0f172a;margin-bottom:14px}
.toc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media(max-width:500px){.toc-grid{grid-template-columns:1fr}}
.toc-item{display:flex;align-items:center;gap:8px;font-size:12px;color:#475569;padding:9px 12px;border-radius:9px;background:#f8fafc;border:1px solid #e2e8f0}

/* Section heading */
.sec-hd{display:flex;align-items:center;gap:14px;margin:36px 0 20px;flex-wrap:wrap}
.sec-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.sec-text h2{font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.3px}
.sec-text p{font-size:11px;color:#64748b;margin-top:3px}

/* Device block */
.db{background:#fff;border-radius:22px;padding:28px 24px;margin-bottom:28px;border:1px solid #e2e8f0}
.db-hd{display:flex;align-items:center;gap:18px;margin-bottom:28px;padding-bottom:22px;border-bottom:2px solid #f1f5f9;flex-wrap:wrap}
.db-emoji{font-size:40px;flex-shrink:0;line-height:1}
.db-title{font-size:20px;font-weight:900;color:#0f172a;letter-spacing:-0.3px}
.db-sub{font-size:11px;color:#64748b;margin-top:4px;word-break:break-all}

/* Score grid */
.sc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
@media(max-width:580px){.sc-grid{grid-template-columns:repeat(2,1fr)}}
.sc-card{background:#f8fafc;border-radius:16px;padding:18px 12px;text-align:center;border:1px solid #e2e8f0}
.sc-num{font-size:38px;font-weight:900;line-height:1;margin-bottom:4px}
.sc-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin-bottom:10px}
.sc-bar-wrap{height:5px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin-bottom:8px}
.sc-bar{height:100%;border-radius:99px}
.sc-status{font-size:10px;font-weight:600;color:#64748b}

/* CWV */
.cwv-wrap{margin-bottom:32px}
.cwv-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2.5px;color:#64748b;margin-bottom:14px}
.cwv-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
@media(max-width:600px){.cwv-grid{grid-template-columns:repeat(3,1fr)}}
.cwv-card{background:#f8fafc;border-radius:12px;padding:14px 8px;text-align:center;border:1px solid #e2e8f0}
.cwv-key{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin-bottom:6px}
.cwv-val{font-size:15px;font-weight:900;color:#1e293b;margin-bottom:3px;word-break:break-word}
.cwv-good{font-size:9px;color:#16a34a;font-weight:600}
.cwv-full{font-size:8px;color:#94a3b8;margin-top:2px}

/* Audit group */
.ag{margin-bottom:24px}
.ag-hd{display:flex;align-items:center;gap:10px;padding:14px 18px;background:#f1f5f9;border-radius:14px;margin-bottom:12px;flex-wrap:wrap}
.ag-emoji{font-size:18px}
.ag-title{font-size:15px;font-weight:800;color:#0f172a;flex:1;letter-spacing:-0.2px}
.ag-badges{display:flex;gap:6px;flex-wrap:wrap}

/* Badge */
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;border:1px solid}
.badge.fail{background:#fee2e2;color:#dc2626;border-color:#fca5a5}
.badge.warn{background:#fef9c3;color:#d97706;border-color:#fde68a}
.badge.pass{background:#dcfce7;color:#16a34a;border-color:#86efac}

/* Audit item */
.ai{border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:8px}
.ai-fail{border-left:4px solid #dc2626}
.ai-warn{border-left:4px solid #d97706}
.ai-pass{border-left:4px solid #16a34a}
.ai-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:14px 16px;flex-wrap:wrap}
.ai-left{display:flex;align-items:flex-start;gap:10px;flex:1}
.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-top:4px}
.dot-fail{background:#dc2626}
.dot-warn{background:#d97706}
.dot-pass{background:#16a34a}
.ai-name{font-size:12px;font-weight:700;color:#1e293b;line-height:1.4}
.ai-val{font-size:11px;font-weight:700;color:#d97706;margin-top:2px}
.ai-desc{font-size:11px;color:#64748b;line-height:1.7;padding:0 16px 12px 35px}
.why-box{margin:0 16px 10px 35px;padding:11px 14px;border-radius:10px;background:#fefce8;border:1px solid #fde68a;font-size:11px;color:#92400e;line-height:1.65}
.fix-box{margin:0 16px 14px 35px;padding:12px 14px;border-radius:10px;background:#f0fdf4;border:1px solid #86efac}
.fix-hd{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#16a34a;margin-bottom:10px}
.fix-step{font-size:11px;color:#166534;margin-bottom:5px;font-weight:500}
.code{background:#0f172a;color:#a8d8f0;border-radius:8px;padding:11px 14px;font-family:'JetBrains Mono',monospace;font-size:10px;overflow-x:auto;white-space:pre;margin:6px 0 10px;border:1px solid #1e293b;display:block}
.res-box{margin:0 16px 14px 35px;background:#f8fafc;border-radius:10px;padding:12px;border:1px solid #e2e8f0}
.res-hd{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin-bottom:10px}
.res-row{padding:7px 10px;border-radius:8px;margin-bottom:5px;background:#fff;border:1px solid #e2e8f0}
.res-url{font-family:'JetBrains Mono',monospace;font-size:10px;color:#1d4ed8;word-break:break-all;margin-bottom:3px}
.res-meta{font-size:10px;color:#94a3b8}
.res-meta b{color:#475569}
.res-more{font-size:10px;color:#94a3b8;text-align:center;margin-top:6px}

/* Footer */
.footer{text-align:center;color:#94a3b8;font-size:11px;margin-top:52px;padding-top:24px;border-top:1px solid #e2e8f0}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">Save as PDF</button>

<div class="wrap">

  <!-- HERO -->
  <div class="hero">
    <div class="hero-eyebrow">Lighthouse Performance Report</div>
    <div class="hero-name">${esc(websiteName || websiteUrl || 'Website Analysis')}</div>
    ${websiteUrl ? `<div class="hero-url">${esc(websiteUrl)}</div>` : ''}
    <div class="hero-meta">Generated: ${ts} &middot; Google Lighthouse &middot; Mobile + Desktop</div>
    <div class="hero-summary">
      ${[['Performance', mPerf], ['SEO', mSeo], ['Accessibility', mA11y], ['Best Practices', mBp]].map(([lbl, val]) => `
      <div class="hs-card">
        <div class="hs-num" style="color:${sc(val)}">${val}</div>
        <div class="hs-lbl">${lbl}</div>
        <div class="hs-device">Mobile</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Desktop scores summary row -->
  ${desktop ? `
  <div style="background:#fff;border-radius:16px;padding:20px 24px;margin-bottom:28px;border:1px solid #e2e8f0">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin-bottom:14px">Desktop Scores</div>
    <div class="sc-grid">
      ${[['Performance', dPerf], ['SEO', dSeo], ['Accessibility', dA11y], ['Best Practices', dBp]].map(([lbl, val]) => `
      <div class="sc-card">
        <div class="sc-num" style="color:${sc(val)}">${val}</div>
        <div class="sc-lbl">${lbl}</div>
        <div class="sc-bar-wrap"><div class="sc-bar" style="width:${val}%;background:${sc(val)}"></div></div>
        <div class="sc-status">Desktop</div>
      </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- TOC -->
  <div class="toc">
    <div class="toc-title">Report Contents</div>
    <div class="toc-grid">
      <div class="toc-item">Mobile &mdash; Performance, SEO, Accessibility, Best Practices</div>
      <div class="toc-item">Desktop &mdash; Performance, SEO, Accessibility, Best Practices</div>
      <div class="toc-item">Core Web Vitals &mdash; LCP, CLS, TBT, FCP, TTFB, Speed Index</div>
      <div class="toc-item">Fix recommendations for every failed audit</div>
    </div>
  </div>

  <!-- MOBILE -->
  <div class="sec-hd">
    <div class="sec-icon" style="background:#eff6ff;font-size:26px">&#128241;</div>
    <div class="sec-text">
      <h2>Mobile Report</h2>
      <p>Simulates Moto G4 on slow 4G &mdash; most important for Google ranking</p>
    </div>
  </div>
  ${buildDeviceBlock('&#128241;', 'Mobile', mobile, auditedUrl)}

  <!-- DESKTOP -->
  <div class="sec-hd">
    <div class="sec-icon" style="background:#f0fdf4;font-size:26px">&#128421;</div>
    <div class="sec-text">
      <h2>Desktop Report</h2>
      <p>Full desktop browser simulation &mdash; fast network, full CPU</p>
    </div>
  </div>
  ${buildDeviceBlock('&#128421;', 'Desktop', desktop, auditedUrl)}

  <div class="footer">
    Lighthouse Report &middot; Powered by Google PageSpeed Insights &middot; ${ts}
  </div>
</div>
</body>
</html>`
}

/* ─────────────────────────────────────────────
   EXPORT BUTTON COMPONENT
───────────────────────────────────────────── */
// export default function ExportButton({ pageData, auditedUrl, websiteName, websiteUrl }) {
//   const [busy, setBusy] = useState(false)

//   const handleExport = () => {
//     if (!pageData) return
//     setBusy(true)
//     setTimeout(() => {
//       try {
//         const html = generateReport({ pageData, auditedUrl, websiteName, websiteUrl })
//         const win = window.open('', '_blank')
//         if (win) {
//           win.document.write(html)
//           win.document.close()
//         }
//       } catch (err) {
//         console.error('Export failed:', err)
//       } finally {
//         setBusy(false)
//       }
//     }, 80)
//   }

//   return (
//     <button
//       type="button"
//       onClick={handleExport}
//       disabled={busy || !pageData}
//       title={!pageData ? 'Run the audit first' : 'Export full Lighthouse report — Mobile + Desktop, all categories'}
//       style={{
//         display: 'inline-flex',
//         alignItems: 'center',
//         gap: '6px',
//         padding: '8px 14px',
//         borderRadius: '99px',
//         border: 'none',
//         background: pageData ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)' : 'rgba(0,0,0,0.1)',
//         color: '#fff',
//         fontSize: '12px',
//         fontWeight: '700',
//         cursor: pageData ? 'pointer' : 'not-allowed',
//         opacity: pageData ? 1 : 0.5,
//         transition: 'all 0.2s',
//         whiteSpace: 'nowrap',
//         fontFamily: 'inherit',
//         boxShadow: pageData ? '0 2px 12px rgba(29,78,216,0.35)' : 'none',
//       }}
//     >
//       {busy
//         ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
//         : <FileDown size={13} />
//       }
//       {busy ? 'Generating...' : 'Export PDF'}
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </button>
//   )
// }


/* ─────────────────────────────────────────────
    EXPORT BUTTON COMPONENT (Fixed)
───────────────────────────────────────────── */
export default function ExportButton({ pageData, auditedUrl, websiteName, websiteUrl, isDark }) {
  const [busy, setBusy] = useState(false)

  const handleExport = () => {
    if (!pageData) return
    setBusy(true)
    setTimeout(() => {
      try {
        const html = generateReport({ pageData, auditedUrl, websiteName, websiteUrl })
        const win = window.open('', '_blank')
        if (win) {
          win.document.write(html)
          win.document.close()
        }
      } catch (err) {
        console.error('Export failed:', err)
      } finally {
        setBusy(false)
      }
    }, 80)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy || !pageData}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        background: busy || !pageData ? (isDark ? 'rgba(255,255,255,0.05)' : '#94A3B8') : (isDark ? 'linear-gradient(180deg, #334155 0%, #0F172A 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)'),
        color: busy || !pageData ? (isDark ? 'rgba(255,255,255,0.4)' : '#FFFFFF') : (isDark ? '#F8FAFC' : '#0F172A'),
        border: busy || !pageData ? 'none' : (isDark ? '1px solid #475569' : '1px solid #E2E8F0'),
        padding: '0.6rem 1.1rem', borderRadius: '10px',
        fontSize: '0.85rem', fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        cursor: busy || !pageData ? 'not-allowed' : 'pointer',
        opacity: pageData ? 1 : 0.6,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        whiteSpace: 'nowrap',
        boxShadow: busy || !pageData ? 'none' : (isDark ? '0 1px 3px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)'),
      }}
      onMouseEnter={(e) => {
        if(pageData && !busy) {
           e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.03)';
           e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if(pageData && !busy) {
           e.currentTarget.style.boxShadow = isDark ? '0 1px 3px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)';
           e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {busy ? (
        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <FileDown size={15} color={isDark ? "#94A3B8" : "#475569"} />
      )}
      <span style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{busy ? 'Generating...' : 'Export PDF'}</span>
      
      {/* CSS Animation for Loader */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </button>
  )
}