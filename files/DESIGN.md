# DESIGN.md — Pundi (Personal Finance Dashboard)

> Dokumen ini adalah **source of truth visual**. Skill UI/UX yang akan ditambahkan ke project wajib mengacu ke § 4 (Design System) sebelum membuat komponen apa pun — lihat aturan lengkap di AGENTS.md.

## 1. Sitemap

```
/                         → Landing/marketing singkat (khusus versi publik demo)
/login, /signup           → Autentikasi
/onboarding               → Setup akun pertama + anggaran pertama
/dashboard                → Halaman ringkasan utama (lihat wireframe § 3)
/transaksi                → List, filter, dan quick-add transaksi
/anggaran                 → Kelola anggaran per kategori
/arus-kas                 → Laporan & grafik arus kas (bulanan, tren)
/aset                     → Daftar aset/investasi + tren net worth
/tujuan                   → Goals tabungan
/insight                  → Feed insight & notifikasi
/pengaturan               → Profil, akun/wallet, kategori custom
```

## 2. Key Components

| Komponen | Fungsi |
|---|---|
| `SidebarNav` | Navigasi utama, persisten di desktop, jadi bottom nav di mobile |
| `AccountSwitcher` | Dropdown untuk filter dashboard per akun/wallet atau "semua akun" |
| `SummaryCard` | Kartu ringkasan angka besar (saldo total, income, expense) — pakai tabular numerals |
| `CashFlowChart` | Area/line chart arus kas dengan signature "ledger baseline" (lihat § 4.6) |
| `CategoryBreakdownChart` | Donut/bar chart proporsi pengeluaran per kategori |
| `NetWorthTrendChart` | Line chart tren total aset dikurangi utang, per bulan |
| `BudgetProgress` | Progress bar/ring per kategori anggaran, dengan status warna (aman/waspada/lewat) |
| `GoalCard` | Progress goal tabungan + estimasi tanggal tercapai |
| `TransactionList` | Tabel/list transaksi dengan filter, tabular numerals rata kanan |
| `QuickAddTransaction` | Form/modal ringkas untuk tambah transaksi cepat, dapat dipanggil dari halaman mana pun |
| `InsightFeed` | List insight singkat (teks + ikon tren) |
| `EmptyState` | Komponen terarah-aksi untuk state kosong (belum ada transaksi/budget/goal) |

## 3. Layout Concept — Dashboard Utama

Konsep: sidebar tetap di kiri, konten utama tersusun sebagai kartu-kartu bergaya "ledger" (garis tipis, flat, tidak melayang dengan shadow tebal), tersusun mengikuti prioritas informasi dari kiri-atas ke kanan-bawah.

```
┌────────────┬──────────────────────────────────────────────────┐
│  Pundi      │  Halo, Sarah · [Akun: Semua ▾]      [+ Tambah]   │
│  ─────────  ├──────────────────────────────────────────────────┤
│  Dashboard  │ ┌───────────────┐┌──────────────┐┌───────────────┐│
│  Transaksi  │ │ Saldo Total   ││ Pemasukan     ││ Pengeluaran   ││
│  Anggaran   │ │ Rp 24.850.000 ││ bulan ini     ││ bulan ini     ││
│  Arus Kas   │ │ ▲ 4,2%        ││ Rp 8.200.000  ││ Rp 5.640.000  ││
│  Aset       │ └───────────────┘└──────────────┘└───────────────┘│
│  Tujuan     │ ┌─────────────────────────────┐ ┌────────────────┐│
│  Insight    │ │ Arus Kas 6 Bulan Terakhir    │ │ Kategori Bulan ││
│  ─────────  │ │ (area chart, ledger baseline)│ │ Ini (donut)    ││
│  Pengaturan │ └─────────────────────────────┘ └────────────────┘│
│             │ ┌─────────────────────────────┐ ┌────────────────┐│
│             │ │ Transaksi Terbaru (tabel)    │ │ Anggaran &     ││
│             │ │                               │ │ Tujuan (ringkas)│
│             │ └─────────────────────────────┘ └────────────────┘│
└────────────┴──────────────────────────────────────────────────┘
```

Di mobile: sidebar → bottom nav 5 ikon (Dashboard, Transaksi, +Tambah, Anggaran, Lainnya), kartu-kartu disusun 1 kolom penuh sesuai urutan prioritas di atas.

## 4. Design System

### 4.1 Filosofi

