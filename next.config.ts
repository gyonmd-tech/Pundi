import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize node-appwrite from bundler to prevent __dirname reference errors on Vercel
  serverExternalPackages: ["node-appwrite"],

  typescript: {
    ignoreBuildErrors: false,
  },

  env: {
    NEXT_PUBLIC_APP_NAME: "Pundi",
  },
};

export default nextConfig;
