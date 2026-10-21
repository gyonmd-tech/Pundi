# Spec — design-revamp (2026-10-21)

Disetujui pengguna ("saya setuju semuanya, langsung saja ke implementasinya"). Dikerjakan sebagai 4 paket, masing-masing PR sendiri, urutan A → B → C → D.

## Paket A — Fondasi & bug
1. **Mobile density (<640px):** header atas ±56px, bottom nav 56px + FAB 48px, judul halaman 22px, padding kartu 16px, gap 12px. Lewat aturan bersama (globals + komponen layout), bukan per halaman.
2. **Popover terpotong:** `Select` dan `DatePicker` merender panel lewat portal ke `document.body`, posisi `fixed` dari rect pemicu, flip ke atas bila ruang bawah kurang, posisi diperbarui saat scroll/resize. Modal dirender lewat portal dengan z-index di atas header (termasuk modal halaman Anggaran).
3. **Chat Penjaga:** render markdown ringan (tebal, miring, `kode`, daftar `-`/`1.`, baris baru) dengan pengurai sendiri → elemen React (tanpa HTML mentah). Kolom ketik tanpa border/outline/shadow/ring saat fokus.
4. **Performa & stabilitas:** `next build` untuk ukuran bundle per rute; dynamic import untuk dependensi berat; uji semua rute 360px & 1440px, terang & gelap, catat error console; laporan di `.10x/reviews/`.

## Paket B — History chat Penjaga
- Koleksi baru `chat_threads` {userId, title, preview, lastMessageAt} dan `chat_messages` {threadId, userId, role, content, tools[]}; izin per pengguna.
- Server menyimpan pesan pengguna sebelum memanggil AI dan jawaban Penjaga setelah stream selesai. Judul = ringkasan pesan pertama (tanpa panggilan AI). Konteks ke AI = 12 pesan terakhir thread, dibaca dari server.
- UI: desktop panel kiri (Chat baru + daftar dikelompokkan Hari ini / Kemarin / 7 hari terakhir / Lebih lama, hapus); mobile sheet dari ikon riwayat. Thread aktif di URL `/penjaga?c=<id>`. Mode demo: localStorage.

## Paket C — Anggaran + Kalkulator
- **Anggaran** (masalah utama: alur membuat): sheet bertahap 3 langkah — (1) pilih kategori (kategori tanpa anggaran di atas, tampil rata-rata belanja), (2) kalimat isian "Batas Rp __ setiap [hari | minggu | bulan]" + saran rata-rata + pratinjau total sebulan, (3) ringkasan; "Jatah fleksibel" di bawah "Opsi lanjutan" dengan penjelasan bahasa sehari-hari. Tombol Kembali/Lanjut dan indikator langkah.
- **Kalkulator:** hub grid 6 kartu alat (ikon, judul, deskripsi singkat, warna); ketuk → tampilan fokus alat dengan tombol kembali; alat aktif di hash URL. Keypad kalkulator muat satu layar di HP tanpa tertutup bottom nav.

## Paket D — Landing page
- **Hero:** video loop latar baru tanpa teks (komposisi Remotion `HeroLoop`, ±10 dtk, frame awal = frame akhir agar mulus), overlay gradasi, judul + CTA di atasnya; poster gambar; `prefers-reduced-motion` → gambar diam.
- **Storyboard scroll:** section sticky dengan 4 babak — Ceritakan → Penjaga menyusun draft → Kamu setujui → Dashboard rapi. Progres scroll (0–1, dihaluskan lerp di rAF) menggerakkan panggung (mockup HP + Penjaga + kartu) dan teks babak. Hanya transform/opacity.
- **Section lain diseragamkan:** pola header section yang sama, kartu dengan gaya & radius konsisten, reveal-on-scroll halus.

## Di luar cakupan
Perubahan skema anggaran, model AI baru, alat kalkulator baru.
