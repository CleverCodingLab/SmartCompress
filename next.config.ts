import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ffmpeg-static and archiver to be resolved server-side
  serverExternalPackages: ["ffmpeg-static"],

  // Increase body parser limit for video uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
