# SRE — design-revamp

## Titik rawan & sinyal
- **Chat Penjaga** (`/api/penjaga/chat`): kegagalan simpan jawaban dicatat `console.error("[penjaga] Gagal menyimpan jawaban…")` di log fungsi Vercel. Error penyedia AI tampil ke pengguna dengan pesan spesifik (kunci ditolak, kredit habis, model tidak ada + daftar model tersedia).
- **MCP** (`/api/mcp`): 401 token tidak valid, 503 bila koleksi belum siap; rate limit 60 panggilan/menit per pengguna.
- **Landing video**: bila MP4 gagal, poster tetap tampil (lapisan di bawah video).

## Runbook singkat
| Gejala | Penyebab umum | Tindakan |
|---|---|---|
| Chat: "Riwayat chat belum disiapkan" | Koleksi belum dibuat | `npm run db:setup` |
| Chat: "Model … tidak tersedia" | Penyedia menonaktifkan model | Ganti `PENJAGA_LLM_MODEL` ke salah satu yang ditampilkan, redeploy |
| Semua rute 404 di dev lokal | Cache `.next/dev` rusak setelah crash | Hentikan dev server, hapus `.next/dev`, jalankan ulang |
| Modal/dropdown terpotong lagi | Animasi dengan fill-mode `both`/`forwards` + transform pada wrapper | Gunakan `backwards` (lihat ADR-001 & motion.css) |

## Belum ada
- Monitoring/alert terpusat (hanya log Vercel). Rekomendasi lanjutan: Vercel Log Drains atau Sentry untuk route Penjaga.
