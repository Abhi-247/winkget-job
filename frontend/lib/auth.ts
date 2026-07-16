import NextAuth, { NextAuthConfig, Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
        console.log("[AUTH] Authorizing credentials:", { email: credentials.email, role: credentials.role });
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
        console.log("[AUTH] Backend login response status:", res.status, "success:", data.success);
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

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authConfig: NextAuthConfig = {
  providers,

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ account, profile, user }) {
      console.log("[AUTH] signIn callback:", { provider: account?.provider, userId: user?.id });
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
        } catch (err: any) {
          console.error("[AUTH] Google signIn error:", err.message);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      console.log("[AUTH] jwt callback - initial token:", { id: token.id, role: token.role }, "hasUser:", !!user);
      if (user) {
        token.id = (user as NextAuthUser & { id: string }).id;
        token.role = (user as NextAuthUser & { role: string }).role;

        // Store the accessToken directly in the JWT cookie
        const backendToken = (
          user as NextAuthUser & { accessToken: string }
        ).accessToken;
        if (backendToken) {
          console.log("[AUTH] Storing accessToken in JWT cookie");
          token.accessToken = backendToken;
        }
      }
      
      // Clean up massive base64 avatar properties to keep the cookie size small
      delete token.picture;
      delete (token as any).picture;
      delete (token as any).image;
      delete (token as any).avatar;

      console.log("[AUTH] jwt callback - token keys:", Object.keys(token));
      console.log("[AUTH] jwt callback - returning token stringified length:", JSON.stringify(token).length);
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("[AUTH] session callback - input token:", { id: token.id, role: token.role });
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
