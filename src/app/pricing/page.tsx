"use client";

import React, { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import anime from 'animejs';
import { Check, Sparkles } from 'lucide-react';
import styles from '../page.module.css';

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnnual, setIsAnnual] = useState(true);

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

  const plans = [
    { 
      name: 'Starter', 
      priceMonthly: 49,
      priceAnnual: 39,
      desc: 'Perfect for small blogs and indie hackers.', 
      features: ['1 Project', '10,000 AI words/mo', 'Basic SEO Audit', 'Community Support'] 
    },
    { 
      name: 'Pro', 
      priceMonthly: 149,
      priceAnnual: 119,
      desc: 'For growing agencies and serious startups.', 
      features: ['5 Projects', '100,000 AI words/mo', 'Advanced SEO & Indexing', 'Priority Support'], 
      highlighted: true 
    },
    { 
      name: 'Enterprise', 
      priceMonthly: 499,
      priceAnnual: 399,
      desc: 'Unlimited power for high-volume needs.', 
      features: ['Unlimited Projects', 'Unlimited AI words', 'Custom Workflows', 'Dedicated Account Manager'] 
    }
  ];

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.backgroundGlow}></div>
      <div className={styles.gridOverlay}></div>
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center mb-16 animate-item">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Invest in your organic growth. No hidden fees, no surprises.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 rounded-full bg-slate-800 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-violet-500 transition-transform duration-300 shadow-lg ${isAnnual ? 'translate-x-8' : ''}`}></div>
            </button>
            <span className={`text-sm font-semibold ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Annually <span className="text-emerald-400 text-xs ml-1 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`animate-item relative group rounded-3xl p-[1px] ${plan.highlighted ? 'bg-gradient-to-b from-violet-500 to-fuchsia-600 shadow-2xl shadow-violet-900/30' : 'bg-gradient-to-b from-slate-700 to-slate-800'}`}>
              <div className="absolute inset-0 bg-slate-950/90 rounded-3xl group-hover:bg-slate-950/80 transition-colors"></div>
              <div className={`relative h-full rounded-3xl p-8 flex flex-col ${plan.highlighted ? 'bg-violet-950/20 backdrop-blur-xl' : 'bg-slate-900/40 backdrop-blur-xl'}`}>
                
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-violet-500/20">
                    <Sparkles size={14} /> MOST POPULAR
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">
                    ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-slate-500 font-medium">/mo</span>
                </div>

                <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 mb-8 ${plan.highlighted ? 'bg-white text-slate-950 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}>
                  Get Started
                </button>

                <div className="flex-1 flex flex-col gap-4">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlighted ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-400'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-slate-300 text-sm font-medium">{feat}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
