import { NextResponse } from "next/server";
import { addToContactList, sendWithConvert } from "@/lib/email/convert";
import { celebrationEmail } from "@/lib/email/template";
import { getFeedPage } from "@/lib/feed";
import { clientIp, rateLimit, siteUrl } from "@/lib/site";
import { newCardId, saveCard } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import { LIMITS, type StoredCard } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

/** Public wall feed: `GET /api/cards?page=1` */
export async function GET(req: Request) {
  const page = Number(new URL(req.url).searchParams.get("page") ?? "1");
  return NextResponse.json(await getFeedPage(page), { headers: { "Cache-Control": "no-store" } });
}

type Body = {
  mode?: unknown;
  name?: unknown;
  role?: unknown;
  org?: unknown;
  message?: unknown;
  photo?: unknown;
  theme?: unknown;
  senderName?: unknown;
  listed?: unknown;
  send?: { enabled?: unknown; firstName?: unknown; email?: unknown };
  website?: unknown; // honeypot
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`card:${ip}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "You've made a lot of cards! Please try again in a little while." }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Bots fill every field; people never see this one.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ id: newCardId(), email: { status: "not_requested" } });
  }

  const mode = body.mode === "self" ? "self" : "other";
  const name = str(body.name, LIMITS.name);
  const role = str(body.role, LIMITS.role);
  const org = str(body.org, LIMITS.org);
  const message = typeof body.message === "string" ? body.message.trim().slice(0, LIMITS.message) : "";
  const senderName = mode === "self" ? "" : str(body.senderName, LIMITS.senderName);
  const theme = typeof body.theme === "string" && body.theme in THEMES ? (body.theme as StoredCard["theme"]) : "ruut";
  const photo = typeof body.photo === "string" ? body.photo : "";

  if (!name || !role || !org || !message) {
    return NextResponse.json({ error: "Please fill in the name, role, organisation and message." }, { status: 400 });
  }
  if (photo && (!PHOTO_RE.test(photo) || photo.length > LIMITS.photoBytes * 1.37)) {
    return NextResponse.json({ error: "That photo couldn't be used. Try a smaller JPG or PNG." }, { status: 400 });
  }

  const wantsEmail = mode === "other" && body.send?.enabled === true;
  const recipientFirstName = str(body.send?.firstName, LIMITS.name);
  const recipientEmail = str(body.send?.email, 254).toLowerCase();
  if (wantsEmail && (!recipientFirstName || !EMAIL_RE.test(recipientEmail))) {
    return NextResponse.json({ error: "Please add their first name and a valid email address." }, { status: 400 });
  }

  const card: StoredCard = {
    id: newCardId(),
    createdAt: new Date().toISOString(),
    mode,
    name,
    role,
    org,
    message,
    photo,
    theme,
    senderName,
    listed: body.listed !== false,
    email: { status: "not_requested" },
  };

  if (wantsEmail) {
    if (!rateLimit(`email:${ip}`, 8, 60 * 60 * 1000)) {
      card.email = { status: "failed", recipientFirstName };
    } else {
      const base = await siteUrl();
      const { subject, html, text } = celebrationEmail({ card, recipientFirstName, siteUrl: base });
      // Save first so the image URL inside the email resolves as soon as it's opened.
      await saveCard(card);
      // Recipient's last name, when the card's name starts with the first name they gave us.
      const [cardFirst, ...rest] = name.split(" ");
      const lastName = cardFirst.toLowerCase() === recipientFirstName.toLowerCase() ? rest.join(" ") : "";
      const [result] = await Promise.all([
        sendWithConvert({
          id: card.id,
          to: { email: recipientEmail, name: recipientFirstName },
          subject,
          html,
          text,
        }),
        // Every recipient also lands in the CS Week contact list in Convert.
        addToContactList({ email: recipientEmail, firstName: recipientFirstName, lastName, businessName: org }),
      ]);
      card.email = { status: result.status, recipientFirstName };
    }
  }

  await saveCard(card, { index: true });
  return NextResponse.json({ id: card.id, email: card.email });
}
