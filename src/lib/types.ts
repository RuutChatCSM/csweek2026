import type { ThemeId } from "./themes";

export type CelebrationMode = "other" | "self";

/** Everything needed to draw a card. Shared by the live preview and the server renderer. */
export type CardData = {
  mode: CelebrationMode;
  name: string;
  role: string;
  org: string;
  message: string;
  /** Processed (cropped, optionally duotoned) JPEG data URL or image URL; empty for an initials avatar */
  photo: string;
  theme: ThemeId;
  senderName: string;
};

export type EmailStatus = "not_requested" | "sent" | "queued_dev" | "failed";

export type StoredCard = CardData & {
  id: string;
  createdAt: string;
  /** Shown on the public Wall of Celebrations (creator opted in) */
  listed?: boolean;
  /** Removed by a moderator */
  hidden?: boolean;
  email: {
    status: EmailStatus;
    recipientFirstName?: string;
  };
};

/** Lightweight public shape used by the hero, the reveal fan and the wall. */
export type FeedItem = {
  id: string;
  name: string;
  role: string;
  org: string;
  message: string;
  senderName: string;
  mode: CelebrationMode;
  theme: ThemeId;
  photoUrl: string | null;
  createdAt: string;
  /** Sample celebration shown while the wall is still filling up */
  example?: boolean;
};

export type FeedPage = {
  items: FeedItem[];
  page: number;
  pages: number;
  total: number;
};

export const LIMITS = {
  name: 40,
  role: 48,
  org: 48,
  message: 240,
  senderName: 40,
  photoBytes: 900_000,
} as const;

export const CS_WEEK = {
  year: 2026,
  theme: "The Extra Mile",
  dates: "Oct 5–9, 2026",
  hashtag: "#CSWeek2026",
  logo: "/brand/csweek-2026-logo.png",
  site: "https://csweek.com",
} as const;

export const WALL_PAGE_SIZE = 12;
