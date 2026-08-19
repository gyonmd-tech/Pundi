# PRD — Pundi (Personal Finance Dashboard)

> Status: Draft v1 · Nama "Pundi" bersifat sementara, silakan ganti sebelum development jika perlu. Semua istilah teknis sengaja ditulis dalam Bahasa Inggris mengikuti konvensi dokumentasi Rumah Design.

## 1. Ringkasan Produk

Pundi adalah dashboard manajemen keuangan pribadi yang menyatukan pencatatan transaksi, anggaran (budgeting), arus kas (cash flow), serta gambaran aset/investasi dalam satu tampilan yang rapi dan mudah dibaca. Produk ini dirancang sebagai **portfolio piece** yang menunjukkan kemampuan mendesain dan membangun dashboard data-heavy yang tetap terasa personal, tenang, dan tidak membingungkan — bukan aplikasi akuntansi bisnis, dan bukan sekadar pencatat pengeluaran sederhana.

Tagline: **"Satu dashboard untuk semua arus keuanganmu."**

## 2. Latar Belakang Masalah

Kebanyakan orang mengelola keuangan pribadi secara terpecah: mutasi bank di satu tempat, dompet digital di tempat lain, catatan pengeluaran manual di notes atau spreadsheet, dan investasi dipantau lewat aplikasi sekuritas terpisah. Akibatnya:

- Sulit menjawab pertanyaan sederhana seperti "sebenarnya total kekayaan saya berapa sekarang?"
- Anggaran dibuat di awal bulan tapi tidak pernah dicek lagi karena tidak ada pengingat visual yang jelas.
- Data pengeluaran menumpuk tapi tidak pernah diubah menjadi insight yang bisa ditindaklanjuti.
- Banyak aplikasi finance yang ada terasa terlalu "ramai" (terlalu banyak warna, terlalu banyak angka tanpa hierarki) sehingga pengguna malas membuka aplikasinya secara rutin.

Peluangnya: dashboard finansial yang datanya padat, tapi *visual hierarchy*-nya rapi, sehingga pengguna betah membuka dan mengecek kondisi keuangannya setiap hari — bukan cuma sekali sebulan.

## 3. Target Pengguna

**Primary persona — "Sarah, 27, pekerja kantoran urban"**
Berpenghasilan tetap + freelance sampingan, punya 3–4 akun (bank utama, e-wallet, tabungan, sedikit reksadana). Sudah pernah coba spreadsheet tapi malas update manual terus-menerus. Ingin satu tempat untuk melihat kondisi keuangan tanpa harus menghitung manual, dan ingin merasa "in control" tanpa harus jadi ahli finansial.

Karakteristik penting untuk desain produk:
- Mobile-first dalam kebiasaan cek harian, tapi nyaman pakai desktop saat melakukan input/rencana bulanan.
- Menghargai kejelasan angka lebih dari animasi atau dekorasi.
- Butuh rasa aman/percaya terhadap data finansialnya — tone produk harus tenang dan meyakinkan, bukan norak atau terlalu "gamified".

## 4. Tujuan Produk & Metrik Keberhasilan

| Tujuan | Indikator (untuk versi demo/portfolio) |
|---|---|
| Pengguna bisa memahami kondisi keuangannya dalam < 10 detik buka dashboard | Ringkasan saldo, arus kas bulan berjalan, dan status anggaran tampil di atas *fold* tanpa scroll |
| Pencatatan transaksi terasa cepat, bukan beban | Tambah transaksi ≤ 3 langkah (quick-add) |
| Anggaran terasa hidup, bukan angka statis | Progress budget realtime + notifikasi saat mendekati/lewat limit |
| Dashboard tetap enak dilihat walau data padat | Tidak ada lebih dari 1 warna aksen dominan per layar; setiap chart punya baseline & label yang jelas |
| Demo meyakinkan calon klien/employer bahwa desainer memahami data-viz | Data demo realistis (histori 6–12 bulan), bukan angka acak/placeholder |

## 5. Lingkup Fitur (Feature Scope)

Fokus produk: **kombinasi menyeluruh** — budgeting harian, laporan arus kas, dan overview aset/investasi disatukan dalam satu dashboard (bukan produk yang hanya fokus di satu area saja). Fitur dikelompokkan per epic, dengan tanda prioritas MVP (wajib untuk demo layak tayang) dan v2 (backlog lanjutan, dicatat juga di PLAN.md).

