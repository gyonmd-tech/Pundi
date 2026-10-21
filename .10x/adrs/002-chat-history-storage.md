# ADR-002: History chat Penjaga disimpan server-side di Appwrite

**Status:** Accepted · **Date:** 2026-10-21 · **Feature:** design-revamp (Paket B) · **Author:** 10x-Team

## Context
Chat Penjaga hidup di state React; hilang saat reload dan tidak sinkron web ↔ HP. Pengguna memilih penyimpanan di akun cloud.

## Decision
Dua koleksi `chat_threads` & `chat_messages` (izin per pengguna). Route `/api/penjaga/chat` menerima `threadId`, menyimpan pesan pengguna sebelum memanggil AI dan jawaban asisten setelah stream selesai (juga bila klien terputus). Riwayat konteks AI dibaca dari server (12 pesan terakhir), bukan dari klien.

## Alternatives Considered
| Alternatif | Pro | Kontra | Kenapa tidak |
|---|---|---|---|
| localStorage | Sederhana | Tidak sinkron antar perangkat | Ditolak pengguna (dipakai hanya di mode demo) |
| Klien menyimpan via Server Action | Route tetap stateless | Jawaban hilang bila tab ditutup saat streaming; klien bisa memalsukan riwayat | Kurang andal |

## Consequences
- Positif: riwayat tahan reload & lintas perangkat; konteks AI tidak bisa dimanipulasi klien.
- Negatif: dua tulisan DB per pesan; perlu `npm run db:setup`.
- Risiko: akses thread milik orang lain → selalu verifikasi `userId` pemilik.
