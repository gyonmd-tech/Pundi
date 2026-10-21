# SDE — design-revamp

## Paket A (selesai)
- **A1 Popover portal:** `components/ui/usePortalPosition.ts` (posisi fixed + flip atas/bawah + update saat scroll/resize/visualViewport, `useIsClient`). `Select` & `DatePicker` merender panel lewat `createPortal` z-[90]; klik-luar memeriksa pemicu & panel.
- **A2 Modal:** akar masalah ternyata `animate-in` (motion.css) memakai fill-mode `both` → transform tertahan → wrapper konten menjadi containing block bagi semua modal `fixed` halaman (Anggaran, Aset, Transaksi, Tujuan, Utang) sehingga terpotong di bawah header. Diganti `backwards`. `Modal` juga dipindah ke portal.
- **A3 Density mobile:** root 15px di <640px, kolom isian dikunci 16px (cegah auto-zoom iOS), `.page-title` 1.5rem, FAB 3.25rem, padding main lebih rapat, layar sambutan Penjaga lebih kecil.
- **A4 Chat:** `ChatMarkdown.tsx` (paragraf, daftar, **tebal**, *miring*, `kode`, judul) tanpa HTML mentah; atribut `data-bare-input` + aturan global menghapus ring/outline/shadow fokus pada kolom chat & isian inline draft.
- **A5 Performa:** exceljs+jszip (949KB / 261KB gzip) kini dimuat dinamis saat ekspor Excel (sebelumnya ikut halaman Transaksi).

## Penyimpangan dari rencana
- A2 diselesaikan di sumbernya (motion.css), bukan dengan memindah setiap modal halaman ke portal.

## Tech debt
- zod (75KB gzip) di halaman Pengaturan (CategoryFormModal) — bisa diganti validasi ringan/`zod/mini`.
- Modal halaman masih markup sendiri-sendiri (belum memakai komponen `Modal`).
