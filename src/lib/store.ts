import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { StoredCard } from "./types";

/**
 * Card storage.
 *
 * - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, cards are stored in Redis
 *   (works on serverless hosts like Vercel).
 * - Otherwise cards are written to ./.data/cards (local development / single server).
 */

const TTL_SECONDS = 60 * 60 * 24 * 365;
const DATA_DIR = join(process.cwd(), ".data");

const upstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
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

export async function saveCard(card: StoredCard) {
  if (upstash) {
    await redis(["SET", `card:${card.id}`, JSON.stringify(card), "EX", TTL_SECONDS]);
    return;
  }
  const dir = join(DATA_DIR, "cards");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${card.id}.json`), JSON.stringify(card));
}

export async function getCard(id: string): Promise<StoredCard | null> {
  if (!ID_RE.test(id)) return null;
  if (upstash) {
    const { result } = await redis(["GET", `card:${id}`]);
    return typeof result === "string" ? (JSON.parse(result) as StoredCard) : null;
  }
  try {
    return JSON.parse(await readFile(join(DATA_DIR, "cards", `${id}.json`), "utf8")) as StoredCard;
  } catch {
    return null;
  }
}

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
