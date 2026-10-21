/**
 * Penjaga — versi frame-driven dari components/penjaga/PenjagaCharacter.tsx
 * (aplikasi memakai CSS animation; Remotion wajib digerakkan useCurrentFrame).
 */
import { useCurrentFrame, useVideoConfig } from "remotion";

export type Mood = "idle" | "thinking" | "talking" | "happy";

const TAU = Math.PI * 2;

export const Penjaga: React.FC<{ mood?: Mood; size?: number; style?: React.CSSProperties }> = ({ mood = "idle", size = 300, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const float = -5 * (0.5 - 0.5 * Math.cos((TAU * t) / 3.2));
  const jump = mood === "happy" ? -18 * Math.abs(Math.sin((Math.PI * t) / 0.9)) : 0;
  const bodyY = mood === "happy" ? jump : float;
  const orbY = -6 * (0.5 - 0.5 * Math.cos((TAU * t) / (mood === "thinking" ? 1.2 : 2.6)));
  const orbScale = 1 + (mood === "thinking" ? 0.15 : 0.06) * (0.5 - 0.5 * Math.cos((TAU * t) / (mood === "thinking" ? 1.2 : 2.6)));
  const capeSkew = -3 * (0.5 - 0.5 * Math.cos((TAU * t) / 3.2));
  const headTilt = mood === "thinking" ? -4 - 2 * Math.sin((TAU * t) / 2.4) : 2.5 * Math.sin((TAU * t) / 6.4);
  const blinkPhase = (t % 4.2) / 4.2;
  const blink = blinkPhase > 0.92 && blinkPhase < 0.97 ? 0.1 : 1;
  const wave = mood === "happy" ? -38 * (0.5 - 0.5 * Math.cos((TAU * t) / 0.45))
    : mood === "talking" ? -30 * (0.5 - 0.5 * Math.cos((TAU * t) / 1.1)) : 0;
  const mouthOpen = 0.4 + 0.7 * Math.abs(Math.sin(TAU * t * 1.8));
  const shadowScale = mood === "happy" ? 1 - Math.abs(jump) / 40 : 1 - Math.abs(float) / 40;
  const happy = mood === "happy";

  return (
    <svg viewBox="0 0 200 220" width={size} height={(size * 220) / 200} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id="pj-body" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#2459DE" /><stop offset=".55" stopColor="#1D48B5" /><stop offset="1" stopColor="#172D7B" /></linearGradient>
        <linearGradient id="pj-helm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5C8FF2" /><stop offset=".5" stopColor="#2860E6" /><stop offset="1" stopColor="#1D48B5" /></linearGradient>
        <linearGradient id="pj-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD37A" /><stop offset="1" stopColor="#D99418" /></linearGradient>
        <linearGradient id="pj-cape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2B544" /><stop offset="1" stopColor="#C77C0E" /></linearGradient>
        <radialGradient id="pj-orb" cx=".35" cy=".35" r=".7"><stop offset="0" stopColor="#CADCFF" /><stop offset=".45" stopColor="#5C8FF2" /><stop offset="1" stopColor="#2459DE" /></radialGradient>
        <radialGradient id="pj-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#8FBCFF" stopOpacity=".7" /><stop offset="1" stopColor="#8FBCFF" stopOpacity="0" /></radialGradient>
      </defs>

      <ellipse cx="100" cy="206" rx={44 * shadowScale} ry="7" fill="#0A1A55" opacity={0.22 * shadowScale} />

      <g transform={`translate(0 ${bodyY})`}>
        <g transform={`translate(100 17) scale(${orbScale}) translate(-100 ${-17 + orbY})`}>
          <circle cx="100" cy="17" r="22" fill="url(#pj-glow)" />
          <circle cx="100" cy="17" r="10" fill="url(#pj-orb)" />
          <circle cx="96.5" cy="13.5" r="3" fill="#fff" opacity=".85" />
        </g>

        <path transform={`translate(100 120) skewX(${capeSkew}) translate(-100 -120)`} d="M72 120 C64 148 54 172 50 192 Q100 202 150 192 C146 172 136 148 128 120 Z" fill="url(#pj-cape)" />
        <rect x="78" y="176" width="17" height="20" rx="8.5" fill="#142B87" />
        <rect x="105" y="176" width="17" height="20" rx="8.5" fill="#142B87" />
        <path d="M64 142 C60 172 76 194 100 194 C124 194 140 172 136 142 C134 127 122 118 100 118 C78 118 66 127 64 142 Z" fill="url(#pj-body)" />
        <path d="M76 164 Q98 180 124 166 Q104 172 76 164 Z" fill="#fff" opacity=".28" />
        <path d="M66 136 Q100 150 134 136 L135 145 Q100 160 65 145 Z" fill="url(#pj-gold)" />
        <circle cx="100" cy="151" r="8" fill="url(#pj-gold)" stroke="#B87708" strokeWidth="1.5" />
        <path d="M97.5 147.5 h3.2 a2.4 2.4 0 0 1 0 4.8 h-3.2 v4" fill="none" stroke="#8A5600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        <g transform={`rotate(${wave} 134 136)`}>
          <ellipse cx="140" cy="146" rx="8" ry="12" fill="#1D48B5" transform="rotate(-18 140 146)" />
          <circle cx="143" cy="156" r="6.5" fill="#FFE3CF" />
        </g>
        <g>
          <ellipse cx="62" cy="148" rx="8" ry="11" fill="#1D48B5" transform="rotate(14 62 148)" />
          <path d="M36 140 L66 140 L66 158 C66 172 51 180 51 180 C51 180 36 172 36 158 Z" fill="#E7EFFF" stroke="#1D48B5" strokeWidth="3.2" strokeLinejoin="round" />
          <circle cx="51" cy="157" r="8" fill="url(#pj-gold)" stroke="#B87708" strokeWidth="1.4" />
          <path d="M51 152.5 v9 M48.4 154.6 h4.2 a1.9 1.9 0 0 1 0 3.8 h-3.2 a1.9 1.9 0 0 0 0 3.8 h4.4" fill="none" stroke="#8A5600" strokeWidth="1.4" strokeLinecap="round" />
        </g>

        <g transform={`rotate(${headTilt} 100 118)`}>
          <ellipse cx="57" cy="96" rx="9" ry="15" fill="#17368F" />
          <ellipse cx="143" cy="96" rx="9" ry="15" fill="#17368F" />
          <ellipse cx="100" cy="90" rx="38" ry="32" fill="#FFE3CF" />
          <path d="M54 88 C52 54 74 34 100 34 C126 34 148 54 146 88 C140 74 124 66 100 66 C76 66 60 74 54 88 Z" fill="url(#pj-helm)" />
          <path d="M72 50 C80 42 90 39 98 39" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".45" />
          <rect x="95.5" y="34" width="9" height="32" rx="4.5" fill="url(#pj-gold)" />
          <ellipse cx="76" cy="104" rx="7" ry="4" fill="#FF8FA0" opacity=".55" />
          <ellipse cx="124" cy="104" rx="7" ry="4" fill="#FF8FA0" opacity=".55" />

          {happy ? (
            <g fill="none" stroke="#142B87" strokeWidth="4" strokeLinecap="round">
              <path d="M79 95 Q86 85 93 95" />
              <path d="M107 95 Q114 85 121 95" />
            </g>
          ) : (
            <g transform={`translate(100 92) scale(1 ${blink}) translate(-100 -92)`}>
              <ellipse cx="86" cy="92" rx="6.5" ry="8.5" fill="#142B87" />
              <ellipse cx="114" cy="92" rx="6.5" ry="8.5" fill="#142B87" />
              <g fill="#fff" transform={mood === "thinking" ? "translate(-1 -2)" : undefined}>
                <circle cx="88.4" cy="88.6" r="2.6" />
                <circle cx="116.4" cy="88.6" r="2.6" />
                <circle cx="84.2" cy="95.4" r="1.2" opacity=".8" />
                <circle cx="112.2" cy="95.4" r="1.2" opacity=".8" />
              </g>
            </g>
          )}

          {happy ? (
            <path d="M92 104 Q100 116 108 104 Z" fill="#9C2A3C" stroke="#142B87" strokeWidth="2" strokeLinejoin="round" />
          ) : mood === "talking" ? (
            <ellipse cx="100" cy="107" rx="4.6" ry={4 * mouthOpen} fill="#9C2A3C" stroke="#142B87" strokeWidth="1.8" />
          ) : mood === "thinking" ? (
            <path d="M96 107 Q101 104 106 107" fill="none" stroke="#142B87" strokeWidth="2.6" strokeLinecap="round" />
          ) : (
            <path d="M94 104 Q100 110 106 104" fill="none" stroke="#142B87" strokeWidth="2.6" strokeLinecap="round" />
          )}
        </g>
      </g>

      {mood === "thinking" ? (
        <g fill="#8FBCFF">
          {[[150, 54, 4.5], [163, 44, 5.5], [178, 32, 6.5]].map(([x, y, r], index) => {
            const phase = ((t - index * 0.2) % 1.4) / 1.4;
            const on = phase < 0.4 ? phase / 0.4 : Math.max(0, 1 - (phase - 0.4) / 0.6);
            return <circle key={index} cx={x} cy={y} r={r * (0.7 + 0.3 * on)} opacity={0.15 + 0.85 * on} />;
          })}
        </g>
      ) : null}

      {happy ? (
        <g fill="#F2B544">
          {[[44, 66, 1], [160, 76, 0.75], [152, 32, 0.6]].map(([x, y, s], index) => {
            const phase = ((t + index * 0.3) % 1.2) / 1.2;
            const k = Math.sin(Math.PI * phase);
            return (
              <path key={index} transform={`translate(${x} ${y}) rotate(${45 * phase}) scale(${s * (0.4 + 0.7 * k)})`} opacity={k} d="M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3 Z" />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};
