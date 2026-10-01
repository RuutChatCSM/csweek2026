import type { ThemeId } from "./themes";

export type CelebrationMode = "other" | "self";

/** Everything needed to draw a card. Shared by the live preview and the server renderer. */
export type CardData = {
  mode: CelebrationMode;
  name: string;
  role: string;
  org: string;
  message: string;
  /** Processed (cropped, optionally duotoned) JPEG data URL, or empty for an initials avatar */
  photo: string;
  theme: ThemeId;
  senderName: string;
};

export type EmailStatus = "not_requested" | "sent" | "queued_dev" | "failed";

export type StoredCard = CardData & {
  id: string;
  createdAt: string;
  email: {
    status: EmailStatus;
    recipientFirstName?: string;
  };
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
} as const;
