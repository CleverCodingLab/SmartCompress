#!/usr/bin/env node
/**
 * Compress all images & videos under a folder → <folder>/output/ (same tree).
 * Upload only the output/ tree to VPS (keeps originals safe locally).
 *
 * Usage (from senbsen-frontend):
 *   npm run compress:folder -- --input="D:/media/uploads"
 *   node scripts/compress-folder.mjs --input="D:/media/uploads"
 *   node scripts/compress-folder.mjs "D:/media/uploads" --max-width=1920 --quality=82
 *
 * Options:
 *   --input=PATH       Required. Folder to scan (recursive).
 *   --max-width=N      Max width for images (default 1920). Always preserves aspect ratio.
 *   --quality=N        WebP quality 0–100 (default 82).
 *   --crf=N            Video CRF (default 28, lower = better quality).
 *   --dry-run          List files only; do not encode.
 *
 * Output:
 *   <input>/output/     JPG/PNG → .webp; videos keep same extension (.webm, .mp4, …)
 *   <input>/output/manifest.json   Source → output mapping for upload
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Raster sources only — output is always .webp (skip existing .webp in input). */
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff', '.gif']);
const VIDEO_EXT = new Set(['.webm', '.mov', '.mkv', '.avi', '.m4v', '.mp4']);
const SKIP_DIR_NAMES = new Set(['output', 'node_modules', '.git']);

const FFMPEG_LOG_FLAGS = ['-hide_banner', '-loglevel', 'error'];

/** @type {string | null} */
let ffmpegPath = null;

function parseArgs(argv) {
  const opts = {
    input: null,
    maxWidth: 1920,
    quality: 82,
    crf: 28,
    dryRun: false,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--input=')) opts.input = arg.slice('--input='.length);
    else if (arg.startsWith('--max-width=')) opts.maxWidth = Number(arg.slice('--max-width='.length));
    else if (arg.startsWith('--quality=')) opts.quality = Number(arg.slice('--quality='.length));
    else if (arg.startsWith('--crf=')) opts.crf = Number(arg.slice('--crf='.length));
    else if (!arg.startsWith('--') && !opts.input) opts.input = arg;
  }

  return opts;
}

async function resolveFfmpeg() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  try {
    const mod = await import('ffmpeg-static');
    if (mod.default && fs.existsSync(mod.default)) return mod.default;
  } catch {
    /* optional */
  }
  return 'ffmpeg';
}

