/**
 * scripts/mobile-app-url.mjs
 * Menulis mobile/www/app-url.js: alamat yang dibuka halaman offline aplikasi
 * native (mobile/www/index.html) saat pengguna menekan "Coba lagi" atau saat
 * koneksi kembali. Logikanya sama dengan capacitor.config.ts (PUNDI_APP_URL
 * atau produksi). Dijalankan otomatis oleh `npm run mobile:sync`.
 */
import fs from "node:fs";
import path from "node:path";

const PRODUCTION_URL = "https://pundi-theta.vercel.app";
const appUrl = (process.env.PUNDI_APP_URL || PRODUCTION_URL).replace(/\/$/, "");
const target = `${appUrl}/?source=app`;
const file = path.resolve("mobile/www/app-url.js");
fs.writeFileSync(file, `// Dibuat oleh scripts/mobile-app-url.mjs — jangan diedit manual.\nwindow.PUNDI_APP_URL = ${JSON.stringify(target)};\n`);
console.log(`mobile/www/app-url.js → ${target}`);
