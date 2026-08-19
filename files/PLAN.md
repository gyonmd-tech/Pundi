# PLAN.md — Roadmap Implementasi Pundi

> Setiap fase mengacu ke dokumen lain: PRD.md (scope), DESIGN.md (visual), ARCHITECTURE.md (teknis).

## Fase 0 — Setup

- Init project Next.js + TypeScript + Tailwind
- Buat project Appwrite Cloud, install Appwrite CLI, `appwrite init project`
- Setup `styles/tokens.css` dari DESIGN.md § 4.2–4.3 (warna, tipografi, spacing sebagai CSS variables)
- Install & konfigurasi shadcn/ui, override tema default dengan token Pundi
- Setup struktur folder sesuai ARCHITECTURE.md § 2 (termasuk `lib/appwrite/` dan `appwrite.json`)

## Fase 1 — Fondasi Data & Auth

- Definisikan Collections & Attributes penuh di `appwrite.json` (accounts, categories, transactions, budgets, goals, assets, insights) lalu push via Appwrite CLI — lihat ARCHITECTURE.md § 3
- Setup Permissions per Collection/Document di Appwrite (ARCHITECTURE.md § 4)
- Halaman login/signup + tombol "Coba Demo"
- Middleware proteksi route `(app)`

## Fase 2 — Komponen Inti & Design System

- Bangun komponen dasar: `SummaryCard`, `SidebarNav`, `EmptyState`, `QuickAddTransaction`
- Bangun sistem tabular numerals & formatter Rupiah
- Bangun komponen chart dasar + signature "Ledger Baseline" (validasi visual dulu di satu chart sebelum direplikasi ke chart lain)

## Fase 3 — Epic B & C: Transaksi + Anggaran

- CRUD transaksi lengkap + filter/list
- Quick-add transaksi (modal desktop, bottom sheet mobile)
- CRUD anggaran per kategori + `BudgetProgress` dengan status warna

## Fase 4 — Epic D & E: Arus Kas, Laporan, Aset

- `CashFlowChart` (tren 6 bulan) dengan Ledger Baseline
- `CategoryBreakdownChart` (donut)
- Halaman Aset + `NetWorthTrendChart`

## Fase 5 — Epic F & G: Goals & Insight

- CRUD goal + `GoalCard` dengan estimasi tercapai
- Generate insight sederhana berbasis aturan (rule-based, bukan ML) — mis. bandingkan pengeluaran kategori bulan ini vs rata-rata 3 bulan
- Notifikasi budget mendekati/lewat limit

## Fase 6 — Epic H: Dashboard Utama (Assembly)

- Rakit halaman `/dashboard` menggabungkan semua kartu sesuai wireframe DESIGN.md § 3
- Pastikan hierarki visual & prioritas informasi sesuai rencana (tidak ada halaman yang terasa "penuh sesak")

## Fase 7 — Demo Data & Hardening

- Tulis `prisma/seed.ts` dengan data realistis 6–12 bulan
- Setup akun demo read-only/reset berkala
- QA checklist penuh dari AGENTS.md § 5 (responsive, aksesibilitas, empty/error state)

## Fase 8 — Polish & Launch

- Review desain akhir terhadap DESIGN.md (self-critique: apakah masih terasa khas "ledger", atau sudah melenceng jadi dashboard generik?)
- Setup SEO metadata halaman marketing publik
- Deploy ke Vercel
- Tulis case study untuk diupload ke Rumah Design (format: Ringkasan/Masalah/Solusi/Fitur Utama/Pendekatan Teknis/Hasil)

## V2 Backlog (di luar MVP, dicatat untuk referensi masa depan)

- Import CSV mutasi bank
- Transaksi berulang (recurring)
- Lampiran struk/nota per transaksi
- Ekspor laporan PDF/CSV
- Perbandingan MoM/YoY
- Update harga aset otomatis via API pasar
- Alokasi otomatis sisa anggaran ke goal
- Insight berbasis deteksi anomali
- Family sharing / multi-user

---

## Update — Wallet System Upgrade (Agustus 2026)

> Fase-fase berikut adalah lanjutan dari Fase 8 dan harus dikerjakan secara berurutan karena setiap fase bergantung pada output fase sebelumnya. Prasyarat: semua Fase 0–8 sudah selesai dan aplikasi sudah berjalan stabil.

### Fase 9 — Migrasi Data Model & Multi-Currency

Prasyarat untuk semua fitur wallet baru. Tidak ada UI baru di fase ini — murni perubahan schema dan data.

- [ ] Tambah Collection `accountTypes` ke `appwrite.json` + push via Appwrite CLI
- [ ] Modifikasi Collection `accounts`: tambah kolom `typeId` (String), `currency` (String, default `IDR`), `exchangeRate` (Float, default `1.0`)
- [ ] Update `actions/seed.ts`: seed 5 `accountTypes` default saat user baru signup (Bank, E-Wallet, Tunai, Kartu Kredit, Investasi)
- [ ] Buat `scripts/migrate-account-types.ts`: pemetaan enum lama → `typeId` untuk data existing
- [ ] Buat `actions/accountTypes.ts`: CRUD accountTypes + validasi hapus (cek apakah `typeId` masih dipakai ≥1 akun)
- [ ] Update `lib/data/mock.ts`: ganti field `type` enum dengan `typeId` + tambah `accountTypes` ke data seed demo
- [ ] Update `lib/data/store.tsx`: tambah reducer actions untuk `accountTypes` (CREATE, UPDATE, DELETE)

### Fase 10 — UI Pengaturan: Custom Wallet Types

Fitur CRUD tipe dompet yang visible ke user. Bergantung pada Fase 9.

