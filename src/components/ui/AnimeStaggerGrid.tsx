"use client";

import React, { useEffect, useRef } from "react";
interface AnimeStaggerGridProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimeStaggerGrid({ children, className = "", delay = 0 }: AnimeStaggerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Use dynamic import to safely load animejs in Next.js Turbopack
    import("animejs").then((animeModule) => {
      const anime = animeModule.default || animeModule;
      if (typeof anime !== 'function') return;

      if (!containerRef.current) return;
      const elements = containerRef.current.children;
      
      anime({
        targets: Array.from(elements),
        translateY: [30, 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1200,
        delay: (el: any, i: number) => delay + i * 100
      });
    });
  }, [delay, children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
