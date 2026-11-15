# Materi Portofolio Pundi

Semua gambar promosi dan studi kasus UI/UX Pundi. Tampilan aplikasi di dalamnya adalah tangkapan layar asli (akun demo, mode terang), bukan mockup.

| Folder | Isi | Ukuran |
|---|---|---|
| `01-poster-uiux/` | Poster studi kasus pertama ("Anggaran yang Jujur") | 2400×3800 |
| `02-blueprint/` | Blueprint UI web + mobile (Dashboard, Anggaran, Transaksi, Tujuan, Penjaga, Arus Kas, sistem desain) | 4800×13394 + pratinjau 2866×8000 |
| `03-cover-3x4/` | Cover portofolio: versi ponsel dan versi web dengan laptop | 2400×3200 |
| `04-instagram-4x5/` | Carousel 6 slide: `1080/` siap unggah, `hires/` resolusi tinggi | 1080×1350 / 2400×3000 |
| `05-web-16x9/` | Poster bersih tanpa teks: Dashboard (kobalt) dan Anggaran (navy) | 3840×2160 |
| `source/` | HTML sumber, tangkapan layar, dan skrip render untuk membuat ulang | — |

Video Remotion ada di `video/` (render dengan `npx remotion render Gajian`).

## Render ulang

Butuh Playwright + Chromium. Jalankan dari root repo (tempat `node_modules` berada) dengan path absolut:

```bash
node portfolio/source/render-carousel.cjs "$PWD/portfolio/source/carousel.html" /tmp/out 0.9 -1080
node portfolio/source/render-cover.cjs "$PWD/portfolio/source/cover.html" /tmp/out/cover.png 2 1600
node portfolio/source/render-16x9.cjs "$PWD/portfolio/source/wide.html" /tmp/out 2 -4k
node portfolio/source/render-blueprint.cjs "$PWD/portfolio/source/blueprint.html" /tmp/out/blueprint.png 2
node portfolio/source/poster/render-poster.cjs "$PWD/portfolio/source/poster/poster.html" /tmp/out/poster.png
```

Font dimuat dari Google Fonts (Fraunces, Geist, Bricolage Grotesque, Instrument Serif), jadi perlu koneksi internet. Untuk memperbarui tangkapan layar, ganti file di `source/shots/` (web 1440×900 @2x, mobile Pixel 7).
