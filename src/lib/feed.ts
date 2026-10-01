import "server-only";
import { EXAMPLES } from "./examples";
import { listFeed } from "./store";
import { WALL_PAGE_SIZE, type FeedItem, type FeedPage } from "./types";

/** Below this many real celebrations, the wall is topped up with tagged examples. */
const MIN_REAL_FOR_WALL = 8;

export async function getFeedPage(page: number, size = WALL_PAGE_SIZE): Promise<FeedPage> {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const head = await listFeed(0, MIN_REAL_FOR_WALL);

  if (head.total < MIN_REAL_FOR_WALL) {
    const names = new Set(head.items.map((i) => i.name.toLowerCase()));
    const combined = [...head.items, ...EXAMPLES.filter((e) => !names.has(e.name.toLowerCase()))];
    const pages = Math.max(1, Math.ceil(combined.length / size));
    const p = Math.min(safePage, pages);
    return { items: combined.slice((p - 1) * size, p * size), page: p, pages, total: head.total };
  }

  const pages = Math.max(1, Math.ceil(head.total / size));
  const p = Math.min(safePage, pages);
  const { items, total } = await listFeed((p - 1) * size, size);
  return { items, page: p, pages, total };
}

/**
 * People for the hero collage and the reveal fan: the newest real celebrations with photos
 * first, topped up with examples. The more people celebrate, the more real faces appear.
 */
export async function getShowcase(count: number): Promise<{ items: FeedItem[]; total: number }> {
  const { items, total } = await listFeed(0, 60);
  const real = items.filter((i) => i.photoUrl);
  const fill = EXAMPLES.filter((e) => !real.some((r) => r.name.toLowerCase() === e.name.toLowerCase()));
  return { items: [...real, ...fill].slice(0, Math.max(count, Math.min(real.length, 40))), total };
}
