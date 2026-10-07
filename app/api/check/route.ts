import { NextRequest, NextResponse } from "next/server";

// Verifies the admin password at login
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const ok = !!process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
