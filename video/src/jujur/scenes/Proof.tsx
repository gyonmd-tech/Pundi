import { useCurrentFrame } from "remotion";
import { K, easeOut, sans, tween, useLayout } from "../theme";
import { Body, Eyebrow, Laptop, Phone, Split, Words } from "../parts";

export const PROOF_FRAMES = 180;

const STATS = [
  { value: 84, suffix: "", label: "unit test" },
  { value: 17, suffix: "", label: "skenario e2e" },
  { value: 600, suffix: " KB", prefix: "≤ ", label: "JS per halaman" },
];

/** Bukti: screenshot asli di laptop + dua ponsel, angka pengujian berhitung. */
export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const float = Math.sin(frame / 22) * 8 * u;
  const stage = portrait ? 900 * u : 980 * u;

  const visual = (
    <div style={{ position: "relative", width: stage, height: stage * 0.86 }}>
      <div style={{ position: "absolute", right: -stage * 0.08, top: -stage * 0.02, width: stage * 0.86, height: stage * 0.86, borderRadius: "50%", background: K.cobalt, scale: String(tween(frame, [0, 26], [0.6, 1])) }} />
      <div style={{ position: "absolute", left: stage * 0.86, top: stage * 0.02, width: stage * 0.11, height: stage * 0.11, borderRadius: "50%", background: K.lime, scale: String(tween(frame, [16, 34], [0, 1])) }} />
      <Laptop
        src="jujur/web-anggaran.png"
        width={stage * 0.78}
        style={{ position: "absolute", right: 0, top: stage * 0.06, rotate: "-3deg", translate: `${tween(frame, [6, 34], [stage * 0.4, 0], easeOut)}px ${float}px`, opacity: tween(frame, [6, 20], [0, 1]) }}
      />
      <Phone
        src="jujur/phone-detail.png"
        width={stage * 0.25}
        style={{ position: "absolute", right: stage * 0.02, top: stage * 0.36, rotate: "7deg", translate: `0 ${tween(frame, [22, 52], [stage * 0.5, 0], easeOut) - float}px` }}
      />
      <Phone
        src="jujur/phone-anggaran.png"
        width={stage * 0.31}
        style={{ position: "absolute", left: 0, top: stage * 0.24, rotate: "-5deg", translate: `0 ${tween(frame, [14, 44], [stage * 0.6, 0], easeOut) + float}px` }}
      />
    </div>
  );

  return (
    <Split
      text={
        <>
          <Eyebrow text="DIBUAT DENGAN SERIUS" delay={4} />
          <Words text="Dirancang dari keluhan nyata, diuji sebelum rilis." size={88} delay={10} highlight={["nyata,"]} />
          <Body delay={36}>Tampilan asli aplikasi Pundi — di ponsel dan web.</Body>
          <div style={{ display: "flex", gap: 22 * u, marginTop: 10 * u }}>
            {STATS.map((stat, index) => {
              const start = 56 + index * 10;
              const count = Math.round(tween(frame, [start, start + 34], [0, stat.value]));
              return (
                <div key={stat.label} style={{ flex: 1, padding: `${22 * u}px ${24 * u}px`, borderRadius: 24 * u, background: K.navy, color: K.white, fontFamily: sans, opacity: tween(frame, [start, start + 12], [0, 1]), translate: `0 ${tween(frame, [start, start + 16], [30, 0])}px` }}>
                  <div style={{ fontSize: 54 * u, fontWeight: 800, color: K.lime, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{stat.prefix ?? ""}{count}{stat.suffix}</div>
                  <div style={{ marginTop: 4 * u, fontSize: 24 * u, fontWeight: 600, opacity: 0.9 }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </>
      }
      visual={visual}
      portraitScale={1}
    />
  );
};
