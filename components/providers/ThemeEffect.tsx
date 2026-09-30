"use client";

/**
 * components/providers/ThemeEffect.tsx
 * Menerapkan preferensi tema & warna aksen begitu data preferensi dimuat,
 * dan mengikuti perubahan preferensi sistem (light/dark OS) saat theme
 * diset ke "system". Tidak merender apa pun — efek samping murni.
 */

import { useEffect } from "react";
import { usePreferences } from "@/lib/data/store";
import { applyAccent, applyTheme, resolveTheme } from "@/lib/theme";

export function ThemeEffect() {
  const preferences = usePreferences();

  useEffect(() => {
    applyTheme(preferences.theme);
    if (preferences.theme !== "system" || typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      document.documentElement.dataset.theme = resolveTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preferences.theme]);

  useEffect(() => {
    applyAccent(preferences.accentColor);
  }, [preferences.accentColor]);

  return null;
}
