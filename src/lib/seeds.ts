import "server-only";
import type { StoredCard } from "./types";

/**
 * Ruut's CS Week 2025 "Mission Possible" heroes (csweek25.ruut.chat), prepopulated as real,
 * listed celebrations. They are stored like any other card, so each has a card page,
 * a shareable PNG and a spot on the wall. Roles and organisations are from their 2025 profiles.
 */
const hero = (
  slug: string,
  name: string,
  role: string,
  org: string,
  message: string,
  theme: StoredCard["theme"],
  day: number,
): StoredCard => ({
  id: `cs25-${slug}`,
  createdAt: `2025-10-0${day}T09:00:00.000Z`,
  mode: "other",
  name,
  role,
  org,
  message,
  photo: `/heroes/${slug}-card.jpg`,
  theme,
  senderName: "Team Ruut",
  listed: true,
  featured: true,
  email: { status: "not_requested" },
});

export const SEED_CARDS: StoredCard[] = [
  hero(
    "oluwatobi-ojo",
    "Oluwatobi Ojo",
    "Head of Customer Success",
    "NotchHR",
    "Thank you for solving beyond the script, and for treating every customer as a story worth remembering. That's the extra mile.",
    "ruut",
    6,
  ),
  hero(
    "bukola-willoby",
    "Bukola Willoby",
    "Head of Customer Success",
    "PiggyVest",
    "Nine years of building teams, mentoring others and turning irate moments into big smiles. You prove people are why customers stay.",
    "coral",
    7,
  ),
  hero(
    "eromonsele-oigiagbe",
    "Eromonsele Oigiagbe",
    "Customer Success Associate",
    "Cybervergent",
    "From onboarding to “Wow, this is seamless”, you advocate for customers like a superhero, and share generously with the community.",
    "signal",
    8,
  ),
  hero(
    "muibat-alaran",
    "Muibat Alaran",
    "Customer Experience Specialist",
    "Khefue",
    "From customer service rep to support hero, you never stopped learning. Thank you for building trust in every conversation.",
    "night",
    9,
  ),
];
