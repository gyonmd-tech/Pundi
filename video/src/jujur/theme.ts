/**
 * Tema video "Dari Gajian ke Gajian" — identitas Pundi 2026-11
 * (kobalt + lime, Fraunces + Geist), sama dengan aplikasi & poster.
 */
import { Easing, interpolate, useVideoConfig } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

export const serif = loadFraunces("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;
export const sans = loadGeist("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const hand = loadCaveat("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;

export const K = {
  paper: "#F6F7FA",
  white: "#FFFFFF",
  ink: "#0F1729",
  muted: "#556075",
  rule: "#E3E6EE",
  cobalt: "#2D4FE6",
  cobalt700: "#2340C8",
  cobalt100: "#E6EBFE",
  navy: "#0E1A5C",
  lime: "#C5F04A",
  mint: "#0E9F6E",
  mintInk: "#057A55",
  ember: "#E5484D",
  emberInk: "#B4232A",
  amber: "#E8A317",
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export function tween(frame: number, input: number[], output: number[], easing = easeOut) {
  return interpolate(frame, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

/** u = 1 pada sisi terpendek 1080px, supaya ukuran sama di 16:9 dan 9:16. */
export function useLayout() {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return { width, height, u, portrait: height > width };
}

export function rupiah(value: number) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}
