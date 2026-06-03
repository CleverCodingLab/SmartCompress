"use client";

/**
 * CookieBanner — GDPR/CCPA compliant consent banner.
 * Anime.js v4 slide-up entrance animation.
 */

import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import {
  getConsent,
  acceptAll,
  rejectNonEssential,
  customizeConsent,
  isDoNotTrack,
  type ConsentState,
} from "@/lib/consent";
import { initGA4 } from "@/lib/analytics";

interface CookieBannerProps {
  onConsentChange: (consent: ConsentState) => void;
}

export default function CookieBanner({ onConsentChange }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(true);
  const [adsChecked, setAdsChecked] = useState(true);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = getConsent();
    if (existing) {
      onConsentChange(existing);
      if (existing.analytics) initGA4();
      return;
    }
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [onConsentChange]);

  useEffect(() => {
    if (visible && bannerRef.current) {
      animate(bannerRef.current, {
        translateY: ["100%", "0%"],
        opacity: [0, 1],
        duration: 600,
        ease: "outExpo",
      });
    }
  }, [visible]);

  const handleAcceptAll = () => {
    const consent = acceptAll();
    onConsentChange(consent);
    initGA4();
    hideBanner();
  };

  const handleReject = () => {
    const consent = rejectNonEssential();
    onConsentChange(consent);
    hideBanner();
  };

  const handleCustomize = () => {
    const consent = customizeConsent(analyticsChecked, adsChecked);
    onConsentChange(consent);
    if (consent.analytics) initGA4();
    hideBanner();
  };

  const hideBanner = () => {
    if (bannerRef.current) {
      animate(bannerRef.current, {
        translateY: ["0%", "100%"],
        opacity: [1, 0],
        duration: 400,
        ease: "inExpo",
        onComplete: () => setVisible(false),
      });
    }
  };

  if (!visible) return null;

  return (
    <div ref={bannerRef} className="cookie-banner" style={{ opacity: 0 }}>
      <div className="section-container">
        <div className="glass-strong rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl">
          {isDoNotTrack() && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-[var(--indigo)]/10 text-sm text-[var(--indigo-light)]">
              🛡️ We detected Do Not Track is enabled. Non-essential cookies will be disabled.
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                <span className="text-lg">🍪</span> We value your privacy
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                We use cookies for analytics and advertising. You can accept all or customize your preferences. See our{" "}
                <a href="/privacy" className="text-[var(--indigo-light)] hover:underline">Privacy Policy</a>{" "}and{" "}
                <a href="/cookies" className="text-[var(--indigo-light)] hover:underline">Cookie Policy</a> for more details.
              </p>
            </div>

            {!showCustomize ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:ml-4 shrink-0">
                <button id="cookie-accept-all" onClick={handleAcceptAll} className="btn-primary btn-sm">Accept All</button>
                <button id="cookie-reject" onClick={handleReject} className="btn-secondary btn-sm">Reject Non-essential</button>
                <button id="cookie-customize" onClick={() => setShowCustomize(true)} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4">Customize</button>
              </div>
            ) : (
              <div className="md:ml-4 shrink-0 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={true} disabled className="w-4 h-4 rounded accent-[var(--indigo)]" />
                  <span className="text-sm">Essential (always on)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={analyticsChecked} onChange={(e) => setAnalyticsChecked(e.target.checked)} className="w-4 h-4 rounded accent-[var(--indigo)]" />
                  <span className="text-sm">Analytics (GA4)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={adsChecked} onChange={(e) => setAdsChecked(e.target.checked)} className="w-4 h-4 rounded accent-[var(--indigo)]" />
                  <span className="text-sm">Advertising (AdSense)</span>
                </label>
                <button id="cookie-save-preferences" onClick={handleCustomize} className="btn-primary btn-sm w-full">Save Preferences</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
