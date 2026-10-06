import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi aplikasi native Pundi (Android & iOS) via Capacitor.
 *
 * Pundi memakai Server Actions & sesi berbasis cookie, jadi tidak bisa di-export
 * statis. Aplikasi native memuat versi web yang sudah di-deploy (mis. Vercel)
 * di dalam WebView layar penuh — setiap deploy web otomatis memperbarui app
 * tanpa rilis ulang ke Play Store / App Store.
 *
 * Default memuat produksi di https://pundi-theta.vercel.app. Untuk menguji
 * deploy lain (mis. preview Vercel), timpa lewat env:
 *   PUNDI_APP_URL=https://alamat-lain.vercel.app npm run mobile:sync
 */
const PRODUCTION_URL = "https://pundi-theta.vercel.app";
const appUrl = (process.env.PUNDI_APP_URL || PRODUCTION_URL).replace(/\/$/, "");

const config: CapacitorConfig = {
  appId: "id.pundi.app",
  appName: "Pundi",
  webDir: "mobile/www",
  backgroundColor: "#F4F7FC",
  server: {
    url: `${appUrl}/dashboard`,
    cleartext: appUrl.startsWith("http://"),
    allowNavigation: [new URL(appUrl).host, "*.appwrite.io", "*.cloud.appwrite.io"],
    errorPath: "index.html",
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "never",
    limitsNavigationsToAppBoundDomains: false,
  },
};

export default config;
