# ADR-003: Storyboard landing digerakkan progres scroll di rAF

**Status:** Accepted · **Date:** 2026-10-21 · **Feature:** design-revamp (Paket D) · **Author:** 10x-Team

## Context
Pengguna ingin cerita landing berjalan mengikuti scroll dengan animasi mulus, plus video loop sebagai latar hero.

## Decision
Section sticky setinggi ±400vh; hook `useScrollProgress` membaca posisi section di `requestAnimationFrame`, menghaluskan nilai dengan lerp, dan menulis CSS variable `--p` (0–1) serta indeks babak. Animasi panggung hanya `transform`/`opacity`. `prefers-reduced-motion` → babak berganti tanpa animasi. Video hero = MP4 H.264 loop tanpa teks dari Remotion.

## Alternatives Considered
| Alternatif | Pro | Kontra | Kenapa tidak |
|---|---|---|---|
| CSS scroll-driven animations | Native | Belum merata di Safari/WebView | App mobile & iOS |
| GSAP ScrollTrigger / Framer Motion | Kaya fitur | +40–60KB bundle | Bisa dipenuhi ±50 baris |
| Video di-scrub mengikuti scroll | Sinematik | Seek video berat, patah di HP | Performa |

## Consequences
- Positif: mulus, ringan, jalan di semua browser.
- Negatif: logika animasi ditulis manual.
- Risiko: jank di HP murah → batasi elemen beranimasi, `will-change` hanya saat section aktif.
