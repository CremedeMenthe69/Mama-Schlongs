import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath, revalidateTag } from "next/cache";

// Saves the About page text
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  try {
    const { text } = await req.json();
    await put(`about/${Date.now()}.json`, JSON.stringify({ text: text ?? "" }), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    revalidateTag("about");
    revalidatePath("/about");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Save failed." }, { status: 500 });
  }
}
