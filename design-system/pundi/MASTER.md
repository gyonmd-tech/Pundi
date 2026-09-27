# Pundi Design System — Soft Clay Finance

**Status:** sumber aturan aktif untuk seluruh pekerjaan UI/UX Pundi
**Versi:** 2.0
**Diperbarui:** 27 September 2026
**Cakupan:** landing page, autentikasi, aplikasi personal finance, modul bisnis, dan integrasi agent

Dokumen ini adalah sumber keputusan visual dan perilaku Pundi. Aturan halaman yang ada di `pages/<route>.md` boleh memperinci kebutuhan halaman, tetapi tidak boleh mengganti fondasi brand, aksesibilitas, atau perilaku komponen tanpa dicatat di `DECISIONS.md`.

---

## 1. Arah produk dan desain

Pundi membantu pengguna memahami uangnya tanpa membuat pekerjaan finansial terasa berat. Tampilan harus terasa ramah, optimistis, dan mudah disentuh, tetapi tetap presisi ketika menampilkan angka, risiko, dan tindakan penting.

### Karakter visual

- **Ramah:** sudut lembut, bahasa manusia, ilustrasi yang hangat.
- **Terpercaya:** hierarki jelas, angka stabil, status tidak ambigu.
- **Ceria secara terukur:** pastel dipakai untuk konteks, bukan dekorasi acak.
- **Rapi:** setiap permukaan memiliki fungsi dan tidak ada ruang kosong tanpa alasan.
- **Modular:** personal finance, bisnis, utang, aset, dan agent memiliki identitas modul tanpa kehilangan identitas Pundi.

### Prinsip utama

1. **Angka menjadi pusat informasi.** Dekorasi tidak boleh mengalahkan saldo, arus kas, batas, tanggal, atau status.
2. **Warna membawa arti.** Biru adalah brand dan aksi utama; warna lain menandai tipe data atau modul.
3. **Clay menunjukkan struktur.** Elevasi dipakai untuk menjelaskan lapisan dan interaksi, bukan membuat setiap elemen mengambang.
4. **Satu pola untuk satu fungsi.** Tanggal, rekening, kategori, pencarian, dan tindakan utama selalu memakai pola yang sama.
5. **Kepadatan mengikuti pekerjaan.** Dashboard ringkas dan visual; tabel padat dan mudah dipindai; form tenang dan linear.
6. **Mobile adalah alur utama.** Setiap tindakan inti harus selesai dengan satu tangan pada lebar 360 px.
7. **Kejujuran data.** Loading, data kosong, sinkronisasi, kesalahan, dan data demo harus terlihat jelas.

### Hal yang dilarang

- Glassmorphism sebagai gaya utama.
- Bayangan putih besar dari arah kiri atas.
- Card putih polos berulang tanpa hierarki warna.
- Ungu menjadi warna brand utama.
- Gradien pelangi atau gradien yang tidak punya makna.
- Efek glow neon, blur berlebihan, dan border transparan yang mengurangi kontras.
- Semua elemen berbentuk pill. Pill hanya untuk badge, chip, dan filter ringkas.
- Font tulisan tangan untuk UI atau angka.
- Ikon emoji, ikon dari beberapa keluarga, atau ikon dekoratif tanpa fungsi.
- Placeholder sebagai pengganti label.
- Animasi yang menggeser layout atau memperlambat pencatatan.

---

## 2. Identitas brand

### Aset resmi

Gunakan aset dari `public/PUNDI-brand-assets/`.

| Konteks | Aset |
|---|---|
| Logo pada permukaan terang | `pundi-logo.svg` |
| Logo pada permukaan biru gelap | `pundi-logo-white.svg` |
| Sidebar ringkas / avatar aplikasi | `pundi-symbol.svg` |
| Ikon aplikasi | `pundi-app-icon.svg` |
| Browser | `favicon.svg` |

Logo tidak boleh diberi shadow, stroke, warna ulang, atau dimasukkan ke badge yang sempit. Sediakan ruang kosong minimum sebesar tinggi titik pada simbol di setiap sisi.

