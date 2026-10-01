"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getTheme } from "@/lib/themes";
import { CS_WEEK, type FeedItem } from "@/lib/types";
import { PixelSprite } from "./PixelSprite";
import { PixelTrail } from "./PixelTrail";

const EXPO = [0.16, 1, 0.3, 1] as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? n;

const LINES = ["Celebrating the", "people who go", "the extra mile"];
const MOBILE_LINES = ["Celebrating", "the people", "who go the", "extra mile"];

/**
 * The opening scene. One sticky viewport, driven by scroll:
 *  0.00–0.12  poster hero (MoMoney-style) eases away
 *  0.04–0.20  the fan of portraits peeking at the bottom (Luma-style) rises into a row,
 *             background turns from highway blue to paper
 *  0.22–1.00  the row scrubs sideways; each card flips as it reaches centre to reveal
 *             the message someone wrote
 */
type Slide = { key: string; src: string; label: string; position?: string };

/** Interleaves real celebrations, Ruut's CS Week 2025 community and examples into one photo pool. */
function buildPool(people: FeedItem[], gallery: string[]): Slide[] {
  const real = people.filter((p) => p.photoUrl && !p.example);
  const examples = people.filter((p) => p.photoUrl && p.example);
  const toSlide = (p: FeedItem): Slide => ({
    key: p.id,
    src: p.photoUrl!,
    label: `${firstName(p.name)} · ${p.org}`,
    position: p.photoPosition,
  });
  const extra: Slide[] = gallery.map((src) => ({ key: src, src, label: "CS Week 2025 · Ruut community" }));
  const out: Slide[] = [];
  const lanes = [real.map(toSlide), extra, examples.map(toSlide)];
  for (let i = 0; out.length < lanes.reduce((n, l) => n + l.length, 0); i++)
    for (const lane of lanes) if (lane[i]) out.push(lane[i]);
  return out;
}

/** A counter that ticks every `every` ms, starting after `delay` ms (stops for reduced motion). */
function useTicker(every: number, delay = 0, enabled = true) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let interval = 0;
    const start = window.setTimeout(() => {
      setTick((t) => t + 1);
      interval = window.setInterval(() => setTick((t) => t + 1), every);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [every, delay, enabled]);
  return tick;
}

