"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface AnimeTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimeTextReveal({ text, className = "", delay = 0 }: AnimeTextRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll('.char');
    
    anime.timeline({ loop: false })
      .add({
        targets: elements,
        translateY: [20, 0],
        translateZ: 0,
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1200,
        delay: (el, i) => delay + 30 * i
      });
  }, [delay, text]);

  const words = text.split(" ");

  return (
    <h1 ref={containerRef} className={className} style={{ display: 'inline-block' }}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.split("").map((char, charIndex) => (
            <span key={charIndex} className="char" style={{ display: 'inline-block', opacity: 0 }}>
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
}
