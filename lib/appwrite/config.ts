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