# Handoff

## Current Handoff (QA → SDE/DevOps, 2026-11-08)
- Baca `.10x/decisions/qa/app-maturity.md`.
- Prioritas teknis: (1) saldo atomik via Appwrite transactions / incrementDocumentAttribute + uji konkurensi, (2) idempotensi recurring, (3) hilangkan batas 500 (paginasi/agregasi server), (4) CI + unit test logika uang, (5) performa mobile (data per halaman, chart lazy).
- Belum rilis-matang: 0 test otomatis; belum diuji di perangkat fisik maupun Appwrite asli.

## History

Semua paket selesai. Rilis: merge PR A → B → C → D berurutan, lalu `npm run db:setup` sekali (koleksi riwayat chat). Runbook: `.10x/decisions/sre/design-revamp.md`. Rollback: `.10x/decisions/devops/design-revamp.md`.
