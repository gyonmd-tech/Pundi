import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AppCard, BrandBackground, Eyebrow, Headline } from "../parts";
import { Penjaga } from "../Penjaga";
import { C, tween, ui, useLayout } from "../theme";

export const STORY_TEXT = "Hari ini sarapan bubur 15rb, makan siang soto 25rb, terus isi bensin 30rb pakai cash.";
const TYPE_START = 22;
const CHARS_PER_FRAME = 1.25;
const TYPE_END = TYPE_START + Math.ceil(STORY_TEXT.length / CHARS_PER_FRAME);

const TOOLS = ["Membaca rekening & kategori", "Menyusun draft"];

/** Pengguna bercerita di chat; Penjaga berpikir lalu memanggil tool MCP Pundi. */
export const Story: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const typed = STORY_TEXT.slice(0, Math.max(0, Math.floor((frame - TYPE_START) * CHARS_PER_FRAME)));
  const caret = frame < TYPE_END && Math.floor(frame / 8) % 2 === 0;
  const thinking = frame > TYPE_END + 6;
  const toolIndex = frame > TYPE_END + 40 ? 1 : 0;

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 56 * u,
          padding: `${100 * u}px ${100 * u}px`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * u }}>
          <Eyebrow>1 · Ceritakan</Eyebrow>
          <Headline text="Cukup ceritakan harimu." delay={4} size={portrait ? 92 : 96} />
        </div>

        <div style={{ display: "flex", flexDirection: portrait ? "column-reverse" : "row", alignItems: "center", gap: 48 * u }}>
          <div style={{ opacity: tween(frame, [8, 22], [0, 1]), scale: tween(frame, [8, 26], [0.8, 1]) }}>
            <Penjaga mood={thinking ? "thinking" : "idle"} size={(portrait ? 260 : 300) * u} />
          </div>

          <AppCard
            style={{
              width: (portrait ? 860 : 900) * u,
              padding: 40 * u,
              opacity: tween(frame, [12, 26], [0, 1]),
              translate: `0 ${tween(frame, [12, 30], [60 * u, 0])}px`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 * u, fontWeight: 800, fontSize: 30 * u, color: C.brand900 }}>
              <span style={{ width: 16 * u, height: 16 * u, borderRadius: "50%", background: C.mint, boxShadow: `0 0 0 ${6 * u}px ${C.mint10}` }} />
              Penjaga · Hermes Agent
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 * u }}>
              <div
                style={{
                  maxWidth: "88%",
                  minHeight: 64 * u,
                  background: C.brand600,
                  color: "#fff",
                  borderRadius: `${30 * u}px ${30 * u}px ${8 * u}px ${30 * u}px`,
                  padding: `${22 * u}px ${30 * u}px`,
                  fontSize: 38 * u,
                  lineHeight: 1.4,
                  fontWeight: 600,
                  boxShadow: `0 ${12 * u}px ${26 * u}px ${C.brand600}55`,
                }}
              >
                {typed}
                <span style={{ opacity: caret ? 1 : 0 }}>|</span>
              </div>
            </div>
            <div
              style={{
                marginTop: 28 * u,
                display: "flex",
                alignItems: "center",
                gap: 14 * u,
                opacity: tween(frame, [TYPE_END + 6, TYPE_END + 16], [0, 1]),
                translate: `0 ${tween(frame, [TYPE_END + 6, TYPE_END + 18], [16 * u, 0])}px`,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12 * u,
                  background: "#F1EDFF",
                  color: "#5B3FD0",
                  borderRadius: 999,
                  padding: `${12 * u}px ${24 * u}px`,
                  fontSize: 28 * u,
                  fontWeight: 800,
                  fontFamily: ui,
                }}
              >
                <svg viewBox="0 0 24 24" width={28 * u} height={28 * u} style={{ rotate: `${frame * 10}deg` }}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="#5B3FD033" strokeWidth="3" />
                  <path d="M12 3 a9 9 0 0 1 9 9" fill="none" stroke="#5B3FD0" strokeWidth="3" strokeLinecap="round" />
                </svg>
                {TOOLS[toolIndex]}
              </span>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  style={{
                    width: 12 * u,
                    height: 12 * u,
                    borderRadius: "50%",
                    background: C.brand400,
                    translate: `0 ${-8 * u * Math.max(0, Math.sin(((frame - dot * 4) / 30) * Math.PI * 2))}px`,
                  }}
                />
              ))}
            </div>
          </AppCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