### Epic A — Onboarding & Akun (Wallet)
- [MVP] Sign up / login (email, atau opsi login demo)
- [MVP] Tambah akun/wallet (Bank, E-wallet, Tunai, Kartu Kredit, Investasi) dengan saldo awal
- [MVP] Onboarding singkat: pilih akun awal + isi 1 anggaran pertama
- [v2] Hubungkan akun lewat import CSV mutasi bank

### Epic B — Transaksi
- [MVP] CRUD transaksi (income / expense / transfer antar akun)
- [MVP] Kategori transaksi (preset + custom, dengan ikon & warna)
- [MVP] Quick-add transaksi (form ringkas, bisa diakses dari mana saja di dashboard)
- [MVP] List & filter transaksi (per akun, kategori, rentang tanggal, cari teks)
- [v2] Transaksi berulang (recurring, misal langganan bulanan)
- [v2] Lampiran struk/nota pada transaksi

### Epic C — Anggaran (Budgeting)
- [MVP] Buat anggaran bulanan per kategori
- [MVP] Progress bar/ring anggaran (terpakai vs limit vs sisa hari dalam bulan)
- [MVP] Status visual: aman / mendekati limit / lewat limit
- [v2] Anggaran otomatis berdasarkan rata-rata 3 bulan terakhir

### Epic D — Arus Kas & Laporan
- [MVP] Grafik arus kas bulanan (income vs expense, tren beberapa bulan terakhir)
- [MVP] Breakdown pengeluaran per kategori (chart proporsi)
- [MVP] Ringkasan bulan berjalan: total masuk, total keluar, net cash flow
- [v2] Ekspor laporan (PDF/CSV)
- [v2] Perbandingan bulan-ke-bulan (MoM) dan tahun-ke-tahun (YoY)

### Epic E — Aset & Investasi (Overview)
- [MVP] Daftar aset/investasi (saham, reksadana, kripto, emas, properti) dengan nilai saat ini
- [MVP] Grafik tren net worth (total aset − total utang/kartu kredit) dari waktu ke waktu
- [v2] Update harga otomatis via API pasar (di demo cukup input manual/simulasi)

### Epic F — Tujuan Tabungan (Goals)
- [MVP] Buat goal (nama, target nominal, target tanggal)
- [MVP] Progress goal + estimasi tercapai berdasarkan kecepatan menabung saat ini
- [v2] Alokasi otomatis dari sisa anggaran ke goal

### Epic G — Insight & Notifikasi
- [MVP] Feed insight sederhana (mis. "Pengeluaran kategori Makan 20% lebih tinggi dari bulan lalu")
- [MVP] Notifikasi budget mendekati/lewat limit
- [v2] Insight berbasis pola (deteksi pengeluaran tidak biasa/anomali)

### Epic H — Dashboard Utama
- [MVP] Halaman ringkasan yang menggabungkan: saldo total, arus kas bulan ini, status anggaran teratas, tren net worth, transaksi terbaru, dan insight — inilah halaman inti yang mewakili "dashboard menyeluruh"

## 6. Non-Goals (Batasan Sengaja)

- **Bukan** integrasi perbankan real-time (open banking) — di versi demo, semua data dimasukkan manual atau berupa seed data simulasi.
- **Bukan** aplikasi multi-user/keluarga di MVP (family sharing masuk v2 backlog).
- **Bukan** aplikasi akuntansi bisnis (tidak ada invoicing, pajak, payroll).
- **Bukan** robo-advisor — tidak memberi rekomendasi beli/jual instrumen investasi.

## 7. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Dashboard terasa penuh/berantakan karena banyak jenis data (transaksi, budget, aset, goal) sekaligus | Terapkan hierarki visual ketat dari DESIGN.md; satu halaman ringkasan hanya menampilkan highlight, detail penuh ada di halaman masing-masing |
| Data finansial (walau demo) memberi kesan tidak aman/tidak privat | Semua data demo sintetis, nyatakan eksplisit di halaman demo bahwa ini bukan data nyata (lihat pola "Keamanan Demo" di Smart Presence Platform) |
| Empty state (user baru belum punya transaksi) terasa membosankan/kosong | Rancang empty state yang mengarahkan aksi ("Tambah transaksi pertamamu"), bukan sekadar ilustrasi kosong |
| Chart data-viz terlihat generik/template dashboard SaaS pada umumnya | Ikuti signature visual "ledger rule" di DESIGN.md agar chart terasa khas milik Pundi, bukan komponen chart library default |
| Angka keuangan sulit dibaca cepat karena tidak rata kolom | Gunakan tabular numerals (monospace) untuk semua angka nominal, lihat DESIGN.md § Tipografi |

## 8. Kriteria Sukses (Definition of Done untuk Demo)

