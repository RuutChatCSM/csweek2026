import Link from "next/link";

export function RoadSignMark({
  className = "",
  label = true,
  arrow = false,
}: {
  className?: string;
  label?: boolean;
  arrow?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <rect x="15" y="15" width="70" height="70" rx="10" transform="rotate(45 50 50)" fill="#FFC629" />
      <rect x="21" y="21" width="58" height="58" rx="7" transform="rotate(45 50 50)" fill="none" stroke="#16161A" strokeWidth="3.5" />
      {arrow && (
        <path
          d="M38 66 V52 a8 8 0 0 1 8 -8 H58 M52 36 L60 44 L52 52"
          fill="none"
          stroke="#16161A"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {label && !arrow && (
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontWeight="800"
          fontSize="15"
          fill="#16161A"
        >
          MILE
        </text>
      )}
    </svg>
  );
}

export function BrandLockup({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 font-display font-extrabold tracking-tight ${className}`}>
      <RoadSignMark className="h-7 w-7 shrink-0 transition-transform sm:h-8 sm:w-8 duration-500 group-hover:rotate-[20deg]" label={false} />
      <span className="whitespace-nowrap text-[13px] leading-none sm:text-base">
        Ruut <span className="font-sans font-semibold text-ink/50">×</span> Customer Support Hub
      </span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
      <BrandLockup />
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-ink/15 bg-white/60 px-3.5 py-2 text-sm font-semibold backdrop-blur sm:inline-flex">
          Oct 5–9, 2026
        </span>
        <Link
          href="/create"
          className="whitespace-nowrap rounded-full bg-ink px-3.5 py-2 text-sm font-bold text-paper transition hover:-translate-y-0.5 hover:bg-ink/90"
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
      <BrandLockup className="text-ink" />
      <p>
        Customer Service Week 2026 · <em className="font-serif text-base">The Extra Mile</em> · Emails delivered with{" "}
        <strong className="text-ink">Convert by Ruut</strong>
      </p>
    </footer>
  );
}
