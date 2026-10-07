# Pundi — Keuangan Pintar

Pundi adalah aplikasi pencatatan keuangan personal untuk mengelola transaksi, anggaran, arus kas, aset, tujuan, dan insight dalam satu dashboard responsif. Antarmuka memakai sistem desain Material modern dengan sentuhan claymorphism ringan, bento grid, grafik interaktif, serta panel transaksi yang dapat digunakan di desktop dan perangkat seluler.

## Fitur utama

- Dashboard ringkasan dengan grafik arus kas, kategori, saldo rekening, dan kalender finansial.
- Pencatatan pemasukan, pengeluaran, dan transfer melalui panel samping.
- Pengelolaan transaksi, anggaran, aset, tujuan, insight, dan preferensi.
- Pencarian global melalui header dan pintasan `Ctrl + K`.
- Mode demo lokal yang langsung dapat digunakan tanpa akun cloud.
- Integrasi Appwrite untuk autentikasi dan penyimpanan cloud.
- Ekspor data transaksi ke Excel.
- Layout responsif untuk desktop, tablet, dan ponsel.

## Persyaratan

- Node.js 20.9 atau lebih baru.
- npm.
- Proyek Appwrite hanya diperlukan untuk mode cloud. Mode demo tetap berjalan tanpa Appwrite.

## Menjalankan secara lokal

```bash
npm install
copy .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`. Pilih **Mode demo** pada halaman autentikasi untuk langsung menggunakan seluruh alur aplikasi dengan data contoh.

## Konfigurasi Appwrite

Isi `.env.local` dengan konfigurasi proyek Anda:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=pundi-db
APPWRITE_API_KEY=your_api_key_here
```

Setelah kredensial terisi dan proyek Appwrite aktif, buat database serta koleksi dengan:

```bash
npm run db:setup
```

API key hanya dipakai oleh skrip setup/server. Jangan memasukkan `.env` atau `.env.local` ke Git; keduanya sudah diabaikan melalui `.gitignore`.
Di Vercel, masukkan nilai environment sebagai teks polos tanpa tanda kutip pembuka/penutup. Pastikan proyek Appwrite berstatus aktif dan API key memiliki izin `users.write`, `databases.read`, serta `databases.write`.

## Aplikasi mobile

Pundi tersedia dalam dua bentuk aplikasi mobile, keduanya memakai kode web yang sama sehingga setiap deploy langsung memperbarui semua platform.

### 1. PWA (pasang dari browser)

Setelah web di-deploy lewat HTTPS, Pundi bisa langsung di-install:

- **Android / Chrome / Edge**: buka menu **Lainnya → Pasang aplikasi Pundi** di navigasi bawah, atau pilih *Install app* dari menu browser.
- **iPhone / iPad (Safari)**: ketuk **Bagikan → Tambah ke Layar Utama**.

Yang disertakan: manifest (`app/manifest.ts`) dengan ikon maskable dan shortcut "Tambah transaksi", service worker (`public/sw.js`) yang meng-cache aset statis, dan halaman `public/offline.html` saat koneksi terputus. Data keuangan tidak pernah di-cache — halaman selalu diambil dari jaringan. Service worker hanya aktif di build produksi (`npm run build && npm run start`).

### 2. Aplikasi native Android & iOS (Capacitor)

Folder `android/` dan `ios/` berisi proyek native yang membungkus Pundi dalam WebView layar penuh. Karena Pundi memakai Server Actions, aplikasi native memuat URL web yang sudah di-deploy.

```bash
# Android (butuh Android Studio)
PUNDI_APP_URL=https://pundi-kamu.vercel.app npm run mobile:android

# iOS (butuh macOS + Xcode)
PUNDI_APP_URL=https://pundi-kamu.vercel.app npm run mobile:ios
```

Perintah di atas menyinkronkan konfigurasi (`capacitor.config.ts`) lalu membuka proyek di Android Studio / Xcode untuk dijalankan di emulator, perangkat, atau dibuat file rilis (`.aab` untuk Play Store, archive untuk App Store). Di Windows (cmd), set variabel dulu: `set PUNDI_APP_URL=https://...` lalu `npm run mobile:android`. Ikon dan splash screen sudah memakai logo Pundi.

## Perintah proyek

```bash
npm run dev       # server pengembangan
npm run lint      # pemeriksaan ESLint
npm run build     # build produksi
npm run start     # menjalankan build produksi
npm run db:setup  # menyiapkan resource Appwrite
npm run mobile:sync     # sinkronkan konfigurasi ke proyek Android & iOS
npm run mobile:android  # buka proyek Android di Android Studio
npm run mobile:ios      # buka proyek iOS di Xcode
```

## Struktur utama

```text
app/                 route, layout, loading state, dan halaman
components/auth/     panel dan form autentikasi
components/layout/   sidebar, header, pencarian, notifikasi, panel kanan
components/ui/       komponen dasar: button, input, select, date picker, table
components/charts/   visualisasi data interaktif
components/dashboard/komponen khusus dashboard
components/settings/ komponen halaman pengaturan
lib/                 store data, Appwrite, context, dan utilitas
public/              logo, favicon, ilustrasi, dan aset brand
styles/              design tokens
android/, ios/       proyek native Capacitor
mobile/www/          halaman cadangan app native saat server tidak terjangkau
```

## Pemeriksaan sebelum rilis

```bash
npm run lint
npm run build
```

Build produksi mendukung semua route utama: `/`, `/login`, `/signup`, `/dashboard`, `/transaksi`, `/anggaran`, `/arus-kas`, `/aset`, `/tujuan`, `/insight`, dan `/pengaturan`.