import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi aplikasi native Pundi (Android & iOS) via Capacitor.
 *
 * Pundi memakai Server Actions & sesi berbasis cookie, jadi tidak bisa di-export
 * statis. Aplikasi native memuat versi web yang sudah di-deploy (mis. Vercel)
 * di dalam WebView layar penuh — setiap deploy web otomatis memperbarui app
 * tanpa rilis ulang ke Play Store / App Store.
 *
 * Set URL produksi sebelum `npx cap sync`:
 *   PUNDI_APP_URL=https://pundi-kamu.vercel.app npm run mobile:sync
 */
const appUrl = process.env.PUNDI_APP_URL?.replace(/\/$/, "");

if (!appUrl) {
  console.warn("[capacitor] PUNDI_APP_URL belum diset — app hanya akan menampilkan layar mobile/www/index.html.");
}

const config: CapacitorConfig = {
  appId: "id.pundi.app",
  appName: "Pundi",
  webDir: "mobile/www",
  backgroundColor: "#F4F7FC",
  server: appUrl
    ? {
        url: `${appUrl}/dashboard`,
        cleartext: appUrl.startsWith("http://"),
        allowNavigation: [new URL(appUrl).host, "*.appwrite.io", "*.cloud.appwrite.io"],
        errorPath: "index.html",
      }
    : undefined,
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "never",
    limitsNavigationsToAppBoundDomains: false,
  },
};

export default config;
