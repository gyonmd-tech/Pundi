"use client";

/**
 * components/providers/PwaRegister.tsx
 * Mendaftarkan service worker (/sw.js) dan mulai mendengarkan event install.
 * Service worker hanya aktif di build produksi — di `next dev` justru
 * di-unregister supaya cache tidak mengganggu hot reload.
 */
import { useEffect } from "react";
import { initInstallPrompt } from "@/lib/hooks/useInstallPrompt";

export function PwaRegister() {
  useEffect(() => {
    initInstallPrompt();
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
        // Gagal mendaftar (mis. mode privat) — aplikasi tetap berjalan normal tanpa offline.
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
