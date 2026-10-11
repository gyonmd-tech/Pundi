/**
 * lib/utils/budgetPace.ts
 * Perhitungan anggaran berbasis waktu: jatah per hari / minggu / bulan.
 *
 * `limitAmount` pada Budget tetap berarti total sebulan (dipakai dashboard,
 * insight, dan safe-to-spend). Untuk anggaran harian/mingguan, nilai itu
 * diturunkan dari `cadenceAmount` lewat monthlyLimitFor(), sehingga semua
 * fitur lama tetap konsisten.
 *
 * Minggu dihitung Senin–Minggu dan dipotong di batas bulan; jatah minggu
 * parsial di awal/akhir bulan diprorata per hari.
 */
import type { Budget, BudgetCadence, Transaction } from "@/lib/data/mock";

export const CADENCE_LABEL: Record<BudgetCadence, { unit: string; per: string; current: string; adjective: string }> = {
  daily: { unit: "hari", per: "/hari", current: "hari ini", adjective: "Harian" },
  weekly: { unit: "minggu", per: "/minggu", current: "minggu ini", adjective: "Mingguan" },
  monthly: { unit: "bulan", per: "/bulan", current: "bulan ini", adjective: "Bulanan" },
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM" berdasarkan tanggal lokal (bukan UTC). */
export function toPeriod(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function periodBounds(period: string) {
  const [year, month] = period.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end, days: end.getDate() };
}

/** Total sebulan untuk jatah per hari/minggu/bulan. */
export function monthlyLimitFor(cadence: BudgetCadence, amount: number, period: string): number {
  const { days } = periodBounds(period);
  if (cadence === "daily") return Math.round(amount * days);
  if (cadence === "weekly") return Math.round((amount * days) / 7);
  return Math.round(amount);
}

export function budgetCadence(budget: Pick<Budget, "cadence">): BudgetCadence {
  return budget.cadence ?? "monthly";
}

/** Nominal jatah per unit waktunya (mis. Rp50.000 per hari). */
export function cadenceAmountOf(budget: Pick<Budget, "cadence" | "cadenceAmount" | "limitAmount" | "period">): number {
  const cadence = budgetCadence(budget);
  if (cadence === "monthly") return budget.limitAmount;
  if (budget.cadenceAmount && budget.cadenceAmount > 0) return budget.cadenceAmount;
  const { days } = periodBounds(budget.period);
  return Math.round(cadence === "daily" ? budget.limitAmount / days : (budget.limitAmount * 7) / days);
}

function dayIndex(date: Date, monthStart: Date) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((local.getTime() - monthStart.getTime()) / DAY_MS);
}

export interface BudgetPace {
  cadence: BudgetCadence;
  cadenceAmount: number;
  rollover: boolean;
  /** Tanggal acuan: hari ini, dibatasi ke dalam periode anggaran. */
  refDate: Date;
  daysInMonth: number;
  /** Termasuk hari ini. */
  daysRemaining: number;
  monthSpent: number;
  monthLimit: number;
  /** Jatah yang "seharusnya" sudah terpakai sampai akhir hari ini. */
  allowanceToDate: number;
  spentToDate: number;
  /** > 0 berarti lebih hemat dari jadwal, < 0 lebih boros. */
  aheadBy: number;
  /** Unit berjalan (hari ini / minggu ini / bulan ini). */
  unitAllowance: number;
  unitSpent: number;
  /** Sisa/lebih dari unit-unit sebelumnya yang terbawa (0 bila rollover mati). */
  carryIn: number;
  unitAvailable: number;
  unitRemaining: number;
  unitDaysRemaining: number;
  /** Rekomendasi pemakaian per hari agar sisa bulan aman. */
  perDayLeft: number;
  /** Bisa dipakai hari ini — dipakai untuk ringkasan "jatah hari ini". */
  todayAvailable: number;
  /** Pengeluaran 7 hari terakhir dalam periode (lama → baru), untuk grafik mini. */
  lastDays: Array<{ date: Date; spent: number; allowance: number }>;
}

