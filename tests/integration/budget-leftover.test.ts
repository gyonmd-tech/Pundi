import { beforeEach, describe, expect, it } from "vitest";
import { FakeDatabases } from "../helpers/fakeDatabases";
import { COLLECTIONS } from "@/lib/appwrite/collections";
import { sweepBudgetLeftovers } from "@/lib/appwrite/budgetLeftover";
import type { Budget, BudgetTransfer, Goal, Transaction } from "@/lib/data/mock";

type Dbs = Parameters<typeof sweepBudgetLeftovers>[0];
const d = (y: number, m: number, day: number, h = 12) => new Date(y, m - 1, day, h);

let db: FakeDatabases;
const goal = () => Number(db.get(COLLECTIONS.GOALS, "liburan")?.currentAmount);
const goals: Goal[] = [{ id: "liburan", name: "Liburan", targetAmount: 5_000_000, currentAmount: 0, targetDate: d(2027, 6, 1) }];
const budget: Budget = { id: "reward", categoryId: "fun", period: "2026-10", limitAmount: 300_000, startDate: d(2026, 10, 1, 0), leftoverGoalId: "liburan" };
const spent: Transaction[] = [{ id: "t1", accountId: "bca", categoryId: "fun", type: "expense", amount: 120_000, date: d(2026, 10, 10), tags: [] }];

beforeEach(() => {
  db = new FakeDatabases();
  db.seed(COLLECTIONS.GOALS, { $id: "liburan", userId: "u1", currentAmount: 0 });
});

describe("sisa jatah ke tujuan", () => {
  const now = d(2026, 11, 13);
  const input = (transfers: BudgetTransfer[] = []) => ({ budgets: [budget], goals, transactions: spent, transfers });

  it("menyetor sisa siklus yang sudah berakhir", async () => {
    const deposits = await sweepBudgetLeftovers(db as unknown as Dbs, "u1", input(), now);
    expect(deposits.map((x) => [x.cycleKey, x.amount])).toEqual([["2026-10", 180_000]]);
    expect(goal()).toBe(180_000);
  });

  it("dua pemuatan bersamaan tidak menyetor dua kali", async () => {
    await Promise.all([
      sweepBudgetLeftovers(db as unknown as Dbs, "u1", input(), now),
      sweepBudgetLeftovers(db as unknown as Dbs, "u1", input(), now),
    ]);
    expect(goal()).toBe(180_000);
    expect(db.all(COLLECTIONS.BUDGET_TRANSFERS)).toHaveLength(1);
  });

  it("siklus yang sudah disetor dilewati", async () => {
    const [first] = await sweepBudgetLeftovers(db as unknown as Dbs, "u1", input(), now);
    const again = await sweepBudgetLeftovers(db as unknown as Dbs, "u1", input([first.record]), now);
    expect(again).toHaveLength(0);
    expect(goal()).toBe(180_000);
  });

  it("siklus berjalan belum disetor, dan siklus yang lewat jatah tidak menyetor apa pun", async () => {
    const over: Transaction[] = [{ ...spent[0], amount: 400_000 }];
    const deposits = await sweepBudgetLeftovers(db as unknown as Dbs, "u1", { ...input(), transactions: over }, now);
    expect(deposits).toHaveLength(0);
    expect(goal()).toBe(0);
  });

  it("gagal menambah tujuan → catatan dihapus agar bisa dicoba lagi", async () => {
    db.failNext = (op) => op === "increment";
    await sweepBudgetLeftovers(db as unknown as Dbs, "u1", input(), now);
    expect(db.all(COLLECTIONS.BUDGET_TRANSFERS)).toHaveLength(0);
    await sweepBudgetLeftovers(db as unknown as Dbs, "u1", input(), now);
    expect(goal()).toBe(180_000);
  });
});
