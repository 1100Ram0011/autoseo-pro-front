import { Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
const fmtDuration = (s) => {
  if (!s) return "0m 0s";
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
};
const pct = (a, b) => (!b ? "0.0" : ((a / b) * 100).toFixed(1));
const scoreLabel = (s) => s >= 90 ? "Good" : s >= 50 ? "Fair" : "Poor";
const scoreColor = (s) => s >= 90 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

/* ════════════════════════════════════════
   CSV
════════════════════════════════════════ */
function exportCSV(analytics, pageSpeed, websiteName, websiteUrl, dateLabel) {
  const rows = [];
  const add = (...cells) => rows.push(cells);
  const gap = () => rows.push([]);

  add("AutoSEO.Pro  — ANALYTICS REPORT");
  add("Website", websiteUrl || websiteName);
  add("Period", dateLabel);
  add("Date", new Date().toLocaleString("en-IN"));
  gap();

  add("OVERVIEW");
  add("Metric", "Value", "What it means");
  add("Total Users", analytics.users || 0, "Unique visitors in selected period");
  add("Sessions", analytics.sessions || 0, "Total visits (1 user can have multiple)");
  add("Realtime Users", analytics.realtimeUsers || 0, "People on site right now");
  add("Bounce Rate", `${(analytics.bounceRate || 0).toFixed(1)}%`, "Left after viewing just 1 page");
  add("Avg Session", fmtDuration(analytics.avgSessionDuration), "Time spent per visit");
  add("Pages / Session", (analytics.pagesPerSession || 0).toFixed(1), "Pages explored per visit");
  gap();

  if (analytics.newReturning && Object.keys(analytics.newReturning).length) {
    add("NEW VS RETURNING");
    add("Type", "Users", "Share", "Meaning");
    const tot = Object.values(analytics.newReturning).reduce((s, v) => s + v, 0);
    Object.entries(analytics.newReturning).forEach(([k, v]) =>
      add(k, v, `${pct(v, tot)}%`,
        k.toLowerCase() === "new" ? "First-time visitors" : "Came back again"
      )
    );
    gap();
  }

  if (analytics.trafficSources && Object.keys(analytics.trafficSources).length) {
    add("TRAFFIC SOURCES");
    add("Source", "Sessions", "Share", "Type");
    const tot = Object.values(analytics.trafficSources).reduce((s, v) => s + v, 0);
    const srcDesc = {
      organic: "Search Engine (Google/Bing)", direct: "Direct / Bookmark",
      social: "Social Media", referral: "Other Website Link", email: "Email Campaign"
    };
    Object.entries(analytics.trafficSources).sort((a, b) => b[1] - a[1]).forEach(([src, val]) =>
      add(src, val, `${pct(val, tot)}%`, srcDesc[src.toLowerCase()] || "Other")
    );
    gap();
  }

  if (analytics.topPages?.length) {
    add("TOP PAGES");
    add("Rank", "Page URL", "Views", "Share");
    const tot = analytics.topPages.reduce((s, p) => s + p.views, 0);
    analytics.topPages.forEach((p, i) => add(i + 1, p.page, p.views, `${pct(p.views, tot)}%`));
    gap();
  }

  if (analytics.landingPages?.length) {
    add("LANDING PAGES — Where Users Entered");
    add("Rank", "Page", "Sessions", "Bounce Rate", "Status");
    analytics.landingPages.forEach((p, i) =>
      add(i + 1, p.page, p.sessions || 0, `${(p.bounceRate || 0).toFixed(1)}%`,
          (p.bounceRate || 0) > 70 ? "High" : (p.bounceRate || 0) > 40 ? "Medium" : "Good")
    );
    gap();
  }

  if (analytics.exitPages?.length) {
    add("EXIT PAGES — Where Users Left");
    add("Rank", "Page", "Views", "Exit Rate", "Priority");
    analytics.exitPages.forEach((p, i) =>
      add(i + 1, p.page, p.exits || 0, `${(p.exitRate || 0).toFixed(1)}%`,
          (p.exitRate || 0) > 60 ? "High" : (p.exitRate || 0) > 30 ? "Medium" : "Low")
    );
    gap();
  }

  if (analytics.countries && Object.keys(analytics.countries).length) {
    add("TOP COUNTRIES");
    add("Rank", "Country", "Users", "Share");
    const tot = Object.values(analytics.countries).reduce((s, v) => s + v, 0);
    Object.entries(analytics.countries).sort((a, b) => b[1] - a[1])
      .forEach(([c, v], i) => add(i + 1, c, v, `${pct(v, tot)}%`));
    gap();
  }

  if (analytics.cities && Object.keys(analytics.cities).length) {
    add("TOP CITIES");
    add("Rank", "City", "Users", "Share");
    const tot = Object.values(analytics.cities).reduce((s, v) => s + v, 0);
    Object.entries(analytics.cities).sort((a, b) => b[1] - a[1])
      .forEach(([c, v], i) => add(i + 1, c, v, `${pct(v, tot)}%`));
    gap();
  }

  if (analytics.regions && Object.keys(analytics.regions).length) {
    add("TOP STATES / REGIONS");
    add("Rank", "Region", "Users", "Share");
    const tot = Object.values(analytics.regions).reduce((s, v) => s + v, 0);
    Object.entries(analytics.regions).sort((a, b) => b[1] - a[1])
      .forEach(([c, v], i) => add(i + 1, c, v, `${pct(v, tot)}%`));
    gap();
  }

  if (analytics.devices && Object.keys(analytics.devices).length) {
    add("DEVICES");
    add("Device", "Users", "Share");
    const tot = Object.values(analytics.devices).reduce((s, v) => s + v, 0);
    Object.entries(analytics.devices).sort((a, b) => b[1] - a[1])
      .forEach(([c, v]) => add(c, v, `${pct(v, tot)}%`));
    gap();
  }

  if (analytics.browsers && Object.keys(analytics.browsers).length) {
    add("BROWSERS");
    add("Browser", "Users", "Share");
    const tot = Object.values(analytics.browsers).reduce((s, v) => s + v, 0);
    Object.entries(analytics.browsers).sort((a, b) => b[1] - a[1])
      .forEach(([c, v]) => add(c, v, `${pct(v, tot)}%`));
    gap();
  }

  if (analytics.operatingSystems && Object.keys(analytics.operatingSystems).length) {
    add("OPERATING SYSTEMS");
    add("OS", "Users", "Share");
    const tot = Object.values(analytics.operatingSystems).reduce((s, v) => s + v, 0);
    Object.entries(analytics.operatingSystems).sort((a, b) => b[1] - a[1])
      .forEach(([c, v]) => add(c, v, `${pct(v, tot)}%`));
    gap();
  }

  if (analytics.realtimeDetail) {
    if (analytics.realtimeDetail.byPage?.length) {
      add("REALTIME - ACTIVE BY PAGE");
      add("Page", "Active Users");
      analytics.realtimeDetail.byPage.forEach(r => add(r.name || "Unknown", r.users));
      gap();
    }
    if (analytics.realtimeDetail.byCountry?.length) {
      add("REALTIME - ACTIVE BY COUNTRY");
      add("Country", "Active Users");
      analytics.realtimeDetail.byCountry.forEach(r => add(r.name || "Unknown", r.users));
      gap();
    }
    if (analytics.realtimeDetail.byDevice?.length) {
      add("REALTIME - ACTIVE BY DEVICE");
      add("Device", "Active Users");
      analytics.realtimeDetail.byDevice.forEach(r => add(r.name || "Unknown", r.users));
      gap();
    }
  }

  if (analytics.trend?.length) {
    add("DAILY TREND");
    add("Date", "Users", "Sessions", "Day Change");
    analytics.trend.forEach((t, i) => {
      const prev = i > 0 ? analytics.trend[i - 1].users : null;
      const change = prev ? `${((t.users - prev) / Math.max(prev, 1) * 100).toFixed(1)}%` : "—";
      add(t.date, t.users, t.sessions, change);
    });
    gap();
  }

  if (pageSpeed?.mobile) {
    add("PAGESPEED — MOBILE");
    add("Metric", "Score", "Status");
    [["Performance", "performance"], ["SEO", "seo"], ["Accessibility", "accessibility"], ["Best Practices", "bestPractices"]]
      .forEach(([l, k]) => add(l, pageSpeed.mobile[k] || 0, scoreLabel(pageSpeed.mobile[k] || 0)));
    if (pageSpeed.mobile.coreWebVitals) {
      gap();
      add("CORE WEB VITALS (Mobile)");
      add("Metric", "Value", "Good Threshold");
      const c = pageSpeed.mobile.coreWebVitals;
      add("LCP", c.LCP || "—", "≤ 2.5s");
      add("CLS", c.CLS || "—", "≤ 0.1");
      add("INP", c.INP || "—", "≤ 200ms");
      add("TBT", c.TBT || "—", "≤ 200ms");
      add("Speed Index", c.SpeedIndex || "—", "≤ 3.4s");
    }
    gap();
  }

  if (analytics.conversions?.length) {
    add("CONVERSIONS");
    add("Event", "Count", "Share");
    const tot = analytics.conversions.reduce((s, c) => s + c.count, 0);
    analytics.conversions.forEach(c =>
      add(c.event.replace(/_/g, " "), c.count, `${pct(c.count, tot)}%`)
    );
    gap();
  }

  add("Generated by AutoSEO.Pro  ");

  const csv = rows.map(r =>
    r.map(v => { const s = String(v ?? ""); return (s.includes(",") || s.includes('"')) ? `"${s.replace(/"/g, '""')}"` : s; }).join(",")
  ).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `analytics-${(websiteName || "report").replace(/\s/g, "-").toLowerCase()}-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════
   PDF — BEAUTIFUL PROFESSIONAL REPORT
════════════════════════════════════════ */
async function exportPDF(analytics, pageSpeed, websiteName, websiteUrl, dateLabel) {
  if (!window.jspdf) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = 210, PH = 297, M = 16, COL = PW - M * 2;
  let y = M, pg = 1;

  /* ── palette ── */
  const P = {
    ink: [15, 23, 42],   // near-black bg
    paper: [248, 250, 252],  // off-white page
    card: [241, 245, 249],  // light card bg
    border: [203, 213, 225],  // subtle border
    // orange:    [37,  99,  235],  // primary orange
    // orangeL:   [219, 234, 254],  // orange tint

    // 🔥 PRIMARY THEME (Orange Gradient Style)
    orange: [255, 106, 0],    // #ff6a00
    orangeL: [255, 191, 24],   // #ffbf18
    accent: [255, 140, 0],    // strong orange

    green: [22, 163, 74],
    greenL: [220, 252, 231],
    amber: [217, 119, 6],
    amberL: [254, 243, 199],
    red: [220, 38, 38],
    redL: [254, 226, 226],
    purple: [124, 58, 237],
    purpleL: [237, 233, 254],
    text: [15, 23, 42],   // primary text
    sub: [71, 85, 105],  // secondary text
    hint: [148, 163, 184],  // muted
    white: [255, 255, 255],
    // accent:  [99,  102, 241],  // indigo accent
  };

  const F = (c) => doc.setFillColor(...c);
  const D = (c) => doc.setDrawColor(...c);
  const C = (c) => doc.setTextColor(...c);
  const LW = (w) => doc.setLineWidth(w);

  const scoreRGB = (s) =>
    s >= 90 ? P.green : s >= 50 ? P.amber : P.red;
  const scoreBgRGB = (s) =>
    s >= 90 ? P.greenL : s >= 50 ? P.amberL : P.redL;

  /* ── page setup ── */
  function setupPage() {
    F(P.paper); doc.rect(0, 0, PW, PH, "F");
    // left accent strip
    F(P.orange); doc.rect(0, 0, 3, PH, "F");
    // footer
    F(P.card); doc.rect(0, PH - 10, PW, 10, "F");
    D(P.border); LW(0.2); doc.line(3, PH - 10, PW, PH - 10);
    C(P.hint); doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text("AutoSEO.Pro - REPORT ", M, PH - 4);
    doc.text(`Page ${pg}`, PW - M, PH - 4, { align: "right" });
    doc.text(websiteUrl || websiteName, PW / 2, PH - 4, { align: "center" });
  }

  function newPage() {
    doc.addPage(); pg++;
    setupPage();
    y = M + 6;
  }

  function need(h) { if (y + h > PH - 14) newPage(); }

  /* ── typography ── */
  function H1(text) {
    need(14);
    C(P.text); doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(text, M, y); y += 10;
  }
  function H2(text) {
    need(12);
    C(P.text); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(text, M, y); y += 8;
  }
  function H3(text, color = P.sub) {
    need(8);
    C(color); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text(text.toUpperCase(), M, y);
    D(P.border); LW(0.3);
    doc.line(M + doc.getTextWidth(text.toUpperCase()) + 3, y - 1, M + COL, y - 1);
    y += 7;
  }
  function Body(text, indent = 0) {
    need(6);
    C(P.sub); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(text, M + indent, y); y += 5;
  }
  function Gap(h = 4) { y += h; }

  /* ── divider ── */
  function Divider() {
    need(4); D(P.border); LW(0.2);
    doc.line(M, y, M + COL, y); y += 5;
  }

  /* ── callout box ── */
  function Callout(text, type = "info") {
    // need(12);
    // const bg  = type==="success"?P.greenL: type==="warn"?P.amberL: type==="danger"?P.redL: P.orangeL;
    // const col = type==="success"?P.green : type==="warn"?P.amber  : type==="danger"?P.red  : P.orange;
    // F(bg); doc.roundedRect(M,y,COL,10,1.5,1.5,"F");
    // D(col); LW(0.3); doc.roundedRect(M,y,COL,10,1.5,1.5,"S");
    // F(col); doc.rect(M,y,3,10,"F");
    // C(col); doc.setFontSize(7.5); doc.setFont("helvetica","bold");
    // doc.text(text, M+6, y+6.5);
    // y+=13;
  }

  /* ── KPI card ── */
  function KpiCard(label, value, sub, color, x, w, h = 20) {
    F(P.white); doc.roundedRect(x, y, w, h, 2, 2, "F");
    D(color); LW(0.4); doc.roundedRect(x, y, w, h, 2, 2, "S");
    // top color bar
    F(color); doc.roundedRect(x, y, w, 3, 2, 2, "F");
    doc.rect(x, y + 1.5, w, 1.5, "F");
    // value
    C(P.text); doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text(String(value), x + w / 2, y + 10, { align: "center" });
    // label
    C(P.sub); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.text(label, x + w / 2, y + 14.5, { align: "center" });
    if (sub) { C(P.hint); doc.setFontSize(6); doc.text(sub, x + w / 2, y + 18, { align: "center" }); }
  }

  /* ── table ── */
  function Table(headers, rows2, widths, opts = {}) {
    const rowH = 7, headH = 8;
    need(headH + rows2.length * rowH);

    // header row
    F(P.ink); doc.rect(M, y, COL, headH, "F");
    let x = M + 2;
    headers.forEach((h, i) => {
      C(P.white); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      const align = opts.rightAlign?.includes(i) ? "right" : "left";
      doc.text(h, align === "right" ? x + widths[i] - 2 : x, y + 5.5, { align });
      x += widths[i];
    });
    y += headH;

    // data rows
    rows2.forEach((row, ri) => {
      need(rowH);
      F(ri % 2 === 0 ? P.white : P.card);
      doc.rect(M, y, COL, rowH, "F");
      D(P.border); LW(0.1); doc.rect(M, y, COL, rowH, "S");

      let x2 = M + 2;
      row.forEach((cell, ci) => {
        const txt = String(cell ?? "—");
        const align = opts.rightAlign?.includes(ci) ? "right" : "left";
        const cCol = opts.colorCol?.[ci]?.(cell) || P.text;
        C(cCol); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
        const maxW = widths[ci] - 3;
        const short = txt.length * 1.8 > maxW ? txt.slice(0, Math.floor(maxW / 1.8) - 1) + "…" : txt;
        doc.text(short, align === "right" ? x2 + widths[ci] - 2 : x2, y + 5, { align });
        x2 += widths[ci];
      });
      y += rowH;
    });
    D(P.border); LW(0.3); doc.rect(M, y - rows2.length * rowH - headH, COL, headH + rows2.length * rowH, "S");
    y += 3;
  }

  /* ── mini horizontal bar ── */
  // function MiniBar(val, max, bx, by, bw, bh, color) {
  //   F(P.card); doc.roundedRect(bx,by,bw,bh,0.5,0.5,"F");
  //   if (max>0) { F(color); doc.roundedRect(bx,by,(val/max)*bw,bh,0.5,0.5,"F"); }
  // }
  function MiniBar(val, max, bx, by, bw, bh, color) {
    const SAFE_WIDTH = Math.min(bw, 32); // 🔥 max limit fix

    // background (skeleton)
    F(P.card);
    doc.roundedRect(bx, by, SAFE_WIDTH, bh, 0.5, 0.5, "F");

    if (max > 0) {
      const fillW = Math.max(2, (val / max) * SAFE_WIDTH); // 🔥 minimum visible bar
      F(color);
      doc.roundedRect(bx, by, fillW, bh, 0.5, 0.5, "F");
    }
  }
  /* ── score pill ── */
  function ScorePill(score, sx, sy) {
    const c = scoreRGB(score);
    const bg = scoreBgRGB(score);
    F(bg); doc.roundedRect(sx, sy, 14, 7, 1, 1, "F");
    D(c); LW(0.3); doc.roundedRect(sx, sy, 14, 7, 1, 1, "S");
    C(c); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(String(score), sx + 7, sy + 5, { align: "center" });
  }

  /* ══════════════════
     PAGE 1 — COVER
  ══════════════════ */
  setupPage();

  // Big orange header
  F(P.ink); doc.rect(3, 0, PW - 3, 58, "F");
  // Decorative circles
  F([30, 41, 59]); doc.circle(PW - 20, 10, 18, "F");
  F([30, 41, 59]); doc.circle(PW - 8, 45, 22, "F");
  F(P.orange); doc.circle(PW - 20, 10, 9, "F");

  // Logo + title
  C(P.white); doc.setFontSize(26); doc.setFont("helvetica", "bold");
  doc.text("AutoSEO.Pro ", M + 2, 22);
  C(P.hint); doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Website Analytics Report", M + 2, 30);

  // Horizontal line
  F(P.orange); doc.rect(M + 2, 34, 40, 1, "F");

  // Website + period pills
  C(P.hint); doc.setFontSize(8);
  doc.text(`Website: ${websiteUrl || websiteName}`, M + 2, 42);
  doc.text(`Period: ${dateLabel}`, M + 2, 49);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, M + 2, 56);

  y = 72;

  // ── Table of contents ──
  H3("REPORT CONTENTS");
  const sections = [
    ["01", "Key Metrics Overview", "KPIs, Users, Sessions, Bounce Rate"],
    ["02", "Traffic Sources", "Where your visitors come from"],
    ["03", "Top Pages & User Flow", "Most visited, Landing & Exit pages"],
    ["04", "Audience & Geography", "Devices, Browsers, Countries"],
    //    ["05", "PageSpeed & Performance", "Lighthouse scores, Core Web Vitals"],
    ["05", "Trends & Conversions", "Daily data, Goals & Events"],
    //    ["07", "Summary & Recommendations", "Insights & action items"],
  ];

  sections.forEach(([no, title, desc], i) => {
    need(10);
    F(i % 2 === 0 ? P.white : P.card); doc.rect(M, y, COL, 9, "F");
    D(P.border); LW(0.1); doc.rect(M, y, COL, 9, "S");
    F(P.orange); doc.rect(M, y, 8, 9, "F");
    C(P.white); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(no, M + 4, y + 6, { align: "center" });
    C(P.text); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
    doc.text(title, M + 12, y + 6);
    C(P.hint); doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text(desc, M + 90, y + 6);
    y += 9;
  });

  /* ══════════════════════
     PAGE 2 — KEY METRICS
  ══════════════════════ */
  newPage();
  H2("01. Key Metrics Overview");
  Body("A snapshot of your website performance during the selected period.");
  Gap(4);

  // Row 1 — 4 cards
  const cw4 = (COL - 6) / 4;
  KpiCard("TOTAL USERS", (analytics.users || 0).toLocaleString(), "Unique visitors", P.orange, M, cw4, 22);
  KpiCard("SESSIONS", (analytics.sessions || 0).toLocaleString(), "Total visits", P.purple, M + cw4 + 2, cw4, 22);
  KpiCard("BOUNCE RATE", `${(analytics.bounceRate || 0).toFixed(1)}%`, analytics.bounceRate > 60 ? "Needs improvement" : "Normal", analytics.bounceRate > 60 ? P.red : P.green, M + 2 * (cw4 + 2), cw4, 22);
  KpiCard("AVG SESSION", fmtDuration(analytics.avgSessionDuration), "Time on site", P.accent, M + 3 * (cw4 + 2), cw4, 22);
  y += 26;

  // Row 2 — 3 cards
  const cw3 = (COL - 4) / 3;
  KpiCard("PAGES/SESSION", (analytics.pagesPerSession || 0).toFixed(1), "Engagement depth", P.green, M, cw3, 20);
  KpiCard("LIVE USERS", (analytics.realtimeUsers || 0).toLocaleString(), "Online right now", P.red, M + cw3 + 2, cw3, 20);
  const newU = Object.entries(analytics.newReturning || {}).find(([k]) => k.toLowerCase() === "new")?.[1] || 0;
  const retU = Object.entries(analytics.newReturning || {}).find(([k]) => k.toLowerCase() === "returning")?.[1] || 0;
  const nrTot = newU + retU;
  KpiCard("NEW USERS", newU.toLocaleString(), `${pct(newU, nrTot)}% of total`, P.amber, M + 2 * (cw3 + 2), cw3, 20);
  y += 26;

  // Explanations
  H3("WHAT THESE METRICS MEAN");
  const explanations = [
    ["Users", "Unique individuals who visited your site. Each person counted once even if they visit multiple times."],
    ["Sessions", "Total number of visits. One user can generate multiple sessions across different days."],
    ["Bounce Rate", "% of users who left after viewing only 1 page. Lower is better. Under 40% is great, above 70% needs work."],
    ["Avg Session", "How long users spend on your site per visit. Longer = more engaged users."],
    ["Pages/Session", "How many pages users view per visit. Higher = users exploring more content."],
  ];
  explanations.forEach(([term, desc]) => {
    need(8);
    C(P.orange); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    doc.text(`${term}:`, M, y);
    C(P.sub); doc.setFont("helvetica", "normal");
    doc.text(desc, M + 26, y);
    y += 6;
  });
  Gap(2);

  // New vs Returning
  if (nrTot > 0) {
    H3("NEW VS RETURNING USERS");
    const retPct = pct(retU, nrTot);
    const calloutType = parseFloat(retPct) > 30 ? "success" : "warn";
    Callout(
      parseFloat(retPct) > 30
        ? `✓  ${retPct}% returning users — Strong retention! Visitors are coming back.`
        : `⚠  Only ${retPct}% returning users — Focus on retention: email campaigns, push notifications, great content.`,
      calloutType
    );

    Table(
      ["User Type", "Count", "Share", "Interpretation"],
      [["New Users", newU.toLocaleString(), `${pct(newU, nrTot)}%`, "First-time visitors — shows growth"],
      ["Returning", retU.toLocaleString(), `${pct(retU, nrTot)}%`, "Came back — shows loyalty & value"]],
      [40, 28, 22, COL - 90]
    );
  }

  if (analytics.realtimeDetail && analytics.realtimeUsers > 0) {
    Gap(4);
    H3("REAL-TIME ACTIVITY");
    Body("Users currently active on your site.", 0);
    
    if (analytics.realtimeDetail.byPage?.length) {
      Gap(2);
      Table(
        ["Active Page", "Users"],
        analytics.realtimeDetail.byPage.map(r => {
          const nm = String(r.name || "Unknown");
          return [nm.length > 50 ? nm.slice(0, 48) + "…" : nm, r.users];
        }),
        [COL - 30, 30],
        { rightAlign: [1] }
      );
    }
    
    if (analytics.realtimeDetail.byCountry?.length) {
      Gap(2);
      Table(
        ["Country / City", "Users"],
        analytics.realtimeDetail.byCountry.map(r => [r.name || "Unknown", r.users]),
        [COL - 30, 30],
        { rightAlign: [1] }
      );
    }
  }

  /* ══════════════════════
     PAGE 3 — TRAFFIC
  ══════════════════════ */
  newPage();
  H2("02. Traffic Sources");
  Body("Understanding where your visitors come from helps you invest in the right channels.");
  Gap(4);

  const srcEntries = Object.entries(analytics.trafficSources || {}).sort((a, b) => b[1] - a[1]);
  const srcTot = srcEntries.reduce((s, [, v]) => s + v, 0);
  const maxSrc = srcEntries[0]?.[1] || 1;

  if (srcEntries.length) {
    const srcDesc = {
      organic: "Visitors from search engines like Google, Bing",
      direct: "Typed your URL or used a bookmark",
      social: "Clicked from social media platforms",
      referral: "Came from another website's link",
      email: "Clicked from an email campaign",
    };

    // Visual bar chart rows
    H3("SOURCE BREAKDOWN");
    srcEntries.forEach(([src, val], i) => {
      need(10);
      const share = parseFloat(pct(val, srcTot));
      const bColor = [P.orange, P.purple, P.green, P.amber, P.red, P.accent][i % 6];

      F(i % 2 === 0 ? P.white : P.card); doc.rect(M, y, COL, 9, "F");
      D(P.border); LW(0.1); doc.rect(M, y, COL, 9, "S");

      // Source name
      C(P.text); doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(src.charAt(0).toUpperCase() + src.slice(1), M + 2, y + 6);

      // Bar
      MiniBar(val, maxSrc, M + 48, y + 3, 70, 3.5, bColor);

      // Numbers
      C(bColor); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
      doc.text(val.toLocaleString(), M + 124, y + 6, { align: "right" });
      C(P.sub); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
      doc.text(`${share.toFixed(1)}%`, M + 142, y + 6, { align: "right" });

      // Desc
      C(P.hint); doc.setFontSize(6.5);
      doc.text(srcDesc[src.toLowerCase()] || "Other traffic source", M + 148, y + 6);
      y += 9;
    });
    Gap(4);

    // Top source highlight
    const top = srcEntries[0];
    Callout(`🏆  Top source: ${top[0].charAt(0).toUpperCase() + top[0].slice(1)} accounts for ${pct(top[1], srcTot)}% of all traffic.`, "info");
  }

  /* ══════════════════════
     PAGE 4 — PAGES
  ══════════════════════ */
  newPage();
  H2("03. Top Pages & User Flow");
  Body("Discover which pages attract the most visitors and where users enter and exit your site.");
  Gap(4);

  // Top Pages
  if (analytics.topPages?.length) {
    H3("MOST VIEWED PAGES");
    const tvTot = analytics.topPages.reduce((s, p) => s + p.views, 0);
    const tvMax = analytics.topPages[0]?.views || 1;

    analytics.topPages.forEach((p, i) => {
      need(10);
      const rankColors = [P.amber, P.hint, P.hint];
      F(i % 2 === 0 ? P.white : P.card); doc.rect(M, y, COL, 9, "F");
      D(P.border); LW(0.1); doc.rect(M, y, COL, 9, "S");

      // rank badge
      F(i < 3 ? P.ink : P.card); doc.roundedRect(M + 1, y + 1.5, 7, 6, 1, 1, "F");
      C(i < 3 ? P.white : P.hint); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text(String(i + 1), M + 4.5, y + 6, { align: "center" });

      // page path
      const pname = p.page.length > 44 ? p.page.slice(0, 42) + "…" : p.page;
      C(i < 3 ? P.text : P.sub); doc.setFontSize(7.5); doc.setFont(i < 3 ? "helvetica" : "helvetica", i < 3 ? "bold" : "normal");
      doc.text(pname, M + 11, y + 6);

      // bar
      MiniBar(p.views, tvMax, M + 95, y + 3, 30, 2.5, P.purple);

      // views + share
      C(P.orange); doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text((p.views || 0).toLocaleString(), M + COL - 22, y + 6, { align: "right" });
      C(P.hint); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
      doc.text(`${pct(p.views, tvTot)}%`, M + COL - 1, y + 6, { align: "right" });
      y += 9;
    });
    Gap(6);
  }

  // Landing Pages
  if (analytics.landingPages?.length) {
    H3("LANDING PAGES — WHERE USERS ENTERED YOUR SITE");
    Body("These are the first pages users see when they arrive. High bounce rates here need attention.", 0);
    Gap(3);

    Table(
      ["#", "Landing Page", "Sessions", "Bounce Rate", "Status"],
      analytics.landingPages.map((p, i) => [
        i + 1,
        p.page.length > 36 ? p.page.slice(0, 34) + "…" : p.page,
        (p.sessions || 0).toLocaleString(),
        `${(p.bounceRate || 0).toFixed(1)}%`,
        (p.bounceRate || 0) > 70 ? "Needs work" : (p.bounceRate || 0) > 40 ? "Average" : "Good",
      ]),
      [9, COL - 88, 26, 26, 27],
      {
        rightAlign: [2, 3],
        colorCol: {
          4: (v) => v.includes("Needs") ? P.red : v === "Average" ? P.amber : P.green
        }
      }
    );
    Callout("💡  Bounce Rate guide:  < 40% = Great  ·  40–70% = Needs monitoring  ·  > 70% = Urgent attention needed", "info");
  }

  // Exit Pages
  if (analytics.exitPages?.length) {
    Gap(2); H3("EXIT PAGES — WHERE USERS LEFT YOUR SITE");
    Body("High exit rates on non-final pages indicate user frustration or missing content.", 0);
    Gap(3);

    Table(
      ["#", "Exit Page", "Page Views", "Exit Rate", "Priority"],
      analytics.exitPages.map((p, i) => [
        i + 1,
        p.page.length > 36 ? p.page.slice(0, 34) + "…" : p.page,
        (p.exits || 0).toLocaleString(),
        `${(p.exitRate || 0).toFixed(1)}%`,
        (p.exitRate || 0) > 60 ? " High" : (p.exitRate || 0) > 30 ? " Medium" : " Low",
      ]),
      [9, COL - 86, 26, 26, 25],
      { rightAlign: [2, 3] }
    );
  }

  /* ══════════════════════
     PAGE 5 — AUDIENCE
  ══════════════════════ */
  newPage();
  H2("04. Audience & Geography");
  Body("Who are your users and where are they from?");
  Gap(4);

  // Devices
  H3("DEVICE BREAKDOWN");
  const devEntries = Object.entries(analytics.devices || {}).sort((a, b) => b[1] - a[1]);
  const devTot = devEntries.reduce((s, [, v]) => s + v, 0);
  const devColors = { mobile: P.orange, desktop: P.purple, tablet: P.green };

  if (devEntries.length) {
    const dw = (COL - (devEntries.length - 1) * 4) / devEntries.length;
    devEntries.forEach(([dev, val], i) => {
      const dc = devColors[dev.toLowerCase()] || P.accent;
      const share = pct(val, devTot);
      const x = M + i * (dw + 4);
      F(P.white); doc.roundedRect(x, y, dw, 26, 2, 2, "F");
      D(dc); LW(0.4); doc.roundedRect(x, y, dw, 26, 2, 2, "S");
      F(dc); doc.roundedRect(x, y, dw, 4, 2, 2, "F"); doc.rect(x, y + 2, dw, 2, "F");
      C(P.text); doc.setFontSize(14); doc.setFont("helvetica", "bold");
      doc.text(`${share}%`, x + dw / 2, y + 14, { align: "center" });
      C(P.sub); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
      doc.text(dev.charAt(0).toUpperCase() + dev.slice(1), x + dw / 2, y + 19, { align: "center" });
      C(P.hint); doc.setFontSize(7);
      doc.text(`${val.toLocaleString()} users`, x + dw / 2, y + 23.5, { align: "center" });
    });
    y += 30;

    const mob = analytics.devices?.mobile || analytics.devices?.Mobile || 0;
    const mPct = devTot > 0 ? (mob / devTot * 100).toFixed(0) : 0;
    Callout(
      mPct > 60
        ? `${mPct}% of users are on mobile — Mobile-first design is critical for your site!`
        : `Device mix looks healthy. Mobile: ${mPct}% · Desktop: ${pct(analytics.devices?.desktop || 0, devTot)}%`,
      mPct > 60 ? "warn" : "success"
    );
  }

  // // Browsers
  // H3("TOP BROWSERS");
  // const browE = Object.entries(analytics.browsers||{}).sort((a,b)=>b[1]-a[1]).slice(0,20);
  // const browT = browE.reduce((s,[,v])=>s+v,0);
  // const browMax = browE[0]?.[1]||1;

  // if (browE.length) {
  //   const bColors = [P.orange,P.purple,P.green,P.amber,P.red,P.accent];
  //   browE.forEach(([b,val],i) => {
  //     need(8);
  //     F(i%2===0?P.white:P.card); doc.rect(M,y,COL,7.5,"F");
  //     D(P.border); LW(0.1); doc.rect(M,y,COL,7.5,"S");
  //     C(P.text); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
  //     doc.text(b, M+2, y+5.2);
  //     MiniBar(val, browMax, M+44, y+2.5, 80, 3, bColors[i%6]);
  //     C(bColors[i%6]); doc.setFontSize(7.5); doc.setFont("helvetica","bold");
  //     doc.text(val.toLocaleString(), M+128, y+5.2, {align:"right"});
  //     C(P.hint); doc.setFontSize(7); doc.setFont("helvetica","normal");
  //     doc.text(`${pct(val,browT)}%`, M+COL, y+5.2, {align:"right"});
  //     y+=7.5;
  //   });
  //   Gap(5);
  // }

  H3("TOP BROWSERS");

  const browE = Object.entries(analytics.browsers || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const browT = browE.reduce((s, [, v]) => s + v, 0);
  const browMax = browE[0]?.[1] || 1;

  if (browE.length) {
    const bColors = [P.orange, P.green, P.amber, P.red, P.purple];

    // layout positions
    const labelX = M + 2;
    const barX = M + 90;
    const barW = 35;
    const valueX = M + COL - 25;
    const pctX = M + COL;

    browE.forEach(([b, val], i) => {
      need(8);

      // background
      F(i % 2 === 0 ? P.white : P.card);
      doc.rect(M, y, COL, 7.5, "F");
      D(P.border);
      LW(0.1);
      doc.rect(M, y, COL, 7.5, "S");

      // truncate name
      const name = b.length > 18 ? b.slice(0, 16) + "…" : b;

      // browser name
      C(P.text);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(name, labelX, y + 5.2);

      // bar
      MiniBar(val, browMax, barX, y + 2.5, barW, 4, bColors[i % 5]);

      // value
      C(P.text);
      doc.setFont("helvetica", "bold");
      doc.text(val.toLocaleString(), valueX, y + 5.2, { align: "right" });

      // percentage
      C(P.hint);
      doc.setFont("helvetica", "normal");
      doc.text(`${pct(val, browT)}%`, pctX, y + 5.2, { align: "right" });

      y += 7.5;
    });
    Gap(5);
  }

  const osE = Object.entries(analytics.operatingSystems || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const osT = osE.reduce((s, [, v]) => s + v, 0);
  const osMax = osE[0]?.[1] || 1;

  if (osE.length) {
    H3("OPERATING SYSTEMS");
    const osColors = [P.purple, P.orange, P.green, P.amber, P.red];

    const labelX = M + 2;
    const barX = M + 90;
    const barW = 35;
    const valueX = M + COL - 25;
    const pctX = M + COL;

    osE.forEach(([b, val], i) => {
      need(8);
      F(i % 2 === 0 ? P.white : P.card);
      doc.rect(M, y, COL, 7.5, "F");
      D(P.border); LW(0.1); doc.rect(M, y, COL, 7.5, "S");

      const nm = String(b || "Unknown");
      const name = nm.length > 18 ? nm.slice(0, 16) + "…" : nm;

      C(P.text); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
      doc.text(name, labelX, y + 5.2);

      MiniBar(val, osMax, barX, y + 2.5, barW, 4, osColors[i % 5]);

      C(P.text); doc.setFont("helvetica", "bold");
      doc.text(val.toLocaleString(), valueX, y + 5.2, { align: "right" });

      C(P.hint); doc.setFont("helvetica", "normal");
      doc.text(`${pct(val, osT)}%`, pctX, y + 5.2, { align: "right" });

      y += 7.5;
    });
    Gap(5);
  }

  // Countries
  // H3("TOP COUNTRIES");
  // const geoE  = Object.entries(analytics.countries||{}).sort((a,b)=>b[1]-a[1]).slice(0,50);
  // const geoT  = geoE.reduce((s,[,v])=>s+v,0);
  // const geoMx = geoE[0]?.[1]||1;

  // if (geoE.length) {
  //   // 2-column
  //   const hw = (COL-6)/2;
  //   const half = Math.ceil(geoE.length/2);
  //   let leftY=y, rightY=y;

  //   geoE.forEach(([country,val],i) => {
  //     const col2 = i < half ? 0 : 1;
  //     const cy   = col2===0 ? leftY : rightY;
  //     const cx   = M + col2*(hw+6);
  //     need(8);
  //     F(i%2===0?P.white:P.card); doc.rect(cx,cy,hw,7.5,"F");
  //     D(P.border); LW(0.1); doc.rect(cx,cy,hw,7.5,"S");

  //     C(i<3?P.amber:P.hint); doc.setFontSize(7); doc.setFont("helvetica","bold");
  //     doc.text(String(i+1), cx+4, cy+5.2, {align:"center"});
  //     C(P.text); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
  //     const cname = country.length>16 ? country.slice(0,14)+"…" : country;
  //     doc.text(cname, cx+9, cy+5.2);
  //     // MiniBar(val,geoMx, cx+56, cy+2.5, 38, 3, P.green);

  //     C(P.green); doc.setFontSize(7.5); doc.setFont("helvetica","bold");
  //     doc.text(val.toLocaleString(), cx+hw-12, cy+5.2, {align:"right"});
  //     C(P.hint); doc.setFontSize(6.5);
  //     doc.text(`${pct(val,geoT)}%`, cx+hw-1, cy+5.2, {align:"right"});

  //     if (col2===0) leftY+=7.5; else rightY+=7.5;
  //   });
  //   y = Math.max(leftY, rightY)+3;
  // }

  // Countries
  H3("TOP COUNTRIES");

  const geoE = Object.entries(analytics.countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  const geoT = geoE.reduce((s, [, v]) => s + v, 0);

  if (geoE.length) {
    const hw = (COL - 6) / 2;
    const half = Math.ceil(geoE.length / 2);

    let leftY = y;
    let rightY = y;

    geoE.forEach(([country, val], i) => {
      const col2 = i < half ? 0 : 1;
      let cy = col2 === 0 ? leftY : rightY;
      const cx = M + col2 * (hw + 6);

      /* 🔥 FIX: column-wise page break */
      if (cy + 8 > PH - 14) {
        newPage();
        leftY = y;
        rightY = y;
        cy = y;
      }

      // row background
      F(i % 2 === 0 ? P.white : P.card);
      doc.rect(cx, cy, hw, 7.5, "F");

      D(P.border);
      LW(0.1);
      doc.rect(cx, cy, hw, 7.5, "S");

      // rank
      C(i < 3 ? P.amber : P.hint);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(String(i + 1), cx + 4, cy + 5.2, { align: "center" });

      // country name
      C(P.text);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      const cname = country.length > 16 ? country.slice(0, 14) + "…" : country;
      doc.text(cname, cx + 9, cy + 5.2);

      // users
      C(P.green);
      doc.setFont("helvetica", "bold");
      doc.text(val.toLocaleString(), cx + hw - 12, cy + 5.2, { align: "right" });

      // %
      C(P.hint);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(`${pct(val, geoT)}%`, cx + hw - 1, cy + 5.2, { align: "right" });

      // update column Y
      if (col2 === 0) leftY += 7.5;
      else rightY += 7.5;
    });

    // final Y
    y = Math.max(leftY, rightY) + 3;
  }

  // Cities
  // ── GEO HIERARCHY — Country > State > City ──
  const geoTree2 = analytics.geoTree || {};
  const countryArr = Object.entries(geoTree2).sort((a, b) => b[1].users - a[1].users);
  const geoTotUsers = countryArr.reduce((s, [, v]) => s + v.users, 0);

  if (countryArr.length) {
    Gap(4);
    H3("GEOGRAPHIC DISTRIBUTION — COUNTRY › STATE › CITY");
    C(P.hint); doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text("Hierarchical breakdown: click country to see states, click state to see cities.", M, y - 4);

    countryArr.forEach(([country, cData]) => {
      // ── Country header ──
      // need(10);
      // F(P.ink); doc.roundedRect(M,y,COL,9,1,1,"F");
      // C(P.white); doc.setFontSize(8); doc.setFont("helvetica","bold");
      // doc.text(country, M+3, y+6);
      // C(P.orange); doc.setFontSize(8); doc.setFont("helvetica","bold");
      // doc.text(cData.users.toLocaleString()+" users", M+COL-2, y+6, {align:"right"});
      // C(P.hint); doc.setFontSize(7);
      // doc.text(pct(cData.users,geoTotUsers)+"%", M+COL-28, y+6, {align:"right"});
      // const cBarW = geoTotUsers>0 ? (cData.users/geoTotUsers)*40 : 0;
      // F([30,50,80]); doc.roundedRect(M+COL-70, y+3, 40, 3, 0.5,0.5,"F");
      // F(P.orange); doc.roundedRect(M+COL-70, y+3, cBarW, 3, 0.5,0.5,"F");
      // y+=10;

      // ── Country header ──
      need(10);

      // background
      F(P.ink);
      doc.roundedRect(M, y, COL, 9, 1, 1, "F");

      // text
      C(P.white);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(country, M + 3, y + 6);

      // users (right)
      C(P.orange);
      doc.setFontSize(8);
      doc.text(cData.users.toLocaleString() + " users", M + COL - 2, y + 6, { align: "right" });

      // % (shift left a bit)
      C(P.hint);
      doc.setFontSize(7);
      doc.text(pct(cData.users, geoTotUsers) + "%", M + COL - 30, y + 6, { align: "right" });

      /* 🔥 BAR FIX START */

      // layout
      const barMaxW = 32;                 // max width control
      const barX = M + COL - 75;       // start position
      const barY = y + 3;

      // safe width
      const cBarW = geoTotUsers > 0
        ? Math.min(barMaxW, (cData.users / geoTotUsers) * barMaxW)
        : 0;

      // background bar
      F(P.card);
      doc.roundedRect(barX, barY, barMaxW, 3, 0.5, 0.5, "F");

      // fill bar
      F(P.orange);
      doc.roundedRect(barX, barY, Math.max(2, cBarW), 3, 0.5, 0.5, "F");

      /* 🔥 BAR FIX END */

      y += 10;

      // ── Regions under country ──
      const regionArr2 = Object.entries(cData.regions || {}).sort((a, b) => b[1].users - a[1].users);
      const maxReg = regionArr2[0]?.[1]?.users || 1;

      regionArr2.forEach(([region, rData], ri) => {
        need(8);
        const rRowH = 7.5;
        F(ri % 2 === 0 ? P.white : P.card); doc.rect(M + 4, y, COL - 4, rRowH, "F");
        D(P.border); LW(0.1); doc.rect(M + 4, y, COL - 4, rRowH, "S");

        // indent line
        F(P.purple); doc.rect(M + 4, y, 1.5, rRowH, "F");

        C(P.purple); doc.setFontSize(7); doc.setFont("helvetica", "bold");
        doc.text(String(ri + 1), M + 9, y + 5, { align: "center" });
        C(P.text); doc.setFontSize(7.5); doc.setFont("helvetica", ri < 3 ? "bold" : "normal");
        doc.text(region, M + 14, y + 5);

        const rBarW = (rData.users / maxReg) * 35;
        F(P.card); doc.roundedRect(M + 80, y + 2.5, 35, 3, 0.5, 0.5, "F");
        F(P.purple); doc.roundedRect(M + 80, y + 2.5, rBarW, 3, 0.5, 0.5, "F");

        C(P.purple); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
        doc.text(rData.users.toLocaleString(), M + 130, y + 5, { align: "right" });
        C(P.hint); doc.setFontSize(6.5);
        doc.text(pct(rData.users, cData.users) + "%", M + COL - 2, y + 5, { align: "right" });
        y += rRowH;

        // ── Cities under region ──
        const cityArr2 = Object.entries(rData.cities || {}).sort((a, b) => b[1] - a[1]);
        const maxCity2 = cityArr2[0]?.[1] || 1;

        cityArr2.forEach(([city, cVal], ki) => {
          need(7);
          const kRowH = 6.5;
          F(ki % 2 === 0 ? [252, 253, 255] : [245, 247, 250]); doc.rect(M + 10, y, COL - 10, kRowH, "F");
          D([220, 230, 245]); LW(0.1); doc.rect(M + 10, y, COL - 10, kRowH, "S");

          // indent line
          F(P.green); doc.rect(M + 10, y, 1, kRowH, "F");

          C(P.hint); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
          doc.text(String(ki + 1), M + 15, y + 4.5, { align: "center" });
          C(P.sub); doc.setFontSize(7); doc.setFont("helvetica", "normal");
          const cname = city.length > 35 ? city.slice(0, 33) + "…" : city;
          doc.text(cname, M + 20, y + 4.5);

          const cBarW2 = (cVal / maxCity2) * 25;
          F([230, 240, 255]); doc.roundedRect(M + 90, y + 2, 25, 2.5, 0.3, 0.3, "F");
          F(P.green); doc.roundedRect(M + 90, y + 2, cBarW2, 2.5, 0.3, 0.3, "F");

          C(P.green); doc.setFontSize(7); doc.setFont("helvetica", "bold");
          doc.text(cVal.toLocaleString(), M + 125, y + 4.5, { align: "right" });
          C(P.hint); doc.setFontSize(6);
          doc.text(pct(cVal, rData.users) + "%", M + COL - 2, y + 4.5, { align: "right" });
          y += kRowH;
        });

        Gap(1);
      });
      Gap(3);
    });
  }

  // /* ══════════════════════
  //    PAGE 6 — PAGESPEED
  // ══════════════════════ */
  // newPage();
  // H2("05. PageSpeed & Performance");
  // Body("Google Lighthouse audit results. Scores are out of 100 — aim for 90+ on all metrics.");
  // Gap(4);

  // if (pageSpeed?.mobile || pageSpeed?.desktop) {
  //   [["Mobile", pageSpeed?.mobile], ["Desktop", pageSpeed?.desktop]]
  //     .filter(([, d]) => d)
  //     .forEach(([label, data]) => {
  //       H3(label);

  //       // Score pills row
  //       const scores = [
  //         { key: "performance", label: "Performance", tip: "Page load speed & optimization" },
  //         { key: "seo", label: "SEO", tip: "Search engine optimization" },
  //         { key: "accessibility", label: "Accessibility", tip: "Usability for all users" },
  //         { key: "bestPractices", label: "Best Practices", tip: "Modern web standards" },
  //       ];
  //       const sw = COL / 4;
  //       scores.forEach((s, i) => {
  //         const sc = data[s.key] || 0;
  //         const c = scoreRGB(sc);
  //         const bg = scoreBgRGB(sc);
  //         const sx = M + i * sw;
  //         F(bg); doc.roundedRect(sx, y, sw - 2, 22, 2, 2, "F");
  //         D(c); LW(0.3); doc.roundedRect(sx, y, sw - 2, 22, 2, 2, "S");
  //         C(c); doc.setFontSize(16); doc.setFont("helvetica", "bold");
  //         doc.text(String(sc), sx + (sw - 2) / 2, y + 11, { align: "center" });
  //         C(P.sub); doc.setFontSize(7); doc.setFont("helvetica", "bold");
  //         doc.text(s.label, sx + (sw - 2) / 2, y + 16, { align: "center" });
  //         C(c); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  //         doc.text(scoreLabel(sc), sx + (sw - 2) / 2, y + 20, { align: "center" });
  //       });
  //       y += 26;

  //       // Score interpretation
  //       // scores.forEach((s,i) => {
  //       //   const sc = data[s.key]||0;
  //       //   need(7);
  //       //   F(i%2===0?P.white:P.card); doc.rect(M,y,COL,6.5,"F");
  //       //   D(P.border); LW(0.1); doc.rect(M,y,COL,6.5,"S");
  //       //   C(P.sub); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
  //       //   doc.text(s.label, M+2, y+4.7);
  //       //   doc.text(s.tip, M+36, y+4.7);
  //       //   // progress bar
  //       //   F(P.card); doc.roundedRect(M+100, y+2, 46, 3, 0.5,0.5,"F");
  //       //   F(scoreRGB(sc)); doc.roundedRect(M+100, y+2, sc*0.46, 3, 0.5,0.5,"F");
  //       //   ScorePill(sc, M+152, y+0.5);
  //       //   y+=6.5;
  //       // });
  //       // Gap(4);

  //       scores.forEach((s, i) => {
  //         const sc = data[s.key] || 0;
  //         need(8);

  //         const rowH = 7;

  //         // row bg
  //         F(i % 2 === 0 ? P.white : P.card);
  //         doc.rect(M, y, COL, rowH, "F");

  //         D(P.border);
  //         LW(0.1);
  //         doc.rect(M, y, COL, rowH, "S");

  //         // label
  //         C(P.sub);
  //         doc.setFontSize(7.5);
  //         doc.setFont("helvetica", "normal");
  //         doc.text(s.label, M + 2, y + 4.8);

  //         // description
  //         C(P.hint);
  //         doc.setFontSize(6.5);
  //         doc.text(s.tip, M + 36, y + 4.8);

  //         /* 🔥 BAR FIX */
  //         const barX = M + 100;
  //         const barW = 40;
  //         const barH = 3;

  //         // background
  //         F(P.card);
  //         doc.roundedRect(barX, y + 2, barW, barH, 0.5, 0.5, "F");

  //         // fill
  //         const fillW = Math.max(2, (sc / 100) * barW);
  //         F(scoreRGB(sc));
  //         doc.roundedRect(barX, y + 2, fillW, barH, 0.5, 0.5, "F");

  //         /* 🔥 SCORE BOX FIX (NO CHIPAKNA) */
  //         const gap = 6;
  //         const scoreX = barX + barW + gap;

  //         // bg
  //         F(scoreBgRGB(sc));
  //         doc.roundedRect(scoreX, y + 1.5, 12, 5, 1, 1, "F");

  //         // border
  //         D(scoreRGB(sc));
  //         LW(0.3);
  //         doc.roundedRect(scoreX, y + 1.5, 12, 5, 1, 1, "S");

  //         // text
  //         C(scoreRGB(sc));
  //         doc.setFontSize(7.5);
  //         doc.setFont("helvetica", "bold");
  //         doc.text(String(sc), scoreX + 6, y + 4.8, { align: "center" });

  //         y += rowH;
  //       });

  //       // CWV
  //       if (data.coreWebVitals) {
  //         const cwv = data.coreWebVitals;
  //         F(P.ink); doc.roundedRect(M, y, COL, 7, 1, 1, "F");
  //         C(P.white); doc.setFontSize(7); doc.setFont("helvetica", "bold");
  //         doc.text("CORE WEB VITALS", M + 3, y + 5);
  //         y += 7;

  //         const cwvItems = [
  //           { k: "LCP", v: cwv.LCP, good: "≤2.5s", tip: "Largest Contentful Paint — how fast main content loads" },
  //           { k: "CLS", v: cwv.CLS, good: "≤0.1", tip: "Cumulative Layout Shift — visual stability score" },
  //           { k: "INP", v: cwv.INP, good: "≤200ms", tip: "Interaction to Next Paint — responsiveness" },
  //           { k: "TBT", v: cwv.TBT, good: "≤200ms", tip: "Total Blocking Time — JavaScript blocking main thread" },
  //           { k: "Speed Index", v: cwv.SpeedIndex, good: "≤3.4s", tip: "How quickly content becomes visually visible" },
  //         ];
  //         cwvItems.forEach((item, i) => {
  //           need(7);
  //           F(i % 2 === 0 ? P.white : P.card); doc.rect(M, y, COL, 6.5, "F");
  //           D(P.border); LW(0.1); doc.rect(M, y, COL, 6.5, "S");
  //           C(P.orange); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
  //           doc.text(item.k, M + 2, y + 4.7);
  //           C(P.text); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  //           doc.text(item.v || "—", M + 28, y + 4.7);
  //           C(P.green); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  //           doc.text(`Good: ${item.good}`, M + 56, y + 4.7);
  //           C(P.hint); doc.setFontSize(6.5);
  //           doc.text(item.tip, M + 92, y + 4.7);
  //           y += 6.5;
  //         });
  //         Gap(5);
  //       }
  //     });
  // }

  
  /* ══════════════════════
     PAGE 7 — TREND
  ══════════════════════ */
  newPage();
  H2("05. Daily Trend & Conversions");
  Gap(2);

  if (analytics.trend?.length) {
    H3("DAY-BY-DAY USER TREND");
    const tMax = Math.max(...analytics.trend.map(t => t.users), 1);
    const tTot = analytics.trend.reduce((s, t) => s + t.users, 0);
    const tAvg = Math.round(tTot / analytics.trend.length);
    const tPeak = analytics.trend.reduce((a, b) => a.users > b.users ? a : b);

    // Summary cards
    const gap = 4;
    const tw = (COL - gap * 3) / 4;
    KpiCard("TOTAL", tTot.toLocaleString(), "Period total", P.orange, M, tw, 22);

    KpiCard("DAILY AVG", tAvg.toLocaleString(), "Users per day",
      P.purple, M + (tw + gap), tw, 22);

    KpiCard("PEAK", tPeak.users.toLocaleString(), tPeak.date,
      P.green, M + 2 * (tw + gap), tw, 22);

    KpiCard("DAYS", analytics.trend.length, "In selected range",
      P.accent, M + 3 * (tw + gap), tw, 22);

    y += 26;

    // Trend table
    Table(
      ["Date", "Users", "Sessions", "Day Change", "Trend"],
      analytics.trend.map((t, i) => {
        const prev = i > 0 ? analytics.trend[i - 1].users : null;
        const change = prev != null ? `${t.users >= prev ? "+" : ""}${((t.users - prev) / Math.max(prev, 1) * 100).toFixed(1)}%` : "—";
        const trend2 = t.users > (prev || 0) ? "▲" : t.users < (prev || 0) ? "▼" : "—";
        return [t.date, t.users.toLocaleString(), t.sessions.toLocaleString(), change, trend2];
      }),
      [30, 26, 26, 30, COL - 112],
      {
        rightAlign: [1, 2, 3],
        colorCol: {
          3: (v) => v.startsWith("+") ? P.green : v.startsWith("-") ? P.red : P.hint,
          4: (v) => v === "▲" ? P.green : v === "▼" ? P.red : P.hint,
        }
      }
    );
    Gap(4);
  }

  // Conversions
  if (analytics.conversions?.length) {
    H3("CONVERSIONS & KEY EVENTS");
    Body("Key events that represent meaningful user actions on your site.", 0);
    Gap(3);

    const convTot = analytics.conversions.reduce((s, c) => s + c.count, 0);
    const convMax = analytics.conversions[0]?.count || 1;

    analytics.conversions.forEach((c, i) => {
      need(9);
      F(i % 2 === 0 ? P.white : P.card); doc.rect(M, y, COL, 8.5, "F");
      D(P.border); LW(0.1); doc.rect(M, y, COL, 8.5, "S");
      const name = c.event.replace(/_/g, " ");
      C(P.text); doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(name.charAt(0).toUpperCase() + name.slice(1), M + 2, y + 5.5);
      MiniBar(c.count, convMax, M + 72, y + 3, 70, 3, P.green);
      C(P.green); doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(c.count.toLocaleString(), M + COL - 18, y + 5.5, { align: "right" });
      C(P.hint); doc.setFontSize(7); doc.setFont("helvetica", "normal");
      doc.text(`${pct(c.count, convTot)}%`, M + COL - 1, y + 5.5, { align: "right" });
      y += 8.5;
    });
  }

  /* ══════════════════════
     PAGE 8 — SUMMARY
  ══════════════════════ */
  // newPage();
  // H2("07. Executive Summary & Recommendations");
  // Body("Auto-generated insights based on your analytics data. Take action on these to improve performance.");
  // Gap(6);

  const insights = [];

  // Bounce rate
  if (analytics.bounceRate > 70)
    insights.push({ type: "danger", text: `Bounce rate is high at ${analytics.bounceRate?.toFixed(1)}%. Users are leaving quickly. Improve page load speed, make content immediately relevant, and add clear CTAs.` });
  else if (analytics.bounceRate > 40)
    insights.push({ type: "warn", text: `Bounce rate of ${analytics.bounceRate?.toFixed(1)}% is moderate. Consider A/B testing headlines and improving content relevance for key landing pages.` });
  else
    insights.push({ type: "success", text: `Excellent bounce rate of ${analytics.bounceRate?.toFixed(1)}%! Users are engaging well with your content. Keep up the good work.` });

  // Mobile
  const mobV = analytics.devices?.mobile || analytics.devices?.Mobile || 0;
  const dTot = Object.values(analytics.devices || {}).reduce((s, v) => s + v, 0);
  const mPct2 = dTot > 0 ? (mobV / dTot * 100).toFixed(0) : 0;
  if (mPct2 > 60)
    insights.push({ type: "warn", text: `${mPct2}% of your traffic is mobile. Ensure your site is fully responsive, fast on 3G connections, and uses touch-friendly navigation.` });
  else
    insights.push({ type: "success", text: `Good device distribution. Mobile: ${mPct2}%. Your site should be tested on both mobile and desktop for best user experience.` });

  // Traffic sources
  const topSrc2 = Object.entries(analytics.trafficSources || {}).sort((a, b) => b[1] - a[1])[0];
  const srcTot2 = Object.values(analytics.trafficSources || {}).reduce((s, v) => s + v, 0);
  if (topSrc2)
    insights.push({ type: "info", text: `${topSrc2[0].charAt(0).toUpperCase() + topSrc2[0].slice(1)} is your #1 traffic source at ${pct(topSrc2[1], srcTot2)}%. Diversify traffic by investing in ${topSrc2[0].toLowerCase() === "direct" ? "SEO and social" : "additional channels"}.` });

  // Returning users
  const retV2 = Object.entries(analytics.newReturning || {}).find(([k]) => k.toLowerCase() === "returning")?.[1] || 0;
  const nrTot2 = Object.values(analytics.newReturning || {}).reduce((s, v) => s + v, 0);
  if (nrTot2 > 0) {
    const retP = (retV2 / nrTot2 * 100).toFixed(0);
    if (retP < 20)
      insights.push({ type: "warn", text: `Only ${retP}% of users return. Build loyalty through email newsletters, push notifications, and consistently publishing fresh content.` });
    else
      insights.push({ type: "success", text: `${retP}% of users are returning visitors — solid retention! Continue delivering value to keep users coming back.` });
  }

  // PageSpeed
  if (pageSpeed?.mobile?.performance < 50)
    insights.push({ type: "danger", text: `Mobile performance score is critically low at ${pageSpeed.mobile.performance}/100. Compress images, minimize JavaScript, and use a CDN urgently.` });
  else if (pageSpeed?.mobile?.performance < 90)
    insights.push({ type: "warn", text: `Mobile performance score of ${pageSpeed?.mobile?.performance}/100 has room to improve. Focus on image optimization and reducing render-blocking resources.` });
  else if (pageSpeed?.mobile?.performance >= 90)
    insights.push({ type: "success", text: `Great mobile performance score of ${pageSpeed?.mobile?.performance}/100! Your site loads quickly for mobile users.` });

  // Sessions per user
  const spu = analytics.users > 0 ? (analytics.sessions / analytics.users).toFixed(1) : 0;
  if (spu > 1.5)
    insights.push({ type: "success", text: `Users average ${spu} sessions each — they're visiting multiple times. This indicates high-value content or a useful product/service.` });

  insights.forEach(ins => { Callout(ins.text, ins.type); Gap(1); });

  Gap(4); Divider();

  // Sign-off
  need(20);
  F(P.ink); doc.roundedRect(M, y, COL, 18, 2, 2, "F");
  C(P.white); doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("AutoSEO.Pro  — Analytics Report", M + 4, y + 7);
  C(P.hint); doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text(`Website: ${websiteUrl || websiteName}  ·  Period: ${dateLabel}  ·  Pages: ${pg}`, M + 4, y + 13);
  C(P.orange); doc.setFontSize(7);
  doc.text("", M + COL - 2, y + 13, { align: "right" });

  const domain = (websiteUrl || "").replace(/https?:\/\//, "").split("/")[0] || websiteName || "report"; doc.save(`analytics-report-${domain.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now()}.pdf`);
}

/* ════════════════════════════════════════
   COMPONENT
════════════════════════════════════════ */
export default function ExportButton({
  analytics,
  pageSpeed,
  websiteName,
  websiteUrl,
  dateLabel,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);

// 👇 Yahan bahar click close karne ka logic add kiya gaya hai
  const ref = useRef(null);
  
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  // 👆



  async function handleExport(type) {
    setLoading(type);
    setOpen(false);

    try {
      if (type === "csv") {
        exportCSV(analytics, pageSpeed, websiteName, websiteUrl, dateLabel);
      } else {
        await exportPDF(analytics, pageSpeed, websiteName, websiteUrl, dateLabel);
      }
    } catch (err) {
      console.error(err);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        disabled={!!loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: loading ? '#94A3B8' : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          color: loading ? '#FFFFFF' : '#0F172A',
          border: loading ? 'none' : '1px solid #E2E8F0',
          padding: '0.6rem 1.1rem', borderRadius: '10px',
          fontSize: '0.85rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', whiteSpace: 'nowrap',
          fontFamily: "'Inter', sans-serif"
        }}
        onMouseEnter={(e) => {
          if(!loading) {
             e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.03)';
             e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if(!loading) {
             e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.02)';
             e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {loading ? (
          <div style={{
            width: '15px', height: '15px', border: '2px solid #FFFFFF', 
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          <Download size={15} color="#475569" />
        )}
        <span style={{ color: loading ? '#FFFFFF' : '#0F172A' }}>
          {loading ? `Generating ${loading.toUpperCase()}...` : "Export"}
        </span>
      </button>

      {/* DROPDOWN */}
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
        {/* PDF Option */}
        <button
          onClick={() => handleExport('pdf')}
          style={{
            width: '100%', padding: '8px',
            background: 'transparent', border: 'none', borderRadius: '8px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '12px', transition: 'background 0.2s ease',
            fontFamily: "'Inter', sans-serif"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}>
            <Download size={15} color="#2563EB" />
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.2px' }}>Download PDF Report</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Full analytics report</div>
          </div>
        </button>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.8), transparent)', margin: '4px 0' }} />

        {/* CSV Option */}
        <button
          onClick={() => handleExport('csv')}
          style={{
            width: '100%', padding: '8px',
            background: 'transparent', border: 'none', borderRadius: '8px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '12px', transition: 'background 0.2s ease',
            fontFamily: "'Inter', sans-serif"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', border: '1px solid #A7F3D0' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.2px' }}>Download CSV Data</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Raw data export</div>
          </div>
        </button>
      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
