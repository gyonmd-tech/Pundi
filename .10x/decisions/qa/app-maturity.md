# QA — app-maturity (2026-11-08)

Tujuan: menilai kematangan Pundi (web + mobile) dan menyusun rencana uji & perbaikan
berbasis risiko. Sumber: pembacaan kode + build produksi lokal + uji Playwright (emulasi
Pixel 7 / iPhone 13, mode demo). Belum diuji terhadap Appwrite Cloud asli (tanpa kredensial)
dan belum di perangkat fisik.

## Peta sistem (ringkas)
- **Frontend:** Next.js 16 App Router. Seluruh `app/(app)/*` adalah Client Component di bawah
  `AppProvider` (lib/data/store.tsx) — satu `getAppBootstrapAction()` memuat SEMUA data
  pengguna (akun, kategori, 500 transaksi, budget, goal, aset, insight, utang, recurring,
  preferensi) lalu semua halaman menghitung di browser.
- **Backend:** Server Actions (`actions/*.ts`) memakai Appwrite **admin client (API key)** +
  pengecekan kepemilikan manual (`getOwnedDocument` / filter `userId`). API route: `/api/mcp`
  (Hermes, token Bearer) dan `/api/penjaga/chat` (NDJSON streaming).
- **Auth:** cookie httpOnly `pundi-session` berisi secret sesi Appwrite (7 hari). Demo =
  cookie `demo-session-token`, mutasi demo hanya di memori klien.
- **Mobile:** PWA (manifest + sw.js network-first) dan Capacitor yang memuat URL produksi
  di WebView (bukan bundle lokal). Tidak ada plugin native.

## Cakupan uji saat ini
- **Nol test otomatis**, tidak ada CI (`.github/` tidak ada). Gate yang ada hanya
  tsc + eslint + build + uji manual per paket (lihat design-revamp.md).

## Temuan berisiko (urut keparahan)
| # | Area | Temuan | Dampak |
|---|------|--------|--------|
| R1 | Integritas saldo | `applyBalanceChanges` = baca-lalu-tulis tanpa transaksi DB/atomic increment. Dua mutasi bersamaan (2 tab, Penjaga + app, recurring + input manual) → *lost update*, saldo salah permanen. Rollback juga menimpa dengan snapshot lama. | Tinggi — data keuangan salah tanpa terlihat |
| R2 | Recurring | Transaksi berulang dibuat saat bootstrap (setiap app dibuka). Tidak ada kunci/idempotensi → dua bootstrap paralel (tab ganda, refresh cepat, PWA+browser) bisa membuat transaksi ganda & saldo ganda. | Tinggi |
| R3 | Batas 500 | Bootstrap & `getTransactionsAction` ambil maks 500 transaksi; `createBalanceAdjustmentAction` menghitung delta dari maks 500 transaksi setelah tanggal. Pengguna aktif (>500 trx) → grafik/arus kas/anggaran tidak lengkap dan penyesuaian saldo salah hitung. | Tinggi untuk pengguna lama |
| R4 | Rate limit | In-memory per instance; di Vercel serverless praktis tidak efektif untuk login/signup/MCP/chat. | Sedang (brute force) |
| R5 | Signup | Jika seed kategori gagal, user Appwrite sudah dibuat + cookie terset tapi UI menampilkan error → retry signup gagal "email sudah ada". | Sedang |
| R6 | Avatar | File avatar `Permission.read(Role.any())` — publik bagi siapa pun yang tahu ID. | Rendah |
| R7 | Demo | Email `sarah@email.com` juga masuk mode demo (tak terdokumentasi). | Rendah |

## Beban mobile (build produksi, emulasi Pixel 7, mode demo, ukuran tak terkompresi)
| Rute | JS | Total |
|---|---|---|
| /dashboard | 1.229 KB | 1.570 KB |
| /penjaga | 1.070 KB | 1.389 KB |
| /anggaran | 778 KB | 1.092 KB |
| /transaksi | 742 KB | 1.056 KB |
- Tidak ada horizontal overflow di 4 rute di atas.
- Penyebab utama: semua halaman client-side + recharts (~340 KB) di dashboard + seluruh data
  dimuat sekaligus sebelum halaman apa pun tampil (`RouteSkeleton` sampai bootstrap selesai).
- exceljs sudah lazy-load (baik).

## Strategi uji yang direkomendasikan (Opsi B — lihat laporan)
1. Unit test (Vitest) untuk logika uang murni: `transactionHelpers` (getBalanceChanges,
   mergeChanges, negateChanges), `balanceReconciliation`, `recurrence`, `budgetPace`,
   `safeToSpend`, `moneyMath`, `penjaga/demoParser`, `penjaga/matching`, validasi zod.
2. Integration test Server Actions terhadap Appwrite **project uji terpisah**: create/update/
   delete transaksi → saldo; transfer dua sisi; recurring catch-up; ownership (user B tidak
   bisa ubah data user A); konkurensi (N mutasi paralel → saldo tepat).
3. E2E Playwright (sedikit, jalur P0) di viewport mobile: login → tambah transaksi → saldo
   berubah; mode demo; redirect mobile `/` → `/login`; logout.
4. CI GitHub Actions: lint + tsc + unit pada setiap PR; integration + e2e pada main/nightly.

## Quality gates (usulan)
- PR: lint, tsc, unit hijau, build sukses.
- Rilis: integration (termasuk uji konkurensi saldo) + e2e P0 hijau; budget JS mobile
  /dashboard ≤ 600 KB tak terkompresi; uji manual di 1 Android + 1 iPhone fisik.
- Bug produksi apa pun → test regresi sebelum fix di-merge.

## Status
Analisis selesai; menunggu keputusan pengguna soal prioritas (lihat handoff).

## Hasil Fase 1 + 2 (2026-11-08, branch claude/funny-rubin-vb2jww)
- R1 selesai: saldo via increment/decrement atomik; rollback membalik delta. Catatan kondisi, pembayaran utang (decrement min 0), kontribusi tujuan juga atomik.
- R2 selesai: transaksi berulang & insight memakai ID dokumen deterministik → idempoten saat pemuatan paralel.
- R3 selesai: listAllDocuments (cursor) menggantikan limit 500; hapus rekening cek riwayat langsung ke DB (bug baru ditemukan & diperbaiki).
- Test: 27 Vitest (unit + integrasi dengan fake Appwrite yang menyela operasi). Diverifikasi: dengan kode saldo lama, 50 pengeluaran paralel → 49 hilang (test merah); kode baru hijau.
- CI: .github/workflows/ci.yml (lint, typecheck, test, build).
- Performa (Pixel 7 emulasi, mode demo, JS tak terkompresi untuk tampil): dashboard 1.229→743 KB, penjaga 1.070→792 KB; transaksi/anggaran tetap ±740–775 KB. Chart dimuat saat mendekati layar; QuickAddPanel dimuat saat dibuka; zod dikeluarkan dari bundle klien.
- Belum: target 600 KB belum tercapai (sisa ±410 KB framework + layout bersama); belum diuji ke Appwrite asli (increment/decrement butuh Appwrite ≥1.7) dan belum di perangkat fisik; belum ada e2e Playwright di CI.
