/**
 * lib/appwrite/storage.ts
 * Konstanta & helper untuk Appwrite Storage (bucket avatar).
 *
 * Catatan keamanan: file avatar diunggah dengan izin BACA publik
 * (Permission.read(Role.any())) — sengaja berbeda dari seluruh koleksi
 * database lain di app ini yang read-nya dibatasi per-pengguna. Ini
 * trade-off yang disadari: foto profil bukan data finansial sensitif, dan
 * membuatnya publicly-readable memungkinkan <img src> langsung memuat URL
 * Appwrite tanpa perlu route proxy autentikasi tambahan. Tulis/ubah/hapus
 * tetap dibatasi ke pemilik file (Role.user(userId)).
 */
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/appwrite/config";

export const AVATAR_BUCKET_ID = "avatars";
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB, selaras appwrite.json
export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function getAvatarUrl(fileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${AVATAR_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}
