import "server-only";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FeedItem, StoredCard } from "./types";

/**
 * Card storage.
 *
 * - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, cards are stored in Redis
 *   and the public wall is a Redis list (works on serverless hosts like Vercel).
 * - Otherwise cards are written to ./.data/cards (local development / single server).
 */

const TTL_SECONDS = 60 * 60 * 24 * 365;
const DATA_DIR = join(process.cwd(), ".data");
const FEED_KEY = "cards:feed";

const upstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? { url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN }
    : null;

async function redis(command: (string | number)[]) {
  const res = await fetch(upstash!.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${upstash!.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  return (await res.json()) as { result: unknown };
}

const ID_RE = /^[a-zA-Z0-9_-]{6,32}$/;

export function newCardId() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Buffer.from(bytes).toString("base64url");
}

/** Saves a card. `index` adds it to the public wall feed (only on first save). */
export async function saveCard(card: StoredCard, { index = false } = {}) {
  if (upstash) {
    await redis(["SET", `card:${card.id}`, JSON.stringify(card), "EX", TTL_SECONDS]);
    if (index && card.listed && !card.hidden) await redis(["LPUSH", FEED_KEY, card.id]);
    return;
  }
  const dir = join(DATA_DIR, "cards");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${card.id}.json`), JSON.stringify(card));
  feedCache = null;
}

/** Returns a card, or null when missing or hidden by a moderator (unless `includeHidden`). */
export async function getCard(id: string, { includeHidden = false } = {}): Promise<StoredCard | null> {
  if (!ID_RE.test(id)) return null;
  let card: StoredCard | null = null;
  if (upstash) {
    const { result } = await redis(["GET", `card:${id}`]);
    card = typeof result === "string" ? (JSON.parse(result) as StoredCard) : null;
  } else {
    try {
      card = JSON.parse(await readFile(join(DATA_DIR, "cards", `${id}.json`), "utf8")) as StoredCard;
    } catch {
      return null;
    }
  }
  return card && (includeHidden || !card.hidden) ? card : null;
}

export async function hideCard(id: string) {
  const card = await getCard(id, { includeHidden: true });
  if (!card) return false;
  card.hidden = true;
  await saveCard(card);
  if (upstash) await redis(["LREM", FEED_KEY, 0, id]);
  return true;
}

export function toFeedItem(card: StoredCard): FeedItem {
  return {
    id: card.id,
    name: card.name,
    role: card.role,
    org: card.org,
    message: card.message,
    senderName: card.senderName,
    mode: card.mode,
    theme: card.theme,
    photoUrl: card.photo ? `/api/cards/${card.id}/photo` : null,
    createdAt: card.createdAt,
  };
}

// --- Feed (public wall) -------------------------------------------------------

let feedCache: { at: number; ids: StoredCard[] } | null = null;

async function fsFeed(): Promise<StoredCard[]> {
  if (feedCache && Date.now() - feedCache.at < 2000) return feedCache.ids;
  const dir = join(DATA_DIR, "cards");
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const cards = (
    await Promise.all(
      files.map(async (f) => {
        try {
          return JSON.parse(await readFile(join(dir, f), "utf8")) as StoredCard;
        } catch {
          return null;
        }
      }),
    )
  ).filter((c): c is StoredCard => !!c && c.listed === true && !c.hidden);
  cards.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  feedCache = { at: Date.now(), ids: cards };
  return cards;
}

/** Newest-first page of listed cards. */
export async function listFeed(offset: number, limit: number): Promise<{ items: FeedItem[]; total: number }> {
  if (upstash) {
    const [{ result: total }, { result: ids }] = await Promise.all([
      redis(["LLEN", FEED_KEY]),
      redis(["LRANGE", FEED_KEY, offset, offset + limit - 1]),
    ]);
    const idList = (ids as string[]) ?? [];
    if (!idList.length) return { items: [], total: Number(total) || 0 };
    const { result } = await redis(["MGET", ...idList.map((id) => `card:${id}`)]);
    const items = (result as (string | null)[])
      .filter((r): r is string => typeof r === "string")
      .map((r) => JSON.parse(r) as StoredCard)
      .filter((c) => !c.hidden)
      .map(toFeedItem);
    return { items, total: Number(total) || 0 };
  }
  const all = await fsFeed();
  return { items: all.slice(offset, offset + limit).map(toFeedItem), total: all.length };
}

// --- Dev outbox ---------------------------------------------------------------

/** Dev-only outbox: emails that would have been sent through Convert. */
export async function saveOutboxEmail(id: string, email: { to: string; subject: string; html: string }) {
  const dir = join(DATA_DIR, "outbox");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${id}.json`), JSON.stringify(email));
}

export async function getOutboxEmail(id: string) {
  if (!ID_RE.test(id)) return null;
  try {
    return JSON.parse(await readFile(join(DATA_DIR, "outbox", `${id}.json`), "utf8")) as {
      to: string;
      subject: string;
      html: string;
    };
  } catch {
    return null;
  }
}
