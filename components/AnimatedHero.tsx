"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { trackEvent } from "@/lib/analytics";

export default function AnimatedHero() {
  // Stagger variants for smooth spring entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 22,
        stiffness: 90,
      },
    },
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 80,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle backdrop radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[var(--indigo)]/5 to-[var(--cyan)]/5 blur-[120px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, var(--text-muted) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="section-container relative z-10 text-center pt-20 pb-6"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-[var(--text-secondary)]"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
          Powered by ffmpeg • Free & Open Source
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.15] mb-6 text-slate-500/70"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The future <br />
          of compression <br />
          <span className="text-white flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4 mt-2">
            is
            {/* fast group (slides left to right like flash speed) */}
            <motion.span
              initial={{ x: -120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.25 }}
              className="inline-flex items-center gap-2"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[var(--indigo)]/10 border border-[var(--indigo)]/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] align-middle">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[var(--indigo)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </span>
              <span className="gradient-text">fast</span>
            </motion.span>

            <span className="text-slate-500/70 font-semibold">+</span>

            {/* free group (slides right to left like flash speed) */}
            <motion.span
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.25 }}
              className="inline-flex items-center gap-2"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[var(--cyan)]/10 border border-[var(--cyan)]/30 shadow-[0_0_20px_rgba(45,212,191,0.15)] align-middle">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[var(--cyan-light)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
                </svg>
              </span>
              <span className="gradient-text">free.</span>
            </motion.span>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          Drop your images and videos. Get optimized WebP and compressed video
          files in seconds. No signup. No watermarks. 100% free.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
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
          <a href="#features" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 text-base font-medium no-underline">
            See Features ↓
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={scaleVariants}
          className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-14"
        >
          {[
            { value: "10M+", label: "Files Compressed" },
            { value: "73%", label: "Avg. Size Reduction" },
            { value: "<2s", label: "Avg. Compression Time" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="stat-value text-2xl md:text-3xl gradient-text mb-1">{stat.value}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
