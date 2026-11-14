import { AbsoluteFill, useCurrentFrame } from "remotion";
import { K, easeInOut, sans, tween, useLayout } from "../theme";
import { ICONS, Icon, Logo, Words } from "../parts";

export const CTA_FRAMES = 180;

/** Ajakan: pita lime menyapu, "Coba Pundi gratis.", URL, tagline, logo berdenyut sekali. */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, u, portrait } = useLayout();
  const sweep = tween(frame, [0, 22], [-1, 1.2], easeInOut);
  const pulse = 1 + Math.sin(tween(frame, [104, 124], [0, Math.PI])) * 0.06;

  return (
    <AbsoluteFill style={{ background: K.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: 0, width: width * 0.9, height: 46 * u, marginTop: -23 * u, background: K.lime, translate: `${sweep * width}px 0`, rotate: "-8deg" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 * u, padding: `0 ${portrait ? 90 * u : 160 * u}px`, textAlign: "center" }}>
        <div style={{ opacity: tween(frame, [16, 30], [0, 1]), scale: String(pulse) }}>
          <Logo white height={(portrait ? 110 : 96) * u} />
        </div>
        <Words text="Coba Pundi gratis." size={portrait ? 150 : 150} color={K.white} delay={24} highlight={["gratis."]} highlightColor={K.lime} align="center" />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 18 * u,
            height: 100 * u,
            padding: `0 ${16 * u}px 0 ${40 * u}px`,
            borderRadius: 999,
            background: K.lime,
            color: K.navy,
            fontFamily: sans,
            fontWeight: 800,
            fontSize: (portrait ? 40 : 42) * u,
            opacity: tween(frame, [46, 60], [0, 1]),
            scale: String(tween(frame, [46, 64], [0.85, 1])),
          }}
        >
          pundi-theta.vercel.app
          <span style={{ width: 70 * u, height: 70 * u, borderRadius: "50%", background: K.navy, color: K.lime, display: "grid", placeItems: "center" }}><Icon path={ICONS.arrow} size={34 * u} stroke={3} /></span>
        </div>
        <div style={{ display: "flex", gap: 30 * u, fontFamily: sans, fontWeight: 600, fontSize: 36 * u, color: "#C9D1F2", opacity: tween(frame, [66, 80], [0, 1]) }}>
          <span>Ringan</span><span style={{ color: K.lime }}>·</span><span>Jujur</span><span style={{ color: K.lime }}>·</span><span>Tenang</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
