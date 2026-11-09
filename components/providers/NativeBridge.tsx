"use client";

/**
 * components/providers/NativeBridge.tsx
 * Perilaku khusus aplikasi native (Android/iOS via Capacitor). Tidak melakukan
 * apa pun di browser biasa.
 *
 * - Splash screen ditutup setelah halaman pertama tergambar, bukan saat
 *   WebView baru siap (yang menyisakan layar putih selama situs dimuat).
 * - Tombol back Android: tutup dialog/sheet yang terbuka dulu; lalu kembali ke
 *   halaman sebelumnya; di halaman utama, aplikasi diminimalkan (bukan keluar).
 */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hideNativeSplash, isNativeApp, minimizeNativeApp, onNativeBackButton, syncNativeStatusBar } from "@/lib/native";

const HOME_ROUTES = new Set(["/", "/dashboard", "/login", "/signup"]);
const OPEN_LAYER = '[aria-modal="true"], [role="dialog"], [role="alertdialog"]';

/** Tutup lapisan teratas (modal, sheet, dialog konfirmasi). true bila ada yang terbuka. */
function closeTopLayer(): boolean {
  const layers = Array.from(document.querySelectorAll<HTMLElement>(OPEN_LAYER)).filter((layer) => layer.getClientRects().length > 0);
  const top = layers.at(-1);
  if (!top) return false;
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  // Dialog yang tidak mendengarkan Escape: tekan tombol tutup/batalnya.
  window.setTimeout(() => {
    if (!top.isConnected) return;
    const close = Array.from(top.querySelectorAll<HTMLButtonElement>("button")).find((button) => {
      const label = `${button.getAttribute("aria-label") ?? ""} ${button.textContent ?? ""}`.trim().toLowerCase();
      return /^(tutup|batal)\b/.test(label) || label.startsWith("tutup");
    });
    close?.click();
  }, 60);
  return true;
}

export function NativeBridge() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isNativeApp()) return;
    // Halaman di luar aplikasi utama (login) mengikuti tema sistem; AppShell
    // menyetel ulang sesuai preferensi pengguna lewat applyTheme().
    if (!document.documentElement.dataset.theme) syncNativeStatusBar("system");
    const frame = requestAnimationFrame(() => requestAnimationFrame(hideNativeSplash));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isNativeApp()) return;
    return onNativeBackButton(({ canGoBack }) => {
      if (closeTopLayer()) return;
      if (!HOME_ROUTES.has(pathname)) {
        if (canGoBack) window.history.back();
        else router.replace("/dashboard");
        return;
      }
      minimizeNativeApp();
    });
  }, [pathname, router]);

  return null;
}
