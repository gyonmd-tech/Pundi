"use server";

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockTransactions, type Account, type Transaction } from "@/lib/data/mock";

type TransactionInput = Omit<Transaction, "id" | "createdAt">;
type BalanceChanges = Map<string, number>;

function transactionFromDocument(document: Record<string, any>): Transaction {
  return {
    id: document.$id,
    accountId: document.accountId,
    destinationAccountId: document.destinationAccountId || undefined,
    transferKind: document.transferKind || undefined,
    categoryId: document.categoryId || undefined,
    type: document.type,
    amount: Number(document.amount),
    date: new Date(document.date),
    createdAt: new Date(document.$createdAt),
    note: document.note || undefined,
    tags: document.tags || [],
  };
}

function getBalanceChanges(transaction: TransactionInput): BalanceChanges {
  const changes = new Map<string, number>();
  if (transaction.type === "income") changes.set(transaction.accountId, transaction.amount);
  if (transaction.type === "expense") changes.set(transaction.accountId, -transaction.amount);
  if (transaction.type === "transfer" && transaction.destinationAccountId) {
    changes.set(transaction.accountId, -transaction.amount);
    changes.set(transaction.destinationAccountId, transaction.amount);
  }
  return changes;
}

function mergeChanges(...groups: BalanceChanges[]) {
  const result = new Map<string, number>();
  for (const group of groups) {
    for (const [accountId, delta] of group) {
      result.set(accountId, (result.get(accountId) || 0) + delta);
    }
  }
  return new Map([...result].filter(([, delta]) => delta !== 0));
}

function negateChanges(changes: BalanceChanges) {
  return new Map([...changes].map(([accountId, delta]) => [accountId, -delta]));
}

async function applyBalanceChanges(
  databases: Awaited<ReturnType<typeof createAdminServerClient>>["databases"],
  userId: string,
  changes: BalanceChanges,
) {
  const snapshots = new Map<string, number>();
  for (const accountId of changes.keys()) {
    const account = await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, accountId, userId);
    snapshots.set(accountId, Number(account.balance ?? 0));
  }

  const applied: string[] = [];
  try {
    for (const [accountId, delta] of changes) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, accountId, {
        balance: (snapshots.get(accountId) || 0) + delta,
      });
      applied.push(accountId);
    }
  } catch (error) {
    await Promise.allSettled(applied.map((accountId) =>
      databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, accountId, {
        balance: snapshots.get(accountId) || 0,
      })
    ));
    throw error;
  }

  return async () => {
    await Promise.allSettled([...snapshots].map(([accountId, balance]) =>
      databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, accountId, { balance })
    ));
  };
}

async function validateTransaction(
  databases: Awaited<ReturnType<typeof createAdminServerClient>>["databases"],
  userId: string,
  payload: TransactionInput,
) {
  if (!Number.isSafeInteger(payload.amount) || payload.amount <= 0) {
    throw new Error("Nominal transaksi harus berupa angka bulat yang lebih besar dari nol.");
  }
  if (!["income", "expense", "transfer"].includes(payload.type)) {
    throw new Error("Jenis transaksi tidak valid.");
  }
  if (Number.isNaN(payload.date.getTime())) throw new Error("Tanggal transaksi tidak valid.");

  const source = await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, payload.accountId, userId) as unknown as Account;
  if (payload.categoryId) {
    const category = await getOwnedDocument(databases, COLLECTIONS.CATEGORIES, payload.categoryId, userId);
    if (payload.type !== "transfer" && category.type !== payload.type) {
      throw new Error("Kategori tidak sesuai dengan jenis transaksi.");
    }
  }

  if (payload.type === "transfer") {
    if (!payload.destinationAccountId) throw new Error("Pilih rekening tujuan transfer.");
    if (payload.destinationAccountId === payload.accountId) throw new Error("Rekening sumber dan tujuan harus berbeda.");
    const destination = await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, payload.destinationAccountId, userId) as unknown as Account;
    if (payload.transferKind === "cash_withdrawal") {
      if (source.type === "cash") throw new Error("Sumber tarik tunai harus rekening non-tunai.");
      if (destination.type !== "cash") throw new Error("Tujuan tarik tunai harus rekening berjenis uang tunai.");
    }
  }
}

