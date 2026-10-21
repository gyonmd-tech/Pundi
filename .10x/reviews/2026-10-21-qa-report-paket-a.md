# QA Report — design-revamp Paket A (2026-10-21)

## Gerbang statis
- `tsc --noEmit` lolos · `eslint app components lib actions` lolos · `next build` sukses (20 rute).

## Uji browser (dev server, mode demo)
| Uji | Hasil |
|---|---|
| 13 rute app di 360×780: scroll horizontal / elemen meluber | 0 di semua rute |
| 12 rute di 1440×900: lebar dokumen | = viewport (−scrollbar) |
| Error console selama navigasi semua rute | 0 |
| Kalender filter Transaksi (sebelumnya terpotong) | Tampil penuh via portal di atas tabel |
| Modal "Anggaran baru" (sebelumnya tertutup header) | Menutupi seluruh layar, scrim di atas header |
| Markdown chat (sampel jawaban AI) | Daftar, tebal, kode, miring benar; `<script>` ter-escape |
| Root font mobile | 15px; isian 16px |

## Bundle
- Chunk terbesar sebelumnya exceljs+jszip 261KB gzip pada /transaksi → kini dinamis.
- Sisa terbesar: recharts 97KB (sudah dynamic di dashboard/arus-kas/aset), react-dom 69KB, zod 75KB (hanya /pengaturan).

## Belum diuji
- Perangkat iOS fisik (auto-zoom & posisi popover saat keyboard virtual) — diuji lewat emulasi saja.
