"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { CS_WEEK } from "@/lib/types";
import { PixelSprite } from "./PixelSprite";

const EXPO = [0.16, 1, 0.3, 1] as const;

const THANKS = [
  "Thank you for going the extra mile",
  "For the patience on the hard calls",
  "For the replies at 2am",
  "For remembering the customer’s name",
  "For the follow-ups nobody asked for",
  "For making every interaction feel human",
];

export function ThanksMarquee() {
  return (
    <section aria-label="Thank you messages" className="relative z-10 overflow-hidden bg-paper py-10">
      <div className="-rotate-2 bg-stop py-4 text-cream shadow-[0_20px_40px_-20px_rgba(0,0,0,.5)]">
        <div className="marquee flex w-max">
          {[0, 1].map((k) => (
            <ul key={k} aria-hidden={k === 1} className="flex shrink-0 items-center">
              {THANKS.map((t) => (
                <li key={t} className="poster flex items-center whitespace-nowrap px-6 text-3xl sm:text-5xl">
                  {t}
                  <PixelSprite name="heart" color="#F6C343" shadow="#141414" outline="#E23B2E" className="ml-12 h-8 w-8" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <div className="mt-[-6px] rotate-1 bg-highway-deep py-3 text-glow">
        <div className="marquee-reverse flex w-max">
          {[0, 1].map((k) => (
            <p key={k} aria-hidden className="poster shrink-0 whitespace-nowrap px-4 text-xl tracking-wide sm:text-2xl">
              {Array.from({ length: 8 }, () => `${CS_WEEK.hashtag} · The Extra Mile · ${CS_WEEK.dates} · `).join("")}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", title: "Pick someone", body: "A teammate, a support lead, the agent who saved your week. Or yourself." },
  { n: "02", title: "Make their card", body: "Add a photo and a few words. The card builds itself live as you type." },
  { n: "03", title: "Send the love", body: "Email it straight to them, or post it on LinkedIn, X, Instagram and WhatsApp." },
  { n: "04", title: "Watch it spread", body: "Your card lands on the wall. They celebrate someone else. Repeat." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-4 bg-highway-deep text-cream">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="font-serif text-2xl italic text-glow">Four miles, one minute</p>
          <h2 className="poster mt-2 max-w-4xl text-[clamp(52px,8vw,128px)] leading-[0.92] text-glow">
            A greeting card, <span className="text-road">not a form</span>
          </h2>
        </Reveal>
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <div aria-hidden className="absolute left-0 right-0 top-[38px] hidden h-1.5 text-road md:block">
            <div className="road-dashes moving h-full rounded-full" />
          </div>
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} as="li" className="relative">
              <div className="relative z-10 inline-flex h-[78px] flex-col items-center justify-center rounded-lg border-[3px] border-cream bg-[#1F7A4D] px-4 text-white shadow-[4px_4px_0_#141414]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Mile</span>
                <span className="poster text-3xl leading-none">{s.n}</span>
              </div>
              <h3 className="poster mt-6 text-3xl text-cream">{s.title}</h3>
              <p className="mt-2 max-w-xs text-lg leading-relaxed text-cream/70">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PoweredBy() {
  return (
    <section className="relative bg-paper">
      <div aria-hidden className="dot-grid absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="font-serif text-2xl italic text-ink/60">The story behind the celebration</p>
          <h2 className="poster mt-2 max-w-5xl text-[clamp(48px,7.4vw,118px)] leading-[0.92]">
            Great experiences have <span className="text-highway">people</span> behind them
          </h2>
        </Reveal>

        {/* The team behind Ruut */}
        <Reveal className="mt-14">
          <figure className="group relative overflow-hidden rounded-3xl shadow-[0_40px_80px_-40px_rgba(0,0,0,.6)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/ruut-team.jpg"
              alt="The Ruut team laughing together on a sofa in their purple Ruut Chat t-shirts"
              loading="lazy"
              className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] sm:aspect-[2/1]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
              <div>
                <p className="poster text-3xl leading-[0.92] text-white sm:text-5xl">The people behind Ruut</p>
                <p className="mt-2 max-w-md text-sm text-white/80 sm:text-base">
                  Redefining customer experience across Africa, and celebrating the people who deliver it.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/ruut-logo.png" alt="Ruut" className="h-14 w-auto shrink-0 drop-shadow-lg sm:h-20" />
            </figcaption>
          </figure>
        </Reveal>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Reveal delay={0}>
            <a
              href="https://ruut.chat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl bg-[linear-gradient(135deg,#D88BD0,#8B3EF0)] p-8 text-white transition-transform duration-300 hover:-rotate-1 hover:scale-[1.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/ruut-logo.png" alt="" className="h-14 w-14 rounded-2xl bg-white p-2 shadow-md" />
              <p className="poster mt-6 text-4xl">Ruut</p>
              <p className="mt-2 text-lg opacity-90">Powering better customer experiences across every channel.</p>
              <span className="mt-auto pt-6 text-sm font-bold">
                ruut.chat <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href="https://convert.ruut.chat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl bg-[#1a1a2e] p-8 text-white transition-transform duration-300 hover:rotate-1 hover:scale-[1.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/convert-logo.png" alt="Convert" className="h-8 w-auto self-start" />
              <p className="poster mt-6 text-4xl">Convert by Ruut</p>
              <p className="mt-2 text-lg opacity-80">Powering the delivery of every celebration email sent from this page.</p>
              <span className="mt-auto pt-6 text-sm font-bold text-road">
                convert.ruut.chat <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex h-full flex-col rounded-2xl bg-stop p-8 text-cream transition-transform duration-300 hover:-rotate-1 hover:scale-[1.02]">
              <PixelSprite name="headset" color="#F6C343" outline="#141414" className="h-12 w-12" />
              <p className="poster mt-6 text-4xl">You</p>
              <p className="mt-2 text-lg opacity-90">The people actually delivering those experiences, every single day.</p>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="/create"
            className="poster group inline-flex items-center gap-3 rounded-md bg-ink px-7 py-4 text-2xl tracking-wide text-cream transition hover:-translate-y-0.5"
          >
            Celebrate someone <span className="transition-transform group-hover:translate-x-1">➤</span>
          </Link>
          <Link href="/create?mode=self" className="font-serif text-xl italic underline decoration-road decoration-[3px] underline-offset-4">
            Or celebrate yourself 🎉
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** Scroll-reveal wrapper (IntersectionObserver via whileInView). */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const M = as === "li" ? motion.li : motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: EXPO, delay }}
    >
      {children}
    </M>
  );
}

/** A "Make a card" pill that follows you down the page once the hero is gone. */
export function FloatingCTA() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => {
    // Appear once the opening scroll scene is done (it has its own CTAs).
    const wall = document.getElementById("wall");
    setShow(!!wall && v > wall.offsetTop - window.innerHeight * 0.6);
  });
  return (
    <motion.div
      initial={false}
      animate={{ y: show ? 0 : 120, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5, ease: EXPO }}
      className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      <Link
        href="/create"
        tabIndex={show ? 0 : -1}
        className="poster flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-lg tracking-wide text-cream shadow-[0_20px_40px_-12px_rgba(0,0,0,.6)]"
      >
        Celebrate someone
        <span className="grid h-10 w-10 place-items-center rounded-full bg-road text-ink">➤</span>
      </Link>
    </motion.div>
  );
}

export function HomeFooter() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ruut-logo.png" alt="Ruut" className="mb-6 h-14 w-auto" />
          <p className="poster text-[clamp(48px,8vw,120px)] leading-[0.92] text-glow">Go the extra mile.</p>
          <p className="mt-4 max-w-md text-cream/60">
            A Ruut × Customer Support Hub celebration of the people behind great customer experiences. Emails delivered with{" "}
            <strong className="text-cream">Convert by Ruut</strong>.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <a href={CS_WEEK.site} target="_blank" rel="noopener noreferrer" className="block w-24 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CS_WEEK.logo} alt="Customer Service Week 2026 — The Extra Mile" className="w-full" />
          </a>
          <p className="text-sm text-cream/60">
            Customer Service Week · {CS_WEEK.dates}
            <br />
            Official theme and logo from{" "}
            <a href={CS_WEEK.site} target="_blank" rel="noopener noreferrer" className="underline">
              CSWeek.com
            </a>
            <br />
            Stock portraits:{" "}
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline">
              Pexels
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
