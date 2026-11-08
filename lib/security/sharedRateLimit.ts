/**
 * lib/security/sharedRateLimit.ts
 * Pembatas laju yang DIBAGI antar instance server (Vercel serverless),
 * disimpan di koleksi Appwrite `rate_limits`.
 *
 * Satu dokumen per (key, jendela waktu) dengan ID deterministik. Hitungan
 * dinaikkan memakai incrementDocumentAttribute dengan `max = limit`: Appwrite
 * menolak kenaikan yang melewati batas secara atomik, jadi permintaan paralel
 * tidak bisa menyelinap melewati limit.
 *
 * Bila koleksi belum dibuat (`npm run db:setup` belum dijalankan) atau
 * Appwrite tidak bisa dihubungi, jatuh kembali ke limiter memori lama —
 * login tidak pernah terblokir karena masalah infrastruktur limiter.
 */
import { createHash } from "node:crypto";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/collections";
import { checkRateLimit, type RateLimitResult } from "@/lib/security/rateLimit";

type RateLimitDatabases = Pick<
  Awaited<ReturnType<typeof createAdminServerClient>>["databases"],
  "createDocument" | "incrementDocumentAttribute"
>;

export function rateLimitDocumentId(key: string, windowStart: number) {
  return "l" + createHash("sha256").update(`${key}|${windowStart}`).digest("hex").slice(0, 35);
}

const codeOf = (error: unknown) => (error as { code?: number } | null)?.code;

export async function checkSharedRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  getDatabases: () => Promise<RateLimitDatabases> = async () => (await createAdminServerClient()).databases,
  now = Date.now(),
): Promise<RateLimitResult> {
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  const documentId = rateLimitDocumentId(key, windowStart);

  try {
    const databases = await getDatabases();
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.RATE_LIMITS, documentId, {
        key: key.slice(0, 128),
        count: 0,
        expiresAt: new Date(resetAt).toISOString(),
      });
    } catch (error) {
      if (codeOf(error) !== 409) throw error; // 409 = jendela ini sudah ada
    }

    try {
      await databases.incrementDocumentAttribute({
        databaseId: DATABASE_ID, collectionId: COLLECTIONS.RATE_LIMITS, documentId,
        attribute: "count", value: 1, max: limit,
      });
      return { allowed: true, retryAfterSeconds: 0 };
    } catch (error) {
      if (codeOf(error) === 400) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
      }
      throw error;
    }
  } catch {
    return checkRateLimit(key, limit, windowMs);
  }
}
