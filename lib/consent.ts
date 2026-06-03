"use client";

/**
 * Consent state management for GDPR/CCPA compliance.
 * Stores user preferences in localStorage and provides React context.
 */

import { createContext, useContext } from "react";

export interface ConsentState {
  analytics: boolean;
  ads: boolean;
  timestamp: string;
}

const STORAGE_KEY = "compresskit_consent";
const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  ads: false,
  timestamp: "",
};

/** Check if Do Not Track is enabled */
export function isDoNotTrack(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1";
}

/** Read consent from localStorage */
export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

/** Write consent to localStorage */
export function setConsent(consent: ConsentState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

/** Accept all cookies */
export function acceptAll(): ConsentState {
  const consent: ConsentState = {
    analytics: true,
    ads: true,
    timestamp: new Date().toISOString(),
  };
  setConsent(consent);
  return consent;
}

/** Reject non-essential cookies */
export function rejectNonEssential(): ConsentState {
  const consent: ConsentState = {
    analytics: false,
    ads: false,
    timestamp: new Date().toISOString(),
  };
  setConsent(consent);
  return consent;
}

/** Customize consent */
export function customizeConsent(
  analytics: boolean,
  ads: boolean
): ConsentState {
  const consent: ConsentState = {
    analytics: isDoNotTrack() ? false : analytics,
    ads: isDoNotTrack() ? false : ads,
    timestamp: new Date().toISOString(),
  };
  setConsent(consent);
  return consent;
}

/** Has the user made a consent choice? */
export function hasConsented(): boolean {
  return getConsent() !== null;
}

/* ── React Context ── */

export interface ConsentContextValue {
  consent: ConsentState;
  setConsentState: (consent: ConsentState) => void;
  hasConsented: boolean;
}

export const ConsentContext = createContext<ConsentContextValue>({
  consent: DEFAULT_CONSENT,
  setConsentState: () => {},
  hasConsented: false,
});

export function useConsent(): ConsentContextValue {
  return useContext(ConsentContext);
}
