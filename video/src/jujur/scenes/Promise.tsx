import { AbsoluteFill, useCurrentFrame } from "remotion";
import { K, easeInOut, tween, useLayout } from "../theme";
import { Logo, Words } from "../parts";

export const PROMISE_FRAMES = 150;

/** Janji: lingkaran kobalt menutup layar, lalu "Anggaran yang Jujur, dari Gajian ke Gajian." */
export const PromiseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, u, portrait } = useLayout();
  const diagonal = Math.hypot(width, height);
  const grow = tween(frame, [0, 30], [0, 1], easeInOut);

  return (
    <AbsoluteFill style={{ background: K.paper, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: width / 2 - diagonal / 2,
          top: height / 2 - diagonal / 2,
          width: diagonal,
          height: diagonal,
          borderRadius: "50%",
          background: K.cobalt,
          scale: String(grow),
        }}
      />
      <AbsoluteFill style={{ padding: portrait ? `${200 * u}px ${90 * u}px` : `${140 * u}px ${160 * u}px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 * u }}>
        <div style={{ position: "absolute", left: portrait ? 90 * u : 160 * u, top: portrait ? 120 * u : 90 * u, opacity: tween(frame, [40, 56], [0, 1]) }}>
          <Logo white height={64 * u} />
        </div>
        <Words text="Anggaran yang Jujur," size={portrait ? 150 : 170} color={K.white} delay={26} highlight={["Jujur,"]} highlightColor={K.lime} stagger={5} />
        <Words text="dari Gajian ke Gajian." font="sans" weight={800} size={portrait ? 80 : 84} color={K.white} delay={46} stagger={4} />
        <div style={{ width: tween(frame, [64, 90], [0, 220 * u]), height: 10 * u, borderRadius: 5 * u, background: K.lime }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
