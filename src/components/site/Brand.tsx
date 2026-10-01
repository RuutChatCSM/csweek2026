import Link from "next/link";
import { CS_WEEK } from "@/lib/types";

export function BrandLockup({ className = "", tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CS_WEEK.logo}
        alt="Customer Service Week 2026"
        className="h-10 w-auto transition-transform duration-500 group-hover:-translate-y-0.5 sm:h-11"
      />
      <span className="leading-none">
        <span className={`poster block whitespace-nowrap text-[17px] sm:text-xl ${tone === "light" ? "text-glow" : "text-ink"}`}>
          Ruut × Customer Support Hub
        </span>
        <span
          className={`block text-[10px] font-bold uppercase tracking-[0.2em] ${tone === "light" ? "text-glow/70" : "text-ink/50"}`}
        >
          CS Week 2026 · The Extra Mile
        </span>
      </span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
      <BrandLockup />
      <div className="flex items-center gap-2">
        <Link
          href="/#wall"
          className="hidden rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur hover:border-ink sm:inline-flex"
        >
          The wall
        </Link>
        <Link
          href="/create"
          className="poster whitespace-nowrap rounded-md bg-ink px-4 py-2.5 text-sm tracking-wide text-cream transition hover:-translate-y-0.5"
        >
          Make a card
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <BrandLockup />
      <p>
        Customer Service Week · {CS_WEEK.dates} · Theme &amp; logo from{" "}
        <a href={CS_WEEK.site} target="_blank" rel="noopener noreferrer" className="underline">
          CSWeek.com
        </a>{" "}
        · Emails delivered with <strong className="text-ink">Convert by Ruut</strong>
      </p>
    </footer>
  );
}
