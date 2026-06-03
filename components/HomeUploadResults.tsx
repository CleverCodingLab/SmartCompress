"use client";

/**
 * HomeUploadResults — Displays results within the homepage upload section.
 */

import { useCompression } from "@/lib/compression-context";
import ResultCard from "@/components/ResultCard";

export default function HomeUploadResults() {
  const { state } = useCompression();
  const { results, status } = state;

  if (results.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Results ({results.length})
      </h4>
      {results.map((result, i) => (
        <ResultCard key={result.downloadId} result={result} index={i} />
      ))}
    </div>
  );
}
