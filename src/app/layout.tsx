import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";

const poster = localFont({ variable: "--font-poster", src: "../assets/fonts/anton-latin-400-normal.woff" });
const display = localFont({
  variable: "--font-display",
  src: [
    { path: "../assets/fonts/bricolage-grotesque-latin-600-normal.woff", weight: "600" },
    { path: "../assets/fonts/bricolage-grotesque-latin-700-normal.woff", weight: "700" },
    { path: "../assets/fonts/bricolage-grotesque-latin-800-normal.woff", weight: "800" },
  ],
});
const serif = localFont({
  variable: "--font-serif",
  src: [
    { path: "../assets/fonts/instrument-serif-latin-400-normal.woff", weight: "400", style: "normal" },
    { path: "../assets/fonts/instrument-serif-latin-400-italic.woff", weight: "400", style: "italic" },
  ],
});
const body = localFont({
  variable: "--font-body",
  src: [
    { path: "../assets/fonts/figtree-latin-400-normal.woff", weight: "400" },
    { path: "../assets/fonts/figtree-latin-500-normal.woff", weight: "500" },
    { path: "../assets/fonts/figtree-latin-600-normal.woff", weight: "600" },
    { path: "../assets/fonts/figtree-latin-700-normal.woff", weight: "700" },
    { path: "../assets/fonts/figtree-latin-800-normal.woff", weight: "800" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Celebrating the people who go the extra mile · CS Week 2026",
  description:
    "Celebrate a customer service professional with a personalised Customer Service Week 2026 card. A Ruut × Customer Support Hub celebration.",
  openGraph: {
    title: "Celebrating the people who go the extra mile",
    description: "Make a personalised Customer Service Week 2026 card in under a minute.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0B2A7A", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poster.variable} ${display.variable} ${serif.variable} ${body.variable} antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
