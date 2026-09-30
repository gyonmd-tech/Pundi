"use server";

/**
 * actions/preferences.ts
 * Preferensi personalisasi per-pengguna (toggle, akun default, tema, warna
 * aksen, avatar) — disimpan lewat Appwrite Users Preferences API bawaan
 * (users.getPrefs/updatePrefs), BUKAN koleksi database baru. Preferensi
 * kecil berbentuk key-value seperti ini persis kegunaan API tersebut.
 *
 * Mode demo tidak punya user Appwrite asli, jadi tidak ada yang bisa
 * disimpan di server — persist dilakukan di localStorage sisi klien
 * (lib/data/store.tsx), konsisten dengan filosofi demo yang sudah ada
 * (data demo memang tidak permanen di server).
 */

import { ID, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { getAuthUserAction } from "./auth";
import { DEFAULT_PREFERENCES, type UserPreferences } from "@/lib/data/mock";
import { AVATAR_BUCKET_ID, ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE_BYTES } from "@/lib/appwrite/storage";

function sanitize(raw: Partial<UserPreferences>): UserPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...raw,
  };
}

export async function getPreferencesAction(): Promise<UserPreferences> {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return DEFAULT_PREFERENCES;

  try {
    const { users } = await createAdminServerClient();
    const prefs = await users.getPrefs(user.id);
    return sanitize(prefs as Partial<UserPreferences>);
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function updatePreferencesAction(partial: Partial<UserPreferences>): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };
  if (user.isDemo) return { success: true, preferences: sanitize(partial) };

  try {
    const { users } = await createAdminServerClient();
    const current = await users.getPrefs(user.id).catch(() => ({}));
    const next = sanitize({ ...(current as Partial<UserPreferences>), ...partial });
    await users.updatePrefs(user.id, next);
    return { success: true, preferences: next };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Preferensi gagal disimpan." };
  }
}

export async function uploadAvatarAction(formData: FormData): Promise<{ success: boolean; avatarFileId?: string; error?: string }> {
  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };
  if (user.isDemo) return { success: false, error: "Avatar tidak dapat diubah pada mode demo." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { success: false, error: "File tidak ditemukan." };
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { success: false, error: "Format harus JPG, PNG, atau WebP." };
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { success: false, error: "Ukuran file maksimal 2MB." };
  }

  try {
    const { users, storage } = await createAdminServerClient();
    const previousPrefs = await users.getPrefs(user.id).catch(() => ({} as Partial<UserPreferences>));
    const previousFileId = (previousPrefs as Partial<UserPreferences>).avatarFileId;

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await storage.createFile({
      bucketId: AVATAR_BUCKET_ID,
      fileId: ID.unique(),
      file: InputFile.fromBuffer(buffer, file.name || "avatar"),
      permissions: [
        Permission.read(Role.any()),
        Permission.update(Role.user(user.id)),
        Permission.delete(Role.user(user.id)),
      ],
    });

    const next = sanitize({ ...(previousPrefs as Partial<UserPreferences>), avatarFileId: uploaded.$id });
    await users.updatePrefs(user.id, next);

    if (previousFileId && previousFileId !== uploaded.$id) {
      await storage.deleteFile(AVATAR_BUCKET_ID, previousFileId).catch(() => {
        // Avatar lama gagal dihapus — tidak fatal, hanya menyisakan file yatim di bucket.
      });
    }

    return { success: true, avatarFileId: uploaded.$id };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Avatar gagal diunggah." };
  }
}
