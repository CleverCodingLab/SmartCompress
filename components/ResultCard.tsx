"use client";

/**
 * ResultCard — Before/after size comparison with anime.js reveal animation.
 *
 * Animation: scale + fade in on compression complete.
 * Shows compression ratio badge, before/after sizes, and download button.
 */

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { trackEvent } from "@/lib/analytics";
import type { CompressionResult } from "@/lib/compression-context";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ResultCardProps {
  result: CompressionResult;
  index: number;
}

export default function ResultCard({ result, index }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Scale + fade in reveal animation with stagger delay based on index
  useEffect(() => {
    if (hasAnimated.current || !cardRef.current) return;
    hasAnimated.current = true;

    animate(cardRef.current, {
      scale: [0.9, 1],
      opacity: [0, 1],
      translateY: [20, 0],
      delay: index * 80,
      duration: 500,
      ease: "outCubic",
    });
  }, [index]);

  const handleDownload = () => {
    trackEvent("file_download", {
      format: result.outputExt,
      compressed_size_kb: Math.round(result.compressedSize / 1024),
    });

    const url = `/api/download?id=${result.downloadId}&ext=${result.outputExt}&name=${encodeURIComponent(result.originalName)}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.originalName.replace(/\.[^.]+$/, "")}-compressed${result.outputExt}`;
    a.click();
  };

  const savedColor =
    result.savedPercent >= 50
      ? "var(--emerald)"
      : result.savedPercent >= 20
      ? "var(--cyan)"
      : "var(--amber)";

  return (
    <div
      ref={cardRef}
      className="glass rounded-xl p-5 card-hover"
      style={{ opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: File info + before/after */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {/* Kind icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  result.kind === "image"
                    ? "rgba(99, 102, 241, 0.15)"
                    : "rgba(6, 182, 212, 0.15)",
              }}
            >
              {result.kind === "image" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium truncate">{result.originalName}</p>
          </div>

          {/* Before / After bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] w-12 shrink-0">
                Before
              </span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--text-muted)]" style={{ width: "100%" }} />
              </div>
              <span className="stat-value text-xs text-[var(--text-muted)] w-20 text-right">
                {formatFileSize(result.originalSize)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] w-12 shrink-0">
                After
              </span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(result.ratio * 100)}%`,
                    background: `linear-gradient(90deg, var(--indigo), ${savedColor})`,
                  }}
                />
              </div>
              <span className="stat-value text-xs w-20 text-right" style={{ color: savedColor }}>
                {formatFileSize(result.compressedSize)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Savings badge + download */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {/* Savings badge */}
          <div
            className="px-3 py-1.5 rounded-xl text-center"
            style={{
              background: `${savedColor}15`,
              border: `1px solid ${savedColor}30`,
            }}
          >
            <div className="stat-value text-lg" style={{ color: savedColor }}>
              {result.savedPercent}%
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: savedColor }}>
              smaller
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-full px-4 py-2 rounded-lg bg-[var(--indigo)] hover:bg-[var(--indigo-dark)] text-white text-xs font-semibold transition-all hover:scale-105 flex items-center justify-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
