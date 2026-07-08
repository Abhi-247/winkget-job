import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAccessToken } from "@/lib/tokenStore";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const token = getAccessToken(session.user.id);
  if (!token) {
    return NextResponse.json(
      { error: "Token expired, please sign in again" },
      { status: 401 }
    );
  }

  return NextResponse.json({ accessToken: token });
}
