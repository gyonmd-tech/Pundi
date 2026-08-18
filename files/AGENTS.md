# AGENTS.md — Panduan untuk AI Coding Agent (Project Pundi)

Dokumen ini adalah instruksi operasional untuk AI coding agent (dan skill UI/UX yang ditambahkan bersamanya) yang mengerjakan project Pundi. Baca dokumen ini **sebelum** menulis kode apa pun.

## 1. Urutan Baca Dokumen (wajib)

1. `CONTEXT.md` — pahami latar belakang & keputusan yang sudah final
2. `PRD.md` — pahami scope fitur (MVP vs v2), jangan bangun fitur di luar scope tanpa konfirmasi
3. `DESIGN.md` — pahami design system, sitemap, dan content model **sebelum membuat komponen UI apa pun**
4. `ARCHITECTURE.md` — pahami stack, folder structure, dan schema database
5. `PLAN.md` — ikuti urutan fase pengerjaan, jangan lompat fase tanpa alasan jelas

## 2. Aturan Design System (kritis)

- **Jangan pernah** memperkenalkan warna baru di luar token yang ada di `DESIGN.md` § 4.2. Jika butuh warna tambahan (mis. untuk kategori baru), turunkan dari tint token yang sudah ada, jangan menambah hex baru sembarangan.
- **Jangan pernah** mengganti font di luar 3 role yang sudah ditentukan (Display/UI/Data) di § 4.3.
- Semua angka nominal **wajib** memakai font mono dan rata kanan — ini aturan non-negotiable, bukan preferensi.
- Elemen signature "Ledger Baseline" (§ 4.6) wajib diimplementasikan di setiap chart tren (arus kas, net worth) — ini adalah identitas visual utama produk, jangan diganti dengan chart default library tanpa baseline.
- Jika skill UI/UX yang ditambahkan ke project menghasilkan saran desain yang **bertentangan** dengan `DESIGN.md`, ikuti `DESIGN.md`. Tandai konflik tersebut ke pemilik repo, jangan diam-diam memilih salah satu.

## 3. Konvensi Kode

- TypeScript strict mode, tidak ada `any` tanpa justifikasi komentar.
- Komponen React kecil dan reusable, satu tanggung jawab per komponen (ikuti pemisahan di `ARCHITECTURE.md` § 2).
- Semua angka finansial disimpan sebagai Attribute bertipe **Integer** (Rupiah penuh) di Appwrite, jangan pakai tipe **Float** untuk nominal uang — hindari floating point error saat menjumlahkan transaksi. Pengecualian: `units` di collection `assets` boleh Float karena mewakili jumlah lot/unit, bukan nominal Rupiah.
- Format Rupiah & tanggal terpusat di `lib/utils/` — jangan duplikasi logic formatting di banyak tempat.
- Validasi input (Zod) wajib di server action, tidak cukup hanya validasi client-side.

## 4. Data & Privasi

- **Dilarang keras** menggunakan data finansial nyata siapa pun di seed data atau fixture. Semua data demo harus sintetis (nama, nominal, tanggal dibuat/di-generate).
- Seed data (`prisma/seed.ts`) harus realistis: histori transaksi 6–12 bulan, variasi kategori wajar, tren yang masuk akal (bukan angka acak ekstrem) — supaya demo meyakinkan.
- Akun demo publik bersifat read-only atau ter-reset berkala — lihat `ARCHITECTURE.md` § 6.

## 5. QA Checklist Sebelum Menandai Fitur "Selesai"

- [ ] Responsive dari 375px sampai desktop wide, sesuai `DESIGN.md` § 6
- [ ] Semua state komponen ada: default, loading (skeleton sesuai § 4.6), empty, error
- [ ] Kontras warna teks memenuhi AA (§ 4.9)
- [ ] Keyboard navigation & focus state terlihat jelas
- [ ] `prefers-reduced-motion` dihormati untuk semua animasi count-up/progress
- [ ] Tidak ada hardcoded warna/font di luar token DESIGN.md

## 6. Do's & Don'ts

**Do:**
- Rujuk ke DESIGN.md untuk keputusan visual apa pun, sekecil apa pun.
- Tanyakan ke pemilik repo bila PRD ambigu untuk suatu fitur, daripada menebak scope.
- Tulis commit message deskriptif per fitur/epic (mengacu ke Epic A–H di PRD.md).

**Don't:**
- Jangan menambah dependency chart/UI library baru tanpa alasan kuat — Recharts + shadcn/ui sudah cukup untuk seluruh MVP.
- Jangan membangun fitur v2 sebelum semua fitur MVP di fase yang sesuai (lihat PLAN.md) selesai.
- Jangan generate data seed yang terlihat acak/tidak natural (mis. semua transaksi bernilai bulat genap) — ini portfolio demo, harus meyakinkan.
