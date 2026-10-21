import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame } from "remotion";
import { BrandBackground, PundiSymbol } from "../parts";
import { C, easeInOut, tween, ui, useLayout } from "../theme";

// Geometri pundi-logo-white.svg (viewBox 145 205 1490 480): simbol menempati x 160–605, y 215–660.
const LOGO_RATIO = 1490 / 480;
const SYMBOL_LEFT = (160 - 145) / 1490;
const SYMBOL_TOP = (215 - 205) / 480;
const SYMBOL_SIZE = 445 / 480;
const WORDMARK_START = 0.31;

/** 0–3 dtk: titik logo jatuh, pundi terbentuk, lalu bergeser menjadi logo lengkap. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const logoH = 150 * u;
  const logoW = logoH * LOGO_RATIO;
  const bigSize = 300 * u;
  const move = tween(frame, [36, 58], [0, 1], easeInOut);

  const size = bigSize + (logoH * SYMBOL_SIZE - bigSize) * move;
  const left = (logoW / 2 - bigSize / 2) + (logoW * SYMBOL_LEFT - (logoW / 2 - bigSize / 2)) * move;
  const top = (logoH / 2 - bigSize / 2) + (logoH * SYMBOL_TOP - (logoH / 2 - bigSize / 2)) * move;

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 70 * u }}>
        <div style={{ position: "relative", width: logoW, height: logoH }}>
          <Img
            src={staticFile("pundi-logo-white.svg")}
            style={{
              position: "absolute",
              inset: 0,
              width: logoW,
              height: logoH,
              clipPath: `inset(0 0 0 ${WORDMARK_START * 100}%)`,
              opacity: tween(frame, [44, 58], [0, 1]),
              translate: `${tween(frame, [44, 64], [60 * u, 0])}px 0`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left,
              top,
              filter: `drop-shadow(0 ${18 * u}px ${30 * u}px rgba(5, 15, 60, .4))`,
            }}
          >
            <PundiSymbol
              size={size}
              light
              bodyScale={tween(frame, [4, 26], [0, 1], Easing.bezier(0.34, 1.56, 0.64, 1))}
              dotY={tween(frame, [10, 34], [-560, 0], Easing.bounce)}
              dotScale={tween(frame, [10, 20], [0.4, 1])}
            />
          </div>
        </div>
        <div
          style={{
            fontFamily: ui,
            fontWeight: 600,
            fontSize: 44 * u,
            color: C.brand100,
            opacity: tween(frame, [56, 70], [0, 1]),
            translate: `0 ${tween(frame, [56, 72], [24 * u, 0])}px`,
          }}
        >
          Keuangan pribadi yang punya <span style={{ color: C.gold, fontWeight: 800 }}>penjaga</span>.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