### Warna inti dari brand asset

| Token | Nilai | Fungsi |
|---|---:|---|
| `brand-950` | `#112772` | permukaan brand paling dalam |
| `brand-900` | `#142B87` | wordmark, teks brand gelap |
| `brand-800` | `#17368F` | sidebar aktif gelap |
| `brand-700` | `#1D48B5` | hover primary |
| `brand-600` | `#2459DE` | primary default |
| `brand-500` | `#2860E6` | primary bright, focus |
| `brand-300` | `#8FBCFF` | aksen lembut dari simbol |

### Skala primary turunan

Skala ini memperluas warna aset tanpa mengubah identitasnya.

| Token | Nilai | Penggunaan |
|---|---:|---|
| `brand-50` | `#F3F7FF` | tint paling lembut |
| `brand-100` | `#E7EFFF` | state terpilih lembut dan chart fill |
| `brand-200` | `#CADCFF` | border aktif lembut |
| `brand-300` | `#8FBCFF` | chart fill / illustration accent |
| `brand-400` | `#5C8FF2` | data visualization |
| `brand-500` | `#2860E6` | focus dan ikon utama |
| `brand-600` | `#2459DE` | tombol utama |
| `brand-700` | `#1D48B5` | hover |
| `brand-800` | `#17368F` | active/pressed |
| `brand-900` | `#142B87` | heading beraksen |
| `brand-950` | `#112772` | permukaan brand gelap |

### Neutral dan permukaan

| Token | Nilai | Penggunaan |
|---|---:|---|
| `white` | `#FFFFFF` | bidang bersih, logo inverse, input |
| `canvas` | `#F4F7FC` | latar aplikasi |
| `canvas-blue` | `#EEF4FF` | variasi latar section |
| `surface` | `#F9FBFF` | panel netral |
| `surface-raised` | `#FFFFFF` | modal/drawer dan kontrol penting |
| `ink-950` | `#17213D` | heading dan nominal utama |
| `ink-800` | `#2B3553` | body kuat |
| `ink-600` | `#5F6982` | body sekunder |
| `ink-500` | `#7B849B` | metadata |
| `ink-300` | `#B9C1D2` | placeholder |
| `line` | `#DCE4F2` | pemisah |
| `line-strong` | `#C7D3E7` | outline kontrol |

Putih adalah warna inti semua card standar. Card yang perlu menjadi fokus utama memakai `brand-600` solid dengan teks putih. Tint pastel tidak dipakai sebagai latar card; tint hanya untuk area grafik, selected state ringan, dekorasi kecil, dan empty state.

### Palet pastel fungsional

| Nama | Surface | Strong | Ink | Arti utama |
|---|---:|---:|---:|---|
| Blue | `#E7EFFF` | `#2860E6` | `#142B87` | brand, rekening, informasi |
| Mint | `#E5F7F1` | `#159B78` | `#0B6B54` | pemasukan, aman, berhasil |
| Coral | `#FFE9EC` | `#E95766` | `#B83547` | pengeluaran, risiko, gagal |
| Amber | `#FFF3D8` | `#D99418` | `#855A00` | peringatan, tagihan, jatuh tempo |
| Lavender | `#F0EAFE` | `#7B61D1` | `#5E46B8` | transfer, insight, agent |
| Cyan | `#E4F7FA` | `#168AA0` | `#0F6B7B` | analitik, arus, sinkronisasi |
| Peach | `#FFF0E5` | `#D87538` | `#9D4D20` | tujuan, milestone |

Rasio warna pada satu layar: sekitar 70% canvas dan card putih, 20% brand blue, dan maksimal 10% semantic strong. `Strong` dipakai untuk chart, badge, ikon, dan indikator. Tint pastel maksimal 8% dari suatu region dan tidak membentuk card mandiri. Gunakan `Ink` atau putih untuk teks kecil pada warna solid agar kontras memenuhi WCAG AA.

### Warna domain yang tetap

