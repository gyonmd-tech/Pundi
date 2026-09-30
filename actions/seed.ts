"use server";

/**
 * actions/seed.ts
 * Inisialisasi data awal (Akun default & Kategori transaksi standar) untuk pengguna baru.
 *
 * Keamanan: fungsi ini HARUS selalu menyeed data untuk pengguna yang sedang
 * login (dari sesi/cookie), bukan untuk sembarang userId yang dikirim caller.
 * Sebelumnya userId diterima langsung sebagai parameter tanpa verifikasi sesi,
 * yang memungkinkan Server Action ini dipanggil langsung (di luar alur signup)
 * untuk menulis akun/kategori atas nama userId siapa pun yang ditebak.
 */

import { createAdminServerClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/collections";
import { Permission, Role, ID } from "node-appwrite";
import { mockCategories } from "@/lib/data/mock";
import { getAuthUserAction } from "./auth";

export async function seedDefaultCategoriesAction() {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: false, error: "Sesi login tidak ditemukan." };
  }

  const userId = user.id;

  try {
    const { databases } = await createAdminServerClient();
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

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
      },
      permissions
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
        },
        permissions
      );
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error seeding default categories:", message);
    return { success: false, error: message };
  }
}
