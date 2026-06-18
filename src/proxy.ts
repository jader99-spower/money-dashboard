import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isRoot = request.nextUrl.pathname === "/";

  const sessionSecret = process.env.AUTH_SECRET ?? "dev-secret";
  const cookie = request.cookies.get("admin-session");
  const isAuthenticated = cookie?.value === sessionSecret;

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
