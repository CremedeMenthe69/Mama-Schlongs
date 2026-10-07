import type { Metadata } from "next";
import Shell, { Underline } from "@/components/Shell";
import { getAbout } from "@/lib/posts";

// Served from cache; refreshed instantly when you save in /admin
export const revalidate = 86400;
export const metadata: Metadata = { title: "About Mama | Mama Schlong's Gallery" };

export default async function AboutPage() {
  const text = await getAbout();
  // A blank line in the admin text box starts a new paragraph
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <Shell page="about">
      <section className="mm-menu">
        <h2>About Mama</h2>
        <Underline />
        <div className="mm-about">
          <figure className="mm-polaroid" style={{ margin: 0 }}>
            <img src="/mamas-boys.jpg" alt="Mama's two boys, shaking hands" />
            <span>My boys</span>
          </figure>
          <div>
            {paragraphs.length
              ? paragraphs.map((p, i) => <p key={i} style={{ whiteSpace: "pre-line" }}>{p}</p>)
              : <p>Mama hasn&apos;t written anything here yet. Sit down, have some bread.</p>}
          </div>
        </div>
      </section>
    </Shell>
  );
}
