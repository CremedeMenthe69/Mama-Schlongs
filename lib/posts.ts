import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";

export interface Post {
  url: string;       // where the artwork file lives
  filename: string;  // original file name (used to pick the right viewer)
  caption: string;
  date: string;
}

// These results are remembered by the site, so visitors don't trigger a
// storage lookup. The memory is cleared whenever you hit Save in /admin
// (and refreshed once a day as a safety net).
const ONE_DAY = 60 * 60 * 24;

export const getLatestPost = unstable_cache(
  async () => fetchLatest<Post>("posts/"),
  ["latest-post"],
  { tags: ["posts"], revalidate: ONE_DAY }
);

export const getAbout = unstable_cache(
  async () => (await fetchLatest<{ text: string }>("about/"))?.text ?? "",
  ["about-text"],
  { tags: ["about"], revalidate: ONE_DAY }
);

// Every save creates a new <prefix><timestamp>.json record.
// The newest one is what the site shows; older ones are kept as history.
async function fetchLatest<T>(prefix: string): Promise<T | null> {
  const { blobs } = await list({ prefix });
  if (!blobs.length) return null;
  const latest = blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )[0];
  // Each record has a unique address and never changes, so it's safe to cache
  const res = await fetch(latest.url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Couldn't read ${prefix} record`);
  return (await res.json()) as T;
}
