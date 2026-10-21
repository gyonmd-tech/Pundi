import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame } from "remotion";
import { BrandBackground, Headline } from "../parts";
import { Penjaga } from "../Penjaga";
import { C, tween, ui, useLayout } from "../theme";

/** Penutup: pesan utama + logo + ajakan. Berakhir di latar yang sama dengan Intro agar loop mulus. */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 * u, padding: 100 * u }}>
        <div style={{ scale: tween(frame, [0, 20], [0.6, 1], Easing.bezier(0.34, 1.56, 0.64, 1)), opacity: tween(frame, [0, 10], [0, 1]) }}>
          <Penjaga mood="idle" size={230 * u} />
        </div>
        <div>
          <Headline text="Ceritakan harimu." delay={8} size={88} />
          <Headline text="Penjaga yang mencatat." delay={16} size={88} accent="Penjaga" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30 * u,
            marginTop: 10 * u,
            opacity: tween(frame, [30, 44], [0, 1]),
            translate: `0 ${tween(frame, [30, 48], [24 * u, 0])}px`,
          }}
        >
          <Img src={staticFile("pundi-logo-white.svg")} style={{ height: 80 * u }} />
          <span
            style={{
              fontFamily: ui,
              fontWeight: 800,
              fontSize: 28 * u,
              color: C.brand950,
              background: "#fff",
              borderRadius: 999,
              padding: `${16 * u}px ${30 * u}px`,
              boxShadow: `0 ${10 * u}px ${30 * u}px rgba(5,15,60,.35)`,
            }}
          >
            Hermes Agent × Pundi
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
