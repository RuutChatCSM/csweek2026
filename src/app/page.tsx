import Link from "next/link";
import { CardFan } from "@/components/site/CardFan";
import { RoadSignMark, SiteFooter, SiteNav } from "@/components/site/Brand";
import { Spotlight } from "@/components/site/Spotlight";

const THANKS = [
  "Thank you for going the extra mile",
  "For the patience on the hard calls",
  "For the replies at 2am",
  "For turning “this isn’t working” into “thank you so much”",
  "For remembering the customer’s name",
  "For the follow-ups nobody asked for",
  "For making every interaction feel human",
];

const STEPS = [
  { n: "01", title: "Pick someone", body: "A teammate, a support lead, the agent who saved your week — or yourself." },
  { n: "02", title: "Make their card", body: "Add a photo and a few words. Watch the card come to life as you type." },
  { n: "03", title: "Send the love", body: "Share it on LinkedIn, X, Instagram or WhatsApp — or email it straight to them." },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      {/* Hero */}
      <section className="relative isolate">
        <Spotlight />
        <SiteNav />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pb-10 pt-6 text-center sm:px-8 sm:pt-10">
          <p className="rise inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-bold shadow-sm backdrop-blur sm:text-base">
            <span aria-hidden>🎉</span>
            <span className="bg-gradient-to-r from-ruut via-violet to-coral bg-clip-text text-transparent">
              Happy Customer Service Week 2026
            </span>
          </p>

          <h1 className="mt-6 font-display font-extrabold uppercase leading-[0.82] tracking-[-0.045em] text-ink sm:mt-8">
            <span className="sr-only">The Extra Mile — the Customer Service Week 2026 theme</span>
            <span aria-hidden className="flex items-end justify-center gap-[0.12em] text-[clamp(78px,17vw,250px)]">
              <span
                className="rise font-serif text-[0.5em] font-normal normal-case italic leading-none tracking-normal text-ink/80"
                style={{ animationDelay: "120ms" }}
              >
                The
              </span>
              <span className="rise" style={{ animationDelay: "200ms" }}>
                Extra
              </span>
            </span>
            <span
              aria-hidden
              className="relative flex items-center justify-center gap-[0.08em] text-[clamp(78px,17vw,250px)]"
            >
              <span className="rise" style={{ animationDelay: "300ms" }}>
                Mile
              </span>
              <span className="rise inline-block" style={{ animationDelay: "450ms" }}>
                <RoadSignMark arrow className="wobble h-[0.78em] w-[0.78em] drop-shadow-[0_14px_20px_rgba(22,22,26,.25)]" />
              </span>
            </span>
          </h1>

          <div aria-hidden className="rise mt-5 h-2 w-[min(780px,90%)] text-ink" style={{ animationDelay: "500ms" }}>
            <div className="road-dashes moving h-full rounded-full" />
          </div>

          <p
            className="rise mt-8 max-w-xl text-lg leading-relaxed text-ink/75 sm:text-xl"
            style={{ animationDelay: "550ms" }}
          >
            This week we celebrate the people who go a little further for every customer. Make one of them a card. Tell
            them they matter.
          </p>

          <div className="rise mt-8 flex flex-col items-center gap-4" style={{ animationDelay: "650ms" }}>
            <Link
              href="/create"
              className="group inline-flex items-center gap-3 rounded-full bg-ink py-4 pl-7 pr-4 text-base font-bold text-paper shadow-[0_18px_40px_-14px_rgba(22,22,26,.7)] transition hover:-translate-y-0.5 sm:text-lg"
            >
              Celebrate a Customer Service Professional
              <span className="grid h-9 w-9 place-items-center rounded-full bg-signal text-ink transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/create?mode=self"
              className="font-serif text-xl italic text-ink/80 underline decoration-signal decoration-[3px] underline-offset-4 transition hover:text-ink"
            >
              Or celebrate yourself 🎉
            </Link>
          </div>
        </div>

        <div className="relative z-10 px-4 pb-16">
          <CardFan />
        </div>
      </section>

      {/* Thank-you marquee */}
      <section aria-label="Thank you messages" className="relative -rotate-1 bg-signal py-5 text-ink">
        <div className="flex w-max marquee">
          {[0, 1].map((k) => (
            <ul key={k} aria-hidden={k === 1} className="flex shrink-0 items-center">
              {THANKS.map((t) => (
                <li key={t} className="flex items-center whitespace-nowrap px-6 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t}
                  <RoadSignMark className="ml-12 h-8 w-8" label={false} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
        <p className="font-serif text-2xl italic text-ink/70">Three miles, one minute.</p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
          It’s a greeting card, not a form.
        </h2>
        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div aria-hidden className="absolute left-0 right-0 top-[38px] hidden h-1.5 text-ink/80 md:block">
            <div className="road-dashes h-full rounded-full" />
          </div>
          {STEPS.map((s) => (
            <li key={s.n} className="relative">
              <div className="relative z-10 inline-flex h-[78px] flex-col items-center justify-center rounded-2xl border-[3px] border-ink bg-[#1F7A4D] px-4 text-white shadow-[4px_4px_0_#16161A]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Mile</span>
                <span className="font-display text-3xl font-extrabold leading-none">{s.n}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-extrabold tracking-tight">{s.title}</h3>
              <p className="mt-2 max-w-sm text-lg leading-relaxed text-ink/70">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Powered by Ruut */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <p className="font-serif text-2xl italic text-paper/60">The story behind the celebration</p>
          <h2 className="mt-2 max-w-4xl font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
            Great experiences have people behind them.
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-ruut p-8">
              <p className="font-display text-3xl font-extrabold">Ruut</p>
              <p className="mt-3 text-lg text-white/85">Powering better customer experiences across every channel.</p>
            </div>
            <div className="rounded-3xl bg-lime p-8 text-ink">
              <p className="font-display text-3xl font-extrabold">Convert by Ruut</p>
              <p className="mt-3 text-lg text-ink/75">
                Powering the delivery of every celebration email sent from this page.
              </p>
            </div>
            <div className="rounded-3xl bg-signal p-8 text-ink">
              <p className="font-display text-3xl font-extrabold">You</p>
              <p className="mt-3 text-lg text-ink/75">The people actually delivering those experiences, every single day.</p>
            </div>
          </div>
          <div className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/create"
              className="group inline-flex items-center gap-3 rounded-full bg-signal py-4 pl-7 pr-4 text-lg font-bold text-ink transition hover:-translate-y-0.5"
            >
              Celebrate someone
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-signal transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link href="/create?mode=self" className="font-serif text-xl italic text-paper/80 underline decoration-signal underline-offset-4">
              Or celebrate yourself 🎉
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