- Pemasukan: Mint.
- Pengeluaran: Coral.
- Transfer: Lavender.
- Tarik tunai: Blue.
- Penyesuaian kondisi saldo: Amber.
- Utang: Amber; status terlambat memakai Coral.
- Piutang: Cyan; berhasil dibayar memakai Mint.
- Agent/Hermes: Lavender dengan ikon spark, tanpa warna neon.
- Informasi sistem dan sinkronisasi: Blue atau Cyan.

Warna tidak boleh menjadi satu-satunya pembeda. Selalu sertakan label, ikon, pola garis, atau angka.

---

## 3. Tipografi

### Keluarga font

**Display dan heading: Bricolage Grotesque**
Karakter bentuknya ekspresif, membulat, dan terasa ceria tanpa terlihat kekanak-kanakan. Dipakai untuk hero, judul halaman, judul card besar, dan empty state.

**UI, body, dan angka: Plus Jakarta Sans**
Ramah, modern, mudah dibaca dalam Bahasa Indonesia, dan stabil pada tabel serta form. Gunakan fitur `tabular-nums` untuk nominal, tanggal, persentase, dan data chart.

Fallback: `"Segoe UI", system-ui, sans-serif`.

### Aturan font

- Maksimal dua keluarga font pada satu halaman.
- Heading memakai bobot 600–700. Hindari 800–900 kecuali hero landing.
- Body memakai 400 atau 500.
- Tombol dan label memakai 600.
- Angka finansial memakai `font-variant-numeric: tabular-nums lining-nums`.
- Jangan memakai italic untuk nominal atau status.
- Uppercase hanya untuk eyebrow pendek, maksimal 18 karakter, dengan tracking `0.08em`.
- Jangan mengecilkan body di bawah 14 px pada desktop atau mobile.

### Skala tipe

| Token | Desktop | Mobile | Line-height | Penggunaan |
|---|---:|---:|---:|---|
| `display-xl` | 56 | 40 | 1.04 | hero landing |
| `display-lg` | 44 | 34 | 1.08 | judul auth / campaign |
| `heading-xl` | 36 | 30 | 1.12 | judul halaman |
| `heading-lg` | 28 | 24 | 1.18 | judul section utama |
| `heading-md` | 22 | 20 | 1.25 | judul card |
| `heading-sm` | 18 | 17 | 1.3 | sub-card / modal |
| `body-lg` | 17 | 16 | 1.55 | intro |
| `body-md` | 15 | 15 | 1.55 | body default |
| `body-sm` | 13 | 13 | 1.45 | metadata |
| `label` | 12 | 12 | 1.35 | field label / eyebrow |
| `data-xl` | 46 | 34 | 1.08 | saldo utama |
| `data-lg` | 30 | 26 | 1.12 | ringkasan |
| `data-md` | 18 | 17 | 1.25 | row total |

Judul memakai sentence case. Contoh: “Arus kas bulan ini”, bukan “Arus Kas Bulan Ini”.

---

## 4. Spacing, grid, dan ukuran

Gunakan basis 4 px. Nilai utama: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.

### Container

- Lebar konten maksimum aplikasi: 1440 px.
- Lebar teks landing maksimum: 680 px.
- Gutter desktop: 32 px.
- Gutter tablet: 24 px.
- Gutter mobile: 16 px.
- Jarak antar-section desktop: 48–64 px.
- Jarak antar-section mobile: 32–40 px.

### Responsive grid

| Rentang | Kolom | Gap | Perilaku |
|---|---:|---:|---|
| `< 640` | 4 | 12–16 | stack, full width |
| `640–1023` | 8 | 16–20 | dua kolom bila aman |
| `1024–1439` | 12 | 20–24 | dashboard padat |
| `>= 1440` | 12 | 24 | konten dibatasi container |

Breakpoint mengikuti kebutuhan konten, bukan jenis perangkat. Tidak boleh ada horizontal scroll pada viewport 360 px.

### Bento dashboard

Dashboard memakai grid 12 kolom dengan baris dasar 88 px pada desktop. Widget dapat memakai ukuran:

