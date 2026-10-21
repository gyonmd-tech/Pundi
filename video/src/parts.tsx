import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, display, easeOut, tween, ui, useLayout } from "./theme";

/** Latar biru Pundi dengan cincin & orb yang bergerak pelan. */
export const BrandBackground: React.FC<{ tone?: "deep" | "light" }> = ({ tone = "deep" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = frame / 30;
  const light = tone === "light";
  return (
    <AbsoluteFill
      style={{
        background: light
          ? `radial-gradient(circle at 15% 0%, ${C.brand100} 0%, transparent 45%), radial-gradient(circle at 100% 100%, ${C.brand200}66 0%, transparent 50%), ${C.paper}`
          : `radial-gradient(circle at 80% 10%, ${C.brand500} 0%, transparent 45%), linear-gradient(135deg, ${C.brand950} 0%, ${C.brand800} 55%, ${C.brand600} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: height * 0.9,
          height: height * 0.9,
          right: -height * 0.25,
          top: -height * 0.35,
          borderRadius: "50%",
          border: `${height * 0.07}px solid ${light ? `${C.brand600}10` : "#FFFFFF12"}`,
          rotate: `${drift * 6}deg`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: height * 0.55,
          height: height * 0.55,
          left: width * 0.08 + Math.sin(drift * 0.6) * 30,
          bottom: -height * 0.3 + Math.cos(drift * 0.5) * 20,
          borderRadius: "50%",
          background: light ? `${C.brand300}33` : `${C.brand400}33`,
          filter: "blur(60px)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Judul kinetik: kata demi kata naik dari bawah. */
export const Headline: React.FC<{ text: string; delay?: number; size?: number; color?: string; align?: "left" | "center"; accent?: string }> = ({
  text, delay = 0, size = 84, color = "#fff", align = "center", accent,
}) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: display,
        fontWeight: 800,
        fontSize: size * u,
        lineHeight: 1.06,
        letterSpacing: "-0.035em",
        color,
        textAlign: align,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * u * 0.26,
      }}
    >
      {words.map((word, index) => {
        const start = delay + index * 3;
        return (
          <span key={index} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * u * 0.08 }}>
            <span
              style={{
                display: "inline-block",
                color: accent && word.replace(/[.,]/g, "") === accent ? C.gold : undefined,
                translate: `0 ${tween(frame, [start, start + 16], [110, 0], easeOut)}%`,
                opacity: tween(frame, [start, start + 10], [0, 1]),
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

export const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number; dark?: boolean }> = ({ children, delay = 0, dark = false }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  return (
    <div
      style={{
        fontFamily: ui,
        fontWeight: 800,
        fontSize: 26 * u,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: dark ? C.brand600 : C.brand200,
        opacity: tween(frame, [delay, delay + 12], [0, 1]),
        translate: `0 ${tween(frame, [delay, delay + 14], [16 * u, 0])}px`,
      }}
    >
      {children}
    </div>
  );
};

/** Simbol pundi (kantong + titik) dari public/PUNDI-brand-assets/pundi-symbol.svg. */
export const PundiSymbol: React.FC<{ size: number; dotY?: number; dotScale?: number; bodyScale?: number; light?: boolean }> = ({
  size, dotY = 0, dotScale = 1, bodyScale = 1, light = false,
}) => (
  <svg viewBox="160 215 445 445" width={size} height={size} style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="fold-v" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor={light ? "#FFFFFF" : "#2459DE"} />
        <stop offset=".54" stopColor={light ? "#E7EFFF" : "#1D48B5"} />
        <stop offset="1" stopColor={light ? "#CADCFF" : "#172D7B"} />
      </linearGradient>
    </defs>
    <g transform={`translate(382 470) scale(${bodyScale}) translate(-382 -470)`}>
      <path
        fill="url(#fold-v)"
        fillRule="evenodd"
        d="M257.0,310.7 L264.0,310.5 L275.0,312.5 L291.0,317.7 L309.0,326.7 L322.0,334.7 L370.0,368.3 L388.0,377.3 L400.0,380.5 L414.0,380.5 L419.0,379.3 L429.0,374.3 L437.0,366.4 L443.3,356.0 L447.3,345.0 L450.5,327.0 L450.5,315.0 L451.0,313.9 L454.0,313.7 L481.0,324.7 L495.0,331.7 L519.0,345.7 L541.0,361.5 L556.0,375.5 L560.0,380.6 L565.3,389.0 L569.5,402.0 L569.5,407.0 L570.5,410.0 L570.5,433.0 L567.3,454.0 L563.3,469.0 L558.3,483.0 L545.3,511.0 L534.3,530.0 L522.0,548.4 L510.0,564.4 L497.5,579.0 L483.0,593.5 L472.4,602.0 L456.0,612.3 L443.0,618.3 L428.0,623.3 L413.0,626.5 L408.0,626.5 L405.0,627.5 L375.0,627.5 L344.0,622.3 L330.0,618.3 L308.0,610.3 L293.0,603.3 L274.0,592.3 L259.6,582.0 L246.0,570.5 L226.0,548.4 L210.7,525.0 L204.7,512.0 L199.7,498.0 L195.5,480.0 L194.5,467.0 L193.5,464.0 L193.5,446.0 L194.5,443.0 L195.5,427.0 L200.7,399.0 L208.7,370.0 L218.7,343.0 L225.7,329.0 L228.5,325.0 L236.0,317.7 L250.0,311.7 Z M265.0,379.7 L251.0,381.8 L250.1,383.0 L250.5,384.0 L265.5,402.0 L290.0,426.5 L308.6,442.0 L325.0,454.3 L343.0,466.3 L373.0,482.3 L390.0,489.3 L424.0,497.7 L437.0,502.3 L441.0,502.3 L463.0,494.3 L480.0,486.3 L504.0,472.3 L521.4,460.0 L518.0,457.7 L509.0,454.3 L456.0,427.7 L432.0,416.7 L397.0,402.7 L376.0,395.7 L342.0,386.7 L320.0,382.5 L305.0,380.5 L298.0,380.5 L295.0,379.5 Z"
      />
    </g>
    <circle cx="377.5" cy={288.5 + dotY} r={42 * dotScale} fill={light ? "#8FBCFF" : "#2860E6"} />
  </svg>
);

/** Kartu putih bergaya aplikasi Pundi. */
export const AppCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { u } = useLayout();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 34 * u,
        boxShadow: `0 ${20 * u}px ${60 * u}px rgba(10, 26, 85, .28), 0 ${4 * u}px ${10 * u}px rgba(10, 26, 85, .12)`,
        fontFamily: ui,
        color: C.ink,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
