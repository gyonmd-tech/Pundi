import { Img, staticFile, useCurrentFrame } from "remotion";
import { K, sans, serif, tween, useLayout } from "./theme";

/** Teks kata demi kata naik dari bawah. */
export const Words: React.FC<{
  text: string;
  delay?: number;
  size: number;
  color?: string;
  font?: "serif" | "sans";
  weight?: number;
  highlight?: string[];
  highlightColor?: string;
  align?: "left" | "center";
  stagger?: number;
}> = ({ text, delay = 0, size, color = K.ink, font = "serif", weight = 700, highlight = [], highlightColor = K.cobalt, align = "left", stagger = 4 }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  return (
    <div
      style={{
        fontFamily: font === "serif" ? serif : sans,
        fontWeight: weight,
        fontSize: size * u,
        lineHeight: 1.02,
        letterSpacing: font === "serif" ? "-0.03em" : "-0.025em",
        color,
        textAlign: align,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: "0.25em",
      }}
    >
      {text.split(" ").map((word, index) => {
        const start = delay + index * stagger;
        return (
          <span key={`${word}-${index}`} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em" }}>
            <span
              style={{
                display: "inline-block",
                translate: `0 ${tween(frame, [start, start + 16], [110, 0])}%`,
                color: highlight.includes(word) ? highlightColor : color,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Label kecil berhuruf kapital, mis. "01 · SIKLUS GAJIAN". */
export const Eyebrow: React.FC<{ text: string; delay?: number; color?: string; dot?: string }> = ({ text, delay = 0, color = K.muted, dot = K.cobalt }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14 * u,
        opacity: tween(frame, [delay, delay + 12], [0, 1]),
        translate: `${tween(frame, [delay, delay + 14], [-20, 0])}px 0`,
        fontFamily: sans,
        fontWeight: 800,
        fontSize: 24 * u,
        letterSpacing: "0.2em",
        color,
      }}
    >
      <span style={{ width: 14 * u, height: 14 * u, borderRadius: "50%", background: dot }} />
      {text}
    </div>
  );
};

/** Bingkai ponsel dengan screenshot asli. */
export const Phone: React.FC<{ src: string; width: number; style?: React.CSSProperties }> = ({ src, width, style }) => (
  <div style={{ width, padding: width * 0.04, borderRadius: width * 0.16, background: K.ink, boxShadow: `0 ${width * 0.15}px ${width * 0.3}px rgba(14,26,92,0.35)`, ...style }}>
    <Img src={staticFile(src)} style={{ display: "block", width: "100%", borderRadius: width * 0.125 }} />
  </div>
);

/** Bingkai laptop sederhana dengan screenshot asli. */
export const Laptop: React.FC<{ src: string; width: number; style?: React.CSSProperties }> = ({ src, width, style }) => (
  <div style={{ width, padding: `${width * 0.02}px ${width * 0.02}px ${width * 0.045}px`, borderRadius: width * 0.035, background: K.ink, boxShadow: `0 ${width * 0.07}px ${width * 0.14}px rgba(14,26,92,0.35)`, ...style }}>
    <Img src={staticFile(src)} style={{ display: "block", width: "100%", borderRadius: width * 0.02 }} />
  </div>
);

/** Kartu putih standar. */
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { u } = useLayout();
  return (
    <div style={{ background: K.white, border: `${2 * u}px solid ${K.rule}`, borderRadius: 36 * u, padding: 40 * u, boxShadow: `0 ${24 * u}px ${60 * u}px rgba(14,26,92,0.10)`, ...style }}>
      {children}
    </div>
  );
};

/** Ikon garis sederhana (gaya Lucide). */
export const Icon: React.FC<{ path: string; size: number; color?: string; stroke?: number }> = ({ path, size, color = "currentColor", stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {path.split("|").map((d) => <path key={d} d={d} />)}
  </svg>
);

export const ICONS = {
  utensils: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2|M7 2v20|M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z|M3 6h18|M16 10a4 4 0 0 1-8 0",
  swap: "m16 3 4 4-4 4|M20 7H4|m8 21-4-4 4-4|M4 17h16",
  alert: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3|M12 9v4|M12 17h.01",
  check: "M20 6 9 17l-5-5",
  arrow: "M5 12h14|m13 6 6 6-6 6",
  calendar: "M8 2v4|M16 2v4|M3 10h18|M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
};

/** Logo Pundi (svg asli). */
export const Logo: React.FC<{ height: number; white?: boolean; style?: React.CSSProperties }> = ({ height, white, style }) => (
  <Img src={staticFile(white ? "pundi-logo-white.svg" : "jujur/pundi-logo.svg")} style={{ height, width: "auto", display: "block", ...style }} />
);

/** Tata letak adegan: 16:9 teks kiri & visual kanan; 9:16 teks atas & visual bawah. */
export const Split: React.FC<{ text: React.ReactNode; visual: React.ReactNode; background?: string; portraitScale?: number }> = ({ text, visual, background = K.paper, portraitScale = 1.18 }) => {
  const { u, portrait } = useLayout();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background,
        display: "flex",
        flexDirection: portrait ? "column" : "row",
        alignItems: portrait ? "stretch" : "center",
        gap: (portrait ? 70 : 80) * u,
        padding: portrait ? `${170 * u}px ${90 * u}px ${150 * u}px` : `${110 * u}px ${130 * u}px`,
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: portrait ? "0 0 auto" : "0 0 44%", display: "flex", flexDirection: "column", gap: 30 * u }}>{text}</div>
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", scale: String(portrait ? portraitScale : 1) }}>{visual}</div>
    </div>
  );
};

/** Teks pendukung yang memudar masuk. */
export const Body: React.FC<{ children: React.ReactNode; delay?: number; color?: string; size?: number }> = ({ children, delay = 0, color = K.muted, size = 38 }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  return (
    <p style={{ margin: 0, fontFamily: sans, fontWeight: 500, fontSize: size * u, lineHeight: 1.35, color, opacity: tween(frame, [delay, delay + 14], [0, 1]), translate: `0 ${tween(frame, [delay, delay + 16], [24, 0])}px` }}>
      {children}
    </p>
  );
};