- `S`: 3 kolom × 2 baris — metrik tunggal.
- `M`: 4 kolom × 3 baris — ringkasan dengan sparkline.
- `W`: 8 kolom × 3 baris — grafik horizontal.
- `L`: 6 kolom × 5 baris — kalender/tabel ringkas.
- `XL`: 12 kolom × 4–6 baris — analitik utama.

Pada mobile semua widget menjadi 4 kolom penuh. Pengurutan mobile disimpan terpisah dari ukuran desktop. Grid kosong saat drag menampilkan slot biru bertekstur halus, bukan kotak putus-putus tajam.

---

## 5. Bentuk dan material Soft Clay

Clay Pundi berasal dari bentuk tebal membulat, card putih atau biru brand solid, outline biru tipis, dan bayangan biru-abu yang lembut. Tidak memakai pasangan shadow gelap dan shadow putih besar seperti neumorphism lama.

### Radius

| Token | Nilai | Penggunaan |
|---|---:|---|
| `radius-xs` | 8 px | tooltip, badge kecil |
| `radius-sm` | 12 px | chip, button kecil |
| `radius-md` | 16 px | input, button, row interaktif |
| `radius-lg` | 22 px | card |
| `radius-xl` | 28 px | panel, drawer, auth shell |
| `radius-2xl` | 36 px | hero dan feature surface |
| `radius-full` | 999 px | avatar dan status chip |

### Elevasi

```css
--shadow-rest:
  0 2px 4px rgba(20, 43, 135, 0.04),
  0 10px 24px rgba(20, 43, 135, 0.07);

--shadow-raised:
  0 4px 8px rgba(17, 39, 114, 0.06),
  0 18px 42px rgba(17, 39, 114, 0.12);

--shadow-floating:
  0 12px 24px rgba(17, 39, 114, 0.10),
  0 28px 70px rgba(17, 39, 114, 0.16);

--shadow-pressed:
  inset 0 2px 6px rgba(17, 39, 114, 0.12);
```

Highlight putih bila diperlukan hanya berupa garis inset maksimal `rgba(255,255,255,0.35)`. Jangan membuat shadow putih eksternal.

### Formula card

- Hanya ada dua surface: `default` putih dan `highlight` Brand 600 solid.
- Card default memakai border `1px` Brand 600 pada opacity 10–12%.
- Card highlight memakai border Brand 700, teks putih, dan subteks putih pada opacity 70–80%.
- Radius 22–28 px.
- Padding 20–28 px.
- Shadow `rest`; hover `raised` hanya jika card dapat diklik.
- Card statis tidak bergerak saat hover.
- Maksimal dua tingkat card bersarang.
- Warna domain muncul pada grafik, ikon, progress, badge, atau data marker; bukan sebagai background card.
- Gradien warna dilarang pada card. Gradien hanya boleh dipakai sebagai fill grafik dengan perubahan opacity.

---

## 6. Ikonografi dan ilustrasi

- Gunakan Lucide sebagai keluarga ikon UI.
- Stroke default 1.75 px; 2 px untuk active state.
- Ukuran umum 16, 18, 20, dan 24 px.
- Ikon selalu memiliki `aria-hidden` bila label teks sudah menjelaskan fungsi.
- Icon-only button wajib memiliki tooltip dan accessible name.
- Gunakan simbol Pundi untuk identitas aplikasi, bukan sebagai ikon tindakan.
- Ilustrasi auth yang ada tetap dipakai dan hanya boleh ditingkatkan resolusi/kualitasnya tanpa mengubah komposisi.
- Ilustrasi landing harus menjelaskan alur finansial nyata: mencatat, memahami, merencanakan, dan mengambil tindakan.

---

## 7. Motion dan interaction

Motion harus terasa lembut, cepat, dan memiliki sebab.

| Token | Durasi | Penggunaan |
|---|---:|---|
| `instant` | 100 ms | pressed state |
| `fast` | 160 ms | hover, focus, tooltip |
| `normal` | 240 ms | dropdown, tabs, card state |
| `slow` | 360 ms | drawer, modal, panel auth |
| `emphasis` | 520 ms | perpindahan visual besar yang jarang |

