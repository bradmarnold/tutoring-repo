import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = new URL(req.url);
  const needs = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  
  // Allow access to login page and login API without authentication
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }
  
  if (!needs) return NextResponse.next();
  const cookie = req.cookies.get("admin");
  if (cookie?.value === process.env.ADMIN_PASSWORD) return NextResponse.next();
  if (pathname.startsWith("/api")) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL("/admin/login", req.url);
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
