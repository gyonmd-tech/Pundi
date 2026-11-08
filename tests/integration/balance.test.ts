import { beforeEach, describe, expect, it } from "vitest";
import { FakeDatabases } from "../helpers/fakeDatabases";
import { COLLECTIONS } from "@/lib/appwrite/collections";
import { applyBalanceChanges, getBalanceChanges, mergeChanges, negateChanges } from "@/lib/appwrite/transactionHelpers";
import { createTransactionForUser } from "@/lib/appwrite/transactionService";

type Dbs = Parameters<typeof createTransactionForUser>[0];

let db: FakeDatabases;
const dbs = () => db as unknown as Dbs;
const balance = (id: string) => Number(db.get(COLLECTIONS.ACCOUNTS, id)?.balance);

beforeEach(() => {
  db = new FakeDatabases();
  db.seed(COLLECTIONS.ACCOUNTS, { $id: "bank", userId: "u1", name: "Bank", type: "bank", balance: 1_000_000 });
  db.seed(COLLECTIONS.ACCOUNTS, { $id: "cash", userId: "u1", name: "Cash", type: "cash", balance: 0 });
  db.seed(COLLECTIONS.ACCOUNTS, { $id: "other", userId: "u2", name: "Milik orang lain", type: "bank", balance: 5 });
  db.seed(COLLECTIONS.CATEGORIES, { $id: "food", userId: "u1", type: "expense" });
});

describe("saldo atomik (R1)", () => {
  it("50 pengeluaran paralel tidak ada yang hilang", async () => {
    await Promise.all(Array.from({ length: 50 }, () =>
      createTransactionForUser(dbs(), "u1", { accountId: "bank", categoryId: "food", type: "expense", amount: 1_000, date: new Date(), tags: [] }),
    ));
    expect(balance("bank")).toBe(1_000_000 - 50 * 1_000);
    expect(db.all(COLLECTIONS.TRANSACTIONS)).toHaveLength(50);
  });

  it("pemasukan & pengeluaran paralel dari dua sumber (app + Penjaga) tetap akurat", async () => {
    await Promise.all([
      ...Array.from({ length: 20 }, () => applyBalanceChanges(dbs(), "u1", new Map([["bank", 500]]))),
      ...Array.from({ length: 20 }, () => applyBalanceChanges(dbs(), "u1", new Map([["bank", -300]]))),
    ]);
    expect(balance("bank")).toBe(1_000_000 + 20 * 500 - 20 * 300);
  });

  it("transfer menggeser dua rekening", async () => {
    await createTransactionForUser(dbs(), "u1", { accountId: "bank", destinationAccountId: "cash", type: "transfer", amount: 250_000, date: new Date(), tags: [] });
    expect(balance("bank")).toBe(750_000);
    expect(balance("cash")).toBe(250_000);
  });

  it("gagal menyimpan dokumen → saldo dikembalikan", async () => {
    db.failNext = (op, collectionId) => op === "create" && collectionId === COLLECTIONS.TRANSACTIONS;
    await expect(createTransactionForUser(dbs(), "u1", { accountId: "bank", type: "expense", amount: 10_000, date: new Date(), tags: [] })).rejects.toThrow();
    expect(balance("bank")).toBe(1_000_000);
  });

  it("gagal di sisi kedua transfer → sisi pertama dibalik", async () => {
    db.failNext = (op, _c, documentId) => op === "increment" && documentId === "cash";
    await expect(applyBalanceChanges(dbs(), "u1", new Map([["bank", -100], ["cash", 100]]))).rejects.toThrow();
    expect(balance("bank")).toBe(1_000_000);
    expect(balance("cash")).toBe(0);
  });

  it("rollback tidak menimpa mutasi lain yang terjadi di antaranya", async () => {
    const rollback = await applyBalanceChanges(dbs(), "u1", new Map([["bank", -100]]));
    await applyBalanceChanges(dbs(), "u1", new Map([["bank", 7]])); // mutasi lain
    await rollback();
    expect(balance("bank")).toBe(1_000_007);
  });

  it("edit transaksi hanya menerapkan selisihnya", async () => {
    const previous = getBalanceChanges({ accountId: "bank", type: "expense", amount: 50_000, date: new Date(), tags: [] });
    const next = getBalanceChanges({ accountId: "bank", type: "expense", amount: 20_000, date: new Date(), tags: [] });
    await applyBalanceChanges(dbs(), "u1", mergeChanges(negateChanges(previous), next));
    expect(balance("bank")).toBe(1_030_000);
  });
});

describe("kepemilikan data", () => {
  it("tidak bisa menggeser saldo rekening milik pengguna lain", async () => {
    await expect(applyBalanceChanges(dbs(), "u1", new Map([["other", 1_000]]))).rejects.toThrow(/tidak memiliki akses/);
    expect(balance("other")).toBe(5);
  });

  it("tidak bisa mencatat transaksi ke rekening pengguna lain", async () => {
    await expect(createTransactionForUser(dbs(), "u1", { accountId: "other", type: "income", amount: 1, date: new Date(), tags: [] })).rejects.toThrow();
    expect(db.all(COLLECTIONS.TRANSACTIONS)).toHaveLength(0);
  });

  it("validasi nominal & tujuan transfer", async () => {
    await expect(createTransactionForUser(dbs(), "u1", { accountId: "bank", type: "expense", amount: 0, date: new Date(), tags: [] })).rejects.toThrow(/Nominal/);
    await expect(createTransactionForUser(dbs(), "u1", { accountId: "bank", destinationAccountId: "bank", type: "transfer", amount: 5, date: new Date(), tags: [] })).rejects.toThrow(/berbeda/);
    expect(balance("bank")).toBe(1_000_000);
  });
});
