import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { loginWithGoogle } from "@/lib/api";
import type { ProfilePrivacy } from "@/lib/types";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      username?: string | null;
      privacy?: ProfilePrivacy;
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
    async jwt({ token, account, trigger, session }) {
      if (account?.id_token) {
        try {
          const data = await loginWithGoogle(account.id_token);
          token["accessToken"] = data.accessToken;
          token["backendUser"] = data.user;
        } catch (error) {
          console.error("[Auth] Falha ao trocar token com o backend:", error);
        }
      }

      if (trigger === "update" && session?.user) {
        token["backendUser"] = {
          ...(token["backendUser"] as Record<string, unknown>),
          ...session.user,
        };
      }

      return token;
    },
    async session({ session, token }) {
      const accessToken = token["accessToken"] as string | undefined;
      const backendUser = token["backendUser"] as
        | {
            id: string;
            name: string;
            email: string;
            username?: string | null;
            privacy?: ProfilePrivacy;
          }
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
          username: backendUser.username,
          privacy: backendUser.privacy,
        };
      }

      return session;
    },
  },
});