Easing utama: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
Drag memakai spring teredam tanpa overshoot besar. Setelah dilepas, widget harus berhenti pada satu frame akhir tanpa koreksi posisi kedua.

Aturan:

- Jangan menganimasikan `width`, `height`, `top`, atau `left` bila transform dapat digunakan.
- Hover tidak boleh mengubah ukuran layout.
- Loading data memakai skeleton dengan bentuk yang sama seperti konten akhir.
- Hormati `prefers-reduced-motion` dan hilangkan perpindahan dekoratif.
- Mobile auth tidak memakai perpindahan panel; ilustrasi tetap di atas.
- Success boleh memakai micro-animation maksimal 600 ms satu kali.

---

## 8. Komponen inti

Setiap komponen harus memiliki state default, hover, focus-visible, active, disabled, loading, error bila relevan, serta perilaku mobile.

### Button

- Tinggi: 40, 44, atau 48 px.
- Primary: Brand 600, teks putih, hover Brand 700, pressed Brand 800.
- Secondary: Brand 900, teks putih, hover Brand 950.
- Tertiary: transparan, teks Brand 700.
- Destructive: Coral ink dengan teks putih, dipakai hanya untuk tindakan merusak.
- Tombol utama maksimal satu per region visual.
- Label berupa kata kerja: “Simpan transaksi”, “Tambah rekening”.
- Jangan menambahkan ikon bila tidak menambah pemahaman.

### Badge

- Badge status memakai warna solid, bukan tint pucat.
- Primary memakai Brand 600; neutral Brand 900; success Mint Ink; warning Amber Ink; danger Coral Ink.
- Teks selalu putih dan minimal `font-weight: 700`.
- Badge informatif tidak boleh terlihat seperti tombol; hindari elevasi dan ukuran berlebihan.

### Input

- Label selalu berada di luar field.
- Tinggi minimum 48 px; textarea minimum 104 px.
- Border default `line-strong`, background putih atau tint sangat lembut.
- Focus hanya mengubah border dan ring 3 px Brand 500 pada opacity 16%.
- Tidak boleh muncul outline/border browser kedua.
- Prefix/suffix tidak mengurangi ruang teks.
- Error menjelaskan cara memperbaiki, bukan hanya “Tidak valid”.

Auth memakai varian underline khusus: tidak ada container border; focus hanya menguatkan garis bawah.

### Select, date, account, dan category picker

- Jangan memakai native select mentah untuk UI utama.
- Trigger mengikuti ukuran input.
- Popover memakai surface-raised, radius 16–20 px, dan shadow raised.
- Pilihan aktif memakai Brand 100 dan teks Brand 900.
- Account option menampilkan nama, tipe, warna, dan saldo bila relevan.
- Date picker menampilkan format lokal Indonesia dan menyediakan input keyboard.

### Search

- Search field berdiri langsung dalam layout tanpa card pembungkus tambahan.
- Tinggi 44–48 px.
- Search memakai filled surface Brand 50 tanpa border dan tanpa underline.
- Focus tidak boleh memunculkan border, ring, shadow, atau kotak kedua pada elemen input; surface search tetap stabil saat mengetik.
- Clear action muncul setelah ada teks.
- Global search dapat menemukan transaksi, rekening, dan halaman; hasil dikelompokkan.
- Pencarian tabel hanya memfilter data tabel aktif.

### Table dan data list

- Header memakai warna solid atau tint medium dengan kontras jelas.
- Header tabel tidak memiliki hover state.
- Row memakai surface putih dengan separator yang rapi; warna semantic berada pada badge dan nominal, bukan garis di tepi baris.
- Hover memakai Brand 50 tanpa menggeser baris atau mengubah warna teks dan tombol di dalamnya.
- Tindakan “Lihat detail” tersedia dari setiap row.
- Desktop menampilkan maksimal 10 row per halaman secara default.
- Mobile berubah menjadi data list/card rows, bukan tabel yang dipaksa menyempit.
- Header tabel dapat sticky jika area scroll lebih dari satu viewport.
- Nominal rata kanan dan memakai tabular numerals.

