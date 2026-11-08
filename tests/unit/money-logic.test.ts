import { describe, expect, it } from "vitest";
import { getBalanceChanges, mergeChanges, negateChanges } from "@/lib/appwrite/transactionHelpers";
import { computeObservedDelta } from "@/lib/utils/balanceReconciliation";
import { getNextOccurrence } from "@/lib/utils/recurrence";
import { occurrenceDocumentId } from "@/lib/appwrite/recurringGenerator";
import type { Transaction } from "@/lib/data/mock";

const base = { date: new Date("2026-01-10"), tags: [] as string[] };

describe("getBalanceChanges", () => {
  it("pemasukan menambah, pengeluaran mengurangi rekening sumber", () => {
    expect([...getBalanceChanges({ ...base, accountId: "a", type: "income", amount: 100 })]).toEqual([["a", 100]]);
    expect([...getBalanceChanges({ ...base, accountId: "a", type: "expense", amount: 40 })]).toEqual([["a", -40]]);
  });

  it("transfer tercatat dua sisi", () => {
    const changes = getBalanceChanges({ ...base, accountId: "a", destinationAccountId: "b", type: "transfer", amount: 75 });
    expect(Object.fromEntries(changes)).toEqual({ a: -75, b: 75 });
  });

  it("transfer tanpa tujuan tidak mengubah saldo", () => {
    expect(getBalanceChanges({ ...base, accountId: "a", type: "transfer", amount: 75 }).size).toBe(0);
  });
});

describe("mergeChanges / negateChanges", () => {
  it("edit transaksi = batalkan lama + terapkan baru, delta nol dibuang", () => {
    const previous = getBalanceChanges({ ...base, accountId: "a", type: "expense", amount: 50 });
    const next = getBalanceChanges({ ...base, accountId: "a", type: "expense", amount: 80 });
    expect(Object.fromEntries(mergeChanges(negateChanges(previous), next))).toEqual({ a: -30 });
    expect(mergeChanges(negateChanges(previous), previous).size).toBe(0);
  });

  it("pindah rekening memindahkan dampak saldo", () => {
    const previous = getBalanceChanges({ ...base, accountId: "a", type: "expense", amount: 50 });
    const next = getBalanceChanges({ ...base, accountId: "b", type: "expense", amount: 50 });
    expect(Object.fromEntries(mergeChanges(negateChanges(previous), next))).toEqual({ a: 50, b: -50 });
  });
});

describe("computeObservedDelta", () => {
  const tx = (overrides: Partial<Transaction>): Transaction => ({
    id: Math.random().toString(), accountId: "a", type: "expense", amount: 0, date: new Date("2026-01-20"), tags: [], ...overrides,
  });

  it("menghitung selisih terhadap saldo pada tanggal kondisi", () => {
    // Saldo sekarang 1.000; setelah snapshot ada pengeluaran 200 dan transfer masuk 300.
    const transactions = [
      tx({ type: "expense", amount: 200 }),
      tx({ type: "transfer", accountId: "b", destinationAccountId: "a", amount: 300 }),
      tx({ type: "expense", amount: 999, date: new Date("2026-01-01") }), // sebelum snapshot → diabaikan
    ];
    const snapshotEnd = new Date("2026-01-15T23:59:59");
    // Saldo diharapkan saat snapshot = 1000 - (-200 + 300) = 900; nyata 850 → delta -50.
    expect(computeObservedDelta(transactions, "a", 1000, 850, snapshotEnd)).toBe(-50);
  });
});

describe("getNextOccurrence", () => {
  it("bulanan dipangkas ke akhir bulan yang lebih pendek", () => {
    const next = getNextOccurrence(new Date(2026, 0, 31), "monthly");
    expect([next.getFullYear(), next.getMonth(), next.getDate()]).toEqual([2026, 1, 28]);
  });

  it("mingguan maju 7 hari", () => {
    expect(getNextOccurrence(new Date(2026, 0, 28), "weekly").getDate()).toBe(4);
  });
});

describe("occurrenceDocumentId", () => {
  it("deterministik, ≤36 karakter, dan valid sebagai ID Appwrite", () => {
    const date = new Date("2026-03-01T00:00:00Z");
    const id = occurrenceDocumentId("rule_1", date);
    expect(id).toBe(occurrenceDocumentId("rule_1", new Date(date)));
    expect(id).not.toBe(occurrenceDocumentId("rule_1", new Date("2026-04-01T00:00:00Z")));
    expect(id).not.toBe(occurrenceDocumentId("rule_2", date));
    expect(id.length).toBeLessThanOrEqual(36);
    expect(id).toMatch(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
  });
});
