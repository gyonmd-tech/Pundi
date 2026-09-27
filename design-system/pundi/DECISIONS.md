# Pundi Design Decisions

Catat keputusan yang mengubah atau memperjelas design system. Jangan mengandalkan riwayat chat sebagai satu-satunya sumber keputusan.

## Format

```text
### DS-000 — Judul keputusan
Tanggal:
Status: Proposed | Accepted | Replaced
Konteks:
Keputusan:
Dampak:
Menggantikan:
```

---

### DS-001 — Arah visual Pundi Soft Clay

**Tanggal:** 27 September 2026
**Status:** Accepted

**Konteks:** Sistem lama menggunakan dark glassmorphism, warna primary yang tidak mengikuti aset Pundi, dan tipografi handwritten yang kurang sesuai untuk aplikasi finansial.

**Keputusan:** Pundi menggunakan clean soft clay dengan fondasi putih, canvas biru sangat lembut, primary dari aset brand, pastel fungsional, dan shadow biru-abu tanpa external white shadow.

**Dampak:** Semua redesign berikutnya mengikuti `MASTER.md`. Token ungu lama akan dimigrasikan bertahap ketika komponen terkait direvisi.

### DS-002 — Pasangan tipografi

**Tanggal:** 27 September 2026
**Status:** Accepted

**Keputusan:** Bricolage Grotesque digunakan untuk display/heading dan Plus Jakarta Sans untuk UI/body/data. Angka menggunakan tabular numerals.

**Dampak:** Manrope dan font lokal lama tidak lagi menjadi acuan untuk hasil redesign baru. Migrasi dilakukan per halaman agar dapat direview secara lokal.

### DS-003 — Strategi modular

**Tanggal:** 27 September 2026
**Status:** Accepted

**Keputusan:** UI dibagi menjadi primitives, composites, patterns, layout, feedback, dan module components. Module manifest menjadi arah arsitektur untuk personal finance, business finance, dan Hermes Agent.

**Dampak:** Komponen domain tidak ditempatkan di folder UI generik. Shell membaca kapabilitas modul melalui kontrak yang stabil.

### DS-004 — Proses review lokal

**Tanggal:** 27 September 2026
**Status:** Accepted

**Keputusan:** Perubahan UI/UX dibuat dan diperiksa secara lokal. Commit, push, pembaruan PR, dan deploy hanya dilakukan setelah persetujuan eksplisit pengguna.

### DS-005 — Surface card putih dan highlight biru

**Tanggal:** 27 September 2026
**Status:** Accepted

**Konteks:** Penggunaan pastel berbeda pada hampir setiap card membuat dashboard terasa tidak konsisten dan mengurangi hierarki informasi.

**Keputusan:** Card standar selalu putih. Card prioritas dapat memakai Brand 600 solid sebagai highlight. Warna semantic tetap dipakai secara tegas pada grafik, badge, ikon, progress, dan data marker. Badge serta button memakai warna solid dengan teks berkontras tinggi.

**Dampak:** Aturan pastel surface pada DS-001 digantikan oleh keputusan ini. Sidebar memakai Brand 900 solid dengan panel logo putih. Primitive `Card`, `Badge`, dan `Button` menjadi sumber varian resmi.
