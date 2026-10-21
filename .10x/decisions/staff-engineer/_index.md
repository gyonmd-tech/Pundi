# Staff Engineer — Index
[DISCOVERED]
- Token warna via CSS vars (`styles/tokens.css`), tema gelap lewat `data-theme="dark"` dengan ramp brand 50–300 diganti di dark.
- Motion: `styles/motion.css` (animate-in, skeleton shimmer). Komponen UI di `components/ui/*` (Button cva, Card, Select kustom berbasis popover absolut).
- Bahasa UI & komentar: Bahasa Indonesia.
- Masalah lintas fitur terlihat: popover/dropdown absolut terpotong oleh parent `overflow-hidden` (Select di draft Penjaga, DatePicker di filter Transaksi); modal Anggaran tertutup header (z-index).
