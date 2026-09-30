/**
 * lib/security/rateLimit.ts
 *
 * Pembatas laju permintaan (rate limiter) sederhana berbasis memori proses,
 * untuk mencegah percobaan login/pendaftaran bertubi-tubi dari satu sumber.
 *
 * Catatan: ini adalah lapisan pertahanan terbaik-upaya (best-effort), bukan
 * pengganti pembatasan di level infrastruktur (mis. WAF/Appwrite Cloud). Pada
 * lingkungan serverless dengan banyak instance atau cold start, penghitung
 * ini bisa ter-reset dan tidak dibagi antar instance — untuk skala publik
 * yang lebih besar, gantikan dengan penyimpanan bersama (mis. Redis/Upstash).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Bersihkan bucket kedaluwarsa secara berkala agar Map tidak tumbuh tanpa batas.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Sliding-window sederhana per `key` (biasanya `"<aksi>:<ip>"` atau
 * `"<aksi>:<email>"`). Mengizinkan maksimal `limit` percobaan dalam
 * `windowMs` milidetik.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Ambil alamat IP terbaik dari header proxy (x-forwarded-for/x-real-ip).
 * Mengembalikan "unknown" jika tidak tersedia — pemanggil sebaiknya
 * menggabungkan ini dengan identitas lain (mis. email) agar limiter tetap
 * berguna walau IP tidak terbaca.
 */
export function getClientIpFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
