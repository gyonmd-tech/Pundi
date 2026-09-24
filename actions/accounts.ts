"use server";

import { ID, Query } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { getAuthUserAction } from "./auth";
import type { Account, AccountType } from "@/lib/data/mock";

const accountTypes: AccountType[] = ["bank", "ewallet", "cash", "credit_card", "investment"];

type AccountPayload = Omit<Account, "id">;

function validateAccount(payload: AccountPayload) {
  const name = payload.name.trim();
  if (name.length < 2 || name.length > 100) throw new Error("Nama rekening harus terdiri dari 2–100 karakter.");
  if (!accountTypes.includes(payload.type)) throw new Error("Jenis rekening tidak valid.");
  if (!Number.isSafeInteger(payload.balance)) throw new Error("Saldo awal harus berupa angka bulat.");
  if (!/^#[0-9A-Fa-f]{6}$/.test(payload.colorTag)) throw new Error("Warna rekening tidak valid.");
  return { ...payload, name };
}

export async function createAccountAction(payload: AccountPayload) {
  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };
  if (user.isDemo) return { success: true, id: `acc-${Date.now()}` };

  try {
    const data = validateAccount(payload);
    const { databases } = await createAdminServerClient();
    const document = await databases.createDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, ID.unique(), {
      userId: user.id,
      name: data.name,
      type: data.type,
      balance: data.balance,
      colorTag: data.colorTag,
      isActive: data.isActive,
    });
    return { success: true, id: document.$id };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Rekening gagal dibuat." };
  }
}

export async function updateAccountAction(payload: Account) {
  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };
  if (user.isDemo) return { success: true };

  try {
    const data = validateAccount(payload);
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, payload.id, user.id);
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, payload.id, {
      name: data.name,
      type: data.type,
      balance: data.balance,
      colorTag: data.colorTag,
      isActive: data.isActive,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Rekening gagal diperbarui." };
  }
}

export async function deleteAccountAction(id: string) {
  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };
  if (user.isDemo) return { success: true };

  try {
    const { databases } = await createAdminServerClient();
    const account = await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, id, user.id);
    const accounts = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ACCOUNTS, [
      Query.equal("userId", user.id),
      Query.limit(2),
    ]);
    if (accounts.total <= 1) throw new Error("Minimal satu rekening harus tetap tersedia.");
    if (Number(account.balance) !== 0) throw new Error("Kosongkan atau pindahkan saldo rekening sebelum menghapusnya.");

    const transactions = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TRANSACTIONS, [
      Query.equal("userId", user.id),
      Query.equal("accountId", id),
      Query.limit(1),
    ]);
    if (transactions.total > 0) throw new Error("Rekening memiliki riwayat transaksi. Nonaktifkan rekening agar riwayat tetap utuh.");

    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Rekening gagal dihapus." };
  }
}