"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTheme } from "@/lib/themes";
import type { FeedItem, FeedPage } from "@/lib/types";
import { PixelSprite } from "./PixelSprite";

const EXPO = [0.16, 1, 0.3, 1] as const;
const POLL_MS = 8000;

/**
 * The Wall of Celebrations: every card people choose to share, newest first.
 * Paginated, and it refreshes itself so new celebrations slide in while you watch.
 */
export function Wall({ initial }: { initial: FeedPage }) {
  const [data, setData] = useState<FeedPage>(initial);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [pendingNew, setPendingNew] = useState(0);
  const [loading, setLoading] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const latestTotal = useRef(initial.total);

  const load = useCallback(async (page: number, { scroll = false } = {}) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards?page=${page}`, { cache: "no-store" });
      const next = (await res.json()) as FeedPage;
      setData((prev) => {
        const known = new Set(prev.items.map((i) => i.id));
        setFresh(new Set(prev.page === next.page ? next.items.filter((i) => !known.has(i.id)).map((i) => i.id) : []));
        return next;
      });
      latestTotal.current = next.total;
      if (page === 1) setPendingNew(0);
      const url = new URL(window.location.href);
      if (page > 1) url.searchParams.set("page", String(page));
      else url.searchParams.delete("page");
      window.history.replaceState(null, "", url);
      if (scroll) top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Live updates: page 1 refreshes in place; other pages show a "new" pill.
  useEffect(() => {
    const t = window.setInterval(async () => {
      if (document.hidden) return;
      if (data.page === 1) {
        void load(1);
      } else {
        const res = await fetch("/api/cards?page=1", { cache: "no-store" });
        const head = (await res.json()) as FeedPage;
        setPendingNew(Math.max(0, head.total - latestTotal.current));
      }
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [data.page, load]);

  const pages = Array.from({ length: data.pages }, (_, i) => i + 1);

  return (
    <section id="wall" className="relative scroll-mt-4 bg-paper">
      <div aria-hidden className="dot-grid absolute inset-0" />
      <div ref={top} className="relative mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
              <span className="live-dot h-2.5 w-2.5 rounded-full bg-stop" /> Live · updates as people celebrate
            </p>
            <h2 className="poster mt-3 text-[clamp(52px,9vw,148px)] leading-[0.98] text-ink">
              The wall of <span className="text-highway">celebrations</span>
            </h2>
          </div>
          <div className="flex items-end gap-4 md:flex-col md:items-end">
            <CountUp value={data.total} />
            <Link
              href="/create"
              className="poster inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-ink px-5 py-3 text-lg tracking-wide text-cream transition hover:-translate-y-0.5"
            >
              Add someone ➤
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {pendingNew > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => load(1, { scroll: true })}
              className="sticky top-4 z-20 mx-auto mt-6 flex items-center gap-2 rounded-full bg-stop px-4 py-2 text-sm font-bold text-white shadow-lg"
            >
              ↑ {pendingNew} new celebration{pendingNew > 1 ? "s" : ""}, see the latest
            </motion.button>
          )}
        </AnimatePresence>

        <motion.ul layout className={`mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 ${loading ? "opacity-70" : ""} transition-opacity`}>
          <AnimatePresence mode="popLayout" initial={false}>
            {data.items.map((item, i) => (
              <WallTile key={item.id} item={item} index={i} isNew={fresh.has(item.id)} />
            ))}
          </AnimatePresence>
        </motion.ul>

        {data.items.length === 0 && (
          <p className="mt-16 text-center font-serif text-2xl italic text-ink/60">The road is clear. Be the first to celebrate someone.</p>
        )}

        {data.pages > 1 && (
          <nav aria-label="Wall pages" className="mt-14 flex flex-wrap items-center justify-center gap-2">
            <PageButton disabled={data.page === 1} onClick={() => load(data.page - 1, { scroll: true })} label="Previous page">
              ←
            </PageButton>
            {pages.map((pg) => (
              <PageButton key={pg} active={pg === data.page} onClick={() => load(pg, { scroll: true })} label={`Page ${pg}`}>
                {pg}
              </PageButton>
            ))}
            <PageButton disabled={data.page === data.pages} onClick={() => load(data.page + 1, { scroll: true })} label="Next page">
              →
            </PageButton>
          </nav>
        )}
      </div>
    </section>
  );
}

function PageButton({
  children,
  onClick,
  active,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`poster grid h-11 min-w-11 place-items-center rounded-md border-2 px-3 text-lg transition ${
        active ? "border-ink bg-ink text-cream" : "border-ink/20 bg-white hover:border-ink"
      } disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="text-right">
      <p className="poster text-6xl leading-none text-stop">{shown.toLocaleString()}</p>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/60">people celebrated</p>
    </div>
  );
}

const TILT = [-1.4, 0.8, -0.6, 1.2, -1, 0.5];

function WallTile({ item, index, isNew }: { item: FeedItem; index: number; isNew: boolean }) {
  const theme = getTheme(item.theme);
  const href = item.example ? null : `/c/${item.id}`;
  const body = (
    <article
      className="group relative overflow-hidden rounded-2xl shadow-[0_20px_40px_-24px_rgba(0,0,0,.45)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0"
      style={{ background: theme.bg, color: theme.ink, rotate: `${TILT[index % TILT.length]}deg` }}
    >
      {item.photoUrl ? (
        <div className="relative aspect-[5/4] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.photoUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ objectPosition: item.photoPosition ?? "50% 25%" }}
          />
          {item.featured && (
            <span className="absolute left-3 top-3 rounded-sm bg-road px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
              CS Week 2025 hero
            </span>
          )}
          {item.example && (
            <span className="absolute left-3 top-3 rounded-sm bg-ink/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cream">
              Example
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 pt-5">
          <span className="poster grid h-14 w-14 place-items-center rounded-lg text-2xl text-white" style={{ background: theme.duo[0] }}>
            {item.name.slice(0, 1)}
          </span>
          <PixelSprite name="heart" color="#E23B2E" className="h-6 w-6" />
        </div>
      )}
      <div className="p-5">
        <p className="poster text-4xl leading-none">{item.name}</p>
        <p className="mt-1.5 text-sm font-semibold" style={{ color: theme.muted }}>
          {item.role} · {item.org}
        </p>
        <div className="mt-4 rounded-xl p-4" style={{ background: theme.panel, color: theme.panelInk }}>
          <p className="font-serif text-xl italic leading-[1.3]">“{item.message}”</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider opacity-70">
            {item.mode === "self" ? "Celebrating themself" : item.senderName ? `— ${item.senderName}` : "— A colleague"}
          </p>
        </div>
      </div>
    </article>
  );

  return (
    <motion.li
      layout
      initial={isNew ? { opacity: 0, scale: 0.6, y: -40, rotate: -6 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={isNew ? { type: "spring", stiffness: 200, damping: 16 } : { duration: 0.6, ease: EXPO, delay: (index % 6) * 0.05 }}
      className="mb-5 break-inside-avoid"
    >
      {href ? (
        <Link href={href} aria-label={`Open ${item.name}'s card`} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
    </motion.li>
  );
}
