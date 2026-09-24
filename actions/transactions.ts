"use server";

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { mockTransactions, type Transaction } from "@/lib/data/mock";

function transactionBalanceDelta(type: Transaction["type"], amount: number) {
  if (type === "income") return amount;
  if (type === "expense") return -amount;
  return 0;
}

export async function getTransactionsAction(): Promise<{ data: Transaction[]; error?: string }> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { data: mockTransactions };

  try {
    const { databases } = await createAdminServerClient();
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TRANSACTIONS, [
      Query.equal("userId", user.id),
      Query.orderDesc("date"),
      Query.limit(100),
    ]);

    return {
      data: response.documents.map((document) => ({
        id: document.$id,
        accountId: document.accountId,
        categoryId: document.categoryId,
        type: document.type,
        amount: Number(document.amount),
        date: new Date(document.date),
        note: document.note,
        tags: document.tags || [],
      })),
    };
  } catch (error: unknown) {
    return { data: mockTransactions, error: error instanceof Error ? error.message : "Transaksi tidak dapat dimuat." };
  }
}

export async function createTransactionAction(payload: Omit<Transaction, "id">) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true, id: `tx-${Date.now()}` };

  try {
    if (!Number.isSafeInteger(payload.amount) || payload.amount <= 0) {
      throw new Error("Nominal transaksi harus berupa angka bulat yang lebih besar dari nol.");
    }
    if (!["income", "expense", "transfer"].includes(payload.type)) {
      throw new Error("Jenis transaksi tidak valid.");
    }
    if (Number.isNaN(payload.date.getTime())) {
      throw new Error("Tanggal transaksi tidak valid.");
    }

    const { databases } = await createAdminServerClient();
    const account = await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, payload.accountId, user.id);
    if (payload.categoryId) {
      const category = await getOwnedDocument(databases, COLLECTIONS.CATEGORIES, payload.categoryId, user.id);
      if (payload.type !== "transfer" && category.type !== payload.type) {
        throw new Error("Kategori tidak sesuai dengan jenis transaksi.");
      }
    }
    const previousBalance = Number(account.balance ?? 0);
    const delta = transactionBalanceDelta(payload.type, payload.amount);

    if (delta !== 0) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, payload.accountId, {
        balance: previousBalance + delta,
      });
    }

    try {
      const document = await databases.createDocument(
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
        },
      );
      return { success: true, id: document.$id };
    } catch (error) {
      if (delta !== 0) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, payload.accountId, {
          balance: previousBalance,
        }).catch(() => undefined);
      }
      throw error;
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Transaksi gagal disimpan." };
  }
}

export async function deleteTransactionAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };

  try {
    const { databases } = await createAdminServerClient();
    const transaction = await getOwnedDocument(databases, COLLECTIONS.TRANSACTIONS, id, user.id);
    const account = await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, String(transaction.accountId), user.id);
    const previousBalance = Number(account.balance ?? 0);
    const delta = transactionBalanceDelta(transaction.type, Number(transaction.amount));

    if (delta !== 0) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, String(transaction.accountId), {
        balance: previousBalance - delta,
      });
    }

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TRANSACTIONS, id);
    } catch (error) {
      if (delta !== 0) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, String(transaction.accountId), {
          balance: previousBalance,
        }).catch(() => undefined);
      }
      throw error;
    }

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Transaksi gagal dihapus." };
  }
}

export async function exportTransactionsCSVAction(transactionsList?: Transaction[]): Promise<string> {
  const list = transactionsList?.length ? transactionsList : (await getTransactionsAction()).data;
  const headers = ["ID", "Tanggal", "Tipe", "Nominal (IDR)", "Akun ID", "Kategori ID", "Catatan"];
  const rows = list.map((transaction) => [
    `"${transaction.id}"`,
    `"${new Date(transaction.date).toISOString().slice(0, 10)}"`,
    `"${transaction.type.toUpperCase()}"`,
    transaction.amount,
    `"${transaction.accountId}"`,
    `"${transaction.categoryId || ""}"`,
    `"${(transaction.note || "").replace(/"/g, '""')}"`,
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}