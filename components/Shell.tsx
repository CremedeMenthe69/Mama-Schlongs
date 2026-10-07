import { CUP_SVG, CHIANTI_SVG } from "./art";

// Renders one of the hand-drawn SVGs
export function Art({ svg, className }: { svg: string; className?: string }) {
  return <span className={`mm-art ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}

type Page = "special" | "about" | "kitchen";

// The restaurant: awning, sign, table props, footer
export default function Shell({ page, children }: { page: Page; children: React.ReactNode }) {
  return (
    <>
      <div className="mm-awning" aria-hidden="true" />
      <div className="mm-wrap">
        <header className="mm-sign">
          <img src="/mama.png" alt="Mama Schlong" className="mm-logo" />
          <a href="/" className="mm-title">
            <h1>Mama Schlong&apos;s</h1>
            <span>Gallery</span>
          </a>
          <nav className="mm-nav">
            <a href="/" className="mm-tab" aria-current={page === "special" ? "page" : undefined}>Today&apos;s special</a>
            <a href="/about" className="mm-tab" aria-current={page === "about" ? "page" : undefined}>About Mama</a>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="mm-footer">
          <span>Mama Schlong&apos;s Gallery. Est. 1987. Cash only, no substitutions.</span>
        </footer>
      </div>
      <Art svg={CUP_SVG} className="mm-prop mm-cup" />
      <Art svg={CHIANTI_SVG} className="mm-prop mm-chianti" />
    </>
  );
}

// Red pencil underline, like the one under "BROS"
export function Underline() {
  return (
    <svg className="mm-underline" viewBox="0 0 200 12" aria-hidden="true">
      <path d="M3 7 Q50 3 100 7 T197 6" stroke="#d65a74" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M20 10 Q80 7 150 10" stroke="#d65a74" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}
