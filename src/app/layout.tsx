import type { Metadata, Viewport } from "next";
import { Anton, Bricolage_Grotesque, Figtree, Instrument_Serif } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const poster = Anton({ variable: "--font-poster", subsets: ["latin"], weight: "400" });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const body = Figtree({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

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
