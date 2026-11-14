import { useCurrentFrame } from "remotion";
import { K, easeInOut, rupiah, sans, tween, useLayout } from "../theme";
import { Eyebrow, ICONS, Icon, Split, Words, Body } from "../parts";

export const TRANSFER_FRAMES = 180;

const AMOUNT = 310_000;

/** 03 · Pindahkan jatah: ketuk "Tutup dari Makan & Minum", jatah berpindah, Belanja jadi aman. */
export const Transfer: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const move = tween(frame, [54, 96], [0, 1], easeInOut);
  const done = frame >= 98;
  const press = frame >= 40 && frame < 47 ? 0.94 : 1;
  const tap = tween(frame, [36, 56], [0, 1]);
  const bannerOut = tween(frame, [104, 120], [0, 1]);
  const toastIn = tween(frame, [116, 132], [0, 1]);
  const moved = Math.round((AMOUNT * move) / 5_000) * 5_000;
  const makanLeft = 1_652_500 - moved;
  const belanjaLimit = 1_200_000 + moved;
  const belanjaPct = Math.min(100, (1_200_000 / belanjaLimit) * 100);
  const W = 760 * u;
  const cardW = 368 * u;

  const budgetCard = (title: string, icon: string, tile: string, line1: string, line2: string, badge: { text: string; bg: string }, bar: React.ReactNode) => (
    <div style={{ width: cardW, boxSizing: "border-box", padding: 28 * u, borderRadius: 30 * u, background: K.white, border: `${2 * u}px solid ${K.rule}`, boxShadow: `0 ${20 * u}px ${50 * u}px rgba(14,26,92,0.10)`, fontFamily: sans }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ width: 64 * u, height: 64 * u, borderRadius: 18 * u, background: tile, color: K.white, display: "grid", placeItems: "center" }}><Icon path={icon} size={34 * u} /></span>
        <span style={{ padding: `${8 * u}px ${14 * u}px`, borderRadius: 12 * u, background: badge.bg, color: K.white, fontWeight: 800, fontSize: 22 * u }}>{badge.text}</span>
      </div>
      <div style={{ marginTop: 18 * u, fontSize: 32 * u, fontWeight: 800, color: K.ink }}>{title}</div>
      <div style={{ marginTop: 8 * u, fontSize: 32 * u, fontWeight: 800, color: K.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{line1}</div>
      <div style={{ fontSize: 24 * u, fontWeight: 600, color: K.muted, fontVariantNumeric: "tabular-nums" }}>{line2}</div>
      <div style={{ marginTop: 16 * u, height: 16 * u, borderRadius: 8 * u, background: "#E9ECF3", overflow: "hidden", display: "flex" }}>{bar}</div>
    </div>
  );

  const visual = (
    <div style={{ position: "relative", width: W, opacity: tween(frame, [4, 18], [0, 1]), translate: `0 ${tween(frame, [4, 22], [50, 0])}px` }}>
      {/* Slot banner / toast dengan tinggi tetap supaya kartu tidak meloncat */}
      <div style={{ position: "relative", height: 200 * u }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 30 * u, background: K.emberInk, color: K.white, padding: `${26 * u}px ${30 * u}px`, boxSizing: "border-box", fontFamily: sans, opacity: 1 - bannerOut, scale: String(1 - bannerOut * 0.06) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 * u, fontSize: 34 * u, fontWeight: 800 }}>
            <Icon path={ICONS.alert} size={36 * u} />Belanja lewat {rupiah(AMOUNT)}
          </div>
          <div style={{ position: "relative", marginTop: 20 * u, display: "inline-flex", alignItems: "center", gap: 12 * u, height: 72 * u, padding: `0 ${26 * u}px`, borderRadius: 18 * u, background: K.white, color: K.emberInk, fontWeight: 800, fontSize: 28 * u, scale: String(press) }}>
            <Icon path={ICONS.swap} size={30 * u} />Tutup dari Makan &amp; Minum
            {/* Ketukan jari */}
            <span style={{ position: "absolute", right: 60 * u, top: "50%", width: 90 * u, height: 90 * u, marginTop: -45 * u, borderRadius: "50%", border: `${5 * u}px solid ${K.lime}`, opacity: tap > 0 && tap < 1 ? 1 - tap : 0, scale: String(0.4 + tap) }} />
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 30 * u, background: K.mintInk, color: K.white, display: "flex", alignItems: "center", gap: 20 * u, padding: `0 ${34 * u}px`, fontFamily: sans, opacity: toastIn, translate: `0 ${(1 - toastIn) * 20 * u}px` }}>
          <span style={{ width: 64 * u, height: 64 * u, borderRadius: "50%", background: K.white, color: K.mintInk, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon path={ICONS.check} size={36 * u} stroke={3} /></span>
          <span>
            <span style={{ display: "block", fontSize: 34 * u, fontWeight: 800 }}>Jatah dipindahkan {rupiah(AMOUNT)}</span>
            <span style={{ display: "block", fontSize: 26 * u, fontWeight: 600, opacity: 0.9 }}>Saldo rekening tidak berubah</span>
          </span>
        </div>
      </div>

      <div style={{ position: "relative", marginTop: 26 * u, display: "flex", justifyContent: "space-between" }}>
        {budgetCard("Makan & Minum", ICONS.utensils, K.ember, `Sisa ${rupiah(makanLeft)}`, "siklus ini", { text: "Aman", bg: K.mintInk },
          <div style={{ width: `${(1 - makanLeft / 1_950_000) * 100}%`, background: K.cobalt }} />)}
        {budgetCard("Belanja", ICONS.bag, K.cobalt, rupiah(1_510_000), `dari ${rupiah(belanjaLimit)}`, done ? { text: "Aman", bg: K.mintInk } : { text: "Lewat", bg: K.emberInk },
          <>
            <div style={{ width: `${belanjaPct}%`, background: done ? K.mint : K.ink }} />
            <div style={{ width: `${100 - belanjaPct}%`, background: done ? K.mint : K.ember }} />
          </>)}
        {/* Koin jatah yang berpindah */}
        <div
          style={{
            position: "absolute",
            left: cardW * 0.18 + (W - cardW) * move,
            top: 150 * u - Math.sin(move * Math.PI) * 120 * u,
            padding: `${12 * u}px ${20 * u}px`,
            borderRadius: 999,
            background: K.lime,
            color: K.navy,
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 28 * u,
            boxShadow: `0 ${12 * u}px ${30 * u}px rgba(14,26,92,0.25)`,
            opacity: move > 0 && move < 1 ? 1 : 0,
            scale: String(0.8 + Math.sin(move * Math.PI) * 0.25),
          }}
        >
          +{rupiah(AMOUNT)}
        </div>
      </div>
    </div>
  );

  return (
    <Split
      text={
        <>
          <Eyebrow text="03 · PINDAHKAN JATAH" delay={4} />
          <Words text="Lewat? Tutup dari anggaran lain." size={100} delay={10} highlight={["Tutup"]} />
          <Body delay={40}>Dua ketukan. Batas belanja yang bergeser, bukan uang di rekeningmu.</Body>
        </>
      }
      visual={visual}
    />
  );
};
