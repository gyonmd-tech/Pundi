import { beforeEach, describe, expect, it } from "vitest";
import { Query } from "node-appwrite";
import { FakeDatabases } from "../helpers/fakeDatabases";
import { COLLECTIONS } from "@/lib/appwrite/collections";
import { generateDueRecurringTransactions, MAX_CATCHUP_PER_RULE } from "@/lib/appwrite/recurringGenerator";
import { listAllDocuments } from "@/lib/appwrite/pagination";
import type { Models } from "node-appwrite";

type Dbs = Parameters<typeof generateDueRecurringTransactions>[0];
let db: FakeDatabases;
const dbs = () => db as unknown as Dbs;
const balance = (id: string) => Number(db.get(COLLECTIONS.ACCOUNTS, id)?.balance);
const ruleDocs = () => db.all(COLLECTIONS.RECURRING_RULES) as unknown as Models.Document[];
const recurringTx = () => db.all(COLLECTIONS.TRANSACTIONS).filter((d) => d.recordKind === "recurring");

beforeEach(() => {
  db = new FakeDatabases();
  db.seed(COLLECTIONS.ACCOUNTS, { $id: "bank", userId: "u1", balance: 1_000_000 });
  db.seed(COLLECTIONS.GOALS, { $id: "goal", userId: "u1", currentAmount: 0 });
  db.seed(COLLECTIONS.RECURRING_RULES, {
    $id: "rule", userId: "u1", accountId: "bank", goalId: "goal", type: "expense", amount: 100_000,
    frequency: "monthly", startDate: "2026-01-05T00:00:00.000Z", nextOccurrence: "2026-01-05T00:00:00.000Z", isActive: true,
  });
});

describe("transaksi berulang idempoten (R2)", () => {
  const now = new Date("2026-03-20T00:00:00Z"); // jatuh tempo: Jan, Feb, Mar

  it("membuat kejadian yang terlewat sekali dan memajukan jadwal", async () => {
    await generateDueRecurringTransactions(dbs(), "u1", ruleDocs(), now);
    expect(recurringTx()).toHaveLength(3);
    expect(balance("bank")).toBe(700_000);
    expect(Number(db.get(COLLECTIONS.GOALS, "goal")?.currentAmount)).toBe(300_000);
    expect(new Date(String(db.get(COLLECTIONS.RECURRING_RULES, "rule")?.nextOccurrence)) > now).toBe(true);
  });

  it("dua pemuatan bersamaan (dua tab) TIDAK membuat transaksi ganda", async () => {
    const snapshot = ruleDocs(); // keduanya membaca aturan sebelum ada yang memajukan jadwal
    await Promise.all([
      generateDueRecurringTransactions(dbs(), "u1", snapshot, now),
      generateDueRecurringTransactions(dbs(), "u1", snapshot, now),
    ]);
    expect(recurringTx()).toHaveLength(3);
    expect(balance("bank")).toBe(700_000);
    expect(Number(db.get(COLLECTIONS.GOALS, "goal")?.currentAmount)).toBe(300_000);
  });

  it("dipanggil ulang dengan aturan basi tetap tidak menggandakan", async () => {
    const stale = ruleDocs();
    await generateDueRecurringTransactions(dbs(), "u1", stale, now);
    await generateDueRecurringTransactions(dbs(), "u1", stale, now);
    expect(recurringTx()).toHaveLength(3);
    expect(balance("bank")).toBe(700_000);
  });

  it("gagal menggeser saldo → dokumen kejadian dihapus agar bisa dicoba lagi", async () => {
    db.failNext = (op) => op === "decrement";
    await generateDueRecurringTransactions(dbs(), "u1", ruleDocs(), now);
    expect(recurringTx()).toHaveLength(0);
    expect(balance("bank")).toBe(1_000_000);
    await generateDueRecurringTransactions(dbs(), "u1", ruleDocs(), now);
    expect(recurringTx()).toHaveLength(3);
  });

  it(`catch-up dibatasi ${MAX_CATCHUP_PER_RULE} kejadian per pemuatan`, async () => {
    await generateDueRecurringTransactions(dbs(), "u1", ruleDocs(), new Date("2030-01-01T00:00:00Z"));
    expect(recurringTx()).toHaveLength(MAX_CATCHUP_PER_RULE);
  });
});

describe("paginasi tanpa batas 500 (R3)", () => {
  it("mengambil semua dokumen lewat cursor", async () => {
    for (let i = 0; i < 1_234; i++) db.seed(COLLECTIONS.TRANSACTIONS, { $id: `t${i}`, userId: "u1" });
    for (let i = 0; i < 10; i++) db.seed(COLLECTIONS.TRANSACTIONS, { $id: `x${i}`, userId: "u2" });
    const docs = await listAllDocuments(dbs(), COLLECTIONS.TRANSACTIONS, [Query.equal("userId", "u1")]);
    expect(docs).toHaveLength(1_234);
    expect(new Set(docs.map((d) => d.$id)).size).toBe(1_234);
  });

  it("menghormati batas pengaman maxDocuments", async () => {
    for (let i = 0; i < 700; i++) db.seed(COLLECTIONS.TRANSACTIONS, { $id: `t${i}`, userId: "u1" });
    const docs = await listAllDocuments(dbs(), COLLECTIONS.TRANSACTIONS, [], { maxDocuments: 600 });
    expect(docs).toHaveLength(600);
  });
});

describe("insight idempoten", () => {
  it("dua pemuatan bersamaan tidak menggandakan insight", async () => {
    const { generateInsights } = await import("@/lib/appwrite/insightGenerator");
    const ctx = {
      categories: [], transactions: [], budgets: [], recurringRules: [],
      goals: [{ id: "g1", name: "Liburan", targetAmount: 100, currentAmount: 100, targetDate: new Date() }],
    };
    await Promise.all([
      generateInsights(dbs(), "u1", ctx, []),
      generateInsights(dbs(), "u1", ctx, []),
    ]);
    expect(db.all(COLLECTIONS.INSIGHTS)).toHaveLength(1);
  });
});
