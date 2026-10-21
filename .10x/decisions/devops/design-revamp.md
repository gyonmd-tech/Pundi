# DevOps — design-revamp

## Rilis
- 4 PR bertumpuk: #18 (A) → #19 (B) → #20 (C) → PR Paket D. Merge berurutan; GitHub otomatis mengarahkan PR berikutnya ke `main`.
- Vercel men-deploy otomatis dari `main`. Aplikasi mobile (Capacitor WebView) ikut terbarui tanpa rilis store.

## Langkah pasca-merge (wajib sekali)
- `npm run db:setup` — membuat koleksi `chat_threads` & `chat_messages` (Paket B). Hanya menambah; aman untuk data produksi. Tanpa ini, chat cloud membalas 503 "Riwayat chat belum disiapkan".

## Aset
- Video hero: `public/landing/hero-loop{,-mobile}.mp4` (1,6 MB / 1,3 MB, H.264) + poster JPG. Render ulang: `cd video && npm run render:hero`.
- Video cerita lama (`pundi-story*.mp4`) dihapus dari `public/` (tidak dipakai lagi); komposisinya tetap di `video/`.

## Rollback
- Revert merge commit paket yang bermasalah di `main`; Vercel men-deploy ulang otomatis. Koleksi Appwrite baru tidak perlu dihapus (tidak dipakai versi lama).
