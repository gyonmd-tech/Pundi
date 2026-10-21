"use client";

/**
 * components/penjaga/PenjagaCharacter.tsx
 * Maskot "Penjaga" — wujud visual Hermes Agent di Pundi. Gaya chibi 2D
 * vektor ala karakter game mobile: tubuh berbentuk pundi (kantong uang),
 * helm penjaga, perisai koin, dan orb biru yang melayang — orb ini sama
 * dengan titik pada logo Pundi.
 *
 * Seluruh animasi berbasis CSS (transform/opacity saja → murah di HP) dan
 * dimatikan otomatis untuk prefers-reduced-motion.
 */
import { useId } from "react";
import { cn } from "@/lib/utils/cn";
import type { PenjagaMood } from "@/lib/penjaga/types";
import styles from "./PenjagaCharacter.module.css";

interface PenjagaCharacterProps {
  mood?: PenjagaMood;
  /** Lebar dalam px; tinggi mengikuti rasio 200:220. */
  size?: number;
  className?: string;
  /** Tampilkan bayangan di bawah kaki. */
  grounded?: boolean;
  title?: string;
  /** false = pose diam (untuk avatar kecil yang muncul berulang di daftar). */
  animated?: boolean;
}

export function PenjagaCharacter({ mood = "idle", size = 160, className, grounded = true, title = "Penjaga Pundi", animated = true }: PenjagaCharacterProps) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `pj-${uid}-${name}`;
  const eyesClosed = mood === "sleeping";
  const happy = mood === "happy";
  const alert = mood === "alert";

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      role="img"
      aria-label={title}
      className={cn(styles.root, styles[mood], !animated && styles.still, className)}
    >
      <defs>
        <linearGradient id={id("body")} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2459DE" />
          <stop offset=".55" stopColor="#1D48B5" />
          <stop offset="1" stopColor="#172D7B" />
        </linearGradient>
        <linearGradient id={id("helm")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5C8FF2" />
          <stop offset=".5" stopColor="#2860E6" />
          <stop offset="1" stopColor="#1D48B5" />
        </linearGradient>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD37A" />
          <stop offset="1" stopColor="#D99418" />
        </linearGradient>
        <linearGradient id={id("cape")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B544" />
          <stop offset="1" stopColor="#C77C0E" />
        </linearGradient>
        <radialGradient id={id("orb")} cx=".35" cy=".35" r=".7">
          <stop offset="0" stopColor="#CADCFF" />
          <stop offset=".45" stopColor={alert ? "#FF8A96" : "#5C8FF2"} />
          <stop offset="1" stopColor={alert ? "#E95766" : "#2459DE"} />
        </radialGradient>
        <radialGradient id={id("glow")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={alert ? "#E95766" : "#5C8FF2"} stopOpacity=".55" />
          <stop offset="1" stopColor={alert ? "#E95766" : "#5C8FF2"} stopOpacity="0" />
        </radialGradient>
      </defs>

      {grounded ? <ellipse className={styles.shadow} cx="100" cy="206" rx="44" ry="7" fill="#112772" opacity=".14" /> : null}

      <g className={styles.figure}>
        {/* Orb melayang — titik logo Pundi */}
        <g className={styles.orb}>
          <circle cx="100" cy="17" r="20" fill={`url(#${id("glow")})`} />
          <circle cx="100" cy="17" r="10" fill={`url(#${id("orb")})`} />
          <circle cx="96.5" cy="13.5" r="3" fill="#fff" opacity=".85" />
        </g>

        {/* Jubah */}
        <path className={styles.cape} d="M72 120 C64 148 54 172 50 192 Q100 202 150 192 C146 172 136 148 128 120 Z" fill={`url(#${id("cape")})`} />

        {/* Kaki */}
        <rect x="78" y="176" width="17" height="20" rx="8.5" fill="#142B87" />
        <rect x="105" y="176" width="17" height="20" rx="8.5" fill="#142B87" />

        {/* Tubuh pundi */}
        <path d="M64 142 C60 172 76 194 100 194 C124 194 140 172 136 142 C134 127 122 118 100 118 C78 118 66 127 64 142 Z" fill={`url(#${id("body")})`} />
        <path d="M76 164 Q98 180 124 166 Q104 172 76 164 Z" fill="#fff" opacity=".28" />
        {/* Tali pundi + gesper koin */}
        <path d="M66 136 Q100 150 134 136 L135 145 Q100 160 65 145 Z" fill={`url(#${id("gold")})`} />
        <circle cx="100" cy="151" r="8" fill={`url(#${id("gold")})`} stroke="#B87708" strokeWidth="1.5" />
        <path d="M97.5 147.5 h3.2 a2.4 2.4 0 0 1 0 4.8 h-3.2 v4" fill="none" stroke="#8A5600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Lengan kanan (melambai saat senang/bicara) */}
        <g className={styles.armRight}>
          <ellipse cx="140" cy="146" rx="8" ry="12" fill="#1D48B5" transform="rotate(-18 140 146)" />
          <circle cx="143" cy="156" r="6.5" fill="#FFE3CF" />
        </g>

        {/* Lengan kiri + perisai koin */}
        <g className={styles.shield}>
          <ellipse cx="62" cy="148" rx="8" ry="11" fill="#1D48B5" transform="rotate(14 62 148)" />
          <path d="M36 140 L66 140 L66 158 C66 172 51 180 51 180 C51 180 36 172 36 158 Z" fill="#E7EFFF" stroke="#1D48B5" strokeWidth="3.2" strokeLinejoin="round" />
          <circle cx="51" cy="157" r="8" fill={`url(#${id("gold")})`} stroke="#B87708" strokeWidth="1.4" />
          <path d="M51 152.5 v9 M48.4 154.6 h4.2 a1.9 1.9 0 0 1 0 3.8 h-3.2 a1.9 1.9 0 0 0 0 3.8 h4.4" fill="none" stroke="#8A5600" strokeWidth="1.4" strokeLinecap="round" />
        </g>

        {/* Kepala */}
        <g className={styles.head}>
          <ellipse cx="57" cy="96" rx="9" ry="15" fill="#17368F" />
          <ellipse cx="143" cy="96" rx="9" ry="15" fill="#17368F" />
          <ellipse cx="100" cy="90" rx="38" ry="32" fill="#FFE3CF" />
          {/* Helm */}
          <path d="M54 88 C52 54 74 34 100 34 C126 34 148 54 146 88 C140 74 124 66 100 66 C76 66 60 74 54 88 Z" fill={`url(#${id("helm")})`} />
          <path d="M72 50 C80 42 90 39 98 39" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".45" />
          <rect x="95.5" y="34" width="9" height="32" rx="4.5" fill={`url(#${id("gold")})`} />

          {/* Pipi */}
          <ellipse className={styles.blush} cx="76" cy="104" rx="7" ry="4" fill="#FF8FA0" opacity=".55" />
          <ellipse className={styles.blush} cx="124" cy="104" rx="7" ry="4" fill="#FF8FA0" opacity=".55" />

          {/* Mata */}
          {happy ? (
            <g fill="none" stroke="#142B87" strokeWidth="4" strokeLinecap="round">
              <path d="M79 95 Q86 85 93 95" />
              <path d="M107 95 Q114 85 121 95" />
            </g>
          ) : eyesClosed ? (
            <g fill="none" stroke="#142B87" strokeWidth="3.4" strokeLinecap="round">
              <path d="M79 93 Q86 98 93 93" />
              <path d="M107 93 Q114 98 121 93" />
            </g>
          ) : (
            <g className={styles.eyes}>
              <ellipse cx="86" cy="92" rx={alert ? 7.5 : 6.5} ry={alert ? 9.5 : 8.5} fill="#142B87" />
              <ellipse cx="114" cy="92" rx={alert ? 7.5 : 6.5} ry={alert ? 9.5 : 8.5} fill="#142B87" />
              <g className={styles.pupilShine} fill="#fff">
                <circle cx="88.4" cy="88.6" r={alert ? 2 : 2.6} />
                <circle cx="116.4" cy="88.6" r={alert ? 2 : 2.6} />
                <circle cx="84.2" cy="95.4" r="1.2" opacity=".8" />
                <circle cx="112.2" cy="95.4" r="1.2" opacity=".8" />
              </g>
            </g>
          )}

          {/* Mulut */}
          {happy ? (
            <path d="M92 104 Q100 116 108 104 Z" fill="#9C2A3C" stroke="#142B87" strokeWidth="2" strokeLinejoin="round" />
          ) : mood === "talking" ? (
            <ellipse className={styles.mouthTalk} cx="100" cy="107" rx="4.6" ry="4" fill="#9C2A3C" stroke="#142B87" strokeWidth="1.8" />
          ) : mood === "thinking" ? (
            <path d="M96 107 Q101 104 106 107" fill="none" stroke="#142B87" strokeWidth="2.6" strokeLinecap="round" />
          ) : alert ? (
            <path d="M94 109 Q97 105 100 109 Q103 105 106 109" fill="none" stroke="#142B87" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          ) : eyesClosed ? (
            <ellipse cx="100" cy="106" rx="2.6" ry="2" fill="#142B87" opacity=".7" />
          ) : (
            <path d="M94 104 Q100 110 106 104" fill="none" stroke="#142B87" strokeWidth="2.6" strokeLinecap="round" />
          )}
        </g>
      </g>

      {/* Efek per mood */}
      {mood === "thinking" ? (
        <g className={styles.dots} fill="#2459DE">
          <circle cx="150" cy="54" r="4.5" />
          <circle cx="163" cy="44" r="5.5" />
          <circle cx="178" cy="32" r="6.5" />
        </g>
      ) : null}
      {happy ? (
        <g className={styles.sparkles} fill="#F2B544">
          <path d="M40 60 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" />
          <path d="M160 70 l2.2 6 l6 2.2 l-6 2.2 l-2.2 6 l-2.2 -6 l-6 -2.2 l6 -2.2 z" />
          <path d="M150 28 l1.8 4.8 l4.8 1.8 l-4.8 1.8 l-1.8 4.8 l-1.8 -4.8 l-4.8 -1.8 l4.8 -1.8 z" />
        </g>
      ) : null}
      {alert ? (
        <g>
          <path className={styles.sweat} d="M146 70 C146 70 139 80 139 84 a7 7 0 0 0 14 0 C153 80 146 70 146 70 Z" fill="#8FBCFF" stroke="#2459DE" strokeWidth="1.5" />
          <g className={styles.exclaim}>
            <rect x="160" y="22" width="9" height="24" rx="4.5" fill="#E95766" />
            <circle cx="164.5" cy="54" r="5" fill="#E95766" />
          </g>
        </g>
      ) : null}
      {eyesClosed ? (
        <g className={styles.zzz} fill="#5C8FF2" fontFamily="var(--font-bricolage), system-ui" fontWeight="800">
          <text x="140" y="56" fontSize="16">z</text>
          <text x="152" y="40" fontSize="20">z</text>
          <text x="166" y="22" fontSize="24">Z</text>
        </g>
      ) : null}
    </svg>
  );
}