- [ ] Update halaman `/pengaturan`: tambah section baru "Kelola Jenis Dompet" di bawah section Akun yang sudah ada
- [ ] Komponen `WalletTypeCard.tsx`: menampilkan setiap tipe dengan color stripe kiri + ikon + nama + badge "Default" jika `isDefault: true`
- [ ] Modal tambah/edit tipe dompet:
  - Input nama tipe
  - Icon picker: grid ikon Lucide dari set existing (reuse set `CategoryIcon.tsx`) — mobile: wrap grid 4 kolom
  - Color picker: chip warna dari token `tokens.css` (bukan free color picker) — mobile: wrap 2 baris
  - Tombol simpan/batalkan
- [ ] Mobile responsive: modal → bottom sheet (pola sama seperti `QuickAddTransaction.tsx`)
- [ ] Validasi hapus: tipe yang masih dipakai ≥1 akun tampil error toast, bukan langsung dihapus
- [ ] Update form tambah/edit akun di Pengaturan: dropdown tipe pull dari `accountTypes` user (bukan enum hardcoded)
- [ ] Update form tambah/edit akun: tambah field `currency` dropdown dan `exchangeRate` input (hanya tampil jika currency ≠ IDR)

### Fase 11 — Halaman Detail per Dompet & Widget Distribusi Saldo

Halaman baru dan widget dashboard baru. Bergantung pada Fase 9–10.

- [ ] Buat halaman `app/(app)/aset/[accountId]/page.tsx`:
  - Header: nama akun, tipe (dengan ikon), saldo saat ini, badge currency jika non-IDR
  - Tren saldo 6 bulan (line chart, Ledger Baseline wajib ada)
  - Breakdown kategori pengeluaran dari akun ini (donut chart)
  - Tabel mutasi ter-filter: **exclude transfer sebagai income/expense** — tampilkan transfer sebagai baris terpisah dengan label "Transfer ke/dari [nama akun tujuan]"
  - Layout: 2 kolom desktop, 1 kolom stacked mobile
- [ ] Buat komponen `WalletDistributionRing.tsx` (lihat DESIGN.md § 4.11):
  - Donut chart proporsi saldo per dompet
  - Segmen terbesar di-highlight `brass`, sisanya gradasi `pine`
  - Pemisah antar segmen: `rule` 1px
  - Legend: nama dompet + nominal `IBM Plex Mono` tabular
  - Loading state: skeleton ring, bukan spinner
- [ ] Integrasi `WalletDistributionRing` ke halaman Dashboard (`/dashboard`) sebagai panel baru di bawah SummaryCard row pertama
- [ ] Pastikan agregasi total saldo di `SummaryCard` mengkonversi non-IDR ke IDR menggunakan `exchangeRate`

### Fase 12 — Money Flow Ribbon

Visual baru di halaman Arus Kas. Bergantung pada Fase 9–11.

- [ ] Buat komponen `MoneyFlowRibbon.tsx` — **desktop version** (≥768px):
  - Diagram Sankey 3-node: Sumber Pemasukan → Dompet → Kategori Pengeluaran
  - Ribbon arus masuk: `pine`; arus keluar: `ember`
  - Label nominal `IBM Plex Mono` tabular di setiap node dan pita
  - Ledger Baseline `rule` 1.5px di bawah diagram — wajib ada
  - Hover interaction: highlight ribbon terhubung, redup ribbon tidak terkait
- [ ] Buat komponen `MoneyFlowStackedBar.tsx` — **mobile version** (<768px):
  - Stacked bar chart sederhana sebagai pengganti Sankey di layar sempit
  - Warna dan palet sama (`pine`/`ember`), Ledger Baseline tetap ada
  - Label nominal tetap tampil
- [ ] Integrasi kondisional di halaman `/arus-kas`: render `MoneyFlowRibbon` di ≥768px, `MoneyFlowStackedBar` di <768px — gunakan conditional rendering React, bukan CSS-only hide
- [ ] Tempatkan di bawah `CashFlowChart` yang sudah ada, bukan menggantikan

### Fase 13 — Wallet Card Color Stripe + Sparkline & Responsive Pass Menyeluruh

Pass final untuk memoles visual dan memastikan responsivitas lengkap. Bergantung pada Fase 9–12.

- [ ] Update `WalletTypeCard.tsx` / kartu akun di Pengaturan:
  - Tambah color stripe vertikal 3px di sisi kiri (warna dari `colorTag` tipe akun)
  - Tambah mini sparkline 32px tren saldo 30 hari (lihat DESIGN.md § 4.13)
  - Baseline sparkline: `rule` 1px solid, wajib ada
  - Warna garis sparkline otomatis: `pine` jika tren naik, `ember` jika tren turun
  - Badge currency kecil di samping nominal jika non-IDR
- [ ] Grid Wallet Card: 3 kolom desktop, 2 kolom tablet, 1 kolom mobile
- [ ] Cek full responsive pass untuk semua komponen baru:
  - [ ] Icon picker tidak overflow di 375px
  - [ ] Color picker chips wrap rapi 2 baris di mobile
  - [ ] Dropdown tipe akun: scrollable bottom sheet jika daftar >8 item
  - [ ] Wallet Distribution Ring: donut atas + legend bawah di mobile
  - [ ] Halaman `/aset/[accountId]`: 1 kolom stacked di mobile
- [ ] Review akhir terhadap DESIGN.md § 4.6: semua komponen baru pakai tabular numerals, Ledger Baseline ada, warna aksen tidak dekoratif bebas
- [ ] Update `InsightFeed.tsx`: tambah tipe insight baru `account_trend` untuk insight per akun (mis. "Saldo BCA turun 40% bulan ini")
