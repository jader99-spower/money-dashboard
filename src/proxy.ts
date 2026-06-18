import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isRoot = request.nextUrl.pathname === "/";

  if (isDashboard && !request.auth) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isRoot && request.auth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
