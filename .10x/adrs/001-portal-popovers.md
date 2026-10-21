# ADR-001: Popover & modal dirender lewat portal

**Status:** Accepted · **Date:** 2026-10-21 · **Feature:** design-revamp (Paket A) · **Author:** 10x-Team

## Context
Panel `Select`/`DatePicker` memakai `position:absolute` di dalam parent. Banyak kartu memakai `overflow-hidden`/`overflow-auto`, sehingga panel terpotong (draft Penjaga, filter Transaksi). Modal halaman Anggaran berada di lapisan konten z-10 sehingga tertutup header.

## Decision
Render panel popover dan modal ke `document.body` via `createPortal`. Posisi `fixed` dihitung dari `getBoundingClientRect()` pemicu (flip atas/bawah, clamp ke viewport), diperbarui saat scroll (capture), resize, dan `visualViewport` resize. Modal memakai lapisan z-[80].

## Alternatives Considered
| Alternatif | Pro | Kontra | Kenapa tidak |
|---|---|---|---|
| Hapus overflow-hidden di parent | Tanpa kode baru | Merusak clip/radius, dicari satu per satu, rawan regresi | Tidak menyelesaikan akar |
| Library (Floating UI/Radix) | Matang | Dependensi baru, refactor API komponen | Kebutuhan cukup ±60 baris |
| CSS Anchor Positioning | Native | Dukungan Safari/WebView Android belum merata | App mobile = WebView |

## Consequences
- Positif: satu perbaikan untuk semua pemakai Select/DatePicker.
- Negatif: klik-luar & fokus keyboard harus menangani dua pohon DOM.
- Risiko: posisi meleset saat keyboard virtual muncul → hitung ulang saat `visualViewport` berubah.
