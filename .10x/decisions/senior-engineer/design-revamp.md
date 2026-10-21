# Senior Engineer — design-revamp

- **Popover:** hook `usePortalPosition(triggerRef, open, {maxHeight, offset})` → `{top,left,width,maxHeight,placement}`; listener scroll (capture) + resize + visualViewport. Klik luar: `trigger.contains || panel.contains`.
- **Markdown:** tokenisasi per baris (daftar/paragraf) lalu inline (`**`, `*`, `` ` ``); React meng-escape teks otomatis.
- **History:** simpan pesan asisten di blok `finally` stream server agar tetap tersimpan saat klien abort.
- **Wizard anggaran:** state lokal per langkah, validasi per langkah, simpan memakai aksi `upsertBudget` yang sudah ada.
