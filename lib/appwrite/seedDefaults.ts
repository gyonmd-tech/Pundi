/**
 * lib/appwrite/seedDefaults.ts
 * Data awal pengguna baru: satu rekening dan kategori standar.
 *
 * IDEMPOTEN: setiap dokumen memakai ID deterministik (pengguna + kunci),
 * sehingga aman dipanggil berulang — saat signup, dan lagi saat aplikasi
 * dibuka bila seed sebelumnya gagal di tengah jalan. Dokumen yang sudah ada
 * (409) dilewati.
 *
 * Bukan file "use server".
 */
import { createHash } from "node:crypto";
import { Permission, Role } from "node-appwrite";
import type { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { mockCategories } from "@/lib/data/mock";

type AdminDatabases = Awaited<ReturnType<typeof createAdminServerClient>>["databases"];

export function seedDocumentId(prefix: "a" | "c", userId: string, key: string) {
  return prefix + createHash("sha256").update(`${userId}|${key}`).digest("hex").slice(0, 35);
}

async function createIfMissing(databases: AdminDatabases, collectionId: string, id: string, data: Record<string, unknown>, userId: string) {
  try {
    await databases.createDocument(DATABASE_ID, collectionId, id, data, [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]);
  } catch (error) {
    if ((error as { code?: number })?.code !== 409) throw error;
  }
}

export async function seedDefaultsForUser(databases: AdminDatabases, userId: string) {
  await createIfMissing(databases, COLLECTIONS.ACCOUNTS, seedDocumentId("a", userId, "default-account"), {
    userId,
    name: "Dompet Utama / Rekening Bank",
    type: "bank",
    balance: 0,
    colorTag: "#1B4B3F",
    isActive: true,
  }, userId);

  for (const category of mockCategories) {
    await createIfMissing(databases, COLLECTIONS.CATEGORIES, seedDocumentId("c", userId, category.id), {
      userId,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    }, userId);
  }
}
