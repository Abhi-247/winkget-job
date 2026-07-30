import NextAuth, { NextAuthConfig, Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api/v1";

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
    accessToken?: string;
  }
}

const providers: NextAuthConfig["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      role: { label: "Role", type: "text" },
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
            role: credentials.role,
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
      } catch (err: any) {
        console.error("[AUTH] Authorize exception:", err.message);
        return null;
      }
    },
  }),
];

export const authConfig: NextAuthConfig = {
  providers,
  trustHost: true,

  session: { strategy: "jwt" },

  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as NextAuthUser & { id: string }).id;
        token.role = (user as NextAuthUser & { role: string }).role;

        // Store the accessToken directly in the JWT cookie
        const backendToken = (
          user as NextAuthUser & { accessToken: string }
        ).accessToken;
        if (backendToken) {
          token.accessToken = backendToken;
        }
      }
      
      // Clean up massive base64 avatar properties to keep the cookie size small
      delete token.picture;
      delete (token as any).picture;
      delete (token as any).image;
      delete (token as any).avatar;

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id;
      session.user.role = token.role;
      // Retrieve accessToken directly from the JWT cookie
      session.user.accessToken = token.accessToken || "";
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
