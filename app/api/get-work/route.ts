import { NextResponse } from "next/server";
import { getLatestPost, getAbout } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [work, about] = await Promise.all([getLatestPost(), getAbout()]);
    return NextResponse.json({ work, about });
  } catch {
    return NextResponse.json({ work: null, about: "" });
  }
}
