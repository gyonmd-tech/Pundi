/**
 * lib/utils/safeToSpend.ts
 * "Aman Dibelanjakan Hari Ini" — angka tunggal yang menjawab pertanyaan
 * paling sering ditanyakan sebelum belanja: uang bebas (di luar tagihan
 * dan rencana anggaran yang sudah dijanjikan) dibagi rata sisa hari bulan
 * ini. Murni perhitungan turunan dari data yang sudah dimuat di client
 * store — tidak ada query/skema baru.
 */
import { daysInMonth } from "@/lib/utils/recurrence";
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

function isSameMonth(date: Date, target: Date) {
  return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth();
}

export function computeSafeToSpend(
  accounts: Account[],
  budgets: Budget[],
  transactions: Transaction[],
  recurringRules: RecurringRule[],
  now: Date = new Date(),
): SafeToSpendResult {
  const liquidBalance = accounts
    .filter((account) => account.isActive && LIQUID_ACCOUNT_TYPES.includes(account.type))
    .reduce((sum, account) => sum + account.balance, 0);

  const endOfMonth = new Date(now.getFullYear(), now.getMonth(), daysInMonth(now.getFullYear(), now.getMonth()), 23, 59, 59);
  const upcomingBills = recurringRules
    .filter((rule) => rule.isActive && rule.type === "expense")
    .filter((rule) => {
      const next = new Date(rule.nextOccurrence);
      return next >= now && next <= endOfMonth;
    })
    .reduce((sum, rule) => sum + rule.amount, 0);

  const period = now.toISOString().slice(0, 7);
  const budgetReserved = budgets
    .filter((budget) => budget.period === period)
    .reduce((sum, budget) => {
      const spent = transactions
        .filter((t) =>
          t.type === "expense" &&
          t.recordKind !== "balance_adjustment" &&
          t.categoryId === budget.categoryId &&
          isSameMonth(new Date(t.date), now)
        )
        .reduce((s, t) => s + t.amount, 0);
      return sum + Math.max(0, budget.limitAmount - spent);
    }, 0);

  const daysRemaining = daysInMonth(now.getFullYear(), now.getMonth()) - now.getDate() + 1;
  const freeAmount = liquidBalance - upcomingBills - budgetReserved;
  const isOverExtended = freeAmount < 0;
  const perDay = isOverExtended || daysRemaining <= 0 ? 0 : Math.floor(freeAmount / daysRemaining);

  return { liquidBalance, upcomingBills, budgetReserved, daysRemaining, freeAmount, perDay, isOverExtended };
}
