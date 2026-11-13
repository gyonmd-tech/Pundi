/**
 * lib/appwrite/budgetMapper.ts
 * Dokumen Appwrite `budgets` → tipe Budget aplikasi. Satu tempat untuk
 * bootstrap (lib/appwrite/bootstrap.ts) dan actions/budgets.ts, supaya field
 * baru (startDate, repeat, accountIds) tidak terlewat di salah satunya.
 *
 * Bukan file "use server".
 */
import type { Models } from "node-appwrite";
import type { Budget, BudgetTransfer } from "@/lib/data/mock";

export interface BudgetFields {
  categoryId: string;
  period: string;
  limitAmount: number;
  cadence?: Budget["cadence"] | null;
  cadenceAmount?: number | null;
  rollover?: boolean | null;
  startDate?: string | null;
  repeat?: boolean | null;
  accountIds?: string[] | null;
  leftoverGoalId?: string | null;
}

export function budgetFromDocument(doc: Models.Document): Budget {
  const f = doc as unknown as BudgetFields;
  return {
    id: doc.$id,
    categoryId: f.categoryId,
    period: f.period,
    limitAmount: Number(f.limitAmount),
    cadence: f.cadence ?? "monthly",
    cadenceAmount: f.cadenceAmount ? Number(f.cadenceAmount) : undefined,
    rollover: f.rollover ?? true,
    startDate: f.startDate ? new Date(f.startDate) : undefined,
    repeat: f.repeat ?? true,
    accountIds: f.accountIds?.length ? f.accountIds : undefined,
    leftoverGoalId: f.leftoverGoalId || undefined,
  };
}

export function budgetTransferFromDocument(doc: Models.Document): BudgetTransfer {
  const f = doc as unknown as { fromBudgetId: string; toBudgetId: string; amount: number; date: string; note?: string | null; kind?: BudgetTransfer["kind"] | null };
  return {
    id: doc.$id,
    fromBudgetId: f.fromBudgetId,
    toBudgetId: f.toBudgetId,
    amount: Number(f.amount),
    date: new Date(f.date),
    note: f.note || undefined,
    kind: f.kind ?? "budget",
  };
}
