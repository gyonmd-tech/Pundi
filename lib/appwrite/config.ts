/**
 * Shared Appwrite configuration.
 *
 * Vercel values are plain strings. This normalizer also accepts values copied
 * from dotenv files with wrapping quotes, so a deployment cannot pass an
 * endpoint such as `"https://.../v1"` to the Appwrite SDK.
 */
export function normalizeEnvironmentValue(value: string | undefined, fallback = "") {
  let normalized = (value ?? fallback).trim();

  while (normalized.length >= 2) {
    const first = normalized.at(0);
    const last = normalized.at(-1);
    const isWrapped = (first === '"' && last === '"') || (first === "'" && last === "'");
    if (!isWrapped) break;
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized || fallback;
}

function warnMissingEnv(varName: string) {
  // Hanya untuk visibilitas developer; mode demo/guest tetap berjalan tanpa
  // Appwrite (lihat actions/auth.ts, actions/bootstrap.ts), jadi ini tidak
  // menghentikan aplikasi — tapi setiap panggilan Appwrite nyata akan gagal
  // dengan jelas alih-alih diam-diam menyasar proyek yang salah.
  if (process.env.NODE_ENV !== "production") return;
  console.warn(
    `[appwrite/config] ${varName} tidak diset. Fitur berbasis akun cloud tidak akan berfungsi ` +
      `sampai environment variable ini dikonfigurasi di deployment.`,
  );
}

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) warnMissingEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) warnMissingEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
if (!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) warnMissingEnv("NEXT_PUBLIC_APPWRITE_DATABASE_ID");

export const APPWRITE_ENDPOINT = normalizeEnvironmentValue(
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  "https://sgp.cloud.appwrite.io/v1",
).replace(/\/+$/, "");

export const APPWRITE_PROJECT_ID = normalizeEnvironmentValue(
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  "pundi-production",
);

export const APPWRITE_DATABASE_ID = normalizeEnvironmentValue(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  "pundi-db",
);