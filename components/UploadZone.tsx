"use client";

/**
 * UploadZone — Drag-and-drop file upload with Anime.js border morph animation.
 *
 * Animation spec:
 * - On dragover: border morphs from dashed to solid + indigo glow (anime timeline)
 * - On file drop: file cards stagger in from the right
 * - Format badges pulse on hover
 */

import { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { animate, stagger } from "animejs";
import { useCompression } from "@/lib/compression-context";
import { trackEvent } from "@/lib/analytics";

const SUPPORTED_FORMATS = [
  { ext: "JPEG", color: "#F59E0B" },
  { ext: "PNG", color: "#10B981" },
  { ext: "WEBP", color: "#6366F1" },
  { ext: "GIF", color: "#F43F5E" },
  { ext: "BMP", color: "#8B5CF6" },
  { ext: "TIFF", color: "#EC4899" },
  { ext: "MP4", color: "#06B6D4" },
  { ext: "WEBM", color: "#14B8A6" },
  { ext: "MOV", color: "#3B82F6" },
  { ext: "AVI", color: "#A855F7" },
  { ext: "MKV", color: "#EF4444" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone() {
  const { state, addFiles, removeFile, dispatch, showToast } = useCompression();
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const fileCardsRef = useRef<HTMLDivElement>(null);
  const prevFileCount = useRef(0);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      addFiles(acceptedFiles);

      // Track each file upload
      acceptedFiles.forEach((file) => {
        trackEvent("file_upload", {
          file_type: file.type || "unknown",
          file_size_kb: Math.round(file.size / 1024),
        });
      });

      if (fileRejections.length > 0) {
        fileRejections.forEach((rejection) => {
          const isTooLarge = rejection.errors.some((e: any) => e.code === "file-too-large");
          if (isTooLarge) {
            showToast(`"${rejection.file.name}" is too large. Maximum size is 100MB.`, "warning");
            return;
          }
          const isInvalidType = rejection.errors.some((e: any) => e.code === "file-invalid-type");
          if (isInvalidType) {
            showToast(`"${rejection.file.name}" is not a supported format.`, "warning");
            return;
          }
          showToast(`"${rejection.file.name}" was rejected.`, "warning");
        });
      }
    },
    [addFiles, showToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".gif"],
      "video/*": [".webm", ".mov", ".mkv", ".avi", ".m4v", ".mp4"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  // Anime.js icon animations on dragover (border styles are handled natively by CSS transition)
  useEffect(() => {
    if (!dropzoneRef.current) return;

    if (isDragActive) {
      // Scale up slightly
      animate(".upload-icon", {
        scale: [1, 1.15],
        translateY: [0, -5],
        duration: 400,
        ease: "outBack",
      });
    } else {
      animate(".upload-icon", {
        scale: [1.15, 1],
        translateY: [-5, 0],
        duration: 300,
        ease: "outCubic",
      });
    }
  }, [isDragActive]);

  // Stagger new file cards in from the right
  useEffect(() => {
    const newCount = state.files.length;
    if (newCount > prevFileCount.current && fileCardsRef.current) {
      const newCards = fileCardsRef.current.querySelectorAll(".file-card");
      const startIndex = prevFileCount.current;
      const targetCards = Array.from(newCards).slice(startIndex);

      animate(targetCards, {
        translateX: [30, 0],
        opacity: [0, 1],
        delay: stagger(60),
        duration: 500,
        ease: "outCubic",
      });
    }
    prevFileCount.current = newCount;
  }, [state.files.length]);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        ref={dropzoneRef}
        className={`upload-border cursor-pointer p-10 md:p-16 text-center transition-all ${
          isDragActive ? "active" : ""
        }`}
      >
        <input {...getInputProps()} id="file-upload-input" />

        <div className="upload-icon mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--indigo)]/20 to-[var(--cyan)]/20 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--indigo)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            <polyline points="16 16 12 12 8 16" />
          </svg>
        </div>

        <h2 className="text-lg md:text-xl font-semibold mb-2">
          {isDragActive ? (
            <span className="gradient-text">Drop your files here</span>
          ) : (
            "Drag & drop files here"
          )}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          or click to browse • Max 100MB per file
        </p>

        {/* Format badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SUPPORTED_FORMATS.map((fmt) => (
            <span
              key={fmt.ext}
              className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-transform hover:scale-110"
              style={{
                background: `${fmt.color}15`,
                color: fmt.color,
                border: `1px solid ${fmt.color}30`,
              }}
            >
              {fmt.ext}
            </span>
          ))}
        </div>
      </div>

      {/* File cards */}
      {state.files.length > 0 && (
        <div ref={fileCardsRef} className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Files ({state.files.length})
          </h3>
          {state.files.map((file) => (
            <div
              key={file.id}
              className="file-card glass rounded-xl p-4 flex items-center gap-4 card-hover"
              style={{ opacity: 0 }}
            >
              {/* File type icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background:
                    file.kind === "image"
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(6, 182, 212, 0.15)",
                }}
              >
                {file.kind === "image" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <span className="stat-value">{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase">{file.ext.replace(".", "")}</span>
                  <span>•</span>
                  <span className="capitalize">{file.kind}</span>
                </p>
              </div>

              {/* Preview (images only) */}
              {file.preview && (
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[var(--border-subtle)]">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--rose)] hover:bg-[var(--rose)]/10 transition-all shrink-0"
                aria-label={`Remove ${file.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
