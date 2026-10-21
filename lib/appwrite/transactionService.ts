/**
 * lib/appwrite/transactionService.ts
 * Inti pembuatan transaksi yang tidak bergantung pada sesi cookie: dipakai
 * oleh Server Action manual (actions/transactions.ts) DAN oleh Penjaga
 * (Hermes Agent via MCP — lib/penjaga/*) yang mengautentikasi lewat token.
 * Validasi, perubahan saldo, rollback, dan audit log hanya ada di sini.
 *
 * Bukan file "use server".
 */
import { ID, type Models } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { recordAuditLog, type AuditActor } from "@/lib/appwrite/auditLog";
import {
  applyBalanceChanges,
  documentPayload,
  documentPermissions,
  getBalanceChanges,
  type TransactionInput,
} from "@/lib/appwrite/transactionHelpers";
import type { Account, Transaction } from "@/lib/data/mock";

type AdminDatabases = Awaited<ReturnType<typeof createAdminServerClient>>["databases"];

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

export function transactionFromDocument(document: Models.Document): Transaction {
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

export async function validateTransaction(databases: AdminDatabases, userId: string, payload: TransactionInput) {
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

/** Validasi → ubah saldo → simpan dokumen → audit log. Saldo di-rollback bila penyimpanan gagal. */
export async function createTransactionForUser(
  databases: AdminDatabases,
  userId: string,
  payload: TransactionInput,
  options: { actor?: AuditActor; summary?: string } = {},
) {
  await validateTransaction(databases, userId, payload);
  const rollback = await applyBalanceChanges(databases, userId, getBalanceChanges(payload));
  try {
    const document = await databases.createDocument(
      DATABASE_ID, COLLECTIONS.TRANSACTIONS, ID.unique(), documentPayload(userId, payload),
      documentPermissions(userId),
    );
    await recordAuditLog(databases, userId, {
      entityType: "transaction", entityId: document.$id, action: "create",
      actor: options.actor,
      summary: options.summary ?? `Mencatat transaksi ${payload.type}`, after: payload,
    });
    return document;
  } catch (error) {
    await rollback();
    throw error;
  }
}
