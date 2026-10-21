# Penjaga — integrasi Hermes Agent

Penjaga adalah [Hermes Agent](https://hermes-agent.nousresearch.com) milikmu yang menjaga ruang keuangan Pundi.
Kamu cukup bercerita ("sarapan 15rb, bensin 30rb pakai cash"), lalu Hermes menyusun **draft** transaksi.
Saldo baru berubah setelah kamu menyetujui draft, baik lewat tombol **Simpan** di aplikasi maupun dengan menjawab "ya, simpan" di chat Hermes.
Pencatatan manual (tombol +) tetap berjalan seperti biasa.

```
Telegram / WhatsApp / CLI ──► Hermes Agent ──MCP──► Pundi /api/mcp ──► draft ──► (setuju) ──► transaksi
Panel Penjaga di app ──► /api/penjaga/chat ──► Hermes API server ──┘
```

## 1. Siapkan database

Dua koleksi baru, `agent_tokens` dan `agent_drafts`, sudah ditambahkan ke `appwrite.json`. Buat koleksinya di Appwrite dengan:

```bash
npm run db:setup
```

## 2. Hubungkan Hermes ke Pundi (MCP)

1. Masuk ke Pundi, buka **Penjaga → Hubungkan Hermes Agent → Buat token baru**. Token `pnd_…` hanya ditampilkan sekali.
2. Tambahkan ke `~/.hermes/config.yaml`:

   ```yaml
   mcp_servers:
     pundi:
       url: https://domain-pundi-kamu/api/mcp
       headers:
         Authorization: "Bearer pnd_TOKEN_KAMU"
   ```

3. Jalankan ulang `hermes gateway`. Tool yang tersedia:

   | Tool | Fungsi |
   | --- | --- |
   | `pundi_konteks` | Tanggal hari ini (WIB), rekening + saldo, kategori, jumlah draft |
   | `pundi_buat_draft` | Mengubah cerita menjadi draft (tidak mengubah saldo) |
   | `pundi_daftar_draft` | Daftar draft yang menunggu |
   | `pundi_konfirmasi_draft` | Menyimpan draft menjadi transaksi (hanya setelah persetujuan eksplisit) |
   | `pundi_tolak_draft` | Membuang draft |
   | `pundi_transaksi` | Transaksi tersimpan pada rentang tanggal |
   | `pundi_ringkasan` | Total masuk/keluar & kategori terbesar |

Token bisa dicabut kapan saja dari halaman yang sama. Setiap token terikat ke satu akun, dan semua aksi Hermes tercatat di **Pengaturan → Log aktivitas** dengan label *Penjaga*.

## 3. (Opsional) Chat Hermes langsung di aplikasi

1. Aktifkan API server Hermes di `~/.hermes/.env`:

   ```env
   API_SERVER_ENABLED=true
   API_SERVER_KEY=rahasia-panjang-acak
   ```

   API server mendengarkan di `127.0.0.1:8642`. Bila Pundi berjalan di Vercel, ekspos port tersebut secara aman, misalnya lewat Cloudflare Tunnel atau Tailscale Funnel dengan HTTPS.

2. Isi environment Pundi:

   ```env
   HERMES_API_URL=https://hermes.domainmu.com
   HERMES_API_KEY=rahasia-panjang-acak
   HERMES_MODEL=hermes-agent
   PENJAGA_OWNER_EMAILS=email-akun-pundimu@contoh.com
   ```

   `PENJAGA_OWNER_EMAILS` wajib diisi. Hermes memakai satu token MCP milik pemiliknya, jadi hanya pemilik yang boleh mengobrol dengannya dari aplikasi.

Setiap pengguna mendapat satu sesi Hermes per hari (`X-Hermes-Session-Id: pundi-<user>-<tanggal>`), sehingga "cerita hari ini" tetap utuh antar pesan.

## Mode demo

Tanpa akun (guest/demo), Penjaga berjalan sebagai **mode latihan**: cerita diurai secara lokal (`lib/penjaga/demoParser.ts`) supaya alurnya bisa dicoba tanpa Hermes.

## Video landing page

Video hero dibuat dengan Remotion di folder `video/`:

```bash
cd video
npm i
npm run dev      # Remotion Studio untuk mengedit
npm run render   # menulis public/landing/*.mp4|webm|jpg
```
