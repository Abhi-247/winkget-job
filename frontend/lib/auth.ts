import NextAuth, { NextAuthConfig, Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Extend types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      accessToken: string;
    };
  }
  interface User {
    id: string;
    role: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) return null;
          return {
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            image: data.user.avatar || null,
            role: data.user.role,
            accessToken: data.token,
          };
        } catch {
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ account, profile, user }) {
      // For Google OAuth, exchange the id_token with our backend
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await fetch(`${API}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: account.id_token,
              role: "jobseeker",
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) return false;
          // Attach backend data to user object for jwt callback
          (user as NextAuthUser & { role: string; accessToken: string }).role =
            data.user.role;
          (
            user as NextAuthUser & { role: string; accessToken: string }
          ).accessToken = data.token;
          (user as NextAuthUser & { id: string }).id = data.user._id;
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as NextAuthUser & { id: string }).id;
        token.role = (user as NextAuthUser & { role: string }).role;
        token.accessToken = (
          user as NextAuthUser & { accessToken: string }
        ).accessToken;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
