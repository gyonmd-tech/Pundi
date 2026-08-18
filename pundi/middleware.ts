import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // ── Demo Mode ──────────────────────────────────────────────────
  // Untuk portfolio demo: semua route app dapat diakses tanpa auth.
  // Ketika Supabase credentials asli sudah dikonfigurasi,
  // uncomment blok auth di bawah dan hapus baris ini.
  // (ARCHITECTURE.md § 5: tombol 'Coba Demo' untuk pengalaman portfolio)
  return NextResponse.next();

  // ── Auth Guard (aktifkan setelah Supabase dikonfigurasi) ────────
  // Uncomment blok di bawah ini saat Supabase sudah terhubung.
  //
  // import { createServerClient } from '@supabase/ssr';
  //
  // let supabaseResponse = NextResponse.next({ request });
  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   { cookies: { getAll() { return request.cookies.getAll(); }, setAll(s) { ... } } }
  // );
  // const { data: { user } } = await supabase.auth.getUser();
  // const isAppRoute = ["/dashboard","/transaksi","/anggaran","/arus-kas","/aset","/tujuan","/insight","/pengaturan"]
  //   .some(p => request.nextUrl.pathname.startsWith(p));
  // if (!user && isAppRoute) {
  //   const url = request.nextUrl.clone(); url.pathname = '/login'; return NextResponse.redirect(url);
  // }
  // return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