export function HeroReveal({ people, total, gallery }: { people: FeedItem[]; total: number; gallery: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const cards = people.slice(0, 11);
  const n = cards.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Viewport-derived sizes live in motion values so transforms stay reactive.
  const vw = useMotionValue(1440);
  const vh = useMotionValue(900);
  useEffect(() => {
    const set = () => {
      vw.set(window.innerWidth);
      vh.set(window.innerHeight);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [vw, vh]);

  const heroOpacity = useTransform(p, [0, 0.11], [1, 0]);
  const heroScale = useTransform(p, [0, 0.12], [1, 0.9]);
  const heroY = useTransform(p, [0, 0.12], [0, -80]);
  const heroPointer = useTransform(p, (v) => (v > 0.08 ? "none" : "auto"));
  const blueOpacity = useTransform(p, [0.07, 0.17], [1, 0]);
  const revealOpacity = useTransform(p, [0.14, 0.22], [0, 1]);
  const revealY = useTransform(p, [0.14, 0.22], [40, 0]);
  const focus = useTransform(p, (v) => -0.6 + (n - 1 + 0.6) * clamp01((v - 0.22) / 0.72));
  const roadProgress = useTransform(p, [0.22, 0.94], ["0%", "100%"]);

  // Pointer parallax for the hero collage
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 16 });
  const sy = useSpring(my, { stiffness: 60, damping: 16 });

  const pool = useMemo(() => buildPool(people, gallery), [people, gallery]);
  const tick = useTicker(2600, 0, !reduce && pool.length > 1);
  const slide = pool[tick % Math.max(1, pool.length)];

  return (
    <section
      ref={ref}
      aria-label="Celebrating the people who go the extra mile"
      className="relative"
      style={{ height: `${120 + n * 48}vh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Paper (Luma) underneath, highway blue (MoMoney) on top */}
        <div aria-hidden className="dot-grid absolute inset-0 bg-paper" />
        <motion.div aria-hidden className="absolute inset-0 bg-highway-deep" style={{ opacity: blueOpacity }} />

        {/* ---------- HERO ---------- */}
        <motion.div
          className="absolute inset-0 z-10"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY, pointerEvents: heroPointer }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width - 0.5);
            my.set((e.clientY - r.top) / r.height - 0.5);
          }}
        >
          <PixelTrail />
          <HeroNav total={total} />

          <div className="relative mx-auto flex h-full max-w-[1500px] flex-col items-center justify-center px-4 pb-[17vh] pt-24 text-center sm:pb-[19vh]">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: EXPO }}
              className="mb-4 rounded-full bg-highway-mid px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cream sm:mb-6 sm:text-sm"
            >
              <span aria-hidden>🎉</span> Happy Customer Service Week 2026
            </motion.p>

            <div className="relative">
              <h1 className="poster text-glow" aria-label="Celebrating the people who go the extra mile">
                <span className="hidden sm:block">
                  {LINES.map((line, li) => (
                    <PosterLine key={line} text={line} delay={0.18 + li * 0.12} />
                  ))}
                </span>
                <span className="block sm:hidden">
                  {MOBILE_LINES.map((line, li) => (
                    <PosterLine key={line} text={line} delay={0.18 + li * 0.1} mobile />
                  ))}
                </span>
              </h1>

              {/* Photo dropped into the headline, cycling through the people being celebrated */}
              <Parallax x={sx} y={sy} depth={-26} className="absolute left-[73%] top-[4%] z-10 w-[26%] sm:left-[75%] sm:top-[14%] sm:w-[19%]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.75 }}
                  className="relative aspect-[4/3] overflow-hidden rounded-md shadow-[0_24px_50px_-12px_rgba(0,0,0,.6)] ring-4 ring-cream"
                >
                  <SlideImage slide={slide} />
                </motion.div>
              </Parallax>

              {/* Official CS Week 2026 logo, unaltered, as a sticker */}
              <Parallax x={sx} y={sy} depth={30} className="absolute right-0 top-[66%] z-20 w-[19%] sm:-right-[8%] sm:top-[58%] sm:w-[13%]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.3, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 1.05 }}
                >
                  <a href={CS_WEEK.site} target="_blank" rel="noopener noreferrer" className="bob block drop-shadow-[0_18px_24px_rgba(0,0,0,.45)] transition-transform hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CS_WEEK.logo} alt="Customer Service Week 2026 — The Extra Mile (csweek.com)" className="w-full" />
                  </a>
                </motion.div>
              </Parallax>

              <Parallax x={sx} y={sy} depth={40} className="absolute left-0 top-[42%] z-20 w-[11%] sm:-left-[8%] sm:top-[30%] sm:w-[9%]">
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -40 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 12, delay: 1.2 }}
                >
                  <PixelSprite name="headset" color="#E23B2E" className="wobble w-full" />
                </motion.div>
              </Parallax>

              <Parallax x={sx} y={sy} depth={18} className="absolute left-[2%] -top-[5%] z-20 w-[7%] sm:-left-[5%] sm:top-[2%] sm:w-[4.5%]">
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 1.35 }}>
                  <PixelSprite name="heart" color="#F6C343" className="bob w-full [animation-delay:-1.2s]" />
                </motion.div>
              </Parallax>

              <Parallax x={sx} y={sy} depth={22} className="absolute right-[18%] -bottom-[4%] z-20 hidden w-[4%] sm:block">
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 1.45 }}>
                  <PixelSprite name="sparkle" color="#F6EBD3" className="wobble w-full [animation-duration:3s]" />
                </motion.div>
              </Parallax>

            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.9, ease: "easeOut" }}
              className="mt-6 flex flex-col items-center gap-3 sm:mt-8"
            >
              <TicketButton href="/create">Celebrate a CS professional</TicketButton>
              <Link href="/create?mode=self" className="font-serif text-lg italic text-cream/90 underline decoration-road decoration-2 underline-offset-4 hover:text-cream">
                Or celebrate yourself 🎉
              </Link>
            </motion.div>

            {/* Static pixel blocks, like the reference's squares by the cursor */}
            <div aria-hidden className="pointer-events-none absolute bottom-[26%] right-[12%] hidden grid-cols-3 gap-0 opacity-70 lg:grid">
              {[1, 1, 0, 0, 1, 1, 1, 0, 1].map((on, i) => (
                <span key={i} className={`h-10 w-10 ${on ? (i % 2 ? "bg-highway-mid" : "bg-highway") : ""}`} />
              ))}
            </div>
          </div>

          {/* Corner portraits, floating */}
          <FloatingPortraits pool={pool} x={sx} y={sy} enabled={!reduce} />

          {/* "Letter from the editor" chip → latest celebration */}
          <LatestChip people={people} enabled={!reduce} />
        </motion.div>

        {/* ---------- REVEAL HEADER (paper phase) ---------- */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 pt-6 sm:px-8 sm:pt-10"
          style={{ opacity: revealOpacity, y: revealY }}
        >
          <div>
            <p className="font-serif text-xl italic text-ink/70 sm:text-3xl">Messages from the road</p>
            <h2 className="poster text-[clamp(40px,min(6.6vw,11vh),112px)] leading-[0.92] text-ink">
              They went the <br className="sm:hidden" />
              <span className="text-stop">extra mile</span>
            </h2>
          </div>
          <div className="hidden text-right sm:block">
            <p className="poster text-6xl leading-none text-highway">{Math.max(total, 0).toLocaleString()}</p>
            <p className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.16em] text-ink/60">
              {total === 1 ? "celebration" : "celebrations"} so far
            </p>
          </div>
        </motion.div>

        {/* ---------- FAN → ROW → FLIP ---------- */}
        <div className="pointer-events-none absolute inset-0 z-[15] [perspective:1800px]">
          {cards.map((c, i) => (
            <FanCard key={c.id} item={c} i={i} n={n} p={p} focus={focus} vw={vw} vh={vh} />
          ))}
        </div>

        {/* Road progress */}
        <motion.div
          aria-hidden
          className="absolute inset-x-4 bottom-6 z-20 mx-auto h-1.5 max-w-3xl overflow-hidden rounded-full bg-ink/10 sm:inset-x-8"
          style={{ opacity: revealOpacity }}
        >
          <motion.div className="h-full rounded-full bg-ink" style={{ width: roadProgress }} />
        </motion.div>
      </div>
    </section>
  );
}

function PosterLine({ text, delay, mobile = false }: { text: string; delay: number; mobile?: boolean }) {
  const words = text.split(" ");
  return (
    <span
      className={`block overflow-hidden pb-[0.02em] leading-[0.92] ${
        mobile ? "text-[min(18.5vw,10vh)]" : "text-[clamp(48px,min(12.4vw,14.5vh),190px)]"
      }`}
    >
      <motion.span
        className="inline-block"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.028, delayChildren: delay }}
      >
        {words.map((w, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {[...w].map((ch, ci) => (
              <motion.span
                key={ci}
                className="inline-block"
                variants={{
                  hidden: { y: "105%", rotate: 8, opacity: 0 },
                  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 0.9, ease: EXPO } },
                }}
              >
                {ch}
              </motion.span>
            ))}
            {wi < words.length - 1 && <span className="inline-block w-[0.22em]" />}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Parallax({
  x,
  y,
  depth,
  className,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  className?: string;
  children: React.ReactNode;
}) {
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth);
  return (
    <motion.div className={className} style={{ x: tx, y: ty }}>
      {children}
    </motion.div>
  );
}

function TicketButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-stretch overflow-hidden rounded-md bg-cream text-ink shadow-[0_14px_30px_-10px_rgba(0,0,0,.6)] transition-transform hover:-translate-y-0.5"
    >
      <span className="poster px-5 py-3.5 text-lg tracking-wide sm:px-7 sm:text-xl">{children}</span>
      <span aria-hidden className="ticket-divider w-[2px] text-highway-deep/50" />
      <span aria-hidden className="grid w-14 place-items-center text-xl transition-transform group-hover:translate-x-1">
        ➤
      </span>
    </Link>
  );
}

function HeroNav({ total }: { total: number }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EXPO }}
      className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-6"
    >
      <nav className="hidden items-center gap-1.5 lg:flex">
        {[
          ["How it works", "#how"],
          ["The wall", "#wall"],
          ["Celebrate yourself", "/create?mode=self"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="last:hidden xl:last:inline-flex rounded-full bg-highway-mid px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cream/90 transition hover:bg-highway hover:text-cream"
          >
            {label}
          </a>
        ))}
      </nav>
      <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ruut-logo.png" alt="Ruut" className="h-9 w-auto sm:h-10" />
        <span className="min-w-0 text-left lg:text-center">
          <span className="poster block whitespace-nowrap text-lg leading-none text-glow sm:text-[26px]">
            Ruut × <span className="hidden sm:inline">Customer Support Hub</span>
            <span className="sm:hidden">CS Hub</span>
          </span>
          <span className="block whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] text-glow/80 sm:text-[10px]">
            Presents CS Week 2026
          </span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href="#how"
          className="hidden rounded-full bg-highway-mid px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cream/90 transition hover:bg-highway hover:text-cream md:inline-flex lg:hidden"
        >
          How it works
        </a>
        <a
          href="#wall"
          className="hidden rounded-full bg-highway-mid px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cream/90 transition hover:bg-highway hover:text-cream md:inline-flex lg:hidden"
        >
          The wall
        </a>
        <a
          href="#wall"
          className="relative hidden h-10 w-10 place-items-center rounded-full bg-highway-mid text-cream sm:grid"
          aria-label={`${total} celebrations on the wall`}
        >
          <PixelSprite name="heart" color="#E23B2E" outline="transparent" shadow="transparent" className="h-4 w-4" />
          {total > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-stop px-1 text-center text-[10px] font-bold leading-5 text-white">
              {total > 999 ? "999+" : total}
            </span>
          )}
        </a>
        <Link
          href="/create"
          className="poster whitespace-nowrap rounded-md bg-cream px-4 py-2.5 text-sm tracking-wide text-ink transition hover:-translate-y-0.5"
        >
          Make a card
        </Link>
      </div>
    </motion.header>
  );
}

function SlideImage({ slide, className = "" }: { slide?: Slide; className?: string }) {
  return (
    <>
      <AnimatePresence initial={false}>
        {slide && (
          <motion.img
            key={slide.key}
            src={slide.src}
            alt=""
            initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.15 }}
            animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.8, ease: EXPO }}
            className={`absolute inset-0 h-full w-full object-cover ${className}`}
            style={{ objectPosition: slide.position ?? "50% 25%" }}
          />
        )}
      </AnimatePresence>
      {slide && (
        <span className="absolute bottom-1.5 left-1.5 max-w-[90%] truncate rounded-sm bg-ink/85 px-1.5 py-0.5 text-left text-[9px] font-bold uppercase tracking-wider text-cream sm:bottom-2 sm:left-2 sm:text-[11px]">
          {slide.label}
        </span>
      )}
    </>
  );
}

const CORNERS = [
  { cls: "left-[2.5%] top-[56%]", r: -7, depth: 50, d: "7s", anim: "float-a", offset: 5, delay: 900 },
  { cls: "right-[2.5%] top-[16%]", r: 7, depth: 46, d: "6.5s", anim: "float-b", offset: 11, delay: 1700 },
];

/** Two floating polaroids in the corners, each switching on its own beat. */
function FloatingPortraits({
  pool,
  x,
  y,
  enabled,
}: {
  pool: Slide[];
  x: MotionValue<number>;
  y: MotionValue<number>;
  enabled: boolean;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      {CORNERS.map((c, i) => (
        <Parallax key={i} x={x} y={y} depth={c.depth} className={`absolute w-[8vw] max-w-[140px] ${c.cls}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EXPO, delay: 1.1 + i * 0.12 }}
          >
            <div className={`${c.anim} rounded-md bg-cream p-1.5 shadow-xl`} style={{ ["--r" as string]: `${c.r}deg`, ["--d" as string]: c.d }}>
              <CornerSlot pool={pool} offset={c.offset} delay={c.delay} enabled={enabled} />
            </div>
          </motion.div>
        </Parallax>
      ))}
    </div>
  );
}

