"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      return result;
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    await signIn("google", { redirect: false });
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/sign-in");
  }, [router]);

  const redirectToDashboard = useCallback(() => {
    if (!user?.role) return;
    router.push(`/${user.role}/dashboard`);
  }, [user, router]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    loginWithCredentials,
    loginWithGoogle,
    logout,
    redirectToDashboard,
  };
}
