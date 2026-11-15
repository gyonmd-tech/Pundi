import { useCurrentFrame } from "remotion";
import { K, rupiah, sans, tween, useLayout } from "../theme";
import { Body, Card, Eyebrow, ICONS, Icon, Split, Words } from "../parts";

export const HONEST_FRAMES = 210;

const EXPLAIN = "Jatah Rp 35.000 − kelebihan kemarin Rp 12.500 = Rp 22.500.";

/** 02 · Jatah yang jujur: kartu harian terisi sampai lewat, lalu dijelaskan dalam kalimat. */
export const Honest: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const spent = Math.round(tween(frame, [30, 92], [0, 30_000]) / 500) * 500;
  const within = tween(frame, [30, 78], [0, 75]);
  const over = tween(frame, [78, 96], [0, 25]);
  const isOver = frame >= 80;
  const typed = Math.round(tween(frame, [112, 168], [0, EXPLAIN.length], (t) => t));
  const oldStrike = tween(frame, [104, 118], [0, 100]);

  const visual = (
    <div style={{ width: 760 * u, display: "flex", flexDirection: "column", gap: 22 * u }}>
      <div style={{ alignSelf: "flex-start", position: "relative", fontFamily: sans, fontWeight: 600, fontSize: 30 * u, color: K.muted, opacity: tween(frame, [96, 108], [0, 1]) }}>
        Dulu: “dari −Rp 6.701”
        <span style={{ position: "absolute", left: 0, top: "52%", height: 4 * u, width: `${oldStrike}%`, background: K.ember }} />
      </div>
      <Card style={{ border: `${4 * u}px solid ${isOver ? K.ember : K.rule}`, opacity: tween(frame, [8, 22], [0, 1]), translate: `0 ${tween(frame, [8, 26], [50, 0])}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 * u }}>
          <span style={{ width: 88 * u, height: 88 * u, borderRadius: 24 * u, background: K.ember, color: K.white, display: "grid", placeItems: "center" }}><Icon path={ICONS.utensils} size={46 * u} /></span>
          <div style={{ flex: 1, fontFamily: sans }}>
            <div style={{ fontSize: 40 * u, fontWeight: 800, color: K.ink }}>Makan &amp; Minum</div>
            <div style={{ fontSize: 28 * u, fontWeight: 600, color: K.muted }}>Harian · Rp 35.000</div>
          </div>
          <span style={{ padding: `${10 * u}px ${18 * u}px`, borderRadius: 14 * u, background: isOver ? K.emberInk : K.mintInk, color: K.white, fontFamily: sans, fontWeight: 800, fontSize: 26 * u }}>{isOver ? "Lewat" : "Aman"}</span>
        </div>
        <div style={{ marginTop: 34 * u, display: "flex", alignItems: "baseline", gap: 14 * u, fontFamily: sans, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontSize: 72 * u, fontWeight: 800, whiteSpace: "nowrap", color: isOver ? K.emberInk : K.ink }}>{rupiah(spent)}</span>
          <span style={{ fontSize: 32 * u, fontWeight: 700, whiteSpace: "nowrap", color: K.muted }}>/ Rp 22.500 hari ini</span>
        </div>
        <div style={{ marginTop: 22 * u, height: 22 * u, borderRadius: 11 * u, background: "#E9ECF3", overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${within}%`, background: isOver ? K.ink : K.mint }} />
          <div style={{ width: `${over}%`, background: K.ember }} />
        </div>
        <div style={{ marginTop: 26 * u, minHeight: 90 * u, fontFamily: sans, fontSize: 34 * u, lineHeight: 1.35, fontWeight: 600, color: K.ink }}>
          {EXPLAIN.slice(0, typed)}
          <span style={{ opacity: frame > 108 && frame < 180 && Math.floor(frame / 8) % 2 === 0 ? 1 : 0, color: K.cobalt }}>|</span>
        </div>
      </Card>
    </div>
  );

  return (
    <Split
      text={
        <>
          <Eyebrow text="02 · JATAH YANG JUJUR" delay={4} />
          <Words text="Tanpa jatah mundur. Tanpa angka misterius." size={96} delay={10} highlight={["mundur.", "misterius."]} />
          <Body delay={44}>Jatah dihitung sejak anggaran dibuat, dan setiap angka dijelaskan dengan kalimat yang bisa dibaca siapa saja.</Body>
        </>
      }
      visual={visual}
    />
  );
};
