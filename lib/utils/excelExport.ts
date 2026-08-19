/**
 * lib/utils/excelExport.ts
 * Generate file Excel (.xlsx) profesional dengan template berformat rapih.
 *
 * Template Layout:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Row 1   PUNDI — Personal Finance Dashboard  [header brand] │
 * │  Row 2   Laporan Mutasi Transaksi             [sub-title]   │
 * │  Row 3   Periode:      [value]                              │
 * │  Row 4   Tanggal Ekspor: [value]                            │
 * │  Row 5   Filter Aktif: [value]                              │
 * │  Row 6   Jumlah Data:  [value]                              │
 * │  Row 7   (blank)                                            │
 * │  Row 8   No. | Tanggal | Jenis | ... | ID Ref   [header]   │
 * │  Row 9+  data rows (alternating row tint)                   │
 * │  Row N+1 (blank)                                            │
 * │  Row N+2 RINGKASAN                                          │
 * │  Row N+3 Total Pemasukan      | Rp xxx                      │
 * │  Row N+4 Total Pengeluaran    | Rp xxx                      │
 * │  Row N+5 Arus Kas Bersih      | Rp xxx                      │
 * │  Row N+6 Jumlah Transaksi     | xx transaksi                │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Warna mengikuti design system Pundi (DESIGN.md § 4.2):
 * - Pine   #1B4B3F  — header bar, total positif
 * - Ember  #9C4A2E  — total negatif
 * - Brass  #B08A3E  — sub-header accent
 * - Paper  #EEF1EF  — alternating row tint
 * - Rule   #C8CDC7  — border tipis
 */

import ExcelJS from "exceljs";

// ─── Warna Design System (Pundi tokens.css) ──────────────────────────────────
const COLORS = {
  pine:       "1B4B3F",
  pineTint:   "E8F0EE",
  ember:      "9C4A2E",
  emberTint:  "F5EAE6",
  brass:      "B08A3E",
  brassTint:  "F5EFE2",
  paper:      "EEF1EF",
  surface:    "FFFFFF",
  ink:        "16201D",
  inkMuted:   "5B655F",
  rule:       "C8CDC7",
};

// ─── Font Mono / Tabular Numerals ────────────────────────────────────────────
// ExcelJS tidak bisa embed font Google, gunakan Courier New sebagai mono fallback
const FONT_MONO = "Courier New";
const FONT_UI   = "Calibri";

export interface ExcelExportTransaction {
  date:        string;  // YYYY-MM-DD
  type:        "income" | "expense" | "transfer";
  typeLabel:   string;  // "Pemasukan" | "Pengeluaran" | "Transfer"
  amount:      number;  // raw number (signed: + income, - expense)
  accountName: string;
  category:    string;
  note:        string;
  tags:        string;
  id:          string;
}

export interface ExcelExportOptions {
  reportTitle:   string;
  period:        string;
  exportDate:    string;
  activeFilters: string;
  transactions:  ExcelExportTransaction[];
  totals: {
    income:   number;
    expense:  number;
    netFlow:  number;
    count:    number;
  };
}

/** Helper: set fill warna solid pada cell */
function fill(hex: string): ExcelJS.Fill {
  return {
    type:    "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${hex}` },
  };
}

/** Helper: border tipis hairline (rule) */
function thinBorder(color = COLORS.rule): Partial<ExcelJS.Borders> {
  const side: ExcelJS.BorderStyle = "thin";
  const c = { style: side, color: { argb: `FF${color}` } };
  return { top: c, left: c, bottom: c, right: c };
}

/** Helper: format number ke Rupiah string */
function fmtRupiah(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(abs);
  if (amount < 0)  return `-Rp ${formatted}`;
  if (amount > 0)  return `+Rp ${formatted}`;
  return `Rp ${formatted}`;
}

/**
 * Generate Blob berisi file .xlsx dan trigger download di browser.
 */
