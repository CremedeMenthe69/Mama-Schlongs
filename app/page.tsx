import GalleryView from "@/components/GalleryView";
import { getLatestPost } from "@/lib/posts";

// Served from cache; refreshed instantly when you save in /admin
export const revalidate = 86400;

export default async function Home() {
  const work = await getLatestPost();
  return <GalleryView work={work} />;
}