Pundi mengambil metafora **buku besar (ledger) modern** — dunia pencatatan finansial yang presisi, bergaris, dan tabular — lalu didigitalkan dengan tone yang tenang dan bersih. Ini sengaja menghindari tiga pola default yang terlalu sering muncul di desain AI-generated saat ini: (1) latar krem hangat + aksen terracotta, (2) latar nyaris hitam + aksen neon, (3) gaya broadsheet/koran dengan garis-garis dekoratif tanpa fungsi. Sebagai gantinya, setiap garis di Pundi punya alasan: garis adalah baris ledger, bukan dekorasi.

**Signature element produk:** *Ledger Baseline* — setiap chart data (arus kas, tren net worth) berdiri di atas garis dasar tegas seperti garis buku kas, dan setiap angka nominal dirender dengan tabular numerals sehingga kolom-kolom uang selalu rata, persis seperti pembukuan manual yang rapi.

### 4.2 Palet Warna

| Token | Hex | Penggunaan |
|---|---|---|
| `paper` | `#EEF1EF` | Background utama (netral kebiruan-hijau pucat, bukan krem) |
| `surface` | `#FFFFFF` | Background kartu/panel di atas `paper` |
| `ink` | `#16201D` | Teks utama, hampir hitam dengan undertone hijau gelap ("tinta") |
| `ink-muted` | `#5B655F` | Teks sekunder, label, caption |
| `pine` (primary) | `#1B4B3F` | Aksi utama, state positif (income, saldo naik, progress aman) |
| `ember` (secondary) | `#9C4A2E` | State negatif (expense besar, budget lewat limit, saldo turun) — sengaja bukan merah generik dan bukan `#D97757` |
| `brass` (accent) | `#B08A3E` | Aksen jarang: highlight goal tercapai, badge premium/penting |
| `rule` | `#C8CDC7` | Garis hairline (border kartu, baseline chart, divider) |
| `warning` | `#B8862E` | Status "mendekati limit anggaran" (di antara aman dan lewat) |

Aturan pemakaian: maksimum satu warna aksen dominan per layar. `pine` dan `ember` **hanya** dipakai untuk makna semantik (positif/negatif), tidak untuk dekorasi bebas. `brass` dipakai sangat jarang (maksimal 1–2 elemen per halaman) supaya tetap terasa istimewa.

### 4.3 Tipografi

| Role | Font | Penggunaan |
|---|---|---|
| Display | **Fraunces** (serif editorial, optical size besar) | Headline halaman, angka saldo besar di summary card utama |
| UI/Body | **General Sans** (grotesk geometris) | Navigasi, label, body text, tombol |
| Data/Mono | **IBM Plex Mono** (tabular numerals) | **Semua** angka nominal, tanggal, persentase — di transaksi, chart axis, summary card |

Type scale (base 16px, ratio ~1.25):

```
Display XL   40px / 44px   — angka saldo utama
Display L    28px / 34px   — judul halaman
Heading      20px / 26px   — judul kartu/section
Body         16px / 24px   — teks umum
Small        14px / 20px   — label, caption
Data L       24px / 28px (mono) — angka besar di summary card
Data M       16px / 22px (mono) — angka di tabel transaksi
```

Aturan khusus: angka nominal **selalu** rata kanan dan pakai font mono agar kolom sejajar — ini bukan pilihan estetika semata, tapi kebutuhan fungsional membaca data finansial secara cepat.

### 4.4 Grid & Spacing

- Base spacing unit: **8px** (gunakan kelipatan 8: 8/16/24/32/48/64).
- Grid desktop: 12 kolom, max-width kontainer 1280px, gutter 24px.
- Sidebar tetap lebar 240px di desktop ≥1280px, collapsible jadi icon-only di 1024–1279px, jadi bottom nav di <768px.
- Card padding: 24px desktop, 16px mobile.

### 4.5 Radius, Border & Elevation

- Radius kecil dan konsisten: **6px** untuk kartu, **4px** untuk elemen kecil (badge, input) — cukup untuk terasa modern tanpa jadi terlalu "bubbly"/SaaS generik.
- Kartu memakai **hairline border** (`rule`, 1px) sebagai pemisah utama, bukan shadow tebal. Shadow hanya dipakai tipis untuk elemen yang benar-benar mengambang (modal, dropdown), maksimal `0 4px 12px rgba(22,32,29,0.08)`.
- Tidak ada gradient dekoratif. Warna solid saja, sesuai filosofi ledger yang presisi.

### 4.6 Data Visualization Guidelines

