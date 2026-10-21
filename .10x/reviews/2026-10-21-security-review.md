# Security Review — design-revamp (2026-10-21)
- **Riwayat chat:** setiap operasi thread/pesan memverifikasi `userId` pemilik di server (`getOwnedThread`); konteks AI dibaca dari DB, bukan dari klien → klien tidak bisa menyisipkan riwayat palsu. Pengguna demo tidak bisa memanggil route (401).
- **Markdown chat:** tanpa `dangerouslySetInnerHTML`; `<script>` ter-escape (diuji).
- **Input:** pesan dibatasi 4000 karakter, konten tersimpan ≤12000; rate limit chat 30/menit/pengguna.
- **Landing/video:** aset statis dari origin sendiri; tidak ada skrip pihak ketiga baru.
- Tidak ada perubahan pada auth, token MCP, atau izin Appwrite yang ada.
