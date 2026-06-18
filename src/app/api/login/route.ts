import { NextResponse } from "next/server";

const ADMIN_ID = process.env.ADMIN_ID ?? "admin";
const ADMIN_PW = process.env.ADMIN_PW ?? "admin";

export async function POST(req: Request) {
  const { username, password } = await req.json() as { username: string; password: string };

  if (username !== ADMIN_ID || password !== ADMIN_PW) {
    return Response.json({ error: "아이디 또는 비밀번호가 틀렸습니다." }, { status: 401 });
  }

  const sessionSecret = process.env.AUTH_SECRET ?? "dev-secret";
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-session", sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
