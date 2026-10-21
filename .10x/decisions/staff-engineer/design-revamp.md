# Staff Engineer — design-revamp

- Tanpa dependensi animasi/popover baru; util kecil sendiri.
- Animasi hanya transform/opacity; hormati `prefers-reduced-motion`.
- Komponen baru: komentar header berbahasa Indonesia, warna lewat token (hex hanya untuk permukaan yang selalu gelap).
- Gerbang setiap paket: `tsc` + `eslint` + uji browser 360px/1440px, terang/gelap, sebelum PR.
