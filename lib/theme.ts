/**
 * lib/theme.ts
 * Penerapan tema (terang/gelap/sistem) dan warna aksen — logika murni,
 * dipakai oleh components/providers/ThemeEffect.tsx (client) dan skrip
 * inline pra-hidrasi di app/layout.tsx (mencegah flash warna saat load).
 */
import type { AccentColor, ThemeMode } from "@/lib/data/mock";
import { syncNativeStatusBar } from "@/lib/native";

export const THEME_CACHE_KEY = "pundi-theme-cache";
export const ACCENT_CACHE_KEY = "pundi-accent-cache";

/** Resolusi "system" ke terang/gelap nyata berdasarkan preferensi OS. */
export function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

/**
 * Preset warna aksen — dibatasi ke warna semantik yang sudah ada di token
 * (styles/tokens.css), bukan hex bebas, konsisten dengan larangan "warna
 * dekoratif bebas" di design-system/pundi/MASTER.md. `null` berarti pakai
 * brand default tanpa override apa pun.
 */
export const ACCENT_PRESETS: Record<AccentColor, { 500: string; 600: string; 700: string } | null> = {
  brand: null,
  mint: { 500: "#1FB383", 600: "#0E9F6E", 700: "#057A55" },
  ember: { 500: "#EC6A6E", 600: "#E5484D", 700: "#B4232A" },
  lavender: { 500: "#9483DD", 600: "#7B61D1", 700: "#5E46B8" },
  cyan: { 500: "#25A6BE", 600: "#168AA0", 700: "#0F6B7B" },
};

const ACCENT_VARS = ["--color-brand-500", "--color-brand-600", "--color-brand-700"] as const;

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;
  // Warna status bar ponsel / jendela aplikasi terpasang ikut tema aplikasi, bukan hanya tema OS.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = resolved === "dark" ? "#0B0F1A" : "#F3F4F7";
  });
  // Aplikasi native: warna ikon status bar ikut tema (tanpa efek di browser).
  syncNativeStatusBar(resolved);
  try {
    localStorage.setItem(THEME_CACHE_KEY, resolved);
  } catch {
    // localStorage tidak tersedia — tema tetap berlaku untuk sesi ini.
  }
}

export function applyAccent(accentColor: AccentColor) {
  if (typeof document === "undefined") return;
  const preset = ACCENT_PRESETS[accentColor];
  const root = document.documentElement;
  const [c500, c600, c700] = ACCENT_VARS;
  if (preset) {
    root.style.setProperty(c500, preset[500]);
    root.style.setProperty(c600, preset[600]);
    root.style.setProperty(c700, preset[700]);
  } else {
    root.style.removeProperty(c500);
    root.style.removeProperty(c600);
    root.style.removeProperty(c700);
  }
  try {
    localStorage.setItem(ACCENT_CACHE_KEY, accentColor);
  } catch {
    // localStorage tidak tersedia — warna aksen tetap berlaku untuk sesi ini.
  }
}
