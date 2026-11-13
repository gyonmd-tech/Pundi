/**
 * lib/utils/safeToSpend.ts
 * "Aman Dibelanjakan Hari Ini" — angka tunggal yang menjawab pertanyaan
 * paling sering ditanyakan sebelum belanja: uang bebas (di luar tagihan
 * dan sisa jatah anggaran yang sudah dijanjikan) dibagi rata sisa hari
 * siklus anggaran berjalan (lib/utils/budgetCycle.ts). Murni perhitungan
 * turunan dari data yang sudah dimuat di client store.
 */
import { cycleFor, daysBetween, DEFAULT_CYCLE_DAY } from "@/lib/utils/budgetCycle";
import { activeBudgetPaces } from "@/lib/utils/budgetPace";
import type { Account, Budget, RecurringRule, Transaction } from "@/lib/data/mock";

const LIQUID_ACCOUNT_TYPES: Account["type"][] = ["bank", "ewallet", "cash"];

export interface SafeToSpendResult {
  liquidBalance: number;
  upcomingBills: number;
  budgetReserved: number;
  daysRemaining: number;
  freeAmount: number;
  perDay: number;
  isOverExtended: boolean;
}

export function computeSafeToSpend(
  accounts: Account[],
  budgets: Budget[],
  transactions: Transaction[],
  recurringRules: RecurringRule[],
  now: Date = new Date(),
  cycleDay: number = DEFAULT_CYCLE_DAY,
): SafeToSpendResult {
  const cycle = cycleFor(now, cycleDay);
  const liquidBalance = accounts
    .filter((account) => account.isActive && LIQUID_ACCOUNT_TYPES.includes(account.type))
    .reduce((sum, account) => sum + account.balance, 0);

  const endOfCycle = new Date(cycle.end.getFullYear(), cycle.end.getMonth(), cycle.end.getDate(), 23, 59, 59);
  const upcomingBills = recurringRules
    .filter((rule) => rule.isActive && rule.type === "expense")
    .filter((rule) => {
      const next = new Date(rule.nextOccurrence);
      return next >= now && next <= endOfCycle;
    })
    .reduce((sum, rule) => sum + rule.amount, 0);

  const budgetReserved = activeBudgetPaces(budgets, transactions, { now, cycleDay })
    .reduce((sum, { pace }) => sum + Math.max(0, pace.monthLimit - pace.monthSpent), 0);

  const daysRemaining = daysBetween(now, cycle.end) + 1;
  const freeAmount = liquidBalance - upcomingBills - budgetReserved;
  const isOverExtended = freeAmount < 0;
  const perDay = isOverExtended || daysRemaining <= 0 ? 0 : Math.floor(freeAmount / daysRemaining);

  return { liquidBalance, upcomingBills, budgetReserved, daysRemaining, freeAmount, perDay, isOverExtended };
}
