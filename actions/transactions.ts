"use server";

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { ID, Query, type Models } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockTransactions, type Account, type Transaction } from "@/lib/data/mock";
import {
  applyBalanceChanges,
  documentPayload,
  documentPermissions,
  getBalanceChanges,
  mergeChanges,
  negateChanges,
  type TransactionInput,
} from "@/lib/appwrite/transactionHelpers";
import { computeObservedDelta } from "@/lib/utils/balanceReconciliation";
import { recordAuditLog } from "@/lib/appwrite/auditLog";

export type { TransactionInput };

interface TransactionFields {
  accountId: string;
  destinationAccountId?: string;
  transferKind?: Transaction["transferKind"];
  recordKind?: Transaction["recordKind"];
  recurringRuleId?: string;
  debtId?: string;
  observedBalance?: number;
  categoryId?: string;
  type: Transaction["type"];
  amount: number;
  date: string;
  note?: string;
  tags?: string[];
}

function transactionFromDocument(document: Models.Document): Transaction {
  const fields = document as unknown as TransactionFields;
  return {
    id: document.$id,
    accountId: fields.accountId,
    destinationAccountId: fields.destinationAccountId || undefined,
    transferKind: fields.transferKind || undefined,
    recordKind: fields.recordKind || "standard",
    recurringRuleId: fields.recurringRuleId || undefined,
    debtId: fields.debtId || undefined,
    observedBalance: fields.observedBalance == null ? undefined : Number(fields.observedBalance),
    categoryId: fields.categoryId || undefined,
    type: fields.type,
    amount: Number(fields.amount),
    date: new Date(fields.date),
    createdAt: new Date(document.$createdAt),
    note: fields.note || undefined,
    tags: fields.tags || [],
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

export async function createBalanceAdjustmentAction(payload: {
  accountId: string;
  observedBalance: number;
  date: Date;
  note?: string;
}) {
  const user = await getAuthUserAction();
  if (!Number.isSafeInteger(payload.observedBalance) || payload.observedBalance < 0) {
    return { success: false, error: "Saldo nyata harus berupa angka bulat nol atau lebih." };
  }
  if (Number.isNaN(payload.date.getTime())) return { success: false, error: "Tanggal kondisi tidak valid." };
  if (!user || user.isDemo) {
    return {
      success: true,
      id: `adjustment-${Date.now()}`,
      createdAt: new Date().toISOString(),
      delta: 0,
      newBalance: payload.observedBalance,
      type: "income" as const,
    };
  }

  try {
    const { databases } = await createAdminServerClient();
    const account = await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, payload.accountId, user.id);
    const snapshotEnd = new Date(payload.date);
    snapshotEnd.setHours(23, 59, 59, 999);
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TRANSACTIONS, [
      Query.equal("userId", user.id),
      Query.greaterThan("date", snapshotEnd.toISOString()),
      Query.limit(500),
    ]);

    const recentTransactions = response.documents.map((document) => transactionFromDocument(document));
    const currentBalance = Number(account.balance || 0);
    const delta = computeObservedDelta(recentTransactions, payload.accountId, currentBalance, payload.observedBalance, snapshotEnd);
    const type: Transaction["type"] = delta < 0 ? "expense" : "income";
    const transaction: TransactionInput = {
      accountId: payload.accountId,
      type,
      amount: Math.abs(delta),
      date: snapshotEnd,
      note: payload.note?.trim() || "Penyesuaian saldo berdasarkan kondisi nyata",
      tags: ["rekonsiliasi-saldo"],
      recordKind: "balance_adjustment",
      observedBalance: payload.observedBalance,
    };

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, payload.accountId, {
      balance: currentBalance + delta,
    });
    try {
      const document = await databases.createDocument(
        DATABASE_ID, COLLECTIONS.TRANSACTIONS, ID.unique(), documentPayload(user.id, transaction),
        documentPermissions(user.id),
      );
      await recordAuditLog(databases, user.id, {
        entityType: "transaction", entityId: document.$id, action: "create",
        summary: `Catatan kondisi: penyesuaian saldo "${(account as unknown as { name?: string }).name ?? ""}"`,
        after: { delta, newBalance: currentBalance + delta, observedBalance: payload.observedBalance },
      });
      return {
        success: true,
        id: document.$id,
        createdAt: document.$createdAt,
        delta,
        newBalance: currentBalance + delta,
        type,
      };
    } catch (error) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, payload.accountId, { balance: currentBalance });
      throw error;
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Catatan kondisi gagal disimpan." };
  }
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
        documentPermissions(user.id),
      );
      await recordAuditLog(databases, user.id, {
        entityType: "transaction", entityId: document.$id, action: "create",
        summary: `Mencatat transaksi ${payload.type}`, after: payload,
      });
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
      await recordAuditLog(databases, user.id, {
        entityType: "transaction", entityId: payload.id, action: "update",
        summary: `Mengubah transaksi ${payload.type}`, before: previous, after: payload,
      });
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
      await recordAuditLog(databases, user.id, {
        entityType: "transaction", entityId: id, action: "delete",
        summary: `Menghapus transaksi ${transaction.type}`, before: transaction,
      });
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
