/**
 * lib/utils/csvExport.ts
 * Utility untuk menghasilkan file CSV yang rapih dan profesional.
 *
 * Fitur:
 * - BOM (Byte Order Mark) UTF-8 agar terbaca benar di Microsoft Excel & Numbers
 * - Header metadata laporan (nama perusahaan, periode, tanggal ekspor)
 * - Baris total ringkasan di bawah tabel data
 * - Kolom nomor urut
 * - Format Rupiah di kolom nominal (angka saja, tanpa "Rp" agar bisa dihitung Excel)
 * - Escape otomatis karakter koma, petik, dan newline dalam nilai sel
 *
 * (DESIGN.md § Tabular Numerals: angka harus rata dan konsisten)
 */

export interface CsvRow {
  [key: string]: string | number;
}

/** Escape satu nilai sel CSV secara aman (RFC 4180) */
function escapeCsvCell(value: string | number): string {
  const str = String(value ?? "");
  // Jika mengandung koma, petik ganda, atau newline — bungkus dengan petik ganda
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Join satu baris CSV dari array nilai */
function buildCsvRow(cells: (string | number)[]): string {
  return cells.map(escapeCsvCell).join(",");
}

export interface ExportCsvOptions {
  /** Nama aplikasi / pembuat laporan */
  appName?: string;
  /** Judul laporan (mis. "Laporan Mutasi Transaksi") */
  reportTitle: string;
  /** Periode laporan (mis. "Maret 2026 – Agustus 2026") */
  period?: string;
  /** Filter aktif yang dipakai saat ekspor (mis. "Jenis: Pengeluaran | Akun: BCA") */
  activeFilters?: string;
  /** Header kolom tabel */
  headers: string[];
  /** Baris data */
  rows: (string | number)[][];
  /** Baris total/ringkasan di bagian bawah (opsional) */
  summaryRows?: { label: string; value: string }[];
}

/**
 * Bangun string CSV lengkap dari data yang diberikan.
 * Hasilnya mengandung BOM (\uFEFF) agar Excel membaca UTF-8 dengan benar.
 */
export function buildProfessionalCsv(opts: ExportCsvOptions): string {
  const {
    appName = "Pundi — Personal Finance Dashboard",
    reportTitle,
    period,
    activeFilters,
    headers,
    rows,
    summaryRows,
  } = opts;

  const now = new Date();
  const exportDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(now);

  const lines: string[] = [];

  // ── Bagian 1: Metadata Laporan ──────────────────────────────────────────────
  lines.push(buildCsvRow([appName]));
  lines.push(buildCsvRow([reportTitle]));
  if (period) {
    lines.push(buildCsvRow(["Periode", period]));
  }
  lines.push(buildCsvRow(["Tanggal Ekspor", exportDate]));
  if (activeFilters) {
    lines.push(buildCsvRow(["Filter Aktif", activeFilters]));
  }
  lines.push(buildCsvRow(["Jumlah Data", `${rows.length} transaksi`]));

  // Baris kosong pemisah
  lines.push("");

  // ── Bagian 2: Tabel Data ────────────────────────────────────────────────────
  // Header kolom
  lines.push(buildCsvRow(["No.", ...headers]));

  // Baris data dengan nomor urut
  rows.forEach((row, index) => {
    lines.push(buildCsvRow([index + 1, ...row]));
  });

  // ── Bagian 3: Ringkasan Totals (opsional) ──────────────────────────────────
  if (summaryRows && summaryRows.length > 0) {
    // Baris kosong pemisah
    lines.push("");
    lines.push(buildCsvRow(["RINGKASAN"]));
    summaryRows.forEach((s) => {
      lines.push(buildCsvRow([s.label, s.value]));
    });
  }

  // ── Bagian 4: Footer ────────────────────────────────────────────────────────
  lines.push("");
  lines.push(buildCsvRow(["--- Akhir Laporan ---"]));

  // Tambahkan BOM di awal agar Excel Windows bisa baca UTF-8
  return "\uFEFF" + lines.join("\n");
}

/**
 * Trigger download file CSV di browser.
 * Gunakan fungsi ini dari komponen client-side.
 */
export function downloadCsv(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Bersihkan object URL setelah download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