- **Ledger Baseline**: setiap line/area chart (arus kas, net worth) digambar di atas garis dasar solid (`rule`, tebal 1.5px) yang membentang penuh lebar chart — meniru garis dasar buku kas.
- Warna chart: garis/area income & tren positif = `pine`; expense & tren negatif = `ember`. Jangan pakai palet warna-warni acak untuk kategori — gunakan variasi *tint* dari `pine`/`ink-muted`/`brass` agar tetap kohesif (maksimal 5–6 tint berbeda untuk chart kategori).
- Delta/perubahan (naik/turun) ditampilkan dengan glyph kecil ▲/▼ + warna semantik, bukan badge pil besar berwarna-warni.
- Semua chart wajib punya: label sumbu, satuan (Rp), dan minimal satu titik referensi (mis. rata-rata) — tidak ada chart "telanjang" tanpa konteks angka.
- Grafik donut kategori: label langsung di sebelah legenda dengan angka nominal (mono), bukan hanya persentase.
- Loading state chart: skeleton dengan bentuk baseline yang sama (bukan spinner generik), supaya transisi ke data asli terasa halus.
- Empty state chart (belum ada data cukup): tampilkan baseline kosong + teks ajakan aksi ("Tambahkan transaksi untuk melihat tren arus kasmu").

### 4.7 Ikonografi

Gunakan satu set ikon *outline*, stroke width konsisten 1.5px (rekomendasi: Lucide/Phosphor outline). Ikon kategori transaksi berupa ikon outline sederhana dalam lingkaran tint warna kategori — hindari ikon emoji atau ilustrasi penuh warna yang mengganggu ketenangan visual dashboard.

### 4.8 Motion

Motion dipakai fungsional, bukan dekoratif:
- Angka besar (saldo, summary card) melakukan *count-up* singkat (300–500ms) saat data pertama kali dimuat.
- Progress bar/ring anggaran & goal animasi mengisi dari 0 ke nilai aktual saat halaman dibuka.
- Transisi antar halaman: fade sederhana, tanpa slide/parallax berlebihan.
- Hormati `prefers-reduced-motion` — matikan count-up dan animasi progress jika diaktifkan.

### 4.9 Aksesibilitas

- Kontras teks `ink` di atas `paper`/`surface` harus memenuhi WCAG AA (rasio ≥4.5:1) — palet di atas sudah dirancang memenuhi ini.
- Semua elemen interaktif punya visible focus state (outline 2px `pine`).
- Warna semantik (`pine`/`ember`) tidak boleh jadi satu-satunya penanda status — selalu dampingi dengan ikon/label teks (mis. "▲ Aman", bukan warna hijau saja).

### 4.10 Component States (ringkas)

| State | Aturan |
|---|---|
| Default | `surface` + border `rule` |
| Hover (interaktif) | Background sedikit gelap dari `surface` (`#F5F6F4`), tanpa shadow tambahan |
| Active/Selected | Border `pine` 1.5px, teks `pine` |
| Disabled | Opacity 40%, cursor not-allowed |
| Error (form) | Border `ember`, teks bantuan warna `ember` di bawah field |

## 5. Content Model

| Entity | Field Utama |
|---|---|
| `Account` (Wallet) | id, nama, jenis (bank/e-wallet/tunai/kartu-kredit/investasi), saldo, warna label, is_active |
| `Category` | id, nama, tipe (income/expense), ikon, warna, parent_id (opsional untuk sub-kategori) |
| `Transaction` | id, account_id, category_id, tipe (income/expense/transfer), nominal, tanggal, catatan, tags[] |
| `Budget` | id, category_id, periode (bulan-tahun), limit_amount, computed: spent_amount |
| `Goal` | id, nama, target_amount, current_amount, target_date, linked_account_id (opsional) |
| `Asset` | id, jenis (saham/reksadana/kripto/emas/properti), nama, jumlah_unit, harga_beli, harga_sekarang, tanggal_update |
| `Insight` | id, tipe (budget_warning/goal_progress/tren/tips), pesan, tanggal, is_read |

## 6. Responsive Notes

- Breakpoints: mobile <768px, tablet 768–1023px, desktop ≥1024px, wide ≥1280px.
- Di tablet, grid dashboard turun dari 3 kolom kartu menjadi 2 kolom.
- Tabel transaksi di mobile berubah jadi list card ringkas per baris (bukan tabel horizontal-scroll).
- Quick-add transaksi di mobile muncul sebagai bottom sheet, di desktop sebagai modal tengah.