- Semua fitur MVP di atas berfungsi end-to-end dengan data seed yang realistis (bukan lorem ipsum angka).
- Dashboard utama menampilkan gambaran lengkap kondisi keuangan tanpa perlu scroll berlebihan di desktop.
- Responsive penuh sampai lebar mobile (375px).
- Setiap chart punya label, satuan mata uang (Rupiah), dan baseline yang jelas dibaca tanpa hover.
- Case study Pundi bisa ditulis dan diupload ke Rumah Design mengikuti format Ringkasan/Masalah/Solusi/Fitur Utama/Pendekatan Teknis/Hasil.

---

## Update — Wallet System Upgrade (Agustus 2026)

> Penambahan ini memperluas Epic A dan Epic D berdasarkan PLAN_CUSTOM_WALLET_RESPONSIVE.md. Prinsip seleksi: setiap sub-fitur harus benar-benar mengubah cara user melihat/mengelola uang sehari-hari — yang kosmetik masuk v2 backlog saja.

### Epic A — Onboarding & Akun (Wallet) — Penambahan Fitur Custom Types

| Item | Prioritas | Detail |
|---|---|---|
| Kelola Jenis Dompet Custom | **[MVP]** | Section baru di `/pengaturan`: CRUD tipe akun (nama, ikon Lucide dari set existing, warna dari token `tokens.css`) — bukan color picker bebas agar tetap kohesif dengan palet design system |
| Collection `accountTypes` | **[MVP]** | Setiap user punya daftar tipe dompet sendiri: `userId`, `name`, `icon` (nama Lucide), `colorTag`, `isDefault` |
| Migrasi `accounts.type` → `accounts.typeId` | **[MVP]** | Field enum lama diganti dengan relasi ke `accountTypes`. Seed otomatis 5 tipe default saat signup: Bank, E-wallet, Tunai, Kartu Kredit, Investasi — pemetaan enum lama otomatis |
| Dropdown tipe di form tambah akun | **[MVP]** | Pull dari collection `accountTypes` milik user, bukan enum hardcoded — mendukung tipe custom yang sudah dibuat user |
| Validasi hapus tipe | **[MVP]** | Tipe yang masih dipakai oleh ≥1 akun aktif tidak bisa dihapus, hanya bisa diedit — mencegah data orphan |
| Multi-currency per akun | **[MVP — prasyarat]** | Field `currency` (mis. `IDR`, `USD`, `SGD`) + `exchangeRate` (manual input, rate terhadap IDR) per akun. Kartu akun sendiri tampil pakai mata uang asli (`$1,250.00`), tapi agregat dashboard (total saldo, net worth) tetap dikonversi ke IDR |
| Alert saldo rendah per akun | **[v2]** | Butuh infrastruktur notifikasi tambahan — berbeda dari alert budget yang sudah ada |

### Epic D — Arus Kas & Laporan — Penambahan Fitur per Wallet

| Fitur | Prioritas | Deskripsi |
|---|---|---|
| Halaman Detail per Dompet (`/aset/[accountId]`) | **[MVP]** | Versi mini Arus Kas spesifik satu akun: tren saldo 6 bulan, breakdown kategori pengeluaran dari akun ini, mutasi ter-filter — membantu user mengerti ke mana uang di rekening tertentu pergi |
| Widget Distribusi Saldo (Dashboard) | **[MVP]** | Panel baru di dashboard: \"Di mana uang saya sekarang?\" — Wallet Distribution Ring (lihat DESIGN.md § Update Visual Signature) menampilkan proporsi saldo per dompet |
| Transfer Antar Akun — Pemisahan di Laporan | **[MVP]** | Transfer sudah ada sebagai tipe transaksi, tapi harus dipisah dari income/expense asli di laporan per akun agar cash flow tidak double-count. Laporan `/arus-kas` per akun harus exclude transfer sebagai income/expense |
| Money Flow Ribbon (Halaman Arus Kas) | **[MVP]** | Diagram alur Sankey sederhana: Sumber Pemasukan → Dompet → Kategori Pengeluaran — ditempatkan sebagai visual sekunder di bawah chart tren yang sudah ada, bukan pengganti. Di mobile turun jadi stacked bar sederhana |
| Insight Otomatis per Akun | **[MVP]** | Perluasan `InsightFeed.tsx`: insight spesifik per akun (mis. \"Saldo BCA turun 40% bulan ini, lebih cepat dari biasanya\") — bukan hanya insight level total keseluruhan |
| Ekspor laporan PDF/CSV formal | **[v2]** | Laporan per bulan bergaya laporan keuangan resmi siap cetak — dipindah ke v2 dari backlog umum |
