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
export function HeroReveal({ people, total }: { people: FeedItem[]; total: number }) {
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

  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduce || people.length < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % people.length), 2400);
    return () => window.clearInterval(t);
  }, [people.length, reduce]);
  const featured = people[index % Math.max(1, people.length)];

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

          <div className="relative mx-auto flex h-full max-w-[1500px] flex-col items-center justify-center px-4 pb-[19vh] pt-24 text-center sm:pb-[21vh]">
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
              <Parallax x={sx} y={sy} depth={-26} className="absolute left-[68%] -top-[13%] z-10 w-[30%] sm:left-[75%] sm:top-[14%] sm:w-[19%]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.75 }}
                  className="relative aspect-[4/3] overflow-hidden rounded-md shadow-[0_24px_50px_-12px_rgba(0,0,0,.6)] ring-4 ring-cream"
                >
                  <AnimatePresence initial={false}>
                    {featured?.photoUrl && (
                      <motion.img
                        key={featured.id}
                        src={featured.photoUrl}
                        alt=""
                        initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.15 }}
                        animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.8, ease: EXPO }}
                        className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
                      />
                    )}
                  </AnimatePresence>
                  {featured && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-ink/85 px-1.5 py-0.5 text-left text-[9px] font-bold uppercase tracking-wider text-cream sm:bottom-2 sm:left-2 sm:text-[11px]">
                      {firstName(featured.name)} · {featured.org}
                    </span>
                  )}
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

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.75, ease: "easeOut" }}
              className="mt-6 max-w-xl text-base leading-snug text-glow sm:mt-8 sm:text-xl"
            >
              Customer Service Week 2026 · {CS_WEEK.dates}. Make a card for someone who makes customers feel looked
              after, and watch the road fill up.
            </motion.p>

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
          <FloatingPortraits people={people} x={sx} y={sy} />

          {/* "Letter from the editor" chip → latest celebration */}
          {people[0] && <LatestChip item={people[0]} />}
        </motion.div>

        {/* ---------- REVEAL HEADER (paper phase) ---------- */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 pt-6 sm:px-8 sm:pt-10"
          style={{ opacity: revealOpacity, y: revealY }}
        >
          <div>
            <p className="font-serif text-xl italic text-ink/70 sm:text-3xl">Messages from the road</p>
            <h2 className="poster text-[clamp(40px,min(6.6vw,11vh),112px)] leading-[0.86] text-ink">
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
        <div className="absolute inset-0 z-[15] [perspective:1800px]">
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
      className={`block overflow-hidden pb-[0.02em] leading-[0.86] ${
        mobile ? "text-[min(18.5vw,10vh)]" : "text-[clamp(48px,min(12.4vw,15.5vh),190px)]"
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
      <nav className="hidden items-center gap-1.5 md:flex">
        {[
          ["How it works", "#how"],
          ["The wall", "#wall"],
          ["Celebrate yourself", "/create?mode=self"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="rounded-full bg-highway-mid px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cream/90 transition hover:bg-highway hover:text-cream"
          >
            {label}
          </a>
        ))}
      </nav>
      <Link href="/" className="text-left md:absolute md:left-1/2 md:-translate-x-1/2 md:text-center">
        <span className="poster block text-xl leading-none text-glow sm:text-[26px]">Ruut × Customer Support Hub</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-glow/80">Presents CS Week 2026</span>
      </Link>
      <div className="flex items-center gap-2">
        <a
          href="#wall"
          className="relative grid h-10 w-10 place-items-center rounded-full bg-highway-mid text-cream"
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

const CORNERS = [
  { cls: "left-[2.5%] top-[58%]", r: -7, depth: 50, d: "7s", anim: "float-a" },
  { cls: "right-[2.5%] top-[17%]", r: 7, depth: 46, d: "6.5s", anim: "float-b" },
];

function FloatingPortraits({ people, x, y }: { people: FeedItem[]; x: MotionValue<number>; y: MotionValue<number> }) {
  const picks = useMemo(() => people.filter((p) => p.photoUrl).slice(1, 3), [people]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      {picks.map((person, i) => {
        const c = CORNERS[i];
        return (
          <Parallax key={person.id} x={x} y={y} depth={c.depth} className={`absolute w-[7.5vw] max-w-[130px] ${c.cls}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EXPO, delay: 1.1 + i * 0.12 }}
            >
              <div className={`${c.anim} rounded-md bg-cream p-1.5 shadow-xl`} style={{ ["--r" as string]: `${c.r}deg`, ["--d" as string]: c.d }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={person.photoUrl!} alt="" className="aspect-[4/5] w-full rounded-sm object-cover" />
                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wide text-ink">{firstName(person.name)}</p>
              </div>
            </motion.div>
          </Parallax>
        );
      })}
    </div>
  );
}

function LatestChip({ item }: { item: FeedItem }) {
  const href = item.example ? "#wall" : `/c/${item.id}`;
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EXPO, delay: 1.6 }}
      className="absolute bottom-5 right-4 z-30 hidden items-center gap-3 rounded-2xl bg-white p-2 pl-4 text-left text-ink shadow-[0_20px_40px_-12px_rgba(0,0,0,.5)] transition hover:-translate-y-0.5 sm:right-8 sm:flex"
    >
      <span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink/50">
          <span className="live-dot h-2 w-2 rounded-full bg-stop" /> {item.example ? "Example" : "Just celebrated"}
        </span>
        <span className="block text-[15px] font-bold">{item.name}</span>
        <span className="block text-sm text-ink/60">→ Read the message</span>
      </span>
      {item.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.photoUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
      )}
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
  const rotateY = useTransform(deps, (v: number[]) => at(v).flip * 180);
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
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-white p-[5px] shadow-[0_30px_60px_-24px_rgba(0,0,0,.55)] [backface-visibility:hidden]">
            <div className="relative h-full w-full overflow-hidden rounded-[12px]" style={{ background: theme.bg }}>
              {item.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover grayscale contrast-125" />
              )}
              <div className="absolute inset-0 mix-blend-multiply" style={{ background: theme.bg }} />
              <div className="absolute inset-0 mix-blend-screen opacity-40" style={{ background: theme.duo[1] }} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-12">
                <p className="poster text-[clamp(22px,2.4vw,38px)] leading-[0.9] text-white">{item.name}</p>
                <p className="mt-1 truncate text-[11px] font-semibold text-white/80">{item.role}</p>
              </div>
            </div>
          </div>
          {/* Back: the message */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl p-4 shadow-[0_30px_60px_-24px_rgba(0,0,0,.55)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-5"
            style={{ background: theme.panel, color: theme.panelInk }}
          >
            <span className="poster text-5xl leading-[0.6]" style={{ color: theme.quote }}>
              “
            </span>
            <p className="mt-2 line-clamp-7 flex-1 font-serif text-[clamp(17px,1.5vw,23px)] italic leading-[1.15]">{item.message}</p>
            <div className="mt-3 flex items-center gap-2 border-t border-current/15 pt-3">
              {item.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
              )}
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-bold">To {firstName(item.name)}</p>
                <p className="truncate text-xs opacity-70">
                  {item.mode === "self" ? "Celebrating themself" : item.senderName ? `From ${item.senderName}` : "From a colleague"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
