import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth(function middleware(req: NextRequest & { auth: { user?: { role?: string } } | null }) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protected route patterns
  const isJobseekerRoute = pathname.startsWith("/jobseeker");
  const isEmployerRoute = pathname.startsWith("/employer");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/register");

  // Not authenticated on protected route → redirect to sign-in
  if ((isJobseekerRoute || isEmployerRoute || isAdminRoute) && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Wrong role → redirect to correct dashboard
  if (session?.user) {
    const role = session.user.role;

    if (isJobseekerRoute && role !== "jobseeker") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
    }
    if (isEmployerRoute && role !== "employer") {
      const url = new URL(`/${role}/dashboard`, req.url);
      url.searchParams.set("error", "employer_only");
      return NextResponse.redirect(url);
    }
    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
    }

    // Already logged in user visits auth page → redirect to their dashboard
    if (isAuthRoute) {
      const url = new URL(`/${role}/dashboard`, req.url);
      if (pathname === "/register" && req.nextUrl.searchParams.get("role") === "employer") {
        url.searchParams.set("error", "employer_only");
      }
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/jobseeker/:path*",
    "/employer/:path*",
    "/admin/:path*",
    "/sign-in",
    "/register",
  ],
};
