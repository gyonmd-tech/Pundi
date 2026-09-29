/**
 * lib/utils/recurrence.ts
 * Perhitungan tanggal kejadian berikutnya untuk aturan transaksi berulang.
 */
import type { RecurringFrequency } from "@/lib/data/mock";

/** Jumlah hari pada bulan tertentu (0-indexed month, seperti Date). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Hitung kejadian berikutnya dari tanggal `from`, mempertahankan tanggal
 * (atau bulan+tanggal untuk tahunan) aslinya. Dipangkas ke hari terakhir
 * bulan tersebut jika bulan tujuan lebih pendek (mis. 31 Jan → 28/29 Feb).
 */
export function getNextOccurrence(from: Date, frequency: RecurringFrequency): Date {
  const day = from.getDate();

  if (frequency === "weekly") {
    const next = new Date(from);
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (frequency === "monthly") {
    const year = from.getFullYear();
    const month = from.getMonth() + 1;
    const targetYear = year + Math.floor(month / 12);
    const targetMonth = month % 12;
    const clampedDay = Math.min(day, daysInMonth(targetYear, targetMonth));
    return new Date(targetYear, targetMonth, clampedDay, from.getHours(), from.getMinutes(), from.getSeconds());
  }

  // yearly
  const targetYear = from.getFullYear() + 1;
  const month = from.getMonth();
  const clampedDay = Math.min(day, daysInMonth(targetYear, month));
  return new Date(targetYear, month, clampedDay, from.getHours(), from.getMinutes(), from.getSeconds());
}
