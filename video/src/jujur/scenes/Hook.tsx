import { AbsoluteFill, useCurrentFrame } from "remotion";
import { K, easeInOut, rupiah, sans, serif, tween, useLayout } from "../theme";
import { Words } from "../parts";

export const HOOK_FRAMES = 120;

const LOST = [
  { label: "Makan & Minum", value: 1_950_000 },
  { label: "Transportasi", value: 964_000 },
  { label: "Self Reward", value: 300_000 },
];

/** Hook: "Tanggal 1. Anggaranmu hilang lagi?" — halaman kalender robek, anggaran memudar. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const tear = tween(frame, [62, 92], [0, 1], easeInOut);
  const cardW = 380 * u;

  const calendar = (
    <div style={{ position: "relative", width: cardW * 2.05, height: cardW * 1.25 }}>
      {/* Anggaran yang "hilang" di balik kalender */}
      <div style={{ position: "absolute", right: 0, top: cardW * 0.12, display: "flex", flexDirection: "column", gap: 18 * u, width: cardW * 0.98 }}>
        {LOST.map((item, index) => {
          const start = 66 + index * 6;
          const fade = tween(frame, [start, start + 20], [0, 1]);
          return (
            <div
              key={item.label}
              style={{
                padding: `${20 * u}px ${24 * u}px`,
                borderRadius: 22 * u,
                background: K.white,
                border: `${2 * u}px solid ${K.rule}`,
                fontFamily: sans,
                opacity: tween(frame, [10 + index * 5, 22 + index * 5], [0, 1]) * (1 - fade * 0.55),
                filter: `blur(${fade * 3 * u}px) grayscale(${fade})`,
                translate: `${fade * 30 * u}px 0`,
              }}
            >
              <div style={{ fontSize: 26 * u, fontWeight: 600, color: K.muted }}>{item.label}</div>
              <div style={{ position: "relative", display: "inline-block", fontSize: 36 * u, fontWeight: 800, color: K.ink }}>
                {rupiah(item.value)}
                <span style={{ position: "absolute", left: 0, top: "52%", height: 4 * u, width: `${fade * 100}%`, background: K.ember }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Kalender */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: cardW,
          height: cardW * 1.1,
          borderRadius: 34 * u,
          background: K.white,
          boxShadow: `0 ${30 * u}px ${70 * u}px rgba(14,26,92,0.18)`,
          overflow: "hidden",
          transformOrigin: "top left",
          scale: String(tween(frame, [0, 16], [0.85, 1])),
          opacity: tween(frame, [0, 10], [0, 1]) * (1 - tween(frame, [80, 96], [0, 1])),
          rotate: `${tear * -24}deg`,
          translate: `${tear * -40 * u}px ${tear * 220 * u}px`,
        }}
      >
        <div style={{ height: cardW * 0.26, background: K.ember, color: K.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontWeight: 800, fontSize: 36 * u, letterSpacing: "0.18em" }}>DESEMBER</div>
        <div style={{ height: cardW * 0.84, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontWeight: 700, fontSize: 300 * u, color: K.ink, lineHeight: 1 }}>1</div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: K.paper, display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", justifyContent: "center", gap: (portrait ? 110 : 140) * u, padding: portrait ? `${160 * u}px ${90 * u}px` : `0 ${130 * u}px` }}>
      <div style={{ flex: portrait ? "0 0 auto" : "0 0 46%", display: "flex", flexDirection: "column", gap: 26 * u }}>
        <Words text="Tanggal 1." size={portrait ? 170 : 150} delay={6} />
        <Words text="Anggaranmu hilang lagi?" font="sans" weight={800} size={portrait ? 84 : 76} delay={26} highlight={["hilang"]} highlightColor={K.ember} />
      </div>
      <div style={{ scale: String(portrait ? 1.15 : 1) }}>{calendar}</div>
    </AbsoluteFill>
  );
};
