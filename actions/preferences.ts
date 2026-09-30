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

import { createAdminServerClient } from "@/lib/appwrite/server";
import { getAuthUserAction } from "./auth";
import { DEFAULT_PREFERENCES, type UserPreferences } from "@/lib/data/mock";

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