export async function downloadExcel(opts: ExcelExportOptions): Promise<void> {
  const workbook  = new ExcelJS.Workbook();

  workbook.creator  = "Pundi — Personal Finance Dashboard";
  workbook.created  = new Date();
  workbook.modified = new Date();

  // ── Sheet 1: Laporan Mutasi ─────────────────────────────────────────────────
  const sheet = workbook.addWorksheet("Mutasi Transaksi", {
    views: [{ state: "frozen", ySplit: 8 }], // freeze rows 1-8 (header)
    pageSetup: {
      orientation:    "landscape",
      paperSize:      9, // A4
      fitToPage:      true,
      fitToWidth:     1,
      fitToHeight:    0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
    headerFooter: {
      oddFooter: `&LPundi — Laporan Mutasi Transaksi&C&P / &N&R${opts.exportDate}`,
    },
  });

  // ── Lebar Kolom ─────────────────────────────────────────────────────────────
  const COL_COUNT = 9; // A=No, B=Tanggal, C=Jenis, D=Nominal, E=Akun, F=Kategori, G=Catatan, H=Tags, I=ID
  sheet.columns = [
    { key: "no",      width: 6  },   // A — No.
    { key: "date",    width: 14 },   // B — Tanggal
    { key: "type",    width: 14 },   // C — Jenis
    { key: "amount",  width: 22 },   // D — Nominal
    { key: "account", width: 22 },   // E — Akun
    { key: "cat",     width: 22 },   // F — Kategori
    { key: "note",    width: 32 },   // G — Catatan
    { key: "tags",    width: 20 },   // H — Tags
    { key: "id",      width: 28 },   // I — ID Referensi
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // BAGIAN 1 — HEADER BRAND (Baris 1-2)
  // ═══════════════════════════════════════════════════════════════════════════
  const r1 = sheet.getRow(1);
  r1.height = 28;
  sheet.mergeCells("A1:I1");
  const cellBrand = sheet.getCell("A1");
  cellBrand.value = "PUNDI — Personal Finance Dashboard";
  cellBrand.font  = { name: FONT_UI, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  cellBrand.fill  = fill(COLORS.pine);
  cellBrand.alignment = { vertical: "middle", horizontal: "left", indent: 2 };

  const r2 = sheet.getRow(2);
  r2.height = 20;
  sheet.mergeCells("A2:I2");
  const cellTitle = sheet.getCell("A2");
  cellTitle.value = opts.reportTitle;
  cellTitle.font  = { name: FONT_UI, size: 11, bold: true, color: { argb: `FF${COLORS.surface}` } };
  cellTitle.fill  = fill(COLORS.inkMuted);
  cellTitle.alignment = { vertical: "middle", horizontal: "left", indent: 2 };

  // ═══════════════════════════════════════════════════════════════════════════
  // BAGIAN 2 — METADATA (Baris 3-6)
  // ═══════════════════════════════════════════════════════════════════════════
  const metaItems = [
    ["Periode",         opts.period],
    ["Tanggal Ekspor",  opts.exportDate],
    ["Filter Aktif",    opts.activeFilters],
    ["Jumlah Data",     `${opts.totals.count} transaksi`],
  ];

  metaItems.forEach(([label, value], i) => {
    const rowNum = 3 + i;
    const row    = sheet.getRow(rowNum);
    row.height   = 16;

    // Merge label: A-B
    sheet.mergeCells(`A${rowNum}:B${rowNum}`);
    const labelCell = sheet.getCell(`A${rowNum}`);
    labelCell.value     = label;
    labelCell.font      = { name: FONT_UI, size: 10, bold: true, color: { argb: `FF${COLORS.ink}` } };
    labelCell.fill      = fill(COLORS.paper);
    labelCell.alignment = { vertical: "middle", horizontal: "right", indent: 1 };

    // Merge value: C-I
    sheet.mergeCells(`C${rowNum}:I${rowNum}`);
    const valueCell = sheet.getCell(`C${rowNum}`);
    valueCell.value     = value;
    valueCell.font      = { name: FONT_UI, size: 10, color: { argb: `FF${COLORS.ink}` } };
    valueCell.fill      = fill(COLORS.surface);
    valueCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

    // Border bawah tipis sebagai "ledger line"
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = { bottom: { style: "thin", color: { argb: `FF${COLORS.rule}` } } };
    });
  });

  // Row 7: blank spacer
  sheet.getRow(7).height = 6;

  // ═══════════════════════════════════════════════════════════════════════════
  // BAGIAN 3 — HEADER TABEL (Baris 8)
  // ═══════════════════════════════════════════════════════════════════════════
  const headerRow = sheet.getRow(8);
  headerRow.height = 22;
  const columnHeaders = [
    "No.", "Tanggal", "Jenis Transaksi", "Nominal (IDR)",
    "Akun / Dompet", "Kategori", "Catatan / Deskripsi", "Tags", "ID Referensi",
  ];
  columnHeaders.forEach((text, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.value = text;
    cell.font  = { name: FONT_UI, size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill  = fill(COLORS.pine);
    cell.alignment = {
      vertical: "middle",
      horizontal: colIdx === 3 ? "right" : colIdx === 0 ? "center" : "left",
      indent: colIdx > 0 && colIdx !== 3 ? 1 : 0,
    };
    cell.border = thinBorder(COLORS.pine);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BAGIAN 4 — DATA ROWS (Baris 9+)
  // ═══════════════════════════════════════════════════════════════════════════
  opts.transactions.forEach((tx, idx) => {
    const rowNum  = 9 + idx;
    const dataRow = sheet.getRow(rowNum);
    dataRow.height = 15;

    const isEven    = idx % 2 === 1;
    const rowFill   = isEven ? fill(COLORS.paper) : fill(COLORS.surface);

    // Tentukan warna nominal berdasarkan tipe
    const amountColor =
      tx.type === "income"   ? COLORS.pine  :
      tx.type === "expense"  ? COLORS.ember :
      COLORS.inkMuted;

    // Nilai-nilai sel
    const cells: { value: ExcelJS.CellValue; fmt?: string; mono?: boolean; align?: ExcelJS.Alignment["horizontal"]; color?: string }[] = [
      { value: idx + 1,           align: "center" },                    // A — No.
      { value: tx.date,           align: "left", mono: true },          // B — Tanggal
      { value: tx.typeLabel,      align: "left" },                      // C — Jenis
      { value: tx.amount,         align: "right", mono: true, color: amountColor, fmt: `[>=0]"+Rp "#,##0;"-Rp "#,##0` }, // D — Nominal
      { value: tx.accountName,    align: "left" },                      // E — Akun
      { value: tx.category,       align: "left" },                      // F — Kategori
      { value: tx.note,           align: "left" },                      // G — Catatan
      { value: tx.tags,           align: "left" },                      // H — Tags
      { value: tx.id,             align: "left", mono: true },          // I — ID
    ];

    cells.forEach((c, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      cell.value     = c.value;
      cell.fill      = rowFill;
      cell.font      = {
        name:  c.mono ? FONT_MONO : FONT_UI,
        size:  c.mono ? 9 : 10,
        color: { argb: `FF${c.color ?? COLORS.ink}` },
      };
      cell.alignment = {
        vertical:   "middle",
        horizontal: c.align ?? "left",
        indent:     (c.align === "left" && colIdx > 0) ? 1 : 0,
        wrapText:   colIdx === 6, // wrap Catatan saja
      };
      if (c.fmt) cell.numFmt = c.fmt;
      // Border bawah tipis (ledger line)
      cell.border = { bottom: { style: "thin", color: { argb: `FF${COLORS.rule}` } } };
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BAGIAN 5 — RINGKASAN TOTALS
  // ═══════════════════════════════════════════════════════════════════════════
  const summaryStartRow = 9 + opts.transactions.length + 1; // blank row dulu

  // Blank spacer row
  sheet.getRow(summaryStartRow - 1).height = 8;

  // Header "RINGKASAN"
  const summaryHeaderRow = sheet.getRow(summaryStartRow);
  summaryHeaderRow.height = 20;
  sheet.mergeCells(`A${summaryStartRow}:I${summaryStartRow}`);
  const summaryHeaderCell = sheet.getCell(`A${summaryStartRow}`);
  summaryHeaderCell.value = "RINGKASAN";
  summaryHeaderCell.font  = { name: FONT_UI, size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  summaryHeaderCell.fill  = fill(COLORS.brass);
  summaryHeaderCell.alignment = { vertical: "middle", horizontal: "left", indent: 2 };

  const summaryItems = [
    { label: "Total Pemasukan",    value: opts.totals.income,   color: COLORS.pine  },
    { label: "Total Pengeluaran",  value: -opts.totals.expense, color: COLORS.ember },
    { label: "Arus Kas Bersih",    value: opts.totals.netFlow,  color: opts.totals.netFlow >= 0 ? COLORS.pine : COLORS.ember },
    { label: "Jumlah Transaksi",   value: null,                  color: COLORS.ink,   text: `${opts.totals.count} transaksi` },
  ];

  summaryItems.forEach((item, i) => {
    const rowNum    = summaryStartRow + 1 + i;
    const itemRow   = sheet.getRow(rowNum);
    itemRow.height  = 17;

    // Label: A-D
    sheet.mergeCells(`A${rowNum}:D${rowNum}`);
    const labelCell = sheet.getCell(`A${rowNum}`);
    labelCell.value     = item.label;
    labelCell.font      = { name: FONT_UI, size: 10, bold: true, color: { argb: `FF${COLORS.ink}` } };
    labelCell.fill      = fill(COLORS.paper);
    labelCell.alignment = { vertical: "middle", horizontal: "right", indent: 2 };
    labelCell.border    = { bottom: { style: "thin", color: { argb: `FF${COLORS.rule}` } } };

    // Value: E-I
    sheet.mergeCells(`E${rowNum}:I${rowNum}`);
    const valueCell = sheet.getCell(`E${rowNum}`);
    if (item.text) {
      valueCell.value = item.text;
      valueCell.numFmt = "";
    } else {
      valueCell.value  = item.value;
      valueCell.numFmt = `[>=0]"+Rp "#,##0;"-Rp "#,##0`;
    }
    valueCell.font      = { name: FONT_MONO, size: 10, bold: true, color: { argb: `FF${item.color}` } };
    valueCell.fill      = fill(COLORS.surface);
    valueCell.alignment = { vertical: "middle", horizontal: "left", indent: 2 };
    valueCell.border    = { bottom: { style: "thin", color: { argb: `FF${COLORS.rule}` } } };
  });

  // ── Footer baris terakhir ──────────────────────────────────────────────────
  const footerRow = summaryStartRow + 1 + summaryItems.length + 1;
  sheet.mergeCells(`A${footerRow}:I${footerRow}`);
  const footerCell = sheet.getCell(`A${footerRow}`);
  footerCell.value = `Diekspor dari Pundi — Personal Finance Dashboard  •  ${opts.exportDate}`;
  footerCell.font  = { name: FONT_UI, size: 9, italic: true, color: { argb: `FF${COLORS.inkMuted}` } };
  footerCell.alignment = { horizontal: "center", vertical: "middle" };

  // ── Sheet 2: Legenda Warna ─────────────────────────────────────────────────
  const legendSheet = workbook.addWorksheet("Legenda", { state: "visible" });
  legendSheet.columns = [{ width: 22 }, { width: 30 }];

  const legendHeader = legendSheet.getRow(1);
  legendSheet.mergeCells("A1:B1");
  legendHeader.getCell(1).value = "Legenda Warna Kolom Nominal";
  legendHeader.getCell(1).font  = { name: FONT_UI, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  legendHeader.getCell(1).fill  = fill(COLORS.ink);
  legendHeader.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
  legendHeader.height = 20;

  const legendItems = [
    { label: "Pemasukan (+)",     color: COLORS.pine,  desc: "Saldo masuk ke akun" },
    { label: "Pengeluaran (−)",   color: COLORS.ember, desc: "Saldo keluar dari akun" },
    { label: "Transfer",          color: COLORS.inkMuted, desc: "Pindah antar akun (netral)" },
  ];
  legendItems.forEach((leg, i) => {
    const r = legendSheet.getRow(2 + i);
    r.height = 16;
    r.getCell(1).value = leg.label;
    r.getCell(1).font  = { name: FONT_UI, size: 10, bold: true, color: { argb: `FF${leg.color}` } };
    r.getCell(1).fill  = fill(COLORS.paper);
    r.getCell(1).border = thinBorder();
    r.getCell(2).value = leg.desc;
    r.getCell(2).font  = { name: FONT_UI, size: 10, color: { argb: `FF${COLORS.ink}` } };
    r.getCell(2).fill  = fill(COLORS.surface);
    r.getCell(2).border = thinBorder();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE & DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════════════
  const buffer = await workbook.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `pundi-mutasi-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 200);
}
