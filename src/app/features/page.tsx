"use client";

import React, { useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import anime from 'animejs';
import { Search, PenTool, Zap, Globe, LayoutDashboard, BarChart, Sparkles } from 'lucide-react';
import styles from '../page.module.css';

export default function FeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: '.animate-item',
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(150),
      easing: 'easeOutQuint'
    });
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.backgroundGlow}></div>
      <div className={styles.gridOverlay}></div>
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-item">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-semibold mb-6">
            <Sparkles size={16} /> AutoSEO Engine 2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6">
            Everything you need to <br className="hidden md:block" /> dominate the SERPs.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-medium">
            Stop doing manual SEO. Our autonomous agents handle research, content creation, and indexing while you focus on building your business.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Feature 1 (Large 2 cols) */}
          <div className="md:col-span-2 animate-item relative group rounded-3xl p-[1px] overflow-hidden bg-gradient-to-br from-violet-500/30 to-fuchsia-500/10">
            <div className="absolute inset-0 bg-slate-950/80 group-hover:bg-slate-950/60 transition-colors duration-500"></div>
            <div className="relative h-full bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/20 blur-3xl rounded-full"></div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mb-6 text-violet-300">
                  <PenTool size={28} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">AI Content Generation</h3>
                <p className="text-slate-400 text-lg max-w-md">Generate SEO-optimized articles that read naturally and rank high, powered by our proprietary LLM trained on top-ranking pages.</p>
              </div>
            </div>
          </div>

          {/* Feature 2 (1 col) */}
          <div className="animate-item relative group rounded-3xl p-[1px] overflow-hidden bg-gradient-to-br from-blue-500/30 to-cyan-500/10">
            <div className="absolute inset-0 bg-slate-950/80 group-hover:bg-slate-950/60 transition-colors duration-500"></div>
            <div className="relative h-full bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-300">
                  <Search size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Keyword Research</h3>
                <p className="text-slate-400">Find long-tail, high-intent keywords with zero manual effort.</p>
              </div>
            </div>
          </div>

          {/* Feature 3 (1 col) */}
          <div className="animate-item relative group rounded-3xl p-[1px] overflow-hidden bg-gradient-to-br from-yellow-500/30 to-orange-500/10">
            <div className="absolute inset-0 bg-slate-950/80 group-hover:bg-slate-950/60 transition-colors duration-500"></div>
            <div className="relative h-full bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-6 text-yellow-300">
                  <Zap size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Instant Indexing</h3>
                <p className="text-slate-400">Submit pages instantly to Google Search Console via API.</p>
              </div>
            </div>
          </div>

          {/* Feature 4 (Large 2 cols) */}
          <div className="md:col-span-2 animate-item relative group rounded-3xl p-[1px] overflow-hidden bg-gradient-to-br from-emerald-500/30 to-teal-500/10">
            <div className="absolute inset-0 bg-slate-950/80 group-hover:bg-slate-950/60 transition-colors duration-500"></div>
            <div className="relative h-full bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between overflow-hidden">
              <div className="absolute -left-20 -top-20 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>
              <div className="relative z-10 flex flex-col h-full justify-end">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-300">
                  <BarChart size={28} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Performance Analytics</h3>
                <p className="text-slate-400 text-lg max-w-md">Track exactly how your AI-driven efforts convert to real revenue with beautiful, real-time dashboards.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
