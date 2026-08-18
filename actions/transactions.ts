"use server";

/**
 * actions/transactions.ts
 * Server Actions untuk mutasi transaksi (Appwrite + CSV Export).
 */

import { createSessionServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockTransactions, type Transaction } from "@/lib/data/mock";

export async function getTransactionsAction(): Promise<{ data: Transaction[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { data: mockTransactions };
  }

  try {
    const { databases } = await createSessionServerClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        Query.equal("userId", user.id),
        Query.orderDesc("date"),
        Query.limit(100),
      ]
    );

    const mapped: Transaction[] = response.documents.map((doc: any) => ({
      id: doc.$id,
      accountId: doc.accountId,
      categoryId: doc.categoryId,
      type: doc.type,
      amount: doc.amount,
      date: new Date(doc.date),
      note: doc.note,
      tags: doc.tags || [],
    }));

    return { data: mapped };
  } catch (err: any) {
    return { data: mockTransactions, error: err.message };
  }
}

export async function createTransactionAction(payload: Omit<Transaction, "id">) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true, id: `tx-${Date.now()}` };
  }

  try {
    const { databases } = await createSessionServerClient();
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId: user.id,
        accountId: payload.accountId,
        categoryId: payload.categoryId,
        type: payload.type,
        amount: payload.amount,
        date: payload.date.toISOString(),
        note: payload.note,
        tags: payload.tags || [],
      }
    );

    return { success: true, id: doc.$id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteTransactionAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: true };
  }

  try {
    const { databases } = await createSessionServerClient();
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TRANSACTIONS, id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Format & Generate CSV string untuk mutasi transaksi
 */
export async function exportTransactionsCSVAction(transactionsList?: Transaction[]): Promise<string> {
  const list = transactionsList && transactionsList.length > 0
    ? transactionsList
    : (await getTransactionsAction()).data;

  const headers = ["ID", "Tanggal", "Tipe", "Nominal (IDR)", "Akun ID", "Kategori ID", "Catatan"];
  const rows = list.map((tx) => [
    `"${tx.id}"`,
    `"${new Date(tx.date).toISOString().slice(0, 10)}"`,
    `"${tx.type.toUpperCase()}"`,
    tx.amount,
    `"${tx.accountId}"`,
    `"${tx.categoryId || ''}"`,
    `"${(tx.note || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}
