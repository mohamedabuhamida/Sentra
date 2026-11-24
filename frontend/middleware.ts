import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ["/login", "/signup"];

// Asset/internal route prefixes that are always allowed
const PUBLIC_PREFIXES = [
  "/_next/",
  "/api/",
  "/favicon",
  "/.well-known",
];

// Cookie name where we store the Supabase access token
const TOKEN_COOKIE = "sentra_auth_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public route prefixes (static assets, Next internals, etc.)
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow image/icon files at root
  if (/\.(png|ico|svg|jpg|jpeg|webp|gif|woff2?|ttf|otf|css|js)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // Allow public pages (login, signup)
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    // No session — redirect to login, preserving the original destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token present — allow through
  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
