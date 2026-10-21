# Architect — design-revamp

- **A:** `components/ui/usePortalPosition.ts` (hook posisi + portal) dipakai `Select` dan `DatePicker`; `Modal` dan modal Anggaran → portal z-[80]. Markdown chat: `components/penjaga/ChatMarkdown.tsx` (parser → React nodes). Density: aturan mobile di `app/globals.css` + kelas komponen layout (Header, MobileBottomNav, padding main). ADR-001.
- **B:** `lib/penjaga/history.ts` (CRUD thread/pesan, verifikasi pemilik); route chat menerima `threadId`; Server Actions untuk daftar/ambil/hapus thread; UI `ChatHistory` (panel desktop / sheet mobile). ADR-002.
- **C:** `components/budget/BudgetWizard.tsx` (3 langkah) menggantikan form modal; `app/(app)/kalkulator` → hub + tampilan fokus.
- **D:** `components/landing/*` (HeroBackdrop, ScrollStory, header section seragam) + hook `useScrollProgress`; Remotion `HeroLoop`. ADR-003.

## Failure modes
- Portal saat SSR (tanpa `document`) → panel hanya dirender setelah mount.
- Penyimpanan history gagal → chat tetap berjalan, kegagalan dicatat di log server, UI tidak crash.
- Video gagal dimuat → poster.