function runFfmpeg(args, { silent = false } = {}) {
  return new Promise((resolve, reject) => {
    const bin = ffmpegPath ?? 'ffmpeg';
    const logFlags = silent
      ? ['-hide_banner', '-loglevel', 'quiet']
      : FFMPEG_LOG_FLAGS;
    const p = spawn(bin, [...logFlags, ...args], {
      stdio: silent ? 'ignore' : ['ignore', 'ignore', 'inherit'],
      shell: bin === 'ffmpeg' && process.platform === 'win32',
      windowsHide: true,
    });
    p.on('error', reject);
    p.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${path.basename(bin)} exited ${code}`)),
    );
  });
}

function walkFiles(dir, rootDir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name.toLowerCase())) continue;
      walkFiles(full, rootDir, files);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext)) {
      files.push({
        abs: full,
        rel: path.relative(rootDir, full).split(path.sep).join('/'),
        ext,
        kind: VIDEO_EXT.has(ext) ? 'video' : 'image',
      });
    }
  }
  return files;
}

function outputPathFor(outputRoot, relPath, file) {
  const parsed = path.parse(relPath);
  const outExt = file.kind === 'video' ? file.ext : '.webp';
  const relOut = path.join(parsed.dir, parsed.name + outExt).split(path.sep).join('/');
  return path.join(outputRoot, relOut);
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function compressImage(input, output, { maxWidth, quality }) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await runFfmpeg([
    '-y',
    '-i',
    input,
    '-vf',
    `scale='min(${maxWidth},iw)':-2`,
    '-frames:v',
    '1',
    '-c:v',
    'libwebp',
    '-quality',
    String(quality),
    output,
  ]);
}

async function compressVideo(input, output, { crf, maxWidth }) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const ext = path.extname(output).toLowerCase();
  const scale = `scale='min(${maxWidth},iw)':-2`;
  const base = ['-y', '-i', input, '-vf', scale];

  if (ext === '.webm') {
    await runFfmpeg([
      ...base,
      '-c:v',
      'libvpx-vp9',
      '-crf',
      String(crf),
      '-b:v',
      '0',
      '-cpu-used',
      '2',
      '-row-mt',
      '1',
      '-c:a',
      'libopus',
      '-b:a',
      '128k',
      output,
    ]);
    return;
  }

  const h264Tail =
    ext === '.mp4' || ext === '.m4v' || ext === '.mov'
      ? ['-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output]
      : ['-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-c:a', 'aac', '-b:a', '128k', output];

  await runFfmpeg([...base, ...h264Tail]);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.input) {
    console.error(
      'Missing folder path.\n\n' +
      '  npm run compress:folder -- --input="D:/path/to/uploads"\n' +
      '  node scripts/compress-folder.mjs --input="D:/path/to/uploads"\n',
    );
    process.exit(1);
  }

  const inputRoot = path.resolve(opts.input);
  if (!fs.existsSync(inputRoot) || !fs.statSync(inputRoot).isDirectory()) {
    console.error(`Not a directory: ${inputRoot}`);
    process.exit(1);
  }

  const outputRoot = path.join(inputRoot, 'output');
  const files = walkFiles(inputRoot, inputRoot);

  if (!files.length) {
    console.log(`No images or videos found under:\n  ${inputRoot}`);
    process.exit(0);
  }

  ffmpegPath = await resolveFfmpeg();
  try {
    await runFfmpeg(['-version'], { silent: true });
  } catch {
    console.error('ffmpeg not found. Run: npm install');
    process.exit(1);
  }

  console.log(`Input:  ${inputRoot}`);
  console.log(`Output: ${outputRoot}`);
  console.log(`Files:  ${files.length}${opts.dryRun ? ' (dry-run)' : ''}`);
  console.log(`Using:  ${ffmpegPath}\n`);

  if (opts.dryRun) {
    for (const f of files) {
      const out = outputPathFor(outputRoot, f.rel, f);
      console.log(`  ${f.rel} → output/${path.relative(outputRoot, out).split(path.sep).join('/')}`);
    }
    process.exit(0);
  }

  fs.mkdirSync(outputRoot, { recursive: true });

  const manifest = {
    generatedAt: new Date().toISOString(),
    inputRoot,
    outputRoot,
    settings: {
      maxWidth: opts.maxWidth,
      webpQuality: opts.quality,
      videoCrf: opts.crf,
    },
    files: [],
  };

  let ok = 0;
  let failed = 0;
  let savedBytes = 0;

  for (const f of files) {
    const out = outputPathFor(outputRoot, f.rel, f);
    const relOut = path.relative(outputRoot, out).split(path.sep).join('/');
    const inSize = fs.statSync(f.abs).size;

    process.stdout.write(`→ ${f.rel} … `);

    try {
      if (f.kind === 'image') {
        await compressImage(f.abs, out, opts);
      } else if (f.kind === 'video') {
        await compressVideo(f.abs, out, opts);
      } else {
        console.log('skip (unknown type)');
        continue;
      }

      const outSize = fs.statSync(out).size;
      savedBytes += Math.max(0, inSize - outSize);
      ok += 1;
      console.log(`${formatKb(inSize)} → ${formatKb(outSize)}  (output/${relOut})`);

      manifest.files.push({
        source: f.rel,
        output: `output/${relOut}`,
        inputBytes: inSize,
        outputBytes: outSize,
      });
    } catch (err) {
      failed += 1;
      console.log(`FAILED (${err.message})`);
      manifest.files.push({
        source: f.rel,
        output: `output/${relOut}`,
        error: String(err.message),
      });
    }
  }

  const manifestPath = path.join(outputRoot, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n--- Summary ---');
  console.log(`OK:      ${ok}`);
  console.log(`Failed:  ${failed}`);
  console.log(`Saved:   ~${formatKb(savedBytes)} (vs originals)`);
  console.log(`Manifest: ${manifestPath}`);
  console.log('\nUpload the contents of output/ to VPS. Images are .webp; videos keep the same extension as the source.');

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
