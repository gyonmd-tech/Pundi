import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { AppCard, BrandBackground, Eyebrow, Headline } from "../parts";
import { Penjaga } from "../Penjaga";
import { C, rupiah, tween, ui, useLayout } from "../theme";

const BUDGETS = [
  { name: "Makan & Minum", used: 0.58, color: C.brand600 },
  { name: "Transportasi", used: 0.36, color: C.mint },
  { name: "Belanja", used: 0.82, color: C.brass },
];
const LINE = "M0 150 C40 140 70 100 110 110 S170 150 210 116 S280 50 320 70 S380 86 420 40";

/** Dashboard hidup: saldo menghitung, grafik tergambar, anggaran terisi. */
export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const balance = tween(frame, [16, 70], [0, 24849500], Easing.bezier(0.22, 1, 0.36, 1));
  const draw = tween(frame, [24, 84], [0, 1], Easing.bezier(0.65, 0, 0.35, 1));

  return (
    <AbsoluteFill>
      <BrandBackground tone="light" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: (portrait ? 34 : 50) * u, padding: `${(portrait ? 60 : 100) * u}px ${100 * u}px` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * u }}>
          <Eyebrow dark>3 · Tenang</Eyebrow>
          <Headline text="Saldo & anggaran langsung rapi." delay={2} size={portrait ? 84 : 92} color={C.brand950} />
        </div>

        <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", gap: (portrait ? 20 : 28) * u, alignItems: "stretch" }}>
          <div
            style={{
              width: (portrait ? 860 : 560) * u,
              borderRadius: 36 * u,
              padding: 40 * u,
              color: "#fff",
              fontFamily: ui,
              background: `linear-gradient(135deg, ${C.brand700}, ${C.brand500})`,
              boxShadow: `0 ${24 * u}px ${50 * u}px ${C.brand600}55`,
              position: "relative",
              overflow: "hidden",
              opacity: tween(frame, [6, 18], [0, 1]),
              translate: `0 ${tween(frame, [6, 24], [50 * u, 0])}px`,
            }}
          >
            <div style={{ position: "absolute", right: -80 * u, top: -100 * u, width: 300 * u, height: 300 * u, borderRadius: "50%", border: `${40 * u}px solid #FFFFFF14`, rotate: `${frame}deg` }} />
            <div style={{ fontSize: 28 * u, fontWeight: 700, color: C.brand100 }}>Total saldo tersedia</div>
            <div style={{ marginTop: 12 * u, fontFamily: ui, fontSize: 64 * u, fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              {rupiah(balance)}
            </div>
            <svg viewBox="0 0 420 170" width="100%" height={(portrait ? 120 : 180) * u} style={{ marginTop: 20 * u, overflow: "visible" }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity=".35" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${LINE} L420 170 L0 170 Z`} fill="url(#area)" opacity={draw} />
              <path d={LINE} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} vectorEffect="non-scaling-stroke" />
              <circle cx="420" cy="40" r={9 * draw} fill={C.gold} stroke="#fff" strokeWidth="3" />
            </svg>
          </div>

          <AppCard
            style={{
              width: (portrait ? 860 : 560) * u,
              padding: 40 * u,
              opacity: tween(frame, [14, 26], [0, 1]),
              translate: `0 ${tween(frame, [14, 32], [50 * u, 0])}px`,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 34 * u }}>Anggaran Oktober</div>
            <div style={{ marginTop: (portrait ? 22 : 30) * u, display: "flex", flexDirection: "column", gap: (portrait ? 20 : 30) * u }}>
              {BUDGETS.map((budget, index) => {
                const fill = tween(frame, [30 + index * 8, 70 + index * 8], [0, budget.used], Easing.bezier(0.22, 1, 0.36, 1));
                return (
                  <div key={budget.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 * u, fontWeight: 700 }}>
                      <span>{budget.name}</span>
                      <span style={{ color: C.inkMuted, fontVariantNumeric: "tabular-nums" }}>{Math.round(fill * 100)}%</span>
                    </div>
                    <div style={{ marginTop: 12 * u, height: 18 * u, borderRadius: 999, background: C.brand100, overflow: "hidden" }}>
                      <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 999, background: budget.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </AppCard>

          <div
            style={{
              display: "flex",
              flexDirection: portrait ? "row" : "column",
              alignItems: portrait ? "center" : "flex-end",
              justifyContent: "flex-end",
              alignSelf: portrait ? "stretch" : "flex-end",
              gap: 6 * u,
              opacity: tween(frame, [60, 72], [0, 1]),
              scale: tween(frame, [60, 80], [0.6, 1], Easing.bezier(0.34, 1.56, 0.64, 1)),
            }}
          >
            <div
              style={{
                whiteSpace: "nowrap",
                background: C.brand950,
                color: "#fff",
                fontFamily: ui,
                fontWeight: 700,
                fontSize: 26 * u,
                padding: `${14 * u}px ${22 * u}px`,
                borderRadius: portrait ? `${22 * u}px ${22 * u}px ${4 * u}px ${22 * u}px` : `${22 * u}px ${22 * u}px ${4 * u}px ${22 * u}px`,
                boxShadow: `0 ${10 * u}px ${24 * u}px rgba(10,26,85,.25)`,
                opacity: tween(frame, [76, 86], [0, 1]),
              }}
            >
              Anggaran makanmu masih aman.
            </div>
            <Penjaga mood="happy" size={(portrait ? 150 : 200) * u} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
