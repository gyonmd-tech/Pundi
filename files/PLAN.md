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