function CornerSlot({ pool, offset, delay, enabled }: { pool: Slide[]; offset: number; delay: number; enabled: boolean }) {
  const tick = useTicker(2600, delay, enabled && pool.length > 1);
  const slide = pool[(tick + offset) % Math.max(1, pool.length)];
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-highway">
      <SlideImage slide={slide ? { ...slide, label: slide.label.split(" · ")[0] } : undefined} />
    </div>
  );
}

/** "Letter from the editor" chip, rotating through the latest celebrations. */
function LatestChip({ people, enabled }: { people: FeedItem[]; enabled: boolean }) {
  const recent = useMemo(() => {
    const real = people.filter((p) => !p.example);
    return (real.length ? real : people).slice(0, 6);
  }, [people]);
  const tick = useTicker(4200, 2000, enabled && recent.length > 1);
  const item = recent[tick % Math.max(1, recent.length)];
  if (!item) return null;
  const href = item.example ? "#wall" : `/c/${item.id}`;
  const label = item.example ? "Example" : item.featured ? "CS Week 2025 hero" : "Just celebrated";
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EXPO, delay: 1.6 }}
      className="absolute bottom-5 right-4 z-30 hidden w-[290px] items-center gap-3 rounded-2xl bg-white p-2 pl-4 text-left text-ink shadow-[0_20px_40px_-12px_rgba(0,0,0,.5)] transition hover:-translate-y-0.5 sm:right-8 sm:flex"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink/50">
              <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-stop" /> {label}
            </span>
            <span className="block truncate text-[15px] font-bold">{item.name}</span>
            <span className="block text-sm text-ink/60">→ Read the message</span>
          </span>
          {item.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
              style={{ objectPosition: item.photoPosition ?? "50% 25%" }}
            />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.a>
  );
}

