"use client";

/**
 * HomeUploadSection — Inline upload zone on the homepage.
 * Wraps UploadZone in a CompressionProvider so it works independently.
 */

import { CompressionProvider } from "@/lib/compression-context";
import UploadZone from "@/components/UploadZone";
import CompressionSettings from "@/components/CompressionSettings";
import CompressionProgress from "@/components/CompressionProgress";
import ResultCard from "@/components/ResultCard";
import BulkActions from "@/components/BulkActions";
import HomeUploadResults from "@/components/HomeUploadResults";

export default function HomeUploadSection() {
  return (
    <section className="py-16">
      <div className="section-container">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Try it <span className="gradient-text">now</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto text-center">
            No signup required. Drop your files and compress instantly.
          </p>
        </div>

        <CompressionProvider>
          <div className="max-w-3xl mx-auto space-y-6">
            <UploadZone />
            <CompressionSettings />
            <CompressionProgress />
            <HomeUploadResults />
            <BulkActions />
          </div>
        </CompressionProvider>
      </div>
    </section>
  );
}
