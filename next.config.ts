import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize node-appwrite dari bundler agar tidak error __dirname di Vercel
  serverExternalPackages: ["node-appwrite"],

  typescript: {
    ignoreBuildErrors: false,
  },

  env: {
    NEXT_PUBLIC_APP_NAME: "Pundi",
  },

  // Service worker PWA harus selalu diambil ulang agar update cepat sampai ke pengguna.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },

  // Turbopack config (Next.js 16 default bundler)
  // exceljs menggunakan modul Node.js (fs, path, stream, dll.) yang tidak tersedia di browser.
  // Alias ke false agar Turbopack ganti dengan stub kosong saat bundle client-side.
  turbopack: {
    resolveAlias: {
      fs:     { browser: "./lib/utils/noop.ts" },
      path:   { browser: "./lib/utils/noop.ts" },
      stream: { browser: "./lib/utils/noop.ts" },
      zlib:   { browser: "./lib/utils/noop.ts" },
      crypto: { browser: "./lib/utils/noop.ts" },
    },
  },
};

export default nextConfig;

