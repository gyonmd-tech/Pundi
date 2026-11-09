import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi aplikasi native Pundi (Android & iOS) via Capacitor.
 *
 * Pundi memakai Server Actions & sesi berbasis cookie, jadi tidak bisa di-export
 * statis. Aplikasi native memuat versi web yang sudah di-deploy (mis. Vercel)
 * di dalam WebView layar penuh — setiap deploy web otomatis memperbarui app
 * tanpa rilis ulang ke Play Store / App Store.
 *
 * Aplikasi dibuka di "/?source=app": proxy.ts mengarahkan ke /login, atau
 * langsung ke /dashboard bila sesi masih tersimpan.
 *
 * Default memuat produksi di https://pundi-theta.vercel.app. Untuk menguji
 * deploy lain (mis. preview Vercel), timpa lewat env:
 *   PUNDI_APP_URL=https://alamat-lain.vercel.app npm run mobile:sync
 */
// Sama dengan scripts/mobile-app-url.mjs (alamat yang dibuka halaman offline).
const PRODUCTION_URL = "https://pundi-theta.vercel.app";
const appUrl = (process.env.PUNDI_APP_URL || PRODUCTION_URL).replace(/\/$/, "");

const config: CapacitorConfig = {
  appId: "id.pundi.app",
  appName: "Pundi",
  webDir: "mobile/www",
  backgroundColor: "#F3F4F7",
  server: {
    url: `${appUrl}/?source=app`,
    cleartext: appUrl.startsWith("http://"),
    allowNavigation: [new URL(appUrl).host, "*.appwrite.io", "*.cloud.appwrite.io"],
    errorPath: "index.html",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    // Splash ditutup oleh halaman (components/providers/NativeBridge.tsx)
    // begitu tergambar; 10 detik hanya batas aman bila situs gagal dimuat.
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 10000,
      launchFadeOutDuration: 250,
      backgroundColor: "#F3F4F7",
      showSpinner: false,
    },
    // Plugin inti Capacitor 8: menyuntikkan --safe-area-inset-* untuk WebView
    // lama yang env(safe-area-inset-*)-nya bernilai 0.
    SystemBars: {
      insetsHandling: "css",
      style: "DEFAULT",
    },
  },
  ios: {
    contentInset: "never",
    limitsNavigationsToAppBoundDomains: false,
  },
};

export default config;
