# Ruut × Customer Support Hub · CS Week 2026

An interactive Customer Service Week 2026 experience: **come in, celebrate a customer support professional, make them a personalised card, share it instantly.**
Built around the official 2026 theme, **The Extra Mile** (Oct 5–9, 2026), with a road-sign and mile-marker visual language.

## The flow

| Route | What it is |
| --- | --- |
| `/` | Event-style hero. "Happy Customer Service Week 2026", a huge *The Extra Mile* centrepiece, the primary CTA and **Or celebrate yourself 🎉** |
| `/create` | 5-step builder (Who → Photo → About → Message → Send) with a live card preview. `?mode=self` switches the copy to self-celebration |
| `/c/[id]` | Public card page with share/download, OG tags for link previews, and the viral loop CTA. `?via=email` greets the recipient |
| `/api/cards` | `POST`: validates, stores the card, optionally emails the recipient through Convert |
| `/api/cards/[id]/image` | Card PNG, 1080×1350 (4:5). `?format=story` gives 1080×1920, `?download=1` downloads it |
| `/api/cards/[id]/og` | 1200×630 link-preview image (LinkedIn, X, WhatsApp, Slack) |
| `/dev/outbox/[id]` | Dev only: preview of the email that *would* have been sent |

The viral loop is **Create → Send → Receive → Celebrate someone else → Repeat**. The email and the card page both end with *"Someone celebrated you. Now celebrate someone who makes customer experiences better."*

## How the card is made

`src/components/card/CardArt.tsx` is a single, Satori-compatible component. It renders:
- in the browser as the **live preview** (scaled with CSS), and
- on the server through `next/og` as the **shareable PNG**.

So the preview and the downloaded card always match. Photos are centre-cropped, resized and (optionally) duotoned in the browser (`src/lib/photo.ts`) before upload, which keeps payloads around 100 KB.
There are five colourways in `src/lib/themes.ts`.

## Sharing

LinkedIn, X and WhatsApp use their share URLs with the card page link; the OG image provides the preview. Instagram has no web share URL, so on mobile it uses the native share sheet with the Story image, and on desktop it downloads the Story image. **Copy link** covers Slack, Teams and other internal channels.

## Email: Convert by Ruut

`src/lib/email/convert.ts` POSTs a generic transactional payload (`from`, `to`, `subject`, `html`, `text`, `tags`) to `CONVERT_API_URL` with a Bearer key.
**Adjust `buildPayload` to match Convert's real API contract.** Without credentials, emails are saved to `.data/outbox` and can be previewed in the browser.
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
- Card pages are `noindex` and unlisted (random IDs), and the recipient's email address is never stored.
