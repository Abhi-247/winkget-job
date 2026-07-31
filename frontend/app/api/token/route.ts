import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Backend access tokens are now server-side only. Use /api/proxy instead." },
    { status: 410 }
  );
}
