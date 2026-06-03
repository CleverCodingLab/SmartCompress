/**
 * Compression Workspace — Full-featured compression page.
 * Includes upload zone, settings, progress, results, and ad units.
 */

import type { Metadata } from "next";
import CompressWorkspace from "@/components/CompressWorkspace";

export const metadata: Metadata = {
  title: "Compress Files",
  description:
    "Upload and compress images and videos instantly. Supports JPEG, PNG, GIF, MP4, WEBM, MOV and more. Free, fast, no signup required.",
  alternates: {
    canonical: "/compress",
  },
  openGraph: {
    title: "Compress Files — CompressKit",
    description:
      "Upload and compress images and videos instantly. Free, fast, no signup required.",
    images: ["/og-image.png"],
  },
};

export default function CompressPage() {
  return <CompressWorkspace />;
}
