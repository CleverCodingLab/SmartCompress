/**
 * Server-side compression wrapper.
 * Reimplements the exact ffmpeg calls from compress-folder.mjs
 * as typed async functions for use in API routes.
 *
 * Does NOT modify compress-folder.mjs — uses the same ffmpeg arguments.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { v4 as uuidv4 } from "uuid";

/* ── Supported format sets (mirroring compress-folder.mjs) ── */
export const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".bmp",
  ".tif",
  ".tiff",
  ".gif",
  ".webp",
]);
export const VIDEO_EXT = new Set([".webm", ".mov", ".mkv", ".avi", ".m4v", ".mp4"]);
export const ALL_SUPPORTED = new Set([...IMAGE_EXT, ...VIDEO_EXT]);

/* ── Types ── */
export interface CompressionOptions {
  maxWidth?: number;
  quality?: number; // WebP quality 0-100
  crf?: number; // Video CRF (lower = better quality)
}

export interface CompressionResult {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  ratio: number; // e.g. 0.73 means 73% of original
  savedPercent: number; // e.g. 27 means saved 27%
  outputPath: string;
  outputExt: string;
  kind: "image" | "video";
}

const FFMPEG_LOG_FLAGS = ["-hide_banner", "-loglevel", "error"];

/** Resolve ffmpeg binary path (mirrors compress-folder.mjs logic) */
async function resolveFfmpeg(): Promise<string> {
  // 1. Check env var
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  // 2. Try ffmpeg-static package
  try {
    const mod = await import("ffmpeg-static");
    const ffmpegPath = mod.default as string;
    if (ffmpegPath && fs.existsSync(ffmpegPath)) return ffmpegPath;
  } catch {
    /* optional */
  }
  // 3. Fallback to system ffmpeg
  return "ffmpeg";
}

/** Run ffmpeg with given args, returns a promise */
function runFfmpeg(
  bin: string,
  args: string[],
  silent = false
): Promise<void> {
  return new Promise((resolve, reject) => {
    const logFlags = silent
      ? ["-hide_banner", "-loglevel", "quiet"]
      : FFMPEG_LOG_FLAGS;
    const p = spawn(bin, [...logFlags, ...args], {
      stdio: silent ? "ignore" : ["ignore", "ignore", "inherit"],
      shell: bin === "ffmpeg" && process.platform === "win32",
      windowsHide: true,
    });
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`ffmpeg exited with code ${code}`))
    );
  });
}

/** Compress an image to WebP (same args as compress-folder.mjs) */
async function compressImage(
  bin: string,
  input: string,
  output: string,
  opts: CompressionOptions
): Promise<void> {
  const maxWidth = opts.maxWidth ?? 1920;
  const quality = opts.quality ?? 82;

  fs.mkdirSync(path.dirname(output), { recursive: true });
  await runFfmpeg(bin, [
    "-y",
    "-i",
    input,
    "-vf",
    `scale='min(${maxWidth},iw)':-2`,
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    String(quality),
    output,
  ]);
}

/** Compress a video (same args as compress-folder.mjs) */
async function compressVideo(
  bin: string,
  input: string,
  output: string,
  opts: CompressionOptions
): Promise<void> {
  const maxWidth = opts.maxWidth ?? 1920;
  const crf = opts.crf ?? 28;

  fs.mkdirSync(path.dirname(output), { recursive: true });
  const ext = path.extname(output).toLowerCase();
  const scale = `scale='min(${maxWidth},iw)':-2`;
  const base = ["-y", "-i", input, "-vf", scale];

  if (ext === ".webm") {
    await runFfmpeg(bin, [
      ...base,
      "-c:v", "libvpx-vp9",
      "-crf", String(crf),
      "-b:v", "0",
      "-cpu-used", "2",
      "-row-mt", "1",
      "-c:a", "libopus",
      "-b:a", "128k",
      output,
    ]);
    return;
  }

  // H.264 for mp4/m4v/mov and others
  const useFaststart = [".mp4", ".m4v", ".mov"].includes(ext);
  const h264Args = [
    ...base,
    "-c:v", "libx264",
    "-crf", String(crf),
    "-preset", "slow",
    "-c:a", "aac",
    "-b:a", "128k",
    ...(useFaststart ? ["-movflags", "+faststart"] : []),
    output,
  ];

  await runFfmpeg(bin, h264Args);
}

/** Get the temp directory for compressed files */
function getCompressedDir(): string {
  const dir = path.join(os.tmpdir(), "compresskit-output");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Main compression entry point for API routes.
 * Accepts a file buffer, compresses it, and returns metadata + output path.
 */
export async function compressFile(
  buffer: Buffer,
  originalName: string,
  opts: CompressionOptions = {}
): Promise<CompressionResult> {
  const ext = path.extname(originalName).toLowerCase();
  const kind = VIDEO_EXT.has(ext) ? "video" : "image";
  const id = uuidv4();

  // Determine output extension
  const outputExt = kind === "video" ? ext : ".webp";

  // Create temp paths
  const compressedDir = getCompressedDir();
  const inputPath = path.join(compressedDir, `${id}-input${ext}`);
  const outputPath = path.join(compressedDir, `${id}${outputExt}`);

  // Write buffer to temp file
  fs.writeFileSync(inputPath, buffer);

  const ffmpegBin = await resolveFfmpeg();

  // Verify ffmpeg is available
  try {
    await runFfmpeg(ffmpegBin, ["-version"], true);
  } catch {
    // Clean up input file
    try { fs.unlinkSync(inputPath); } catch { /* ignore */ }
    throw new Error("ffmpeg not found. Please install ffmpeg or set FFMPEG_PATH.");
  }

  try {
    if (kind === "image") {
      await compressImage(ffmpegBin, inputPath, outputPath, opts);
    } else {
      await compressVideo(ffmpegBin, inputPath, outputPath, opts);
    }

    const originalSize = buffer.length;
    const compressedSize = fs.statSync(outputPath).size;
    const ratio = compressedSize / originalSize;
    const savedPercent = Math.max(0, Math.round((1 - ratio) * 100));

    // Clean up input temp file
    try { fs.unlinkSync(inputPath); } catch { /* ignore */ }

    return {
      id,
      originalName,
      originalSize,
      compressedSize,
      ratio,
      savedPercent,
      outputPath,
      outputExt,
      kind,
    };
  } catch (err) {
    // Clean up on error
    try { fs.unlinkSync(inputPath); } catch { /* ignore */ }
    try { fs.unlinkSync(outputPath); } catch { /* ignore */ }
    throw err;
  }
}

/** Get the path for a compressed file by ID */
export function getCompressedFilePath(id: string, ext: string): string {
  return path.join(getCompressedDir(), `${id}${ext}`);
}

/** Clean up a compressed file */
export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch { /* ignore */ }
}
