import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { AppCard, BrandBackground, Eyebrow, Headline } from "../parts";
import { Penjaga } from "../Penjaga";
import { C, rupiah, tween, ui, useLayout } from "../theme";

const DRAFTS = [
  { note: "Sarapan bubur", category: "Makan & Minum", account: "Dompet Tunai", amount: 15000 },
  { note: "Makan siang soto", category: "Makan & Minum", account: "Dompet Tunai", amount: 25000 },
  { note: "Isi bensin", category: "Transportasi", account: "Dompet Tunai", amount: 30000 },
];
const PRESS = 92;
const SAVED = PRESS + 10;

/** Draft muncul → pengguna menekan Simpan → tersimpan & Penjaga senang. */
export const Drafts: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const total = DRAFTS.reduce((sum, draft) => sum + draft.amount, 0);
  const pressScale = frame >= PRESS && frame < PRESS + 8 ? 0.94 : 1;
  const collapse = tween(frame, [SAVED + 14, SAVED + 30], [0, 1], Easing.bezier(0.5, 0, 0.75, 0));

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 50 * u, padding: 100 * u }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * u }}>
          <Eyebrow>2 · Tinjau</Eyebrow>
          <Headline text="Penjaga menyusun catatannya." delay={2} size={portrait ? 84 : 92} />
        </div>

        <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", alignItems: "center", gap: 50 * u }}>
          <AppCard style={{ width: (portrait ? 860 : 920) * u, padding: 36 * u, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: ui, fontWeight: 800, fontSize: 34 * u }}>
                Menunggu konfirmasi
                <span style={{ marginLeft: 14 * u, background: C.brand600, color: "#fff", borderRadius: 999, padding: `${4 * u}px ${16 * u}px`, fontSize: 24 * u }}>
                  {frame < SAVED + 30 ? DRAFTS.length : 0}
                </span>
              </div>
              <div
                style={{
                  background: frame >= SAVED ? C.mint : C.brand600,
                  color: "#fff",
                  borderRadius: 18 * u,
                  padding: `${14 * u}px ${26 * u}px`,
                  fontWeight: 800,
                  fontSize: 26 * u,
                  scale: pressScale,
                  opacity: tween(frame, [40, 52], [0, 1]),
                  boxShadow: `0 ${10 * u}px ${22 * u}px ${frame >= SAVED ? C.mint : C.brand600}55`,
                }}
              >
                {frame >= SAVED ? "✓ Tersimpan" : "Simpan semua"}
              </div>
            </div>

            <div style={{ marginTop: 26 * u, display: "flex", flexDirection: "column", gap: 16 * u }}>
              {DRAFTS.map((draft, index) => {
                const enter = 14 + index * 9;
                const check = tween(frame, [SAVED + index * 4, SAVED + index * 4 + 10], [0, 1], Easing.bezier(0.34, 1.56, 0.64, 1));
                return (
                  <div
                    key={draft.note}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 22 * u,
                      background: C.paper,
                      border: `${2 * u}px solid ${check > 0.5 ? `${C.mint}55` : "#E3E9F5"}`,
                      borderRadius: 24 * u,
                      padding: `${20 * u}px ${24 * u}px`,
                      opacity: tween(frame, [enter, enter + 10], [0, 1]) * (1 - collapse),
                      translate: `${tween(frame, [enter, enter + 18], [80 * u, 0])}px ${collapse * 30 * u}px`,
                      scale: 1 - collapse * 0.08,
                    }}
                  >
                    <div style={{ position: "relative", width: 68 * u, height: 68 * u, borderRadius: 20 * u, background: C.ember10, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" width={34 * u} height={34 * u} style={{ opacity: 1 - check }}>
                        <path d="M7 17 L17 7 M9 7 h8 v8" fill="none" stroke={C.ember} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, borderRadius: 20 * u, background: C.mint, display: "grid", placeItems: "center", scale: check, opacity: check }}>
                        <svg viewBox="0 0 24 24" width={36 * u} height={36 * u}><path d="M5 12.5 L10 17 L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 32 * u }}>{draft.note}</div>
                      <div style={{ marginTop: 6 * u, fontSize: 24 * u, color: C.inkMuted, fontWeight: 600 }}>
                        {draft.category} · {draft.account}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 34 * u, fontVariantNumeric: "tabular-nums" }}>{rupiah(draft.amount)}</div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 22 * u,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 26 * u,
                fontWeight: 700,
                color: C.inkMuted,
                opacity: tween(frame, [40, 52], [0, 1]) * (1 - collapse),
              }}
            >
              <span>Dampak ke saldo</span>
              <span style={{ color: C.ember, fontWeight: 800 }}>−{rupiah(total)}</span>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14 * u,
                opacity: tween(frame, [SAVED + 26, SAVED + 38], [0, 1]),
                scale: tween(frame, [SAVED + 26, SAVED + 44], [0.85, 1], Easing.bezier(0.34, 1.56, 0.64, 1)),
              }}
            >
              <div style={{ width: 110 * u, height: 110 * u, borderRadius: "50%", background: C.mint, display: "grid", placeItems: "center", boxShadow: `0 0 0 ${18 * u}px ${C.mint10}` }}>
                <svg viewBox="0 0 24 24" width={60 * u} height={60 * u}><path d="M5 12.5 L10 17 L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontFamily: ui, fontWeight: 800, fontSize: 40 * u, marginTop: 14 * u }}>3 transaksi tersimpan</div>
              <div style={{ fontSize: 28 * u, color: C.inkMuted, fontWeight: 600 }}>Saldo Dompet Tunai diperbarui otomatis</div>
            </div>
          </AppCard>

          <div style={{ opacity: tween(frame, [6, 18], [0, 1]) }}>
            <Penjaga mood={frame >= SAVED ? "happy" : "talking"} size={(portrait ? 240 : 320) * u} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
