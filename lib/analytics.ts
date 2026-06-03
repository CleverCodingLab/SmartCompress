"use client";

/**
 * GA4 analytics helper — fires events only when user has consented to analytics.
 * Uses the gtag() global injected by Google Analytics script in layout.
 */

import { getConsent } from "./consent";

/* ── Type-safe GA4 event interfaces ── */

interface FileUploadEvent {
  file_type: string;
  file_size_kb: number;
}

interface CompressionCompleteEvent {
  original_size_kb: number;
  compressed_size_kb: number;
  ratio: number;
  format: string;
}

interface FileDownloadEvent {
  format: string;
  compressed_size_kb: number;
}

interface CtaClickEvent {
  location: string;
}

type EventMap = {
  file_upload: FileUploadEvent;
  compression_complete: CompressionCompleteEvent;
  file_download: FileDownloadEvent;
  cta_click: CtaClickEvent;
};

/** Declare gtag on window for TypeScript */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Track a custom GA4 event. Only fires if:
 * 1. User has consented to analytics
 * 2. gtag() is available on window
 */
export function trackEvent<K extends keyof EventMap>(
  eventName: K,
  params: EventMap[K]
): void {
  const consent = getConsent();
  if (!consent?.analytics) return;
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", eventName, params);
}

/** Track a pageview — typically called by Next.js router events */
export function trackPageview(url: string): void {
  const consent = getConsent();
  if (!consent?.analytics) return;
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
    page_path: url,
  });
}

/** Initialize GA4 dataLayer (called after consent is given) */
export function initGA4(): void {
  if (typeof window === "undefined") return;
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!measurementId) return;

  // Create dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  // Inject the GA4 script
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);
}
