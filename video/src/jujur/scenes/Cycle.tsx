import { useCurrentFrame } from "remotion";
import { K, easeInOut, sans, tween, useLayout } from "../theme";
import { Body, Card, Eyebrow, ICONS, Icon, Split, Words } from "../parts";

export const CYCLE_FRAMES = 180;

const DAY = 20;
const DAYS = 31;

/** 01 · Siklus gajian: rentang berganti 1–30 Nov → 25 Okt–24 Nov, cincin terisi. */
export const Cycle: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const swap = tween(frame, [58, 76], [0, 1], easeInOut);
  const progress = tween(frame, [40, 110], [0, DAY / DAYS], easeInOut);
  const left = Math.round(DAYS - tween(frame, [40, 110], [0, DAY], easeInOut));
  const size = 420 * u;
  const radius = size / 2 - 26 * u;
  const circumference = 2 * Math.PI * radius;

  const visual = (
    <Card style={{ width: 760 * u, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 * u, opacity: tween(frame, [8, 22], [0, 1]), translate: `0 ${tween(frame, [8, 26], [50, 0])}px` }}>
      <div style={{ position: "relative", height: 76 * u, width: "100%" }}>
        {[
          { label: "Bulanan · 1 Nov – 30 Nov", o: 1 - swap },
          { label: "Siklus gajian · 25 Okt – 24 Nov", o: swap },
        ].map((chip) => (
          <div key={chip.label} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: chip.o, translate: `0 ${(1 - chip.o) * 16 * u}px` }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 14 * u, height: 76 * u, padding: `0 ${28 * u}px`, borderRadius: 20 * u, background: K.navy, color: K.white, fontFamily: sans, fontWeight: 700, fontSize: 30 * u, whiteSpace: "nowrap" }}>
              <Icon path={ICONS.calendar} size={32 * u} />
              {chip.label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={K.cobalt100} strokeWidth={36 * u} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={K.cobalt} strokeWidth={36 * u} strokeLinecap="round" strokeDasharray={`${circumference * progress} ${circumference}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: sans }}>
          <span style={{ fontSize: 140 * u, fontWeight: 800, color: K.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{left}</span>
          <span style={{ fontSize: 34 * u, fontWeight: 600, color: K.muted }}>hari lagi</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * u, padding: `${16 * u}px ${24 * u}px`, borderRadius: 18 * u, background: K.lime, color: K.navy, fontFamily: sans, fontWeight: 800, fontSize: 30 * u, whiteSpace: "nowrap", opacity: tween(frame, [118, 132], [0, 1]), scale: String(tween(frame, [118, 134], [0.9, 1])) }}>
        <Icon path={ICONS.check} size={30 * u} stroke={3} />
        Berikutnya 25 Nov · lanjut otomatis
      </div>
    </Card>
  );

  return (
    <Split
      text={
        <>
          <Eyebrow text="01 · SIKLUS GAJIAN" delay={4} />
          <Words text="Mulai di hari uangmu masuk." size={104} delay={10} highlight={["masuk."]} />
          <Body delay={40}>Anggaran mengikuti tanggal gajian dan lanjut otomatis tiap bulan — tidak hilang lagi di tanggal 1.</Body>
        </>
      }
      visual={visual}
    />
  );
};
