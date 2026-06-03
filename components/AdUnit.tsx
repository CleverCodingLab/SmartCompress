"use client";

/**
 * AdUnit — Google AdSense ad wrapper.
 * Only renders after user has accepted ads consent.
 * Uses data-ad-test="on" in development mode.
 */

import { useEffect, useRef, useState } from "react";
import { useConsent } from "@/lib/consent";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdUnitProps) {
  const { consent } = useConsent();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [mounted, setMounted] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !consent.ads || !clientId || pushed.current) return;

    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded yet
    }
  }, [mounted, consent.ads, clientId]);

  if (!mounted) {
    return null;
  }

  // Don't render if user hasn't accepted ads
  if (!consent.ads) {
    return null;
  }

  // Don't render without client ID
  if (!clientId) {
    return isDev ? (
      <div className={`ad-container border border-dashed border-[var(--border-subtle)] rounded-xl min-h-[90px] flex items-center justify-center text-[var(--text-muted)] text-xs ${className}`}>
        Ad Placeholder (set NEXT_PUBLIC_ADSENSE_CLIENT_ID)
      </div>
    ) : null;
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        {...(isDev ? { "data-ad-test": "on" } : {})}
      />
    </div>
  );
}
