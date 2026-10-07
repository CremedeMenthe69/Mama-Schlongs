import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mama Schlong's Gallery",
  description: "Fresh art, made daily.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Lobster&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
