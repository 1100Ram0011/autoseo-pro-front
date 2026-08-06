"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface AnimeStaggerGridProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimeStaggerGrid({ children, className = "", delay = 0 }: AnimeStaggerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Use querySelectorAll to find immediate children or items we want to stagger
    // For safety, we can just stagger all immediate children
    const elements = containerRef.current.children;
    
    anime({
      targets: elements,
      translateY: [30, 0],
      opacity: [0, 1],
      easing: "easeOutSpring(1, 80, 10, 0)",
      duration: 1200,
      delay: anime.stagger(100, { start: delay })
    });
  }, [delay, children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
