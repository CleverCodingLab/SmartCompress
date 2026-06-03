"use client";

/**
 * CompressionSettings — Quality slider, max width, video CRF controls.
 */

import { useCompression } from "@/lib/compression-context";

export default function CompressionSettings() {
  const { state, updateSettings, startCompression } = useCompression();
  const { settings, files, status } = state;
  const isCompressing = status === "compressing";

  const hasImages = files.some((f) => f.kind === "image");
  const hasVideos = files.some((f) => f.kind === "video");

  if (files.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Compression Settings
      </h2>

      {/* Image quality slider */}
      {hasImages && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="quality-slider">
              Image Quality (WebP)
            </label>
            <span className="stat-value text-sm text-[var(--indigo)]">
              {settings.quality}%
            </span>
          </div>
          <input
            id="quality-slider"
            type="range"
            min={10}
            max={100}
            step={1}
            value={settings.quality}
            onChange={(e) =>
              updateSettings({ quality: parseInt(e.target.value) })
            }
            disabled={isCompressing}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--indigo)]"
            style={{
              background: `linear-gradient(to right, var(--indigo) 0%, var(--indigo) ${settings.quality}%, var(--border-default) ${settings.quality}%, var(--border-default) 100%)`,
            }}
          />
          <p className="text-xs text-[var(--text-muted)]">
            Lower = smaller file size, higher = better quality
          </p>
        </div>
      )}

      {/* Max width */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="max-width-input">
            Max Width (px)
          </label>
          <span className="stat-value text-sm text-[var(--cyan)]">
            {settings.maxWidth}px
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[720, 1080, 1920, 2560, 3840].map((w) => (
            <button
              key={w}
              onClick={() => updateSettings({ maxWidth: w })}
              disabled={isCompressing}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                settings.maxWidth === w
                  ? "bg-[var(--indigo)] text-white"
                  : "glass hover:bg-[var(--bg-surface-hover)]"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Video CRF */}
      {hasVideos && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="crf-slider">
              Video Quality (CRF)
            </label>
            <span className="stat-value text-sm text-[var(--cyan)]">
              {settings.crf}
            </span>
          </div>
          <input
            id="crf-slider"
            type="range"
            min={18}
            max={40}
            step={1}
            value={settings.crf}
            onChange={(e) => updateSettings({ crf: parseInt(e.target.value) })}
            disabled={isCompressing}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--cyan)]"
            style={{
              background: `linear-gradient(to right, var(--cyan) 0%, var(--cyan) ${((settings.crf - 18) / 22) * 100}%, var(--border-default) ${((settings.crf - 18) / 22) * 100}%, var(--border-default) 100%)`,
            }}
          />
          <p className="text-xs text-[var(--text-muted)]">
            Lower CRF = better quality, larger file • 23–28 recommended
          </p>
        </div>
      )}

      {/* Compress button */}
      <button
        id="start-compression"
        onClick={startCompression}
        disabled={isCompressing || files.length === 0}
        className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isCompressing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Compressing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Compress {files.length} {files.length === 1 ? "File" : "Files"}
          </span>
        )}
      </button>
    </div>
  );
}
