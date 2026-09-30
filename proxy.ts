import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * proxy.ts (pengganti middleware.ts di Next.js 16)
 *
 * Hanya menambahkan header keamanan pada setiap response — TIDAK dipakai
 * untuk menggerbangi rute berdasarkan sesi. Alasan:
 * 1. Guest browsing tanpa login pada /(app)/* adalah fitur yang disengaja
 *    (lihat actions/bootstrap.ts — mode "guest" menampilkan data demo).
 * 2. Dokumentasi Next.js sendiri memperingatkan Server Function tidak
 *    dianggap rute terpisah, sehingga matcher proxy bisa diam-diam tidak
 *    melindunginya — otorisasi tetap wajib diverifikasi di setiap Server
 *    Action (sudah dilakukan lewat getAuthUserAction + getOwnedDocument).
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: fonts.gstatic.com",
      "connect-src 'self' https://*.appwrite.io https://*.cloud.appwrite.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|PUNDI-brand-assets|.*\\.(?:svg|png|jpg|jpeg|ico|mp4)$).*)"],
};
