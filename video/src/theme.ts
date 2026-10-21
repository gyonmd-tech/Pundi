import { Easing, interpolate, useVideoConfig } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadUi } from "@remotion/google-fonts/PlusJakartaSans";

export const display = loadDisplay("normal", { weights: ["700", "800"], subsets: ["latin"] }).fontFamily;
export const ui = loadUi("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;

/** Warna yang sama dengan styles/tokens.css aplikasi Pundi. */
export const C = {
  brand950: "#112772",
  brand900: "#142B87",
  brand800: "#17368F",
  brand700: "#1D48B5",
  brand600: "#2459DE",
  brand500: "#2860E6",
  brand400: "#5C8FF2",
  brand300: "#8FBCFF",
  brand200: "#CADCFF",
  brand100: "#E7EFFF",
  brand50: "#F3F7FF",
  paper: "#F4F7FC",
  ink: "#101B33",
  inkMuted: "#5B6B8C",
  mint: "#159B78",
  mint10: "#E3F6EF",
  ember: "#E95766",
  ember10: "#FDECEE",
  brass: "#D99418",
  gold: "#F2B544",
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** interpolate dengan clamp di kedua sisi. */
export function tween(frame: number, input: number[], output: number[], easing = easeOut) {
  return interpolate(frame, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

/** Satuan skala: 1 pada sisi terpendek 1080px — tata letak ikut rasio 16:9 maupun 4:5. */
export function useLayout() {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return { width, height, u, portrait: height > width };
}

export function rupiah(value: number) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}
