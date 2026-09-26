"use server";

import { ID, Query } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { getAuthUserAction } from "./auth";
import type { Debt, DebtDirection } from "@/lib/data/mock";

type DebtInput = {
  direction: DebtDirection;
  person: string;
  amount: number;
  remainingAmount?: number;
  dueDate?: Date;
  note?: string;
};

function fromDocument(document: Record<string, any>): Debt {
  return {
    id: document.$id,
    direction: document.direction,
    person: document.person,
    amount: Number(document.amount),
    remainingAmount: Number(document.remainingAmount),
    dueDate: document.dueDate ? new Date(document.dueDate) : undefined,
    note: document.note || undefined,
    status: document.status,
    createdAt: new Date(document.$createdAt),
    updatedAt: new Date(document.$updatedAt),
  };
}

function validate(payload: DebtInput) {
  if (!["payable", "receivable"].includes(payload.direction)) throw new Error("Jenis utang tidak valid.");
  if (!payload.person.trim()) throw new Error("Nama pihak wajib diisi.");
  if (!Number.isSafeInteger(payload.amount) || payload.amount <= 0) throw new Error("Nominal harus lebih besar dari nol.");
  const remaining = payload.remainingAmount ?? payload.amount;
  if (!Number.isSafeInteger(remaining) || remaining < 0 || remaining > payload.amount) throw new Error("Sisa utang tidak valid.");
  if (payload.dueDate && Number.isNaN(payload.dueDate.getTime())) throw new Error("Tanggal jatuh tempo tidak valid.");
}

function documentPayload(userId: string, payload: DebtInput) {
  const remainingAmount = payload.remainingAmount ?? payload.amount;
  return {
    userId,
    direction: payload.direction,
    person: payload.person.trim(),
    amount: payload.amount,
    remainingAmount,
    dueDate: payload.dueDate?.toISOString() || null,
    note: payload.note?.trim() || null,
    status: remainingAmount === 0 ? "paid" : "open",
  };
}

export async function getDebtsAction() {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { data: [] as Debt[] };
  try {
    const { databases } = await createAdminServerClient();
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DEBTS, [
      Query.equal("userId", user.id), Query.orderDesc("$createdAt"), Query.limit(500),
    ]);
    return { data: response.documents.map((document) => fromDocument(document)) };
  } catch (error: unknown) {
    return { data: [] as Debt[], error: error instanceof Error ? error.message : "Data utang gagal dimuat." };
  }
}

export async function createDebtAction(payload: DebtInput) {
  const user = await getAuthUserAction();
  try { validate(payload); } catch (error) { return { success: false, error: (error as Error).message }; }
  if (!user || user.isDemo) return { success: true, id: `debt-${Date.now()}`, createdAt: new Date().toISOString() };
  try {
    const { databases } = await createAdminServerClient();
    const document = await databases.createDocument(DATABASE_ID, COLLECTIONS.DEBTS, ID.unique(), documentPayload(user.id, payload));
    return { success: true, id: document.$id, createdAt: document.$createdAt, updatedAt: document.$updatedAt };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Utang gagal disimpan." };
  }
}

export async function updateDebtAction(id: string, payload: DebtInput) {
  const user = await getAuthUserAction();
  try { validate(payload); } catch (error) { return { success: false, error: (error as Error).message }; }
  if (!user || user.isDemo) return { success: true, updatedAt: new Date().toISOString() };
  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.DEBTS, id, user.id);
    const document = await databases.updateDocument(DATABASE_ID, COLLECTIONS.DEBTS, id, documentPayload(user.id, payload));
    return { success: true, updatedAt: document.$updatedAt };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Perubahan utang gagal disimpan." };
  }
}

export async function recordDebtPaymentAction(id: string, amount: number) {
  const user = await getAuthUserAction();
  if (!Number.isSafeInteger(amount) || amount <= 0) return { success: false, error: "Nominal pembayaran harus lebih besar dari nol." };
  if (!user || user.isDemo) return { success: true, remainingAmount: 0, status: "paid" as const, updatedAt: new Date().toISOString() };
  try {
    const { databases } = await createAdminServerClient();
    const previous = await getOwnedDocument(databases, COLLECTIONS.DEBTS, id, user.id);
    const remaining = Number(previous.remainingAmount);
    if (amount > remaining) throw new Error("Pembayaran tidak boleh melebihi sisa utang.");
    const remainingAmount = remaining - amount;
    const status = remainingAmount === 0 ? "paid" : "open";
    const document = await databases.updateDocument(DATABASE_ID, COLLECTIONS.DEBTS, id, { remainingAmount, status });
    return { success: true, remainingAmount, status, updatedAt: document.$updatedAt };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Pembayaran gagal dicatat." };
  }
}

export async function deleteDebtAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };
  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.DEBTS, id, user.id);
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.DEBTS, id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Utang gagal dihapus." };
  }
}
