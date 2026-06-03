"use client";

/**
 * CompressWorkspace — Full compression workspace with upload, settings,
 * progress, results, and ad placements.
 */

import { CompressionProvider, useCompression } from "@/lib/compression-context";
import UploadZone from "@/components/UploadZone";
import CompressionSettings from "@/components/CompressionSettings";
import CompressionProgress from "@/components/CompressionProgress";
import ResultCard from "@/components/ResultCard";
import BulkActions from "@/components/BulkActions";
import AdUnit from "@/components/AdUnit";
import ToastContainer from "@/components/ToastContainer";

function WorkspaceContent() {
  const { state, startCompression } = useCompression();
  const isCompressing = state.status === "compressing";

  return (
    <div className="section-container py-24 md:py-28">
      {/* Toast notifications container */}
      <ToastContainer />

      {/* Page header */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Compression <span className="gradient-text">Workspace</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Upload your files, adjust settings, and download optimized media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 max-w-6xl mx-auto">
        {/* Main column */}
        <div className="space-y-6">
          <UploadZone />

          {/* Mobile Compress Button (Visible on mobile/tablet, hidden on desktop) */}
          {state.files.length > 0 && state.status !== "done" && (
            <div className="lg:hidden">
              <button
                id="start-compression-mobile"
                onClick={startCompression}
                disabled={isCompressing}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCompressing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Compressing...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    Compress {state.files.length} {state.files.length === 1 ? "File" : "Files"}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Ad unit between upload and results */}
          <AdUnit
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HERO || ""}
            format="horizontal"
          />

          <CompressionProgress />

          {/* Results */}
          {state.results.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Results ({state.results.length})
              </h2>
              {state.results.map((result, i) => (
                <ResultCard
                  key={result.downloadId}
                  result={result}
                  index={i}
                />
              ))}
            </div>
          )}

          <BulkActions />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CompressionSettings />

          {/* Error display */}
          {state.error && (
            <div className="glass rounded-2xl p-5 border border-[var(--rose)]/30 bg-[var(--rose)]/5">
              <h4 className="text-sm font-semibold text-[var(--rose)] mb-1 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Error
              </h4>
              <p className="text-sm text-[var(--text-secondary)]">
                {state.error}
              </p>
            </div>
          )}

          {/* Sidebar ad */}
          <AdUnit
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || ""}
            format="vertical"
            className="hidden lg:flex"
          />

          {/* Tips card */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              💡 Tips
            </h2>
            <ul className="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[var(--indigo)] mt-0.5">•</span>
                <span>Images are converted to WebP for optimal web performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--cyan)] mt-0.5">•</span>
                <span>Videos keep their original format with H.264/VP9 encoding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--emerald)] mt-0.5">•</span>
                <span>Lower quality = smaller file, but 80+ is usually indistinguishable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--amber)] mt-0.5">•</span>
                <span>Max width preserves aspect ratio — images won&apos;t be stretched</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompressWorkspace() {
  return (
    <CompressionProvider>
      <WorkspaceContent />
    </CompressionProvider>
  );
}