function FanCard({
  item,
  i,
  n,
  p,
  focus,
  vw,
  vh,
}: {
  item: FeedItem;
  i: number;
  n: number;
  p: MotionValue<number>;
  focus: MotionValue<number>;
  vw: MotionValue<number>;
  vh: MotionValue<number>;
}) {
  const theme = getTheme(item.theme);
  const c = (n - 1) / 2;

  const width = useTransform([vw, vh], ([w, h]: number[]) =>
    w < 640 ? Math.min(w * 0.62, 300, h * 0.4) : Math.min(Math.max(w * 0.2, 200), 340, h * 0.42),
  );

  const layout = (pv: number, f: number, w: number, h: number, cw: number) => {
    const ch = cw * 1.25;
    const t = easeInOut(clamp01((pv - 0.04) / 0.16));
    // Fan peeking from the bottom edge
    const kf = i - c;
    const fanScale = w < 640 ? 0.55 : 0.8;
    const fanX = kf * cw * 0.5 * fanScale;
    const fanY = h / 2 + (ch * fanScale) / 2 - ch * fanScale * 0.42 + Math.abs(kf) ** 1.4 * cw * 0.05 * fanScale;
    const fanR = Math.max(-28, Math.min(28, kf * 5.5));
    // Row, scrubbed by focus
    const k = i - f;
    const rowX = k * cw * 1.1;
    const rowY = h * 0.06 + Math.min(Math.abs(k), 3) * cw * 0.05;
    const rowR = Math.max(-6, Math.min(6, k * 2));
    const near = 1 - Math.min(1, Math.abs(k));
    return {
      x: fanX + (rowX - fanX) * t,
      y: fanY + (rowY - fanY) * t,
      r: fanR + (rowR - fanR) * t,
      s: fanScale + (0.88 + near * 0.24 - fanScale) * t,
      o: t < 1 ? 1 : Math.max(0, Math.min(1, 4.2 - Math.abs(k))),
      flip: t < 0.98 ? 0 : clamp01((f - i + 0.35) / 0.35),
      z: Math.round(100 - Math.abs(t < 1 ? kf : k) * 10),
    };
  };

  const deps = [p, focus, vw, vh, width];
  const at = ([pv, f, w, h, cw]: number[]) => layout(pv, f, w, h, cw);

  const x = useTransform(deps, (v: number[]) => at(v).x);
  const y = useTransform(deps, (v: number[]) => at(v).y);
  const rotate = useTransform(deps, (v: number[]) => at(v).r);
  const scale = useTransform(deps, (v: number[]) => at(v).s);
  const opacity = useTransform(deps, (v: number[]) => at(v).o);
  const zIndex = useTransform(deps, (v: number[]) => at(v).z);
  const flip = useTransform(deps, (v: number[]) => at(v).flip);
  const rotateY = useTransform(flip, (f) => f * 180);
  // Swap faces at the half-turn instead of relying on backface-visibility (unreliable in Safari).
  const frontOpacity = useTransform(flip, (f) => (f < 0.5 ? 1 : 0));
  const backOpacity = useTransform(flip, (f) => (f < 0.5 ? 0 : 1));
  const backPointer = useTransform(flip, (f) => (f > 0.9 ? "auto" : "none"));
  const href = item.example ? undefined : `/c/${item.id}`;
  const marginLeft = useTransform(width, (w) => -w / 2);
  const marginTop = useTransform(width, (w) => (-w * 1.25) / 2);
  const height = useTransform(width, (w) => w * 1.25);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ x, y, rotate, scale, opacity, zIndex, width, height, marginLeft, marginTop }}
    >
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EXPO, delay: 1.3 + Math.abs(i - (n - 1) / 2) * 0.09 }}
        className="h-full w-full"
      >
        <motion.div className="relative h-full w-full [transform-style:preserve-3d]" style={{ rotateY }}>
          {/* Front: tinted portrait */}
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-2xl bg-white p-[5px] shadow-[0_30px_60px_-24px_rgba(0,0,0,.55)]"
            style={{ opacity: frontOpacity }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[12px]" style={{ background: theme.bg }}>
              {item.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover grayscale contrast-125"
                  style={{ objectPosition: item.photoPosition ?? "50% 25%" }}
                />
              )}
              <div className="absolute inset-0 mix-blend-multiply" style={{ background: theme.bg }} />
              <div className="absolute inset-0 mix-blend-screen opacity-40" style={{ background: theme.duo[1] }} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-12">
                {item.featured && (
                  <p className="mb-1.5 inline-block rounded-sm bg-road px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                    CS Week 2025 hero
                  </p>
                )}
                <p className="poster text-[clamp(22px,2.4vw,38px)] leading-none text-white">{item.name}</p>
                <p className="mt-1 truncate text-[11px] font-semibold text-white/80">
                  {item.role} · {item.org}
                </p>
              </div>
            </div>
          </motion.div>
          {/* Back: the message */}
          <motion.a
            href={href}
            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl p-4 shadow-[0_30px_60px_-24px_rgba(0,0,0,.55)] [transform:rotateY(180deg)] sm:p-5"
            style={{ background: theme.panel, color: theme.panelInk, opacity: backOpacity, pointerEvents: backPointer }}
          >
            <span className="poster text-5xl leading-[0.6]" style={{ color: theme.quote }}>
              “
            </span>
            <p className="mt-2 line-clamp-7 flex-1 font-serif text-[clamp(17px,1.5vw,23px)] italic leading-[1.22]">{item.message}</p>
            <div className="mt-3 flex items-center gap-2 border-t border-current/15 pt-3">
              {item.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photoUrl}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                  style={{ objectPosition: item.photoPosition ?? "50% 25%" }}
                />
              )}
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-bold">To {firstName(item.name)}</p>
                <p className="truncate text-xs opacity-70">
                  {item.mode === "self" ? "Celebrating themself" : item.senderName ? `From ${item.senderName}` : "From a colleague"}
                </p>
              </div>
            </div>
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
