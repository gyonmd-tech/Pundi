"use server";

/**
 * actions/categories.ts
 * Server Actions untuk CRUD kategori transaksi (Appwrite + Demo Fallback).
 *
 * Kategori sebelumnya hanya pernah dibuat sekali oleh seedDefaultCategoriesAction
 * saat signup dan tidak pernah bisa diubah/dihapus dari mana pun di aplikasi.
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { getOwnedDocument } from "@/lib/appwrite/ownership";
import { Permission, Role, ID, Query } from "node-appwrite";
import { getAuthUserAction } from "./auth";
import { createCategorySchema } from "@/lib/validations/category";

function categoryPermissions(userId: string) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

export async function createCategoryAction(payload: { name: string; type: "income" | "expense"; icon: string; color: string }) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true, id: `cat-demo-${Date.now()}` };

  const parsed = createCategorySchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CATEGORIES,
      ID.unique(),
      { userId: user.id, ...parsed.data },
      categoryPermissions(user.id),
    );
    return { success: true, id: document.$id };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Kategori gagal disimpan." };
  }
}

export async function updateCategoryAction(payload: { id: string; name: string; type: "income" | "expense"; icon: string; color: string }) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };

  const parsed = createCategorySchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid." };
  }

  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.CATEGORIES, payload.id, user.id);
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, payload.id, parsed.data);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Kategori gagal diperbarui." };
  }
}

export async function deleteCategoryAction(id: string) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return { success: true };

  try {
    const { databases } = await createAdminServerClient();
    await getOwnedDocument(databases, COLLECTIONS.CATEGORIES, id, user.id);

    const [transactionsInUse, budgetsInUse] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTIONS.TRANSACTIONS, [
        Query.equal("userId", user.id), Query.equal("categoryId", id), Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.BUDGETS, [
        Query.equal("userId", user.id), Query.equal("categoryId", id), Query.limit(1),
      ]),
    ]);
    if (transactionsInUse.total > 0) {
      return { success: false, error: "Kategori masih dipakai transaksi. Pindahkan transaksinya ke kategori lain dulu." };
    }
    if (budgetsInUse.total > 0) {
      return { success: false, error: "Kategori masih dipakai anggaran. Hapus atau ubah anggarannya dulu." };
    }

    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Kategori gagal dihapus." };
  }
}
