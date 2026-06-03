"use client";

/**
 * BulkActions — Download All as ZIP, Clear All, and total savings summary.
 */

import { useCompression } from "@/lib/compression-context";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BulkActions() {
  const { state, clearAll } = useCompression();
  const { results, status } = state;

  if (status !== "done" || results.length === 0) return null;

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
  const totalSaved = totalOriginal - totalCompressed;
  const totalSavedPercent =
    totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  const handleDownloadZip = async () => {
    try {
      const items = results.map((r) => ({
        id: r.downloadId,
        ext: r.outputExt,
        originalName: r.originalName,
      }));

      const response = await fetch("/api/download-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ZIP");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compresskit-files.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP download error:", err);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="stat-value text-lg text-[var(--text-primary)]">
            {formatFileSize(totalOriginal)}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
            Original
          </div>
        </div>
        <div className="text-center">
          <div className="stat-value text-lg gradient-text">
            {formatFileSize(totalCompressed)}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
            Compressed
          </div>
        </div>
        <div className="text-center">
          <div className="stat-value text-lg text-[var(--emerald)]">
            {totalSavedPercent}%
          </div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
            Saved
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="download-zip"
          onClick={handleDownloadZip}
          className="btn-primary flex-1 py-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download All as ZIP
        </button>
        <button
          id="clear-all"
          onClick={clearAll}
          className="btn-secondary flex-1 py-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear All
        </button>
      </div>
    </div>
  );
}
