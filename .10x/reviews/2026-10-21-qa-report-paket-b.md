# QA Report — Paket B (2026-10-21)
- tsc + eslint lolos.
- Mode demo (browser 1440 & 375): kirim pesan → thread dibuat, URL `?c=` terisi, tersimpan di localStorage; reload → percakapan & judul dipulihkan; panel kiri desktop dan sheet ponsel menampilkan grup "Hari ini"; markdown balasan tampil.
- **Belum diuji:** jalur cloud (Appwrite) end-to-end — butuh `npm run db:setup` di proyek produksi pengguna & login akun. Rute mengembalikan 503 bermakna bila koleksi belum ada.
