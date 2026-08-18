import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimasi font dari Google Fonts (Fraunces, IBM Plex Mono)
  // General Sans diload via Fontshare (external CDN, di tokens.css)

  // Server Components dapat mengakses env vars langsung
  // Client hanya dapat akses NEXT_PUBLIC_ vars
  env: {
    NEXT_PUBLIC_APP_NAME: "Pundi",
  },
};

export default nextConfig;
