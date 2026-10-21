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

## Paket B (selesai)
- Skema `chat_threads`, `chat_messages` di `appwrite.json` (+ konstanta koleksi).
- `lib/penjaga/history.ts`: list/create/get/append/delete dengan verifikasi pemilik; judul dari pesan pertama (tanpa AI).
- `/api/penjaga/chat` kini menerima `{threadId?, message}`; menyimpan pesan pengguna, konteks 12 pesan terakhir dari DB, jawaban disimpan di `finally` (juga saat klien pergi); event NDJSON baru `thread`.
- Actions `listChatThreadsAction/getChatThreadAction/deleteChatThreadAction`.
- Provider: `threads`, `activeThreadId`, `openThread`, `newChat`, `deleteThread`, `historyLoading`; mode demo menyimpan ke localStorage (`pundi-penjaga-history`, maks 30).
- UI: `ChatHistory` (grup Hari ini/Kemarin/7 hari/Lebih lama), panel kiri lg+, sheet di ponsel, skeleton saat memuat, sinkron URL `?c=`.
- Tech debt: draft demo tidak ikut disimpan per thread (draft tetap global).

## Paket C (selesai)
- `components/budget/BudgetWizard.tsx`: 3 langkah (Kategori → Jatah → Cek) di dalam `Modal` portal; kategori yang sudah dianggarkan diredupkan, rata-rata belanja bulanan sebagai patokan; kalimat "Batas Rp __ setiap hari/minggu/bulan" + saran kebiasaan + pratinjau total sebulan & per hari; "Jatah fleksibel" dipindah ke Opsi lanjutan dengan contoh angka nyata. Mode ubah melewati langkah kategori. Halaman Anggaran kehilangan ±200 baris form lama.
- `app/(app)/kalkulator/page.tsx`: hub 6 kartu bergradasi → tampilan fokus dengan tombol kembali; hash URL via `useSyncExternalStore`; Back browser sinkron. Keypad diperkecil di ponsel (muat di atas bottom nav).
- Skeleton rute `/kalkulator` memakai kerangka kartu.
- Insiden: cache dev `.next/dev` rusak setelah aplikasi tertutup paksa (semua rute 404) → dihapus & dibuat ulang.
