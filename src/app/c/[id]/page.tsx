import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteNav } from "@/components/site/Brand";
import { ShareActions } from "@/components/share/ShareActions";
import { siteUrl } from "@/lib/site";
import { getCard } from "@/lib/store";

export async function generateMetadata({ params }: PageProps<"/c/[id]">): Promise<Metadata> {
  const { id } = await params;
  const card = await getCard(id);
  if (!card) return {};
  const base = await siteUrl();
  const title =
    card.mode === "self"
      ? `${card.name} is celebrating CS Week 2026 🎉`
      : `Celebrating ${card.name} this Customer Service Week 🎉`;
  const description = card.message;
  const image = { url: `${base}/api/cards/${id}/og`, width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    openGraph: { title, description, url: `${base}/c/${id}`, images: [image], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    robots: { index: false },
  };
}

export default async function CardPage({ params, searchParams }: PageProps<"/c/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const card = await getCard(id);
  if (!card) notFound();

  const fromEmail = sp.via === "email";
  const first = card.name.split(/\s+/)[0];
  const url = `${await siteUrl()}/c/${id}`;
  const self = card.mode === "self";

  return (
    <main className="relative min-h-dvh overflow-x-clip">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative z-10">
        <SiteNav />
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 pb-16 pt-4 sm:px-8 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:gap-16 lg:pt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/cards/${id}/image`}
            alt={`Customer Service Week 2026 card celebrating ${card.name}`}
            width={1080}
            height={1350}
            className="rise w-full -rotate-1 rounded-[clamp(14px,3.6%,40px)] shadow-[0_40px_80px_-30px_rgba(22,22,26,.55)]"
          />

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">Customer Service Week 2026</p>
            <h1 className="poster mt-3 text-[clamp(52px,7vw,110px)] leading-[1]">
              {fromEmail
                ? `${first}, this one’s for you.`
                : self
                  ? `${first} is celebrating.`
                  : `Celebrating ${first}.`}
            </h1>
            <p className="mt-5 max-w-xl font-serif text-2xl italic leading-snug text-ink/80">“{card.message}”</p>
            {card.senderName && !self && <p className="mt-3 font-bold">— {card.senderName}</p>}

            <div className="mt-10 max-w-2xl">
              <h2 className="poster mb-4 text-4xl">
                {fromEmail ? "Show it off" : "Share the celebration"}
              </h2>
              <ShareActions id={id} name={card.name} role={card.role} org={card.org} self={self} url={url} />
            </div>

            <div className="mt-10 max-w-2xl rounded-[2rem] bg-ink p-7 text-paper sm:p-9">
              <p className="poster text-4xl leading-none sm:text-5xl">
                {fromEmail || !self ? "Someone celebrated you." : "Your turn."}
              </p>
              <p className="mt-2 text-lg text-paper/75">Now celebrate someone who makes customer experiences better.</p>
              <Link
                href={fromEmail ? `/create?ref=email&from=${id}` : "/create"}
                className="poster group mt-6 inline-flex items-center gap-3 rounded-md bg-road py-3 pl-6 pr-3 text-xl tracking-wide text-ink transition hover:-translate-y-0.5"
              >
                Celebrate someone
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-road transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
