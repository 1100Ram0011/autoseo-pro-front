"use client";

import React, { useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import anime from 'animejs';
import { Sparkles, Activity, ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react';
import styles from '../page.module.css';
import Link from 'next/link';

export default function ProductPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: '.animate-item',
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(150),
      easing: 'easeOutExpo'
    });
    
    // Floating animation for abstract UI
    anime({
      targets: '.float-item',
      translateY: [-10, 10],
      direction: 'alternate',
      loop: true,
      duration: 3000,
      easing: 'easeInOutSine'
    });
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.backgroundGlow}></div>
      <div className={styles.gridOverlay}></div>
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        {/* Split Hero */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
          <div className="flex-1 animate-item">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live: The New Core Engine
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              SEO is hard. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Let AI do it.
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              AutoSEO Pro is the autonomous agent that researches, writes, and indexes content for you. 
              Deploy it on your domain and watch your organic traffic scale without lifting a finger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group">
                Deploy Agent <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2">
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Abstract UI Mockup */}
          <div className="flex-1 w-full animate-item">
            <div className="relative w-full aspect-square md:aspect-video lg:aspect-square max-w-[500px] mx-auto float-item">
              {/* Glow behind mockup */}
              <div className="absolute inset-0 bg-violet-500/20 blur-[100px] rounded-full"></div>
              
              <div className="relative w-full h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col">
                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="h-4 w-24 bg-slate-800 rounded-md"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  </div>
                </div>
                
                {/* Mockup Body */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="h-24 w-full bg-slate-800/50 rounded-xl border border-slate-700/30 p-4 flex flex-col justify-between">
                    <div className="h-3 w-32 bg-slate-700 rounded-md"></div>
                    <div className="flex items-end gap-2">
                      <div className="h-8 w-20 bg-emerald-500/20 rounded-md"></div>
                      <div className="h-4 w-12 bg-emerald-500/10 rounded-md mb-1"></div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 h-32 bg-slate-800/50 rounded-xl border border-slate-700/30"></div>
                    <div className="flex-1 h-32 bg-slate-800/50 rounded-xl border border-slate-700/30"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-800 pt-16">
          {[
            { title: 'AI Automation', icon: <Sparkles size={24} className="text-violet-400" />, desc: 'Fully automated workflows that do the heavy lifting of technical SEO and content creation.' },
            { title: 'Real-time Tracking', icon: <Activity size={24} className="text-blue-400" />, desc: 'Monitor your keyword rankings and traffic spikes exactly as they happen.' },
            { title: 'Enterprise Security', icon: <ShieldCheck size={24} className="text-emerald-400" />, desc: 'Your data is secured with enterprise-grade encryption and access controls.' },
          ].map((feature, i) => (
            <div key={i} className="animate-item">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed mb-4">{feature.desc}</p>
              <Link href="#" className="text-sm text-violet-400 font-semibold hover:text-violet-300 flex items-center gap-1 group">
                Learn more <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
