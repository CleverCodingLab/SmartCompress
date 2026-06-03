/**
 * GET /api/download?id=<uuid>&ext=<.webp|.mp4|...>
 * Serves a compressed file with correct Content-Disposition headers.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCompressedFilePath } from "@/lib/compress";
import fs from "node:fs";
import path from "node:path";

const MIME_MAP: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".avi": "video/x-msvideo",
  ".m4v": "video/mp4",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ext = searchParams.get("ext") || ".webp";
    const originalName = searchParams.get("name") || `compressed${ext}`;

    if (!id) {
      return NextResponse.json(
        { error: "Missing file ID" },
        { status: 400 }
      );
    }

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid file ID" },
        { status: 400 }
      );
    }

    const filePath = getCompressedFilePath(id, ext);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found or has expired" },
        { status: 404 }
      );
    }

    // Read file and create response
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = MIME_MAP[ext] || "application/octet-stream";

    // Build download filename
    const parsed = path.parse(originalName);
    const downloadName = `${parsed.name}-compressed${ext}`;

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
