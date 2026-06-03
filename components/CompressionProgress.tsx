"use client";

/**
 * CompressionProgress — Animated progress bar using Anime.js timeline.
 *
 * Animation spec:
 * - Progress bar uses anime.js timeline with easeInOutExpo easing
 * - Color transitions from indigo → cyan → emerald as progress increases
 * - Percentage counter animates smoothly
 * - File-by-file status text updates
 */

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useCompression } from "@/lib/compression-context";

export default function CompressionProgress() {
  const { state } = useCompression();
  const { status, currentFileIndex, totalFiles } = state;
  const progressRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  const progress =
    status === "done"
      ? 100
      : totalFiles > 0
      ? Math.round((currentFileIndex / totalFiles) * 100)
      : 0;

  // Animate progress bar width and percentage text
  useEffect(() => {
    if ((status !== "compressing" && status !== "done") || !progressRef.current) return;

    animate(progressRef.current, {
      width: `${progress}%`,
      duration: 600,
      ease: "inOutExpo",
    });

    if (percentRef.current) {
      const prevValue = parseInt(percentRef.current.textContent || "0");
      const obj = { value: prevValue };
      animate(obj, {
        value: progress,
        duration: 600,
        ease: "inOutExpo",
        round: 1,
        onUpdate: () => {
          if (percentRef.current) {
            percentRef.current.textContent = `${Math.round(obj.value)}`;
          }
        },
      });
    }
  }, [progress, status]);

  if (status !== "compressing" && status !== "done") return null;

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
          {status === "compressing" ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Compressing...</span>
              <span className="text-xs text-[var(--text-muted)] normal-case font-normal">
                ({currentFileIndex + 1} of {totalFiles})
              </span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Complete!</span>
              <span className="text-xs text-[var(--emerald)] normal-case font-normal">
                (All {totalFiles} files compressed)
              </span>
            </>
          )}
        </h2>
        <span className="text-sm font-semibold text-[var(--indigo-light)]">
          <span ref={percentRef}>{progress}</span>%
        </span>
      </div>

      {/* Progress bar track */}
      <div className="w-full h-2.5 rounded-full bg-[var(--bg-surface)] overflow-hidden border border-[var(--border-subtle)]">
        <div
          ref={progressRef}
          className="progress-fill"
          style={{ width: "0%" }}
        />
      </div>
    </div>
  );
}