### Card statistik

Minimal berisi label, nilai, konteks periode, dan visual pendukung yang relevan. Jangan membentangkan card tinggi bila hanya berisi dua baris teks. Sparkline harus memakai data asli, bukan dekorasi acak.

### Charts

- Gunakan warna domain tetap.
- Axis dan gridline lembut tetapi terbaca.
- Tooltip selalu menampilkan periode, nilai lengkap, dan satuan.
- Jangan memakai lebih dari enam kategori tanpa mekanisme “lainnya”.
- Donut dipakai untuk komposisi; line/area untuk tren; bar untuk perbandingan; progress untuk pencapaian.
- Setiap chart wajib memiliki ringkasan teks untuk aksesibilitas dan kondisi tanpa data.

### Modal, drawer, dan panel transaksi

- Modal untuk keputusan singkat atau konfirmasi.
- Drawer kanan untuk workflow desktop bertahap seperti transaksi.
- Mobile memakai bottom sheet atau full-screen sheet.
- Header dan footer tindakan tetap terlihat; body yang scroll.
- Escape, overlay click, dan focus trap harus konsisten.
- Tindakan destructive tidak boleh menjadi default focus.

### Feedback

- Toast untuk hasil aksi singkat.
- Inline message untuk kesalahan field atau masalah yang harus diperbaiki sebelum lanjut.
- Banner untuk status sistem yang memengaruhi satu halaman atau seluruh aplikasi.
- Empty state menjelaskan keadaan dan satu tindakan berikutnya.
- Skeleton tidak menampilkan angka palsu atau chart mock.

---

## 9. Pola halaman

### Landing page

- Pesan harus konkret tentang pencatatan uang, kondisi saldo, utang, tujuan, dan keputusan harian.
- Hero memiliki satu CTA utama dan satu CTA sekunder.
- Hindari klaim generik seperti “kelola keuangan lebih mudah” tanpa bukti fitur.
- Gunakan bento untuk menunjukkan alur produk, bukan memenuhi ruang.
- Section tersusun: masalah nyata → cara Pundi bekerja → fitur berdasarkan tugas → privasi/sinkronisasi → CTA.

### Auth

- Desktop: dua form tetap tersedia dalam layout dan panel ilustrasi biru bergerak menutupi sisi yang tidak aktif.
- Mobile: ilustrasi tetap di atas, form di bawah, tanpa animasi perpindahan panel.
- Form dan logo terpusat.
- Copy ringkas: “Login” dan “Daftar”.
- Input memakai underline variant.

### Application shell

- Sidebar menampung navigasi modul dan identitas workspace.
- Sidebar desktop memakai Brand 900 solid; bidang putih di belakang logo menyatu dari tepi atas lalu berakhir dalam siluet organik seperti cat tumpah. Bentuk ini bukan badge atau card mandiri.
- Item aktif sidebar memakai card putih dengan teks Brand 900; item tidak aktif memakai putih pada opacity 70%.
- Klik area logo membuka/menutup sidebar desktop.
- Header hanya memuat konteks akun, tanggal informatif, pencarian global, notifikasi, dan satu tindakan utama.
- Tidak boleh ada tindakan “Tambah transaksi” kedua pada body halaman yang sama.
- Mobile memakai bottom navigation untuk destinasi utama dan menu tambahan terpisah.

### Dashboard

- Widget dapat dipindah langsung dengan drag handle/cursor.
- Mode edit memperlihatkan puzzle grid dan opsi resize/hide/reset.
- Data prioritas muncul di atas: posisi kas, pemasukan/pengeluaran, kewajiban mendatang, dan anomali.
- Setiap ruang grid harus terisi oleh informasi bernilai atau layout mengecil secara otomatis.
- Preferensi layout disimpan per pengguna, workspace, dan breakpoint.

