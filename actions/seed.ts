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
import { seedDefaultsForUser } from "@/lib/appwrite/seedDefaults";
import { getAuthUserAction } from "./auth";

export async function seedDefaultCategoriesAction() {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) {
    return { success: false, error: "Sesi login tidak ditemukan." };
  }

  const userId = user.id;

  try {
    const { databases } = await createAdminServerClient();
    await seedDefaultsForUser(databases, userId);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error seeding default categories:", message);
    return { success: false, error: message };
  }
}
