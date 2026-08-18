/**
 * lib/utils/formatter.ts
 * Semua logic formatting terpusat di sini — jangan duplikasi di komponen lain.
 * (AGENTS.md § 3: Format Rupiah & tanggal terpusat di lib/utils/)
 */

/**
 * Format angka ke format Rupiah Indonesia.
 * Selalu gunakan fungsi ini — jangan tulis "Rp" manual di komponen.
 *
 * @example formatRupiah(24850000) → "Rp 24.850.000"
 * @example formatRupiah(-5640000) → "-Rp 5.640.000"
 */
export function formatRupiah(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) return "Rp 0";

  const isNegative = num < 0;
  const abs = Math.abs(num);

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);

  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Format angka ke format Rupiah singkat (untuk chart labels, badges).
 *
 * @example formatRupiahShort(24850000) → "Rp 24,8 jt"
 * @example formatRupiahShort(1500000000) → "Rp 1,5 M"
 */
export function formatRupiahShort(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rp 0";

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(0)} rb`;
  }
  return `${sign}Rp ${abs}`;
}

/**
 * Format tanggal ke format Indonesia.
 *
 * @example formatDate(new Date()) → "18 Agustus 2026"
 * @example formatDate(new Date(), "short") → "18 Agu 2026"
 * @example formatDate(new Date(), "time") → "18 Agu, 13.25"
 */
export function formatDate(
  date: Date | string,
  variant: "long" | "short" | "time" | "month" = "long"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (variant === "month") {
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(d);
  }

  if (variant === "time") {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  if (variant === "short") {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Format persentase.
 *
 * @example formatPercent(0.423) → "42,3%"
 * @example formatPercent(42.3, false) → "42,3%"
 */
export function formatPercent(
  value: number,
  isDecimal: boolean = true,
  decimals: number = 1
): string {
  const num = isDecimal ? value * 100 : value;
  return `${num.toFixed(decimals).replace(".", ",")}%`;
}

/**
 * Format delta (perubahan nilai) dengan tanda ▲/▼.
 *
 * @example formatDelta(4.2) → "▲ 4,2%"
 * @example formatDelta(-2.1) → "▼ 2,1%"
 */
export function formatDelta(percentChange: number): string {
  const abs = Math.abs(percentChange);
  const arrow = percentChange >= 0 ? "▲" : "▼";
  return `${arrow} ${abs.toFixed(1).replace(".", ",")}%`;
}

/**
 * Hitung persentase progress (untuk budget, goals).
 * Clamp antara 0–100.
 */
export function calcProgress(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

/**
 * Tentukan status budget berdasarkan persentase terpakai.
 * - safe: < 75%
 * - warning: 75% – 99%
 * - over: ≥ 100%
 */
export type BudgetStatus = "safe" | "warning" | "over";

export function getBudgetStatus(spent: number, limit: number): BudgetStatus {
  const pct = (spent / limit) * 100;
  if (pct >= 100) return "over";
  if (pct >= 75) return "warning";
  return "safe";
}

/**
 * Estimasi tanggal goal tercapai berdasarkan kecepatan menabung saat ini.
 * Returns null jika tidak cukup data atau kecepatan = 0.
 */
export function estimateGoalDate(
  current: number,
  target: number,
  monthlySavings: number
): Date | null {
  if (monthlySavings <= 0 || current >= target) return null;
  const remaining = target - current;
  const monthsNeeded = remaining / monthlySavings;
  const result = new Date();
  result.setMonth(result.getMonth() + Math.ceil(monthsNeeded));
  return result;
}
