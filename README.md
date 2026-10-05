# Ruut × Customer Support Hub · CS Week 2026

An interactive Customer Service Week 2026 experience: **come in, celebrate a customer support professional, make them a personalised card, share it instantly.**
Built around the official 2026 theme, **The Extra Mile** (Oct 5–9, 2026), with a road-sign and mile-marker visual language.

## The experience

**Home (`/`)** is one scroll-driven story:

1. **Poster hero** (after the MoMoney reference): a highway-blue colour field with huge condensed *Celebrating the people who go the extra mile* type. Letters rise in one by one. A photo dropped into the headline cycles through the people being celebrated. Stickers include the official CS Week logo and pixel-art headset and heart, all with mouse parallax. A pixel trail follows the cursor, and corner portraits float.
2. **Fan → reveal** (after Luma's Art of Hosting): the fan of portraits peeking at the bottom of the hero rises into a row as you scroll. The background turns to paper, and each card flips as it reaches the centre to reveal the message someone wrote.
3. **Thank-you marquees**, then **the Wall**: every shared celebration, newest first. It is paginated (`?page=`) and polls every 8s, so new cards spring in while you watch.
4. How it works, the Ruut / Convert by Ruut story, and the footer.

**The page gets better as people use it.** The hero photo, the corner portraits, the "Just celebrated" chip, the reveal fan and the wall all draw on real celebrations first. Ruut's **CS Week 2025 heroes** (Oluwatobi Ojo, Bukola Willoby, Eromonsele Oigiagbe, Muibat Alaran, from csweek25.ruut.chat) are prepopulated as real celebrations (`src/lib/seeds.ts`) with card pages and a "CS Week 2025 hero" badge. The hero's switching photos also draw on the 2025 community gallery (`src/lib/gallery.ts`). Until there are enough celebrations, the wall is topped up with clearly tagged examples (`src/lib/examples.ts`: fictional people and organisations, free Magnific portraits).

Motion: `motion` (Framer Motion) for the intro, scroll choreography and layout animation, Lenis for smooth scrolling, and a canvas for the pixel trail. Everything respects `prefers-reduced-motion`.

| Route | What it is |
| --- | --- |
| `/create` | 5-step builder with a live preview. `?mode=self` gives the self-celebration copy |
| `/c/[id]` | Public card page with share/download and the viral loop. `?via=email` greets the recipient |
| `GET /api/cards?page=N` | Public wall feed (12 per page) |
| `POST /api/cards` | Validates, stores, optionally adds to the wall, optionally emails through Convert |
| `DELETE /api/cards/[id]` | Moderation: hides a card (header `x-admin-token: $ADMIN_TOKEN`) |
| `/api/cards/[id]/image` | Card PNG 1080×1350. `?format=story` gives 1080×1920, `?download=1` downloads it |
| `/api/cards/[id]/og` | 1200×630 link preview |
| `/api/cards/[id]/photo` | The card's photo (keeps the feed light) |
| `/dev/outbox/[id]` | Dev only: preview of the email that would have been sent |

## Official CS Week logo

Every card, the Story image, the OG image and the email carry the official **Customer Service Week 2026 "The Extra Mile"** logo (`public/brand/csweek-2026-logo.png`, from csweek.com).
The logo terms allow use on websites, social media and emails for your celebration. They require the logo to stay **unaltered** (no stretching, recolouring or reshaping) and ask that you link to CSWeek.com. The site does both.

## How the card is made

`src/components/card/CardArt.tsx` is a single, Satori-compatible component. It renders:
- in the browser as the **live preview** (scaled with CSS), and
- on the server through `next/og` as the **shareable PNG**.

So the preview and the downloaded card always match. Photos are centre-cropped, resized and (optionally) duotoned in the browser (`src/lib/photo.ts`) before upload, which keeps payloads around 100 KB.
There are five colourways in `src/lib/themes.ts`.

## Sharing

LinkedIn, X and WhatsApp use their share URLs with the card page link; the OG image provides the preview. Instagram has no web share URL, so on mobile it uses the native share sheet with the Story image, and on desktop it downloads the Story image. **Copy link** covers Slack, Teams and other internal channels.

## Email: Convert by Ruut

`src/lib/email/convert.ts` sends a transactional message through `POST /messages` and adds recipients to Convert contact list 21 through `POST /contact_lists/21/contacts`. Set `CONVERT_API_KEY` and `CONVERT_CONTACT_LIST_ID=21` in the server environment. The key needs `messages:write` and `contacts:write` scopes. Without a key, emails are saved to `.data/outbox` for local preview; contacts are not added.
The template is in `src/lib/email/template.ts` and is table-based so it works in email clients.

## Run it

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

## Before going live

- Set `NEXT_PUBLIC_SITE_URL`. Email images and links must be absolute public URLs.
- Configure Upstash Redis for storage when deploying to serverless hosts (local `.data/` won't persist there).
- Confirm Convert's API shape and a verified sender domain.
- Rate limiting is in-memory per instance (30 cards and 8 emails per IP per hour, plus a honeypot). Use a shared limiter for multi-instance deployments.
- Swap the text wordmarks in `src/components/site/Brand.tsx` for official Ruut / Customer Support Hub logo files.
- Card pages are `noindex` with random IDs, and the recipient's email address is never stored. Showing a card on the public wall is opt-in (default on) in the last step.
- Set `ADMIN_TOKEN` so you can hide anything inappropriate from the wall. Consider pre-moderation if the wall will be shown on a big screen.
- Example portraits in `public/people` are free Pexels images. The footer credits Pexels, and `public/people/CREDITS.md` lists each source.
- The CS Week 2025 hero and community photos remain in `public/` for reference, but are not displayed on the site.
