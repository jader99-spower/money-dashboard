import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac } from "crypto";

function makeToken() {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update("admin-session-v1").digest("hex");
}

export function proxy(request: NextRequest) {
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isRoot = request.nextUrl.pathname === "/";

  const cookie = request.cookies.get("admin-session");
  const isAuthenticated = cookie?.value === makeToken();

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
