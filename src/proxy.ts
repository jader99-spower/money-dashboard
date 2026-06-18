import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

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
