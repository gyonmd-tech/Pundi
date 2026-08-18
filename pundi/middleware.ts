import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Session check via Appwrite session cookie
  const sessionCookie = request.cookies.get("pundi-session");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");

  // If user has session and visits login/signup, redirect to dashboard
  if (sessionCookie && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
