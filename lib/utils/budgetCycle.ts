/**
 * lib/utils/budgetCycle.ts
 * Siklus anggaran dan anggaran yang aktif di sebuah siklus.
 *
 * Siklus dimulai di "tanggal gajian" pengguna (preferensi `budgetCycleDay`,
 * 1–28, atau 31 = akhir bulan; default 1 = bulan kalender). Contoh: tanggal
 * 25 → siklus 25 Okt – 24 Nov.
 *
 * Anggaran adalah ATURAN yang berlaku sejak `startDate` dan, bila `repeat`
 * tidak dimatikan, otomatis lanjut ke siklus berikutnya — tidak perlu dibuat
 * ulang tiap bulan. `period` tetap disimpan (kunci "YYYY-MM" siklus tempat
 * anggaran mulai) untuk kompatibilitas data lama dan indeks database.
 */
import type { Budget, BudgetCadence } from "@/lib/data/mock";

export const DEFAULT_CYCLE_DAY = 1;
export const END_OF_MONTH = 31;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface BudgetCycle {
  /** Hari pertama siklus (00:00 lokal). */
  start: Date;
  /** Hari terakhir siklus (00:00 lokal). */
  end: Date;
  days: number;
  /** "YYYY-MM" dari bulan tempat siklus dimulai. */
  key: string;
}

export function normalizeCycleDay(day: unknown): number {
  const value = Math.round(Number(day));
  if (value === END_OF_MONTH) return END_OF_MONTH;
  if (!Number.isFinite(value) || value < 1 || value > 28) return DEFAULT_CYCLE_DAY;
  return value;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Tanggal mulai siklus di bulan (year, month) — "akhir bulan" mengikuti panjang bulan. */
function cycleStartIn(year: number, month: number, cycleDay: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, cycleDay === END_OF_MONTH ? lastDay : Math.min(cycleDay, lastDay));
}

export function toPeriodKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Siklus yang memuat tanggal `date`. */
export function cycleFor(date: Date, cycleDay: number = DEFAULT_CYCLE_DAY): BudgetCycle {
  const day = normalizeCycleDay(cycleDay);
  const today = startOfDay(date);
  let start = cycleStartIn(today.getFullYear(), today.getMonth(), day);
  if (start > today) start = cycleStartIn(today.getFullYear(), today.getMonth() - 1, day);
  const nextStart = cycleStartIn(start.getFullYear(), start.getMonth() + 1, day);
  const end = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate() - 1);
  return { start, end, days: daysBetween(start, end) + 1, key: toPeriodKey(start) };
}

/** Siklus berikutnya setelah `cycle`. */
export function nextCycle(cycle: BudgetCycle, cycleDay: number = DEFAULT_CYCLE_DAY): BudgetCycle {
  return cycleFor(new Date(cycle.end.getFullYear(), cycle.end.getMonth(), cycle.end.getDate() + 1), cycleDay);
}

export function daysBetween(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

/** Awal siklus untuk kunci "YYYY-MM" (dipakai anggaran lama tanpa startDate). */
export function cycleStartForKey(key: string, cycleDay: number = DEFAULT_CYCLE_DAY) {
  const [year, month] = key.split("-").map(Number);
  return cycleStartIn(year, month - 1, normalizeCycleDay(cycleDay));
}

/** Tanggal anggaran mulai berlaku. */
export function budgetStart(budget: Pick<Budget, "startDate" | "period">, cycleDay: number = DEFAULT_CYCLE_DAY) {
  return budget.startDate ? startOfDay(new Date(budget.startDate)) : cycleStartForKey(budget.period, cycleDay);
}

/**
 * Satu anggaran aktif per kategori untuk siklus `cycle`: yang sudah mulai
 * paling lambat di akhir siklus, dan berulang atau memang dibuat untuk
 * siklus ini. Bila ada beberapa (mis. data lama per bulan), yang mulai
 * paling akhir yang dipakai.
 */
export function activeBudgetsFor<T extends Budget>(budgets: T[], cycle: BudgetCycle, cycleDay: number = DEFAULT_CYCLE_DAY): T[] {
  const chosen = new Map<string, T>();
  for (const budget of budgets) {
    const start = budgetStart(budget, cycleDay);
    if (start > cycle.end) continue;
    const startsInThisCycle = start >= cycle.start;
    if (budget.repeat === false && !startsInThisCycle && budget.period !== cycle.key) continue;
    const current = chosen.get(budget.categoryId);
    if (!current || budgetStart(current, cycleDay) <= start) chosen.set(budget.categoryId, budget);
  }
  return [...chosen.values()];
}

/** Anggaran yang baru mulai di siklus mendatang (dijadwalkan). */
export function scheduledBudgets<T extends Budget>(budgets: T[], cycle: BudgetCycle, cycleDay: number = DEFAULT_CYCLE_DAY): T[] {
  return budgets.filter((budget) => budgetStart(budget, cycleDay) > cycle.end);
}

/** Jatah per hari dari ritme dan nominalnya. */
export function dailyRateFor(cadence: BudgetCadence, amount: number, cycleDays: number) {
  if (cadence === "daily") return amount;
  if (cadence === "weekly") return amount / 7;
  return amount / cycleDays;
}

export function formatCycleRange(cycle: BudgetCycle) {
  const fmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
  return `${fmt.format(cycle.start)} – ${fmt.format(cycle.end)}`;
}
