import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

const protectedPrefixes = ["/home", "/dashboard", "/configuration", "/locations", "/access", "/audit-logs", "/support"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/dashboard/:path*", "/configuration/:path*", "/locations/:path*", "/access/:path*", "/audit-logs/:path*", "/support/:path*", "/home"],
};
