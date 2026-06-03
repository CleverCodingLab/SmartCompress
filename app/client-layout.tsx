"use client";

/**
 * ClientLayout — Client component wrapper for the root layout.
 * Handles consent state, cookie banner, navbar, and footer.
 * GA4 and AdSense scripts are gated behind user consent.
 */

import { useState, useCallback, useEffect, ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { trackPageview } from "@/lib/analytics";
import {
  ConsentContext,
  type ConsentState,
  getConsent,
} from "@/lib/consent";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [consent, setConsentState] = useState<ConsentState>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      return getConsent() || { analytics: false, ads: false, timestamp: "" };
    }
    return { analytics: false, ads: false, timestamp: "" };
  });

  const [hasConsented, setHasConsented] = useState(() => {
    if (typeof window !== "undefined") {
      return getConsent() !== null;
    }
    return false;
  });

  const handleConsentChange = useCallback((newConsent: ConsentState) => {
    setConsentState(newConsent);
    setHasConsented(true);
  }, []);

  // Track page view on route and consent transitions
  useEffect(() => {
    if (pathname && consent.analytics) {
      trackPageview(pathname);
    }
  }, [pathname, consent.analytics]);

  return (
    <ConsentContext.Provider
      value={{ consent, setConsentState: handleConsentChange, hasConsented }}
    >
      {/* Conditional AdSense script — only loaded after ads consent */}
      {consent.ads && process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner onConsentChange={handleConsentChange} />
    </ConsentContext.Provider>
  );
}
