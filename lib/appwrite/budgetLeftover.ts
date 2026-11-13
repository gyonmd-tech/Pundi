/**
 * lib/appwrite/budgetLeftover.ts
 * Setor sisa jatah ke tujuan tabungan di akhir siklus.
 *
 * Untuk anggaran yang punya `leftoverGoalId`, sisa jatah (jatah − terpakai,
 * bila positif) dari siklus yang SUDAH berakhir ditambahkan ke currentAmount
 * tujuan. Dijalankan saat data pengguna dimuat (bootstrap), maksimal 3 siklus
 * ke belakang.
 *
 * IDEMPOTEN: setiap (anggaran, siklus) punya ID catatan deterministik di
 * koleksi budget_transfers (kind "goal"). Pemuatan bersamaan → yang kedua
 * kena 409 dan tidak menambah tujuan lagi. Catatan dibuat dulu, baru tujuan
 * dinaikkan secara atomik; bila kenaikan gagal, catatan dihapus agar bisa
 * dicoba lagi.
 *
 * Bukan file "use server".
 */
import { createHash } from "node:crypto";
import { Permission, Role } from "node-appwrite";
import type { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { recordAuditLog } from "@/lib/appwrite/auditLog";
import type { Budget, BudgetTransfer, Goal, Transaction } from "@/lib/data/mock";
import { budgetStart, cycleFor } from "@/lib/utils/budgetCycle";
import { computeBudgetPace } from "@/lib/utils/budgetPace";

type AdminDatabases = Awaited<ReturnType<typeof createAdminServerClient>>["databases"];

export const LEFTOVER_LOOKBACK_CYCLES = 3;

export function leftoverRecordId(budgetId: string, cycleKey: string) {
  return "g" + createHash("sha256").update(`${budgetId}|${cycleKey}`).digest("hex").slice(0, 35);
}

export interface LeftoverDeposit {
  budgetId: string;
  goalId: string;
  amount: number;
  cycleKey: string;
  record: BudgetTransfer;
}

export async function sweepBudgetLeftovers(
  databases: AdminDatabases,
  userId: string,
  data: { budgets: Budget[]; goals: Goal[]; transactions: Transaction[]; transfers: BudgetTransfer[]; cycleDay?: number },
  now: Date = new Date(),
): Promise<LeftoverDeposit[]> {
  const deposits: LeftoverDeposit[] = [];
  const goalIds = new Set(data.goals.map((goal) => goal.id));
  const done = new Set(data.transfers.filter((transfer) => transfer.kind === "goal").map((transfer) => transfer.id));

  for (const budget of data.budgets) {
    if (!budget.leftoverGoalId || !goalIds.has(budget.leftoverGoalId)) continue;

    let cycle = cycleFor(now, data.cycleDay);
    for (let step = 0; step < LEFTOVER_LOOKBACK_CYCLES; step++) {
      const lastDay = new Date(cycle.start.getFullYear(), cycle.start.getMonth(), cycle.start.getDate() - 1, 12);
      cycle = cycleFor(lastDay, data.cycleDay);
      if (budgetStart(budget, data.cycleDay) > cycle.end) break;
      if (budget.repeat === false && budgetStart(budget, data.cycleDay) < cycle.start) break;

      const id = leftoverRecordId(budget.id, cycle.key);
      if (done.has(id)) continue;
      const pace = computeBudgetPace(budget, data.transactions, { now: lastDay, cycleDay: data.cycleDay, transfers: data.transfers });
      const amount = pace.monthLimit - pace.monthSpent;
      if (amount <= 0) continue;

      const date = new Date(cycle.end.getFullYear(), cycle.end.getMonth(), cycle.end.getDate(), 23, 0, 0);
      try {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.BUDGET_TRANSFERS, id, {
          userId, fromBudgetId: budget.id, toBudgetId: budget.leftoverGoalId, amount, date: date.toISOString(), kind: "goal",
          note: `Sisa jatah siklus ${cycle.key}`,
        }, [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]);
      } catch (error) {
        if ((error as { code?: number })?.code === 409) continue; // sudah disetor oleh pemuatan lain
        console.error(`Gagal mencatat sisa jatah anggaran ${budget.id}:`, error instanceof Error ? error.message : error);
        break;
      }
      try {
        await databases.incrementDocumentAttribute({
          databaseId: DATABASE_ID, collectionId: COLLECTIONS.GOALS, documentId: budget.leftoverGoalId, attribute: "currentAmount", value: amount,
        });
      } catch (error) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.BUDGET_TRANSFERS, id).catch(() => undefined);
        console.error(`Gagal menambah tujuan ${budget.leftoverGoalId}:`, error instanceof Error ? error.message : error);
        break;
      }
      await recordAuditLog(databases, userId, {
        entityType: "goal", entityId: budget.leftoverGoalId, action: "generate", actor: "system",
        summary: `Sisa jatah Rp ${amount.toLocaleString("id-ID")} (siklus ${cycle.key}) disetor ke tujuan`,
        after: { budgetId: budget.id, amount, cycle: cycle.key },
      });
      deposits.push({
        budgetId: budget.id, goalId: budget.leftoverGoalId, amount, cycleKey: cycle.key,
        record: { id, fromBudgetId: budget.id, toBudgetId: budget.leftoverGoalId, amount, date, note: `Sisa jatah siklus ${cycle.key}`, kind: "goal" },
      });
    }
  }
  return deposits;
}
