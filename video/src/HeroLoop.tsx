/**
 * HeroLoop — video latar hero landing (tanpa judul/teks naratif).
 * Durasi 10 dtk dan SEMUA gerakan periodik dengan periode yang membagi
 * habis 10 dtk (10 · 5 · 2,5), sehingga frame terakhir = frame pertama dan
 * video berulang tanpa sentakan (ADR-003).
 *
 * 16:9 → klaster visual di kanan (kiri kosong untuk judul situs).
 * 4:5  → klaster di bagian bawah (judul situs di atas).
 */
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Penjaga } from "./Penjaga";
import { C, rupiah, ui, useLayout } from "./theme";

export const HERO_LOOP_SECONDS = 10;
const TAU = Math.PI * 2;

/** Gelombang 0..1 dengan periode `period` detik dan fase 0..1. */
function wave(t: number, period: number, phase = 0) {
  return 0.5 - 0.5 * Math.cos(TAU * (t / period + phase));
}

const GlassCard: React.FC<{
  x: number; y: number; t: number; phase: number; u: number; tilt: number; children: React.ReactNode;
}> = ({ x, y, t, phase, u, tilt, children }) => {
  const bob = (wave(t, 5, phase) - 0.5) * 22 * u;
  const sway = (wave(t, 10, phase) - 0.5) * 14 * u;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: `${sway}px ${bob}px`,
        rotate: `${tilt + (wave(t, 10, phase + 0.25) - 0.5) * 3}deg`,
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: `0 ${24 * u}px ${60 * u}px rgba(4, 12, 48, .35)`,
        backdropFilter: "blur(14px)",
        borderRadius: 28 * u,
        padding: `${20 * u}px ${24 * u}px`,
        color: "#fff",
        fontFamily: ui,
      }}
    >
      {children}
    </div>
  );
};

