# QA — index

## Fitur aktif
- `design-revamp` — paket A–D revamp desain (selesai, lihat design-revamp.md)
- `app-maturity` — analisis kematangan web+mobile & strategi uji (analisis selesai, menunggu prioritas)

## Prinsip lintas fitur
- Uji berbasis risiko: integritas saldo & kepemilikan data diuji sebelum UI.
- Logika uang murni → unit test; Server Action + Appwrite → integration test di project uji terpisah; e2e hanya jalur P0 di viewport mobile.
- Setiap bug produksi mendapat test regresi.
