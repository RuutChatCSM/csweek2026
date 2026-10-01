/**
 * Extra faces for the hero's switching photos: Ruut's CS Week 2025 community gallery
 * (from csweek25.ruut.chat) and the 2025 heroes' event photos.
 */
export const COMMUNITY_PHOTOS = Array.from({ length: 15 }, (_, i) => `/community/c${String(i + 1).padStart(2, "0")}.jpg`);

export const HERO_EVENT_PHOTOS = [
  "/heroes/oluwatobi-ojo-2.jpg",
  "/heroes/bukola-willoby-2.jpg",
  "/heroes/eromonsele-oigiagbe.jpg",
  "/heroes/muibat-alaran-2.jpg",
];