const Row: React.FC<{ u: number; color: string; icon: string; label: string; amount: string; amountColor: string }> = ({ u, color, icon, label, amount, amountColor }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 * u }}>
    <div style={{ width: 52 * u, height: 52 * u, borderRadius: 16 * u, background: color, display: "grid", placeItems: "center", fontSize: 26 * u, fontWeight: 800 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 22 * u, fontWeight: 600, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 30 * u, fontWeight: 800, color: amountColor, fontVariantNumeric: "tabular-nums" }}>{amount}</div>
    </div>
  </div>
);

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { u, portrait } = useLayout();
  const t = frame / fps;

  // Pusat klaster visual.
  const cx = portrait ? width / 2 : width * 0.68;
  const cy = portrait ? height * 0.68 : height * 0.52;
  const spread = portrait ? 0.74 : 1;

  const coins = Array.from({ length: 7 }, (_, index) => {
    const lane = (index / 7 - 0.5) * 760 * u * spread;
    // Naik satu "rentang" penuh per 10 dtk → posisi frame 0 = frame terakhir.
    const progress = (t / HERO_LOOP_SECONDS + index / 7) % 1;
    return { x: cx + lane, y: cy + 420 * u - progress * 900 * u, opacity: Math.sin(Math.PI * progress), size: (22 + (index % 3) * 8) * u, spin: progress * 720 };
  });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.brand950} 0%, #13317F 45%, ${C.brand700} 100%)`, overflow: "hidden" }}>
      {/* Cincin & cahaya latar */}
      <div style={{ position: "absolute", left: cx - 520 * u, top: cy - 520 * u, width: 1040 * u, height: 1040 * u, borderRadius: "50%", border: `${70 * u}px solid rgba(255,255,255,0.05)`, rotate: `${(t / HERO_LOOP_SECONDS) * 360}deg` }} />
      <div style={{ position: "absolute", left: cx - 380 * u, top: cy - 380 * u, width: 760 * u, height: 760 * u, borderRadius: "50%", border: `${2 * u}px dashed rgba(143,188,255,0.25)`, rotate: `${-(t / HERO_LOOP_SECONDS) * 360}deg` }} />
      <div style={{ position: "absolute", left: cx - 300 * u + Math.cos(TAU * t / 10) * 140 * u, top: cy - 300 * u + Math.sin(TAU * t / 10) * 90 * u, width: 600 * u, height: 600 * u, borderRadius: "50%", background: "rgba(92,143,242,0.45)", filter: `blur(${120 * u}px)` }} />
      <div style={{ position: "absolute", left: width * 0.05 + Math.sin(TAU * t / 10) * 80 * u, top: height * 0.6, width: 520 * u, height: 520 * u, borderRadius: "50%", background: "rgba(242,181,68,0.16)", filter: `blur(${130 * u}px)` }} />

      {/* Koin naik */}
      {coins.map((coin, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: coin.x,
            top: coin.y,
            width: coin.size,
            height: coin.size,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, #FFE7A8, ${C.gold} 55%, #B87708)`,
            boxShadow: `0 0 ${18 * u}px rgba(242,181,68,0.5)`,
            opacity: coin.opacity * 0.9,
            scale: `${Math.abs(Math.cos((coin.spin * Math.PI) / 180)) * 0.7 + 0.3} 1`,
          }}
        />
      ))}

      {/* Kartu kaca melayang */}
      <GlassCard x={cx - 520 * u * spread} y={cy - 300 * u} t={t} phase={0} u={u} tilt={-4}>
        <Row u={u} color="rgba(233,87,102,0.85)" icon="↗" label="Makan siang" amount={`−${rupiah(25000)}`} amountColor="#FFC2C8" />
      </GlassCard>
      <GlassCard x={cx + 190 * u * spread} y={cy - 360 * u} t={t} phase={0.3} u={u} tilt={5}>
        <Row u={u} color="rgba(21,155,120,0.9)" icon="↙" label="Gaji masuk" amount={`+${rupiah(5500000)}`} amountColor="#A7F3D0" />
      </GlassCard>
      <GlassCard x={cx + 230 * u * spread} y={cy + 120 * u} t={t} phase={0.6} u={u} tilt={-3}>
        <div style={{ fontSize: 22 * u, fontWeight: 600, opacity: 0.75 }}>Total saldo</div>
        <div style={{ fontSize: 40 * u, fontWeight: 800, letterSpacing: "-0.02em" }}>Rp 24,8 jt</div>
        <svg viewBox="0 0 200 60" width={260 * u} height={78 * u} style={{ marginTop: 8 * u, overflow: "visible" }}>
          <path d="M0 50 C30 46 40 30 70 34 S120 48 140 30 S180 10 200 8" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="200" cy="8" r={6 + wave(t, 2.5) * 4} fill={C.gold} stroke="#fff" strokeWidth="2" />
        </svg>
      </GlassCard>
      <GlassCard x={cx - 560 * u * spread} y={cy + 150 * u} t={t} phase={0.8} u={u} tilt={4}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * u }}>
          <div style={{ width: 44 * u, height: 44 * u, borderRadius: "50%", background: C.mint, display: "grid", placeItems: "center", boxShadow: `0 0 0 ${(4 + wave(t, 2.5) * 10) * u}px rgba(21,155,120,${0.35 - wave(t, 2.5) * 0.25})` }}>
            <svg viewBox="0 0 24 24" width={26 * u} height={26 * u}><path d="M5 12.5 L10 17 L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontSize: 26 * u, fontWeight: 800 }}>3 draft tersimpan</div>
        </div>
      </GlassCard>

      {/* Penjaga */}
      <div style={{ position: "absolute", left: cx - 190 * u, top: cy - 230 * u }}>
        <Penjaga mood="idle" size={380 * u} />
      </div>

      {/* Kilau */}
      {[[0.32, 0.18, 0], [0.9, 0.12, 0.33], [0.62, 0.88, 0.66], [0.18, 0.72, 0.5]].map(([fx, fy, phase], index) => {
        const k = wave(t, 2.5, phase);
        return (
          <svg key={index} viewBox="-12 -12 24 24" width={34 * u} height={34 * u} style={{ position: "absolute", left: width * fx, top: height * fy, opacity: k, scale: 0.5 + k * 0.6, rotate: `${k * 45}deg` }}>
            <path d="M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3 Z" fill="#FFE7A8" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};
