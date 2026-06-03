import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: {
    default: "CompressKit - Compress Images & Videos Instantly",
    template: "%s | CompressKit",
  },
  description:
    "Free, fast, privacy-first media compression. Drop your images and videos — get optimized WebP and compressed files in seconds. No signup. No watermarks.",
  keywords: [
    "image compressor",
    "video compressor",
    "webp converter",
    "compress images",
    "compress videos",
    "file compression",
    "free compressor",
    "ffmpeg compression",
  ],
  authors: [{ name: "CompressKit" }],
  creator: "CompressKit",
  openGraph: {
    type: "website",
    title: "CompressKit - Compress Images & Videos Instantly",
    description:
      "Free media compression powered by ffmpeg. Optimize images to WebP, compress videos. No signup required.",
    siteName: "CompressKit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CompressKit - Media Compression Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CompressKit - Compress Images & Videos Instantly",
    description:
      "Free media compression powered by ffmpeg. Optimize images to WebP, compress videos. No signup required.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "./",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://compresskit.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "CompressKit",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web",
              description:
                "Free, fast, privacy-first media compression tool. Compress images to WebP and optimize videos instantly.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Image compression to WebP",
                "Video compression (H.264, VP9)",
                "Bulk file processing",
                "No signup required",
                "Privacy-first - files processed server-side",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
