/**
 * POST /api/compress
 * Accepts multipart/form-data with a single file + compression options.
 * Calls lib/compress.ts which uses ffmpeg (same logic as compress-folder.mjs).
 * Returns JSON with compression result metadata + download ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { compressFile, ALL_SUPPORTED } from "@/lib/compress";
import path from "node:path";



export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    if (!ALL_SUPPORTED.has(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file format: ${ext}. Supported: ${[...ALL_SUPPORTED].join(", ")}`,
        },
        { status: 400 }
      );
    }

    // File size limit: 100MB
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB." },
        { status: 400 }
      );
    }

    // Parse compression options from form data
    const maxWidth = parseInt(formData.get("maxWidth") as string) || 1920;
    const quality = parseInt(formData.get("quality") as string) || 82;
    const crf = parseInt(formData.get("crf") as string) || 28;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run compression
    const result = await compressFile(buffer, file.name, {
      maxWidth,
      quality,
      crf,
    });

    return NextResponse.json({
      id: result.id,
      originalName: result.originalName,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      ratio: result.ratio,
      savedPercent: result.savedPercent,
      outputExt: result.outputExt,
      kind: result.kind,
    });
  } catch (err) {
    console.error("Compression error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during compression",
      },
      { status: 500 }
    );
  }
}
