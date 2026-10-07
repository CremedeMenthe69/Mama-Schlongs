import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath, revalidateTag } from "next/cache";
import { getLatestPost, type Post } from "@/lib/posts";

// Saves a new post record. The artwork file was already uploaded
// straight from the browser; this just records its link + caption.
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  try {
    const { url, filename, caption } = await req.json();
    const prev = await getLatestPost();

    const post: Post = {
      url: url || prev?.url || "",
      filename: filename || prev?.filename || "",
      caption: caption ?? "",
      date: new Date().toISOString().slice(0, 10),
    };

    if (!post.url) {
      return NextResponse.json({ error: "Add a file first." }, { status: 400 });
    }

    await put(`posts/${Date.now()}.json`, JSON.stringify(post), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    // Tell the site there's a new post so visitors see it right away
    revalidateTag("posts");
    revalidatePath("/");

    return NextResponse.json({ ok: true, work: post });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Save failed." }, { status: 500 });
  }
}
