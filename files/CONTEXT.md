# CONTEXT.md — Pundi (Personal Finance Dashboard)

## 1. Latar Belakang Project

Pundi dibangun sebagai project portfolio berikutnya yang akan di-upload ke **Rumah Design**, rumah untuk karya frontend dan cerita proses desain milik pemilik repo. Tujuannya menunjukkan kemampuan merancang dan membangun dashboard data-heavy (banyak angka, banyak chart, banyak state) yang tetap terasa tenang dan mudah dipakai — melengkapi tiga project sebelumnya di portfolio (ArroBuild — SaaS AI dokumentasi, HyBloggyon — blog editorial, Smart Presence Platform — dashboard operasional sekolah).

Dibanding Smart Presence Platform (dashboard operasional multi-role), Pundi sengaja mengambil arah berbeda: **single-user, personal, dan sangat data-visualization-heavy** — menunjukkan sisi lain dari kemampuan desain dashboard, yaitu meracik banyak jenis grafik finansial (arus kas, breakdown kategori, tren net worth) menjadi satu pengalaman yang koheren.

## 2. Terminologi

| Istilah | Arti dalam konteks Pundi |
|---|---|
| Akun / Wallet | Sumber dana: rekening bank, e-wallet, tunai, kartu kredit, atau akun investasi |
| Transaksi | Satu catatan pemasukan, pengeluaran, atau transfer antar akun |
| Kategori | Label pengelompokan transaksi (mis. Makan, Transport, Gaji) |
| Anggaran (Budget) | Batas nominal pengeluaran per kategori dalam satu periode (bulanan) |
| Arus Kas (Cash Flow) | Selisih dan tren pemasukan vs pengeluaran dari waktu ke waktu |
| Aset | Kepemilikan bernilai di luar saldo kas: saham, reksadana, kripto, emas, properti |
| Net Worth | Total aset dikurangi total utang/kartu kredit — indikator kekayaan bersih |
| Goal | Target tabungan dengan nominal dan tanggal target |
| Insight | Ringkasan otomatis dari sistem tentang pola/kondisi keuangan pengguna |
| Ledger Baseline | Elemen visual signature Pundi — garis dasar tegas di setiap chart, terinspirasi garis buku kas |

## 3. Keputusan Teknis Kunci & Alasannya

- **Next.js dipilih, bukan Nuxt 3** — walau platform Rumah Design sendiri (meta-platform-nya) direncanakan pakai Nuxt 3, project-project *yang ditampilkan di dalamnya* (ArroBuild, Smart Presence Platform) konsisten memakai Next.js. Pundi mengikuti pola nyata ini agar konsisten dengan portfolio yang sudah live.
- **Appwrite untuk auth + database + storage** (bukan Supabase) — pemilik repo sudah menghabiskan kuota Supabase di project lain, sehingga Pundi sengaja memakai platform terpisah agar tidak ikut terbentur limit yang sama. Appwrite dipilih dibanding kombinasi layanan terpisah (mis. Neon + Better Auth + R2) karena tetap satu platform all-in-one seperti Supabase, sehingga alur kerja agent tetap sederhana. Konsekuensinya: Pundi **tidak memakai Prisma/PostgreSQL relasional** seperti ArroBuild — skema datanya berbentuk Collections & Attributes ala Appwrite (lihat ARCHITECTURE.md § 3), dan permission-nya beda mekanisme dari RLS Supabase (lihat ARCHITECTURE.md § 4). Ini adalah divergensi teknis yang disengaja, bukan kelalaian konsistensi.
- **Recharts + custom SVG untuk "Ledger Baseline"** — Recharts dipakai untuk chart standar agar development cepat, tapi elemen signature (garis dasar ledger) dibuat custom karena ini adalah identitas visual utama produk, bukan sekadar chart generik.
- **Tabular numerals (IBM Plex Mono) untuk semua angka nominal** — keputusan desain sekaligus fungsional: kolom angka finansial harus rata agar cepat dibaca/dibandingkan, bukan pilihan estetika semata.
- **Metafora "ledger/buku besar"** dipilih secara sadar untuk menghindari klise desain fintech generik (dashboard gelap-neon atau kartu-kartu gradient) — lihat alasan lengkap di DESIGN.md § 4.1.

## 4. Hubungan dengan Skill UI/UX

Repo ini akan ditambahkan sebuah skill UI/UX ("pro max") yang membantu AI coding agent mengeksekusi implementasi visual. Pembagian tanggung jawabnya:

- **DESIGN.md adalah source of truth** untuk keputusan desain yang sudah final: warna, tipografi, spacing, layout concept, dan signature element (Ledger Baseline). Dokumen ini **tidak boleh** ditimpa begitu saja oleh output skill.
- **Skill UI/UX** berperan sebagai *executor* — membantu proses implementasi detail komponen (micro-interaction, refinement spacing di edge case, aksesibilitas teknis) selama tetap berada dalam batasan token & prinsip yang sudah ditetapkan di DESIGN.md.
- Jika skill menyarankan sesuatu yang bertentangan dengan DESIGN.md (misalnya palet warna berbeda), agent harus memperlakukan DESIGN.md sebagai pemenang, kecuali pemilik repo secara eksplisit meminta perubahan pada DESIGN.md itu sendiri terlebih dahulu.

Aturan operasional lebih detail ada di AGENTS.md.

## 5. Catatan Non-Teknis

- Nama "Pundi" adalah usulan/placeholder — cocok secara makna (pundi-pundi = tempat menyimpan uang) dan mudah dibrand, tapi bebas diganti sebelum development dimulai.
- Setelah Pundi selesai dan di-deploy, case study untuk Rumah Design ditulis mengikuti format yang sama seperti tiga project sebelumnya: Ringkasan → Masalah → Solusi → Fitur Utama → Pendekatan Teknis → Hasil, dalam Bahasa Indonesia dengan istilah teknis dalam Bahasa Inggris.