### CRUD pages

- Page header, summary strip, toolbar/filter, content, pagination.
- Add/edit memakai form yang sama dengan mode berbeda.
- Detail dapat dibuka tanpa kehilangan filter dan posisi halaman.
- Loading, empty, error, permission denied, dan offline harus dirancang.

---

## 10. Responsive dan touch

- Target sentuh minimum 44 × 44 px.
- Jarak antartarget minimal 8 px.
- Form mobile memakai satu kolom.
- Footer drawer tidak boleh tertutup safe area atau keyboard.
- Filter kompleks menjadi sheet; filter aktif tetap terlihat sebagai chips.
- Chart menyediakan ringkasan angka sebelum grafik pada mobile.
- Judul panjang boleh dua baris; nominal tidak boleh terpotong tanpa versi lengkap.
- Uji 360, 390, 768, 1024, 1280, dan 1440 px.

---

## 11. Accessibility

- Kontras teks normal minimal 4.5:1; teks besar minimal 3:1.
- Focus-visible harus jelas pada semua kontrol.
- Urutan tab mengikuti urutan visual.
- Semua field memiliki label programatik dan pesan error terkait.
- Dialog memiliki title, description, focus trap, dan pengembalian focus.
- Grafik memiliki nama, ringkasan, dan data alternatif yang dapat dibaca.
- Status tidak boleh bergantung hanya pada warna.
- Animasi menghormati reduced motion.
- Ikon dekoratif tidak dibacakan screen reader.

---

## 12. Content design

Gunakan Bahasa Indonesia yang langsung, singkat, dan manusiawi.

- “Simpan transaksi”, bukan “Submit”.
- “Saldo belum tersedia”, bukan “No data”.
- “Tidak dapat menyimpan transaksi. Periksa koneksi lalu coba lagi.”, bukan pesan teknis Appwrite.
- Pisahkan tanggal transaksi dan tanggal dicatat.
- Tampilkan konsekuensi sebelum tindakan penting: rekening asal berkurang, rekening tujuan bertambah.
- Jangan menyebut fitur tersedia bila backend atau permission belum siap.

Format:

- Mata uang: `Rp 1.250.000`.
- Nilai negatif: `−Rp 125.000`.
- Tanggal ringkas: `27 Sep 2026`.
- Tanggal lengkap: `27 September 2026`.
- Waktu: `18.24`.
- Persentase: satu desimal hanya jika bermakna.

---

## 13. Performa visual

- Gunakan SVG untuk logo dan ikon.
- Gambar raster memiliki ukuran intrinsik, `srcset`, dan format modern bila tersedia.
- Chart berat di-load saat mendekati viewport.
- Hindari backdrop blur pada daftar panjang.
- Animasi hanya memakai transform dan opacity bila memungkinkan.
- Skeleton mengikuti layout akhir agar tidak terjadi layout shift.
- Font dibatasi pada weight yang dipakai dan di-load melalui `next/font`.
- Widget dashboard di-memoize berdasarkan data yang dipakai.

---

## 14. Checklist penerimaan UI

Sebuah halaman belum selesai sebelum:

- [ ] mengikuti token warna dan tipe dokumen ini;
- [ ] tidak membuat komponen duplikat yang sudah tersedia;
- [ ] menggunakan data nyata atau state kosong, bukan mock tersembunyi;
- [ ] memiliki loading skeleton, empty, error, success, dan permission state;
- [ ] berfungsi dengan keyboard dan focus terlihat;
- [ ] tidak memiliki horizontal overflow pada 360 px;
- [ ] dapat dipakai pada 360, 390, 768, 1024, 1280, dan 1440 px;
- [ ] nominal dan tanggal memakai format Indonesia;
- [ ] hover tidak menggeser layout;
- [ ] reduced motion bekerja;
- [ ] tidak ada card kosong atau tinggi yang tidak sebanding dengan isi;
- [ ] semua aksi utama benar-benar terhubung ke fungsi;
- [ ] hasil lokal ditinjau sebelum commit atau push.
