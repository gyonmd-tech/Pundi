import type { MetadataRoute } from "next";

/**
 * Web App Manifest — membuat Pundi bisa di-install ke layar utama
 * (Android, iOS 16.4+, desktop Chromium) dan dibuka seperti aplikasi native.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Pundi — Keuangan Pintar",
    short_name: "Pundi",
    description:
      "Catat transaksi, atur anggaran, pantau arus kas, aset, dan tujuan keuangan dalam satu aplikasi.",
    lang: "id",
    dir: "ltr",
    start_url: "/dashboard?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait",
    background_color: "#F4F7FC",
    theme_color: "#2459DE",
    categories: ["finance", "productivity"],
    icons: [
      { src: "/PUNDI-brand-assets/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/PUNDI-brand-assets/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/PUNDI-brand-assets/maskable-icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/PUNDI-brand-assets/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Tambah transaksi",
        short_name: "Tambah",
        url: "/transaksi?tambah=1",
        icons: [{ src: "/PUNDI-brand-assets/maskable-icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Anggaran",
        url: "/anggaran",
        icons: [{ src: "/PUNDI-brand-assets/maskable-icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Arus Kas",
        url: "/arus-kas",
        icons: [{ src: "/PUNDI-brand-assets/maskable-icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
