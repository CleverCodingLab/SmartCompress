"use client";

/**
 * AnimatedHero — Full-screen hero section with Anime.js v4 animations.
 *
 * Animation breakdown (using animejs v4 `animate()` API):
 * 1. Hero words stagger in from below (translateY + opacity)
 * 2. Subheadline fades in after words complete
 * 3. CTA button scales in with bounce
 * 4. Floating blobs animate on infinite loop (translate + scale)
 * 5. CTA pulses subtly on idle after initial animation
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { trackEvent } from "@/lib/analytics";

export default function AnimatedHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // 1. Stagger each word of the headline in from below
    animate(".hero-word", {
      translateY: [40, 0],
      opacity: [0, 1],
      delay: stagger(80),
      duration: 800,
      ease: "outExpo",
    });

    // 2. Subheadline fades in after headline
    animate(".hero-sub", {
      translateY: [20, 0],
      opacity: [0, 1],
      delay: 600,
      duration: 700,
      ease: "outCubic",
    });

    // 3. CTA button scales in with spring-like bounce
    animate(".hero-cta", {
      scale: [0.8, 1],
      opacity: [0, 1],
      delay: 900,
      duration: 600,
      ease: "outBack",
    });

    // 4. Stats counters fade in with stagger
    animate(".hero-stat", {
      translateY: [30, 0],
      opacity: [0, 1],
      delay: stagger(100, { start: 1100 }),
      duration: 600,
      ease: "outCubic",
    });

    // 5. Floating blobs — infinite ambient movement
    animate(".blob-1", {
      translateX: [0, 30, -20, 0],
      translateY: [0, -25, 15, 0],
      scale: [1, 1.15, 0.95, 1],
      duration: 8000,
      ease: "inOutSine",
      loop: true,
    });

    animate(".blob-2", {
      translateX: [0, -35, 25, 0],
      translateY: [0, 20, -30, 0],
      scale: [1, 0.9, 1.1, 1],
      duration: 10000,
      ease: "inOutSine",
      loop: true,
    });

    animate(".blob-3", {
      translateX: [0, 20, -15, 0],
      translateY: [0, -15, 25, 0],
      scale: [1, 1.1, 0.9, 1],
      duration: 12000,
      ease: "inOutSine",
      loop: true,
    });
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Floating ambient blobs */}
      <div className="blob blob-indigo blob-1" style={{ width: 500, height: 500, top: "10%", left: "-10%", opacity: 0.4 }} />
      <div className="blob blob-cyan blob-2" style={{ width: 400, height: 400, bottom: "10%", right: "-5%", opacity: 0.3 }} />
      <div className="blob blob-indigo blob-3" style={{ width: 300, height: 300, top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.2 }} />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, var(--text-muted) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="section-container relative z-10 text-center pt-20 pb-6">
        {/* Badge */}
        <div className="hero-stat inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-[var(--text-secondary)]" style={{ opacity: 0 }}>
          <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
          Powered by ffmpeg • Free & Open Source
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {["Compress", "anything."].map((word, i) => (
            <span
              key={i}
              className={`hero-word inline-block mr-3 ${i === 1 ? "gradient-text" : ""}`}
              style={{ opacity: 0 }}
            >
              {word}
            </span>
          ))}
          <br className="hidden sm:block" />
          {["Instantly."].map((word, i) => (
            <span
              key={`line2-${i}`}
              className="hero-word inline-block mr-3 gradient-text"
              style={{ opacity: 0 }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p
          className="hero-sub text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-16 leading-relaxed"
          style={{ opacity: 0 }}
        >
          Drop your images and videos. Get optimized WebP and compressed video
          files in seconds. No signup. No watermarks. 100% free.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4" style={{ opacity: 0 }}>
          <Link
            href="/compress"
            className="btn-primary text-base px-8 py-3.5 no-underline"
            onClick={() => trackEvent("cta_click", { location: "hero" })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Start Compressing - Free
          </Link>
          <a href="#features" className="btn-secondary text-base px-8 py-3.5 no-underline">
            See Features ↓
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {[
            { value: "10M+", label: "Files Compressed" },
            { value: "73%", label: "Avg. Size Reduction" },
            { value: "<2s", label: "Avg. Compression Time" },
          ].map((stat, i) => (
            <div key={i} className="hero-stat text-center" style={{ opacity: 0 }}>
              <div className="stat-value text-2xl md:text-3xl gradient-text mb-1">{stat.value}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
