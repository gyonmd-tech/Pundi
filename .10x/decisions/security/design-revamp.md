# Security — design-revamp

- **Paket A:** `ChatMarkdown` tidak memakai `dangerouslySetInnerHTML`; semua teks dirender sebagai node React (ter-escape). Uji: `<script>` dalam jawaban AI tampil sebagai teks. Tidak ada perubahan auth/API.
- **Paket B (rencana):** setiap akses thread/pesan wajib memverifikasi `userId` pemilik di server; konteks AI diambil dari server, bukan dari klien.
