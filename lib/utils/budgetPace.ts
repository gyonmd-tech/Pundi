/**
 * lib/utils/budgetPace.ts
 * Perhitungan anggaran berbasis waktu: jatah per hari / minggu / siklus.
 *
 * Semua dihitung di dalam SIKLUS berjalan (lib/utils/budgetCycle.ts) dan
 * hanya sejak anggaran berlaku (`startDate`): tidak ada jatah "mundur" dan
 * belanja sebelum anggaran dibuat tidak ikut dihitung. Bila anggaran punya
 * sumber dana (`accountIds`), hanya belanja dari rekening itu yang dihitung.
 *
 * Minggu dihitung Senin–Minggu dan dipotong di batas siklus/masa berlaku;
 * jatah minggu parsial diprorata per hari.
 */
import type { Budget, BudgetCadence, Transaction } from "@/lib/data/mock";
import { activeBudgetsFor, budgetStart, cycleFor, dailyRateFor, daysBetween, DEFAULT_CYCLE_DAY, startOfDay } from "@/lib/utils/budgetCycle";

export const CADENCE_LABEL: Record<BudgetCadence, { unit: string; per: string; current: string; adjective: string }> = {
  daily: { unit: "hari", per: "/hari", current: "hari ini", adjective: "Harian" },
  weekly: { unit: "minggu", per: "/minggu", current: "minggu ini", adjective: "Mingguan" },
  monthly: { unit: "siklus", per: "/siklus", current: "siklus ini", adjective: "Per siklus" },
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

export interface BudgetPace {
  cadence: BudgetCadence;
  cadenceAmount: number;
  rollover: boolean;
  /** Tanggal acuan: hari ini, dibatasi ke dalam masa berlaku di siklus ini. */
  refDate: Date;
  cycleStart: Date;
  cycleEnd: Date;
  /** Hari anggaran mulai dihitung di siklus ini (awal siklus atau startDate). */
  effectiveStart: Date;
  /** true bila anggaran baru mulai di tengah siklus berjalan. */
  startedMidCycle: boolean;
  /** Jumlah hari siklus (dipertahankan dengan nama lama). */
  daysInMonth: number;
  activeDays: number;
  /** Termasuk hari ini. */
  daysRemaining: number;
  /** Total terpakai di siklus ini (sejak berlaku). */
  monthSpent: number;
  /** Total jatah di siklus ini (prorata bila mulai di tengah siklus). */
  monthLimit: number;
  /** Jatah yang "seharusnya" sudah terpakai sampai akhir hari ini. */
  allowanceToDate: number;
  spentToDate: number;
  /** > 0 berarti lebih hemat dari jadwal, < 0 lebih boros. */
  aheadBy: number;
  /** Unit berjalan (hari ini / minggu ini / siklus ini). */
  unitAllowance: number;
  unitSpent: number;
  /** Sisa (+) atau kelebihan (−) dari unit-unit sebelumnya yang terbawa (0 bila rollover mati). */
  carryIn: number;
  unitAvailable: number;
  unitRemaining: number;
  unitDaysRemaining: number;
  /** Rekomendasi pemakaian per hari agar sisa siklus aman. */
  perDayLeft: number;
  /** Bisa dipakai hari ini — dipakai untuk ringkasan "aman hari ini". */
  todayAvailable: number;
  /** Pengeluaran 7 hari terakhir sejak berlaku (lama → baru), untuk grafik mini. */
  lastDays: Array<{ date: Date; spent: number; allowance: number }>;
  /** Pengeluaran per hari sepanjang siklus (index 0 = awal siklus). */
  perDay: number[];
}

export interface PaceOptions {
  now?: Date;
  cycleDay?: number;
}

/** Apakah transaksi dihitung untuk anggaran (kategori, jenis, sumber dana). */
export function countsForBudget(budget: Pick<Budget, "categoryId" | "accountIds">, transaction: Transaction) {
  if (transaction.type !== "expense" || transaction.categoryId !== budget.categoryId) return false;
  if (transaction.recordKind === "balance_adjustment") return false;
  if (budget.accountIds && budget.accountIds.length > 0 && !budget.accountIds.includes(transaction.accountId)) return false;
  return true;
}

export function computeBudgetPace(budget: Budget, transactions: Transaction[], nowOrOptions: Date | PaceOptions = {}): BudgetPace {
  const options = nowOrOptions instanceof Date ? { now: nowOrOptions } : nowOrOptions;
  const now = options.now ?? new Date();
  const cycleDay = options.cycleDay ?? DEFAULT_CYCLE_DAY;
  const cycle = cycleFor(now, cycleDay);
  const cadence = budgetCadence(budget);
  const cadenceAmount = cadenceAmountOf(budget);
  const rollover = cadence !== "monthly" && budget.rollover !== false;
  const { start, end, days } = cycle;

  const startDate = budgetStart(budget, cycleDay);
  const startIdx = Math.min(days - 1, Math.max(0, daysBetween(start, startDate)));
  const effectiveStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + startIdx);
  const activeDays = days - startIdx;
  const dailyRate = dailyRateFor(cadence, cadenceAmount, days);
  const monthLimit = Math.round(dailyRate * activeDays);

  const today = startOfDay(now);
  const refDate = today < effectiveStart ? effectiveStart : today > end ? end : today;
  const refIdx = daysBetween(start, refDate);
  const daysRemaining = days - refIdx;

  // Pengeluaran per hari dalam siklus, hanya sejak anggaran berlaku.
  const perDay = new Array<number>(days).fill(0);
  const endOfCycle = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
  for (const transaction of transactions) {
    if (!countsForBudget(budget, transaction)) continue;
    const date = new Date(transaction.date);
    if (date < effectiveStart || date > endOfCycle) continue;
    perDay[daysBetween(start, date)] += transaction.amount;
  }
  const sumRange = (from: number, to: number) => perDay.slice(Math.max(startIdx, from), Math.max(startIdx, to + 1)).reduce((a, b) => a + b, 0);
  const allowance = (from: number, to: number) => Math.round(dailyRate * Math.max(0, to - Math.max(startIdx, from) + 1));

  const monthSpent = sumRange(startIdx, days - 1);
  const spentToDate = sumRange(startIdx, refIdx);
  const allowanceToDate = allowance(startIdx, refIdx);

  // Unit berjalan (hari / minggu Senin–Minggu / siklus), dipotong ke masa berlaku.
  let unitStart = startIdx;
  let unitEnd = days - 1;
  if (cadence === "daily") {
    unitStart = refIdx;
    unitEnd = refIdx;
  } else if (cadence === "weekly") {
    const weekday = (refDate.getDay() + 6) % 7; // Senin = 0
    unitStart = Math.max(startIdx, refIdx - weekday);
    unitEnd = Math.min(days - 1, refIdx + (6 - weekday));
  }
  const unitAllowance = cadence === "monthly" ? monthLimit : allowance(unitStart, unitEnd);
  const unitSpent = sumRange(unitStart, unitEnd);
  const carryIn = rollover && unitStart > startIdx ? allowance(startIdx, unitStart - 1) - sumRange(startIdx, unitStart - 1) : 0;
  const unitAvailable = unitAllowance + carryIn;
  const unitRemaining = unitAvailable - unitSpent;
  const unitDaysRemaining = unitEnd - refIdx + 1;

  const perDayLeft = Math.max(0, Math.round((monthLimit - sumRange(startIdx, refIdx - 1)) / Math.max(1, daysRemaining)));
  const todayAvailable =
    cadence === "monthly"
      ? Math.max(0, perDayLeft - perDay[refIdx])
      : Math.max(0, Math.round(unitRemaining / Math.max(1, cadence === "daily" ? 1 : unitDaysRemaining)));

  const lastDays = [];
  for (let i = Math.max(startIdx, refIdx - 6); i <= refIdx; i += 1) {
    lastDays.push({ date: new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), spent: perDay[i], allowance: Math.round(dailyRate) });
  }

  return {
    cadence,
    cadenceAmount,
    rollover,
    refDate,
    cycleStart: start,
    cycleEnd: end,
    effectiveStart,
    startedMidCycle: startIdx > 0,
    daysInMonth: days,
    activeDays,
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
    perDay,
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

/** Anggaran aktif di siklus berjalan beserta lajunya — satu sumber untuk semua halaman. */
export function activeBudgetPaces<T extends Budget>(budgets: T[], transactions: Transaction[], options: PaceOptions = {}) {
  const now = options.now ?? new Date();
  const cycleDay = options.cycleDay ?? DEFAULT_CYCLE_DAY;
  const cycle = cycleFor(now, cycleDay);
  return activeBudgetsFor(budgets, cycle, cycleDay).map((budget) => ({
    budget,
    pace: computeBudgetPace(budget, transactions, { now, cycleDay }),
  }));
}
