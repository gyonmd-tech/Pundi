# Pundi — Personal Finance Suite

> Satu dashboard elegan untuk semua arus keuangan, tabungan, anggaran, dan aset portofolio.

![Pundi Preview](https://raw.githubusercontent.com/gyonmd-tech/Pundi/main/pundi/public/preview.png)

## ✨ Fitur Utama
- **Dashboard Finansial**: Ringkasan kekayaan bersih, saldo total, grafik arus kas dengan ledger baseline, dan kategori breakdown.
- **Buku Transaksi**: Multi-filter panel, pencarian mutasi kilat (⌘K), dan fitur **Ekspor CSV**.
- **Perencanaan Anggaran**: Alokasi limit bulanan per kategori dan over-budget alerts.
- **Analisis Arus Kas**: Grafik perbandingan 6 bulan dan savings rate gauge.
- **Portofolio Aset & Investasi**: Tracking Saham, Reksadana, Emas, dan Kripto dengan P&L realtime.
- **Tujuan Finansial (Goals)**: Target tabungan dengan estimasi penyelesaian target.
- **Collapsible Sidebar**: Sidebar buka/tutup dinamis dengan floating tooltips.
- **Backend Appwrite Cloud**: Database terstruktur, Row-Level Security, dan Server Actions.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4, Vanilla CSS tokens (HSL Pine, Brass, Ember, Paper)
- **Database & Auth**: Appwrite Cloud (Singapore Region)
- **Icons & Charts**: Lucide React, Recharts

---

## 🚀 Memulai (Quick Start)

### 1. Masuk ke folder proyek
```bash
cd pundi
```

### 2. Install dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lalu masukkan kredensial Appwrite Anda.

### 4. Setup Database Appwrite Otomatis
```bash
npm run db:setup
```

### 5. Jalankan Local Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.
