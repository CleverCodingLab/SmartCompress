"use client";

/**
 * Navbar — Sticky navigation with glassmorphism blur effect.
 * Uses animate() from animejs v4 for mobile menu animation.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { animate, stagger } from "animejs";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("compresskit_theme");
    if (stored === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light");
    }
  }, []);

  // Animate mobile menu with animejs v4 slide-down effect
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileOpen) {
        mobileMenuRef.current.style.display = "flex";
        animate(mobileMenuRef.current, {
          translateY: ["-100%", "0%"],
          opacity: [0, 1],
          duration: 400,
          ease: "outExpo",
        });
        // Stagger menu items sliding in from the left
        animate(".mobile-nav-item", {
          translateX: [-30, 0],
          opacity: [0, 1],
          delay: stagger(60, { start: 150 }),
          duration: 400,
          ease: "outCubic",
        });
      } else {
        animate(mobileMenuRef.current, {
          translateY: ["0%", "-100%"],
          opacity: [1, 0],
          duration: 300,
          ease: "inExpo",
          onComplete: () => {
            if (mobileMenuRef.current)
              mobileMenuRef.current.style.display = "none";
          },
        });
      }
    }
  }, [mobileOpen]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("light", !newIsDark);
    localStorage.setItem("compresskit_theme", newIsDark ? "dark" : "light");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/compress", label: "Compress" },
  ];

  return (
    <>
      <nav
        id="navbar"
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass border-b border-[var(--border-subtle)] shadow-sm"
        style={{ backdropFilter: "blur(24px) saturate(220%)" }}
      >
        <div className="section-container flex items-center justify-between h-16 md:h-18">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--indigo)] to-[var(--cyan)] flex items-center justify-center transition-transform group-hover:scale-110">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Compress<span className="gradient-text">Kit</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 no-underline relative ${
                  pathname === link.href
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[var(--indigo)]" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button id="theme-toggle" onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-[var(--bg-surface-hover)] border border-transparent hover:border-[var(--border-subtle)]" aria-label="Toggle theme">
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
            <Link href="/compress" className="btn-primary btn-sm no-underline">
              Start Compressing
            </Link>
          </div>

          <button id="mobile-menu-toggle" className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface-hover)]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div ref={mobileMenuRef} className="fixed inset-0 z-40 flex-col items-center justify-center gap-6 glass-strong md:hidden" style={{ display: "none" }}>
        <div className="mt-20 flex flex-col items-center gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="mobile-nav-item text-xl font-semibold no-underline transition-colors hover:text-[var(--indigo)]" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <button className="mobile-nav-item mt-4" onClick={() => { toggleTheme(); setMobileOpen(false); }}>
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <Link href="/compress" className="mobile-nav-item btn-primary mt-2 no-underline" onClick={() => setMobileOpen(false)}>
            Start Compressing
          </Link>
        </div>
      </div>
    </>
  );
}
