# Plan — Wallet System Upgrade: Custom Types, Laporan, Visual Signature & Responsive (Pundi)

> Status: Draft plan v2 · Ditujukan untuk dieksekusi oleh AI coding agent.
> Prinsip kerja: **JANGAN buat file dokumentasi baru.** Semua perubahan wajib ditulis sebagai update ke file existing (`PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `PLAN.md`) di folder `files/`. Tandai setiap penambahan dengan heading `## Update — Wallet System Upgrade (Agustus 2026)` di bagian bawah masing-masing file.

## 0. Prinsip Keputusan
Setiap sub-fitur harus lolos satu pertanyaan: **apakah ini benar-benar mengubah cara user melihat/mengelola uangnya sehari-hari, atau cuma tambahan kosmetik?** Yang kosmetik masuk v2 backlog di `PLAN.md`, bukan dikerjakan sekarang. Tabel prioritas di tiap section pakai tag yang sama seperti `PRD.md`: **[MVP]** dan **[v2]**.

---

## 1. Fitur: Custom Wallet Type di Halaman Pengaturan

**Masalah saat ini:** Jenis akun di Epic A masih enum tetap (Bank, E-wallet, Tunai, Kartu Kredit, Investasi). User tidak bisa membedakan "BCA Tabungan" vs "Bank Global (USD)" sebagai *tipe*, hanya sebagai nama.

| Item | Prioritas | Detail |
|---|---|---|
| Collection `accountTypes` | MVP | `userId`, `name`, `icon` (Lucide, reuse pola `CategoryIcon.tsx`), `colorTag`, `isDefault` |
| Migrasi `accounts.type` → `accounts.typeId` | MVP | Seed 5 tipe default per user saat signup, mapping enum lama otomatis |
| Section "Kelola Jenis Dompet" di Pengaturan | MVP | CRUD tipe: nama, icon dari set existing, warna dari token `tokens.css` (bukan color picker bebas) |
| Validasi hapus tipe | MVP | Tipe yang masih dipakai ≥1 akun tidak bisa dihapus, hanya bisa diedit |
| Dropdown tipe di form tambah akun | MVP | Pull dari `accountTypes` user, bukan enum hardcoded |

---

## 2. Fitur: Laporan & Insight per Dompet

| Fitur | Prioritas | Deskripsi |
|---|---|---|
| Halaman Detail per Dompet (`/aset/[accountId]`) | MVP | Versi mini dari Arus Kas: trend saldo, breakdown kategori, mutasi ter-filter — khusus 1 akun |
| Distribusi Saldo (widget Dashboard) | MVP | "Di mana uang saya sekarang" — lihat § 3.1 untuk desainnya |
| Transfer Antar Akun sebagai jalur terpisah | MVP | Transfer sudah ada sebagai tipe transaksi, tapi harus dipisah dari income/expense asli di laporan per akun agar cash flow tidak double-count |
| Insight otomatis per akun | MVP | Perluasan `InsightFeed.tsx`, mis. "Saldo BCA turun 40% bulan ini, lebih cepat dari biasanya" |
| Multi-currency untuk Bank Global (USD) | MVP — prasyarat | Field `currency` + `exchangeRate` (manual input) per akun. Total & net worth dikonversi ke IDR untuk agregat, tapi kartu akun itu sendiri tampil pakai mata uang asli (`$1,250.00`) |
| Alert saldo rendah per akun | v2 | Beda dari alert budget yang sudah ada; butuh infra notifikasi tambahan |

---

## 3. Visual Signature — Desain & Grafik yang Lebih Eksklusif

Prinsip: sesuai risiko yang sudah dicatat di `PRD.md` ("chart data-viz terlihat generik/template dashboard SaaS"), semua chart baru **wajib** pakai signature "Modern Ledger" (ledger baseline, tabular numerals, palet `pine`/`ember`/`brass` yang dibatasi) — bukan default styling dari Recharts.

### 3.1 Wallet Distribution Ring
Donut chart di Dashboard menunjukkan proporsi saldo per dompet. Beda dari donut "Kategori Pengeluaran" yang sudah ada: segmen dompet terbesar otomatis di-highlight pakai aksen `brass` (sesuai aturan "brass maksimal 1–2 elemen per layar"), segmen lain pakai gradasi `pine`. Pemisah antar segmen pakai garis tipis `rule` (bukan drop-shadow), konsisten dengan filosofi garis-sebagai-baris-pembukuan.

### 3.2 Money Flow Ribbon
Diagram alur uang bergaya Sankey sederhana: **Sumber Pemasukan → Dompet → Kategori Pengeluaran**. Ini elemen visual paling pembeda dari dashboard finance generik — render sebagai pita/ribbon dengan warna semantik (`pine` = arus masuk, `ember` = arus keluar), label nominal pakai `IBM Plex Mono` tabular di setiap simpul. Ditempatkan di halaman Arus Kas sebagai visual sekunder di bawah chart tren yang sudah ada, bukan pengganti.

### 3.3 Wallet Card — Color Stripe + Sparkline
Kartu tiap dompet (di halaman Aset & widget Dashboard) diberi strip warna tipis di kiri kartu sesuai `colorTag` tipe akun (mirip garis pada kartu bank fisik), plus mini-sparkline 30 hari terakhir yang berdiri di atas ledger baseline yang sama seperti chart utama — bukan sparkline generik tanpa baseline.

### 3.4 Aturan Non-Generik
Semua chart baru harus lewat review terhadap `DESIGN.md` § Signature Visual sebelum dianggap selesai — cek: tabular numerals dipakai, baseline eksplisit ada, warna aksen tidak dipakai dekoratif bebas.

---

## 4. Responsive Design Pass

Scope: komponen baru dari § 1–3, plus 1–2 celah yang sudah teridentifikasi.

- Section "Kelola Jenis Dompet": form tambah/edit tipe pakai pola bottom sheet mobile yang sama seperti `QuickAddTransaction.tsx`.
- Icon & color picker: grid scroll horizontal / wrap rapi, tanpa overflow di 375px.
- Money Flow Ribbon: di mobile (<768px) turun jadi versi stacked bar sederhana (Sankey terlalu padat untuk layar sempit) — tetap pakai palet & baseline yang sama.
- Wallet Distribution Ring & Wallet Card: grid 1 kolom penuh di mobile, 2 kolom di tablet, sesuai breakpoint yang sudah didefinisikan (≥1280px / 768–1279px / <768px).
- Dropdown tipe akun: tetap scrollable/searchable kalau daftar tipe user sudah panjang (>8 tipe).

---

## 5. Instruksi Eksplisit untuk Agent

1. Update `files/PRD.md` — Epic A: tambah "Kelola jenis dompet custom". Epic D: tambah "Halaman detail per dompet", "Distribusi Saldo", "Money Flow Ribbon".
2. Update `files/ARCHITECTURE.md` — schema `accountTypes`, perubahan `accounts.type` → `accounts.typeId`, field `currency` + `exchangeRate`, catatan migrasi data seed.
3. Update `files/DESIGN.md` — dokumentasikan 3 pola visual baru (§3.1–3.3) sebagai bagian resmi signature "Modern Ledger", plus behavior responsive tiap komponen baru.
4. Update `files/PLAN.md` — urutan fase: (a) migrasi data model & currency → (b) UI Pengaturan (custom types) → (c) halaman detail per dompet + Distribusi Saldo → (d) Money Flow Ribbon → (e) responsive pass menyeluruh.
5. **Tidak membuat file dokumentasi baru** — semua ditulis sebagai penambahan ke 4 file yang sudah ada.
