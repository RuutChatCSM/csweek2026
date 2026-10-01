"use client";

import { useState } from "react";
import { CS_WEEK } from "@/lib/types";

export type SharePerspective = "creator" | "recipient" | "viewer";

type Props = {
  id: string;
  name: string;
  role: string;
  org: string;
  self: boolean;
  /** Absolute URL of the public card page */
  url: string;
  /** Who is sharing: the person who made the card, the person celebrated, or anyone else */
  perspective?: SharePerspective;
  senderName?: string;
};

const RUUT = { x: "@ruutchat", instagram: "@ruutchat", name: "Ruut" } as const;
const TAGS = `${CS_WEEK.hashtag} #TheExtraMile #CustomerServiceWeek`;

/** The heart of each post: who is being celebrated, from whose point of view. */
function lead({ name, role, org, self, perspective = "creator", senderName }: Props) {
  const first = name.trim().split(/\s+/)[0] ?? name;
  const where = [role, org].filter(Boolean).join(" at ");
  if (self) return `This Customer Service Week, I'm taking a moment to celebrate myself and everything I've put into supporting customers this year. 🎉`;
  if (perspective === "recipient")
    return `I was celebrated this Customer Service Week${senderName ? ` by ${senderName}` : ""}, and it made my week. 🥹🎉 Grateful to everyone I get to go the extra mile with.`;
  if (perspective === "viewer")
    return `Celebrating ${name}${where ? `, ${where},` : ""} for going the extra mile for customers this Customer Service Week. 🎉`;
  return `This Customer Service Week, I'm celebrating ${name}${where ? `, ${where},` : ""} for going the extra mile for customers. 🎉 Thank you, ${first}, for making every interaction feel human.`;
}

/** Long-form post (LinkedIn, WhatsApp, Instagram caption, team chat) with a thank-you to Ruut. */
function longPost(props: Props, ruutHandle: string) {
  return [
    lead(props),
    `A big thank you to ${ruutHandle} for creating a platform that celebrates the people behind great customer experiences. 💜`,
    `Know someone who goes the extra mile? Celebrate them too 👇\n${props.url}`,
    TAGS,
  ].join("\n\n");
}

/** X has 280 characters: keep it tight (links count as 23). */
function xPost(props: Props) {
  const { name, self, perspective = "creator" } = props;
  const who = self
    ? "Celebrating myself"
    : perspective === "recipient"
      ? "I got celebrated"
      : `Celebrating ${name.length > 28 ? name.split(/\s+/)[0] : name}`;
  return `${who} for going the extra mile this ${CS_WEEK.hashtag} 🎉 Thank you ${RUUT.x} for building a platform that celebrates the people behind great customer experiences 💜`;
}

const btn =
  "inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-ink px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#141414] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-road";

export function ShareActions(props: Props) {
  const { id, url } = props;
  const [note, setNote] = useState<string | null>(null);
  const text = longPost(props, RUUT.name);
  const image = `/api/cards/${id}/image`;

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(null), 3500);
  };

  async function fetchFile(format: "post" | "story") {
    const res = await fetch(`${image}${format === "story" ? "?format=story" : ""}`);
    const blob = await res.blob();
    return new File([blob], `cs-week-2026-${format}.png`, { type: "image/png" });
  }

  async function nativeShare(format: "post" | "story" = "post") {
    try {
      const file = await fetchFile(format);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return true;
      }
      if (navigator.share) {
        await navigator.share({ text });
        return true;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return true;
    }
    return false;
  }

  async function instagram() {
    // Instagram has no web "compose" URL. Copy the caption, then hand over the image:
    // the native share sheet on phones (pick Instagram), or download + open Instagram on desktop.
    const caption = longPost(props, RUUT.instagram);
    try {
      await navigator.clipboard.writeText(caption);
    } catch {}
    if (await nativeShare("story")) {
      flash("Caption copied. Paste it into your Instagram post or story.");
      return;
    }
    const a = document.createElement("a");
    a.href = `${image}?format=story&download=1`;
    a.download = "";
    a.click();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    flash("Image saved and caption copied. Create a post on Instagram, add the image and paste the caption.");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(text);
      flash("Link copied. Paste it into Slack, Teams or your team chat.");
    } catch {
      flash(url);
    }
  }

  const enc = encodeURIComponent;
  const links = [
    {
      label: "LinkedIn",
      // Opens the LinkedIn post composer with the message pre-filled (the link unfurls into the card preview).
      href: `https://www.linkedin.com/feed/?shareActive=true&text=${enc(text)}`,
      icon: (
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8.25h4.56V23H.22V8.25zM8.34 8.25h4.37v2.02h.06c.61-1.15 2.1-2.37 4.32-2.37 4.62 0 5.47 3.04 5.47 7v8.1h-4.56v-7.18c0-1.71-.03-3.92-2.39-3.92-2.39 0-2.76 1.87-2.76 3.8V23H8.34V8.25z" />
      ),
    },
    {
      label: "X",
      href: `https://x.com/intent/post?text=${enc(xPost(props))}&url=${enc(url)}`,
      icon: <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(longPost(props, "Ruut"))}`,
      icon: (
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z" />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <a href={`${image}?download=1`} download className={`${btn} bg-ink text-paper`}>
          <span aria-hidden>↓</span> Download card
        </a>
        <a href={`${image}?format=story&download=1`} download className={`${btn} bg-white`}>
          <span aria-hidden>↓</span> Story size
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={`${btn} bg-white`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              {l.icon}
            </svg>
            {l.label}
          </a>
        ))}
        <button type="button" onClick={instagram} className={`${btn} bg-white`}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          Instagram
        </button>
        <button type="button" onClick={copyLink} className={`${btn} bg-road`}>
          <span aria-hidden>🔗</span> Copy link
        </button>
      </div>

      <p aria-live="polite" className={`min-h-6 text-sm font-semibold transition-opacity ${note ? "opacity-100" : "opacity-0"}`}>
        {note}
      </p>
    </div>
  );
}
