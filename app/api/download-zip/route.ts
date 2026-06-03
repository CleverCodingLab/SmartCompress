/**
 * POST /api/download-zip
 * Accepts JSON body with array of file IDs, creates ZIP archive, streams to client.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCompressedFilePath } from "@/lib/compress";
// @ts-ignore
import { ZipArchive } from "archiver";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

interface DownloadItem {
  id: string;
  ext: string;
  originalName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items: DownloadItem[] = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No files specified" },
        { status: 400 }
      );
    }

    // Validate all files exist
    const filePaths: { path: string; name: string }[] = [];
    for (const item of items) {
      const filePath = getCompressedFilePath(item.id, item.ext);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: `File not found: ${item.originalName}` },
          { status: 404 }
        );
      }
      const parsed = path.parse(item.originalName);
      filePaths.push({
        path: filePath,
        name: `${parsed.name}-compressed${item.ext}`,
      });
    }

    // Create ZIP archive
    const archive = new ZipArchive({ zlib: { level: 5 } });

    // Collect chunks from the archive stream
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      archive.on("data", (chunk: Buffer) => chunks.push(chunk));
      archive.on("end", resolve);
      archive.on("error", reject);

      // Add files to archive
      for (const fp of filePaths) {
        archive.file(fp.path, { name: fp.name });
      }

      archive.finalize();
    });

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="compresskit-files.zip"',
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (err) {
    console.error("ZIP download error:", err);
    return NextResponse.json(
      { error: "Failed to create ZIP archive" },
      { status: 500 }
    );
  }
}
