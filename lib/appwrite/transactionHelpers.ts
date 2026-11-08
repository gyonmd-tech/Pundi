/**
 * lib/appwrite/transactionHelpers.ts
 * Logika bersama untuk membangun & memvalidasi payload transaksi Appwrite,
 * dan menerapkan perubahan saldo akun. Dipakai oleh actions/transactions.ts
 * (CRUD transaksi manual) dan actions/bootstrap.ts (generasi transaksi
 * berulang) agar aritmetika saldo hanya ada di satu tempat.
 *
 * Bukan file "use server" — berisi fungsi sinkron biasa, sehingga tidak
 * boleh digabung ke dalam actions/transactions.ts (semua export top-level
 * di file "use server" wajib berupa Server Action async).
 */
import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { Permission, Role } from "node-appwrite";
import type { Transaction } from "@/lib/data/mock";

export type TransactionInput = Omit<Transaction, "id" | "createdAt">;
export type BalanceChanges = Map<string, number>;

export function getBalanceChanges(transaction: TransactionInput): BalanceChanges {
  const changes = new Map<string, number>();
  if (transaction.type === "income") changes.set(transaction.accountId, transaction.amount);
  if (transaction.type === "expense") changes.set(transaction.accountId, -transaction.amount);
  if (transaction.type === "transfer" && transaction.destinationAccountId) {
    changes.set(transaction.accountId, -transaction.amount);
    changes.set(transaction.destinationAccountId, transaction.amount);
  }
  return changes;
}

export function mergeChanges(...groups: BalanceChanges[]) {
  const result = new Map<string, number>();
  for (const group of groups) {
    for (const [accountId, delta] of group) {
      result.set(accountId, (result.get(accountId) || 0) + delta);
    }
  }
  return new Map([...result].filter(([, delta]) => delta !== 0));
}

export function negateChanges(changes: BalanceChanges) {
  return new Map([...changes].map(([accountId, delta]) => [accountId, -delta]));
}

type BalanceDatabases = Pick<
  Awaited<ReturnType<typeof createAdminServerClient>>["databases"],
  "getDocument" | "incrementDocumentAttribute" | "decrementDocumentAttribute"
>;

/**
 * Geser saldo satu rekening secara ATOMIK di sisi Appwrite (increment /
 * decrement), bukan baca-lalu-tulis. Dua mutasi bersamaan (dua tab, Penjaga
 * + input manual, transaksi berulang) tidak lagi saling menimpa.
 */
export async function shiftBalance(databases: BalanceDatabases, accountId: string, delta: number) {
  if (delta === 0) return;
  const params = { databaseId: DATABASE_ID, collectionId: COLLECTIONS.ACCOUNTS, documentId: accountId, attribute: "balance" };
  if (delta > 0) await databases.incrementDocumentAttribute({ ...params, value: delta });
  else await databases.decrementDocumentAttribute({ ...params, value: -delta });
}

/**
 * Terapkan perubahan saldo (setelah memastikan semua rekening milik userId).
 * Bila salah satu gagal, perubahan yang sudah masuk dibalik dengan delta
 * kebalikannya. Mengembalikan fungsi rollback yang juga membalik delta —
 * aman walau ada mutasi lain di antaranya, karena tidak menimpa dengan
 * snapshot lama.
 */
export async function applyBalanceChanges(
  databases: BalanceDatabases,
  userId: string,
  changes: BalanceChanges,
) {
  for (const accountId of changes.keys()) {
    await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, accountId, userId);
  }

  const applied: [string, number][] = [];
  try {
    for (const [accountId, delta] of changes) {
      await shiftBalance(databases, accountId, delta);
      applied.push([accountId, delta]);
    }
  } catch (error) {
    await Promise.allSettled(applied.map(([accountId, delta]) => shiftBalance(databases, accountId, -delta)));
    throw error;
  }

  return async () => {
    await Promise.allSettled(applied.map(([accountId, delta]) => shiftBalance(databases, accountId, -delta)));
  };
}

export function documentPermissions(userId: string) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

export function documentPayload(userId: string, payload: TransactionInput, clearOptional = false) {
  const data: Record<string, unknown> = {
    userId,
    accountId: payload.accountId,
    type: payload.type,
    amount: payload.amount,
    date: payload.date.toISOString(),
    tags: payload.tags || [],
  };
  if (payload.categoryId) data.categoryId = payload.categoryId;
  else if (clearOptional) data.categoryId = null;
  if (payload.destinationAccountId) data.destinationAccountId = payload.destinationAccountId;
  else if (clearOptional) data.destinationAccountId = null;
  if (payload.type === "transfer") data.transferKind = payload.transferKind || "account";
  else if (clearOptional) data.transferKind = null;
  if (payload.recordKind) data.recordKind = payload.recordKind;
  else if (clearOptional) data.recordKind = null;
  if (payload.recurringRuleId) data.recurringRuleId = payload.recurringRuleId;
  else if (clearOptional) data.recurringRuleId = null;
  if (payload.debtId) data.debtId = payload.debtId;
  else if (clearOptional) data.debtId = null;
  if (payload.observedBalance != null) data.observedBalance = payload.observedBalance;
  else if (clearOptional) data.observedBalance = null;
  if (payload.note) data.note = payload.note;
  else if (clearOptional) data.note = null;
  return data;
}
