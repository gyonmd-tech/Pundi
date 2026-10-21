# DBA — design-revamp
- Koleksi baru `chat_threads` (idx userId+lastMessageAt) & `chat_messages` (idx threadId+$createdAt, userId). `content` ≤12000 karakter. Dibuat lewat `npm run db:setup` (hanya menambah, aman untuk data produksi).
- Hapus thread menghapus pesan per batch 100 (maks 2000 pesan per thread).
