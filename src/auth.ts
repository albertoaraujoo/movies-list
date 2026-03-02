import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { loginWithGoogle } from "@/lib/api";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        try {
          const data = await loginWithGoogle(account.id_token);
          token["accessToken"] = data.accessToken;
          token["backendUser"] = data.user;
        } catch (error) {
          console.error("[Auth] Falha ao trocar token com o backend:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      const accessToken = token["accessToken"] as string | undefined;
      const backendUser = token["backendUser"] as
        | { id: string; name: string; email: string }
        | undefined;

      if (accessToken) {
        session.accessToken = accessToken;
      }

      if (backendUser) {
        session.user = {
          ...session.user,
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
        };
      }

      return session;
    },
  },
});
