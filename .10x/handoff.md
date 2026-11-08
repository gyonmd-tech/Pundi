# Handoff

## Current Handoff (QA, 2026-11-08 — Fase 1+2 selesai)
- Detail hasil di `.10x/decisions/qa/app-maturity.md` bagian "Hasil Fase 1 + 2".
- Sebelum rilis: jalankan alur tambah/ubah/hapus transaksi sekali di Appwrite Cloud asli (memastikan increment/decrement tersedia), lalu uji di 1 Android + 1 iPhone.
- Berikutnya: Fase 3 (UX mobile per halaman, R4–R6), e2e Playwright di CI.

## Previous Handoff (QA → SDE/DevOps, 2026-11-08)
- Baca `.10x/decisions/qa/app-maturity.md`.
- Prioritas teknis: (1) saldo atomik via Appwrite transactions / incrementDocumentAttribute + uji konkurensi, (2) idempotensi recurring, (3) hilangkan batas 500 (paginasi/agregasi server), (4) CI + unit test logika uang, (5) performa mobile (data per halaman, chart lazy).
- Belum rilis-matang: 0 test otomatis; belum diuji di perangkat fisik maupun Appwrite asli.

## History

Semua paket selesai. Rilis: merge PR A → B → C → D berurutan, lalu `npm run db:setup` sekali (koleksi riwayat chat). Runbook: `.10x/decisions/sre/design-revamp.md`. Rollback: `.10x/decisions/devops/design-revamp.md`.
