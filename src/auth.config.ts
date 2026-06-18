import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
} satisfies NextAuthConfig;
