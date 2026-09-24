# PUNDI brand assets

- `pundi-logo.svg` / `.png`: logo lengkap transparan untuk latar terang.
- `pundi-logo-white.svg`: logo lengkap putih untuk latar biru gelap.
- `pundi-symbol.svg` / `.png`: simbol mandiri transparan.
- `pundi-app-icon.svg`, `app-icon-192.png`, `app-icon-512.png`: ikon aplikasi.
- `favicon.svg`, `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `favicon-48.png`: favicon web.

SVG berisi path vektor (huruf sudah menjadi outline), tanpa gambar raster atau dependensi font. Warna utama: navy `#142B87`, royal blue `#2459DE`, aksen `#2860E6`. Bentuk ditelusuri dari konsep raster pilihan pengguna, kemudian dibuat ulang sebagai path; gunakan master SVG untuk penyesuaian akhir sebelum produksi cetak.

Contoh HTML: `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` dan `<link rel="alternate icon" href="/favicon.ico">`.
