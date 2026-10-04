import { NextResponse, type NextRequest } from "next/server";

import { readSessionToken, sessionCookie } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const session = await readSessionToken(request.cookies.get(sessionCookie)?.value, process.env.ADMIN_SESSION_SECRET);
  if (pathname === "/admin/login") {
    if (!session) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (session) return NextResponse.next();
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
