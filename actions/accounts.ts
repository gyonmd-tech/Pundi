"use server";

import { ID, Permission, Query, Role } from "node-appwrite";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { getAuthUserAction } from "./auth";
import type { Account, AccountType } from "@/lib/data/mock";
import { recordAuditLog } from "@/lib/appwrite/auditLog";

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
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      ID.unique(),
      {
        userId: user.id,
        name: data.name,
        type: data.type,
        balance: data.balance,
        colorTag: data.colorTag,
        isActive: data.isActive,
      },
      [
        Permission.read(Role.user(user.id)),
        Permission.update(Role.user(user.id)),
        Permission.delete(Role.user(user.id)),
      ]
    );
    await recordAuditLog(databases, user.id, {
      entityType: "account", entityId: document.$id, action: "create",
      summary: `Membuat rekening "${data.name}"`, after: data,
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
    const previous = await getOwnedDocument(databases, COLLECTIONS.ACCOUNTS, payload.id, user.id);
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, payload.id, {
      name: data.name,
      type: data.type,
      balance: data.balance,
      colorTag: data.colorTag,
      isActive: data.isActive,
    });
    await recordAuditLog(databases, user.id, {
      entityType: "account", entityId: payload.id, action: "update",
      summary: `Mengubah rekening "${data.name}"`, before: previous, after: data,
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
      Query.limit(500),
    ]);
    if (transactions.documents.some((transaction) => transaction.accountId === id || transaction.destinationAccountId === id)) throw new Error("Rekening memiliki riwayat transaksi. Nonaktifkan rekening agar riwayat tetap utuh.");

    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, id);
    await recordAuditLog(databases, user.id, {
      entityType: "account", entityId: id, action: "delete",
      summary: `Menghapus rekening "${account.name}"`, before: account,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Rekening gagal dihapus." };
  }
}