export function computeBudgetPace(budget: Budget, transactions: Transaction[], now: Date = new Date()): BudgetPace {
  const cadence = budgetCadence(budget);
  const cadenceAmount = cadenceAmountOf(budget);
  const rollover = cadence !== "monthly" && budget.rollover !== false;
  const { start, end, days } = periodBounds(budget.period);
  const monthLimit = budget.limitAmount;
  const dailyRate = monthLimit / days;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const refDate = today < start ? start : today > end ? end : today;
  const refIdx = dayIndex(refDate, start);
  const daysRemaining = days - refIdx;

  // Pengeluaran per hari dalam bulan ini untuk kategori anggaran.
  const perDay = new Array<number>(days).fill(0);
  for (const transaction of transactions) {
    if (transaction.type !== "expense" || transaction.categoryId !== budget.categoryId) continue;
    const date = new Date(transaction.date);
    if (date < start || date > new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)) continue;
    perDay[dayIndex(date, start)] += transaction.amount;
  }
  const sumRange = (from: number, to: number) => perDay.slice(Math.max(0, from), Math.max(0, to + 1)).reduce((a, b) => a + b, 0);

  const monthSpent = sumRange(0, days - 1);
  const spentToDate = sumRange(0, refIdx);
  const allowanceToDate = Math.round(dailyRate * (refIdx + 1));

  // Unit berjalan.
  let unitStart = 0;
  let unitEnd = days - 1;
  if (cadence === "daily") {
    unitStart = refIdx;
    unitEnd = refIdx;
  } else if (cadence === "weekly") {
    const weekday = (refDate.getDay() + 6) % 7; // Senin = 0
    unitStart = Math.max(0, refIdx - weekday);
    unitEnd = Math.min(days - 1, refIdx + (6 - weekday));
  }
  const unitLength = unitEnd - unitStart + 1;
  const unitAllowance = cadence === "monthly" ? monthLimit : Math.round(dailyRate * unitLength);
  const unitSpent = sumRange(unitStart, unitEnd);
  const carryIn = rollover ? Math.round(dailyRate * unitStart) - sumRange(0, unitStart - 1) : 0;
  const unitAvailable = unitAllowance + carryIn;
  const unitRemaining = unitAvailable - unitSpent;
  const unitDaysRemaining = unitEnd - refIdx + 1;

  // Sisa anggaran per awal hari ini dibagi rata ke hari-hari yang tersisa.
  const perDayLeft = Math.max(0, Math.round((monthLimit - sumRange(0, refIdx - 1)) / Math.max(1, daysRemaining)));
  const todayAvailable =
    cadence === "monthly"
      ? Math.max(0, perDayLeft - perDay[refIdx])
      : Math.max(0, Math.round(unitRemaining / Math.max(1, cadence === "daily" ? 1 : unitDaysRemaining)));

  const lastDays = [];
  for (let i = Math.max(0, refIdx - 6); i <= refIdx; i += 1) {
    lastDays.push({ date: new Date(start.getFullYear(), start.getMonth(), i + 1), spent: perDay[i], allowance: Math.round(dailyRate) });
  }

  return {
    cadence,
    cadenceAmount,
    rollover,
    refDate,
    daysInMonth: days,
    daysRemaining,
    monthSpent,
    monthLimit,
    allowanceToDate,
    spentToDate,
    aheadBy: allowanceToDate - spentToDate,
    unitAllowance,
    unitSpent,
    carryIn,
    unitAvailable,
    unitRemaining,
    unitDaysRemaining,
    perDayLeft,
    todayAvailable,
    lastDays,
  };
}

/**
 * Rata-rata pengeluaran kategori per hari/minggu/bulan dari 3 bulan penuh
 * sebelum periode — dipakai sebagai saran nominal saat membuat anggaran.
 */
export function averageSpendFor(categoryId: string, cadence: BudgetCadence, transactions: Transaction[], period: string): number {
  const { start } = periodBounds(period);
  const from = new Date(start.getFullYear(), start.getMonth() - 3, 1);
  const total = transactions
    .filter((t) => t.type === "expense" && t.categoryId === categoryId)
    .filter((t) => {
      const date = new Date(t.date);
      return date >= from && date < start;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  if (!total) return 0;
  const days = Math.round((start.getTime() - from.getTime()) / DAY_MS);
  const perDay = total / days;
  const raw = cadence === "daily" ? perDay : cadence === "weekly" ? perDay * 7 : total / 3;
  // Bulatkan ke ribuan terdekat agar enak dibaca.
  return Math.max(1000, Math.round(raw / 1000) * 1000);
}
