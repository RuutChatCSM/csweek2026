"use client";

import { useState } from "react";
import { CS_WEEK } from "@/lib/types";

type Props = {
  id: string;
  name: string;
  role: string;
  org: string;
  self: boolean;
  /** Absolute URL of the public card page */
  url: string;
};

function shareText({ name, role, org, self }: Props) {
  if (self) {
    return `Taking a moment to celebrate myself this Customer Service Week. Here's to going the extra mile 🎉 ${CS_WEEK.hashtag}`;
  }
  const where = [role, org].filter(Boolean).join(" at ");
  return `Celebrating ${name}${where ? `, ${where},` : ""} for going the extra mile for customers this Customer Service Week 🎉 ${CS_WEEK.hashtag}`;
}

const btn =
  "inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-ink px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#16161A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-signal";

export function ShareActions(props: Props) {
  const { id, url } = props;
  const [note, setNote] = useState<string | null>(null);
  const text = shareText(props);
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
        await navigator.share({ files: [file], text, url });
        return true;
      }
      if (navigator.share) {
        await navigator.share({ text, url });
        return true;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return true;
    }
    return false;
  }

  async function instagram() {
    // Instagram has no web share URL: share the image file on mobile, otherwise download it.
    if (await nativeShare("story")) return;
    const a = document.createElement("a");
    a.href = `${image}?format=story&download=1`;
    a.download = "";
    a.click();
    flash("Story image saved. Post it to your Instagram story or feed!");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      flash("Link copied. Paste it into Slack, Teams or your team chat.");
    } catch {
      flash(url);
    }
  }

  const enc = encodeURIComponent;
  const links = [
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      icon: (
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8.25h4.56V23H.22V8.25zM8.34 8.25h4.37v2.02h.06c.61-1.15 2.1-2.37 4.32-2.37 4.62 0 5.47 3.04 5.47 7v8.1h-4.56v-7.18c0-1.71-.03-3.92-2.39-3.92-2.39 0-2.76 1.87-2.76 3.8V23H8.34V8.25z" />
      ),
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
      icon: <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${text}\n${url}`)}`,
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
        <button type="button" onClick={copyLink} className={`${btn} bg-signal`}>
          <span aria-hidden>🔗</span> Copy link
        </button>
      </div>

      <p aria-live="polite" className={`min-h-6 text-sm font-semibold transition-opacity ${note ? "opacity-100" : "opacity-0"}`}>
        {note}
      </p>
    </div>
  );
}
