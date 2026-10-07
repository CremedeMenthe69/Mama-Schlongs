import { NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";

// Hands the admin page a one-time upload link so the browser can send
// the file straight to Vercel Blob. Works with any file size, and only
// for someone who knows the admin password.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const json = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        if (!process.env.ADMIN_PASSWORD || clientPayload !== process.env.ADMIN_PASSWORD) {
          throw new Error("Not authorized");
        }
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          validUntil: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        return {
          token,
          urlOptions: { addRandomSuffix: true, allowOverwrite: false },
        };
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    const message = (err as Error).message || "Upload failed.";
    return NextResponse.json({ error: message }, { status: message === "Not authorized" ? 401 : 400 });
  }
}
