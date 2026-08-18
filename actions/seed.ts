"use server";

/**
 * actions/seed.ts
 * Inisialisasi data awal (Akun default & Kategori transaksi standar) untuk pengguna baru.
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { ID } from "node-appwrite";
import { mockCategories } from "@/lib/data/mock";

export async function seedDefaultCategoriesAction(userId: string) {
  try {
    const { databases } = await createAdminServerClient();

    // 1. Buat Akun default
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNTS,
      ID.unique(),
      {
        userId,
        name: "Dompet Utama / Rekening Bank",
        type: "bank",
        balance: 0,
        colorTag: "#1B4B3F",
        isActive: true,
      }
    );

    // 2. Buat Kategori default
    for (const cat of mockCategories) {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CATEGORIES,
        ID.unique(),
        {
          userId,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
        }
      );
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error seeding default categories:", err.message);
    return { success: false, error: err.message };
  }
}