function documentPayload(userId: string, payload: TransactionInput, clearOptional = false) {
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
  if (payload.note) data.note = payload.note;
  else if (clearOptional) data.note = null;
  return data;
}

export async function getTransactionsAction(): Promise<{ data: Transaction[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { data: mockTransactions };

  try {
    const { databases } = await createAdminServerClient();
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TRANSACTIONS, [
      Query.equal("userId", user.id), Query.orderDesc("date"), Query.limit(500),
    ]);
    return { data: response.documents.map((document) => transactionFromDocument(document)) };
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : "Transaksi tidak dapat dimuat." };
  }
}

export async function createTransactionAction(payload: TransactionInput) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true, id: `tx-${Date.now()}`, createdAt: new Date().toISOString() };

  try {
    const { databases } = await createAdminServerClient();
    await validateTransaction(databases, user.id, payload);
    const rollback = await applyBalanceChanges(databases, user.id, getBalanceChanges(payload));
    try {
      const document = await databases.createDocument(
        DATABASE_ID, COLLECTIONS.TRANSACTIONS, ID.unique(), documentPayload(user.id, payload),
      );
      return { success: true, id: document.$id, createdAt: document.$createdAt };
    } catch (error) {
      await rollback();
      throw error;
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Transaksi gagal disimpan." };
  }
}

export async function updateTransactionAction(payload: Transaction) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };

  try {
    const { databases } = await createAdminServerClient();
    const previousDocument = await getOwnedDocument(databases, COLLECTIONS.TRANSACTIONS, payload.id, user.id);
    const previous = transactionFromDocument(previousDocument);
    await validateTransaction(databases, user.id, payload);
    const netChanges = mergeChanges(negateChanges(getBalanceChanges(previous)), getBalanceChanges(payload));
    const rollback = await applyBalanceChanges(databases, user.id, netChanges);
    try {
      await databases.updateDocument(
        DATABASE_ID, COLLECTIONS.TRANSACTIONS, payload.id, documentPayload(user.id, payload, true),
      );
      return { success: true };
    } catch (error) {
      await rollback();
      throw error;
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Perubahan transaksi gagal disimpan." };
  }
}

export async function deleteTransactionAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };

  try {
    const { databases } = await createAdminServerClient();
    const transaction = transactionFromDocument(
      await getOwnedDocument(databases, COLLECTIONS.TRANSACTIONS, id, user.id),
    );
    const rollback = await applyBalanceChanges(databases, user.id, negateChanges(getBalanceChanges(transaction)));
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TRANSACTIONS, id);
      return { success: true };
    } catch (error) {
      await rollback();
      throw error;
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Transaksi gagal dihapus." };
  }
}

export async function exportTransactionsCSVAction(transactionsList?: Transaction[]): Promise<string> {
  const list = transactionsList?.length ? transactionsList : (await getTransactionsAction()).data;
  const headers = ["ID", "Tanggal transaksi", "Tanggal dicatat", "Tipe", "Nominal (IDR)", "Akun sumber", "Akun tujuan", "Kategori ID", "Catatan"];
  const rows = list.map((transaction) => [
    `"${transaction.id}"`,
    `"${new Date(transaction.date).toISOString().slice(0, 10)}"`,
    `"${new Date(transaction.createdAt || transaction.date).toISOString()}"`,
    `"${transaction.transferKind === "cash_withdrawal" ? "TARIK TUNAI" : transaction.type.toUpperCase()}"`,
    transaction.amount,
    `"${transaction.accountId}"`,
    `"${transaction.destinationAccountId || ""}"`,
    `"${transaction.categoryId || ""}"`,
    `"${(transaction.note || "").replace(/"/g, '""')}"`,
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
