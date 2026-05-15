import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = [
        "/dashboard",
        "/lots",
        "/tasting",
        "/auction",
        "/reports",
        "/admin",
      ]
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p)
      )
      if (isProtected) return isLoggedIn
      return true
    },
  },
  providers: [],
}
