# CompressKit

> Fast, privacy-first media compression. Powered by ffmpeg. Built with Next.js 14.

![CompressKit](public/og-image.png)

## Features

- 🖼️ **Image Compression** — JPEG, PNG, GIF, BMP, TIFF → optimized WebP
- 🎬 **Video Compression** — MP4, WEBM, MOV, AVI, MKV with H.264/VP9
- 📦 **Bulk Processing** — Drop multiple files, download all as ZIP
- ⚡ **Lightning Fast** — Powered by ffmpeg, the industry standard
- 🔒 **Privacy First** — Files processed in memory, auto-deleted after download
- 🎨 **Beautiful UI** — Dark mode, glassmorphism, Anime.js animations
- 📊 **Analytics** — GA4 integration (consent-gated)
- 📢 **Ads** — AdSense integration (consent-gated)
- 🍪 **GDPR Compliant** — Full cookie consent with Accept/Reject/Customize

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Anime.js |
| Compression | ffmpeg via `compress-folder.mjs` logic |
| State | React Context + useReducer |
| Upload | react-dropzone |
| Analytics | Google Analytics 4 |
| Ads | Google AdSense |

## Getting Started

### Prerequisites

- **Node.js** 18+
- **ffmpeg** installed on your system (or `ffmpeg-static` will be used as fallback)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd SmartCompress

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your GA4 and AdSense IDs

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with:

```env
# Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_HERO=XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=XXXXXXXXXX

# Site URL (for SEO/sitemap)
NEXT_PUBLIC_SITE_URL=https://compresskit.com

# Optional: Custom ffmpeg path
# FFMPEG_PATH=/usr/local/bin/ffmpeg
```

> **Note:** The app works fully without GA4 and AdSense IDs. These features are opt-in and consent-gated.

## How `compress-folder.mjs` is Integrated

The original `compress-folder.mjs` script uses ffmpeg to compress images → WebP and videos → H.264/VP9. Rather than modifying the script, CompressKit:

1. **`/lib/compress.ts`** — Reimplements the exact same ffmpeg arguments as typed TypeScript functions
2. **`/app/api/compress/route.ts`** — POST endpoint that accepts file uploads and calls `compress.ts`
3. **`/app/api/download/route.ts`** — GET endpoint that serves compressed files
4. **`/app/api/download-zip/route.ts`** — POST endpoint for bulk ZIP download

The compression logic uses identical ffmpeg flags:
- Images: `libwebp` codec with configurable quality and max-width scaling
- Videos: `libx264` (MP4/MOV) or `libvpx-vp9` (WebM) with CRF-based quality

## Project Structure

```
├── app/
│   ├── layout.tsx              — Root layout (SEO, JSON-LD)
│   ├── client-layout.tsx       — Client wrapper (consent, GA4, ads)
│   ├── page.tsx                — Homepage
│   ├── compress/page.tsx       — Compression workspace
│   ├── privacy/page.tsx        — Privacy policy
│   ├── cookies/page.tsx        — Cookie policy
│   ├── sitemap.ts              — Dynamic sitemap
│   ├── robots.ts               — Robots.txt config
│   └── api/
│       ├── compress/route.ts   — Compression endpoint
│       ├── download/route.ts   — File download endpoint
│       └── download-zip/route.ts — Bulk ZIP download
├── components/
│   ├── AnimatedHero.tsx        — Hero with anime.js animations
│   ├── UploadZone.tsx          — Drag-and-drop with border morph
│   ├── CompressionProgress.tsx — Animated progress bar
│   ├── CompressionSettings.tsx — Quality/width/CRF controls
│   ├── ResultCard.tsx          — Before/after comparison
│   ├── BulkActions.tsx         — ZIP download + clear all
│   ├── CookieBanner.tsx        — GDPR consent banner
│   ├── AdUnit.tsx              — AdSense wrapper
│   ├── Navbar.tsx              — Sticky glassmorphism nav
│   ├── Footer.tsx              — Multi-column footer
│   ├── FeatureCard.tsx         — Scroll-animated feature card
│   ├── PricingSection.tsx      — Three-tier pricing
│   └── TestimonialsCarousel.tsx — Auto-rotating testimonials
├── lib/
│   ├── compress.ts             — ffmpeg compression wrapper
│   ├── analytics.ts            — GA4 event helpers
│   ├── consent.ts              — GDPR consent management
│   └── compression-context.tsx — React state management
├── compress-folder.mjs         — Original compression script
└── .env.local                  — Environment variables
```

## Scripts

```bash
npm run dev    # Start development server
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Deployment

### Self-hosted / VPS (Recommended)
Best for video compression — no serverless timeout limits.

```bash
npm run build
npm run start
```

### Vercel
Works for image compression. Video files may timeout on Hobby plan (10s limit).
Pro plan supports 60s execution.

## License

MIT
