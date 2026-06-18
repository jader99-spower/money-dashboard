import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isRoot = request.nextUrl.pathname === "/";

  // NextAuth v5 sets __Secure- prefix on HTTPS (production), plain on HTTP (dev)
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("authjs.session-token");

  const isAuthenticated = !!sessionToken;

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isRoot && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
