/**
 * lib/appwrite/storage.ts
 * Konstanta & helper untuk Appwrite Storage (bucket avatar).
 *
 * Catatan keamanan: file avatar bersifat privat (hanya pemilik yang bisa
 * membaca). Browser memuatnya lewat route /api/avatar/[fileId] yang memeriksa
 * sesi pengguna, bukan langsung dari URL Appwrite.
 */
export const AVATAR_BUCKET_ID = "avatars";
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB, selaras appwrite.json
export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function getAvatarUrl(fileId: string): string {
  return `/api/avatar/${encodeURIComponent(fileId)}`;
}
