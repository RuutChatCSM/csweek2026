import { ImageResponse } from "next/og";
import { OG_H, OG_W, OgArt } from "@/components/card/Formats";
import { loadLogoDataUrl, loadOgFonts } from "@/lib/og-fonts";
import { getCard } from "@/lib/store";

export const runtime = "nodejs";

/** 1200×630 link-preview image for LinkedIn, X, WhatsApp and Slack unfurls. */
export async function GET(_req: Request, ctx: RouteContext<"/api/cards/[id]/og">) {
  const { id } = await ctx.params;
  const card = await getCard(id);
  if (!card) return new Response("Not found", { status: 404 });

  return new ImageResponse(<OgArt data={card} logoSrc={await loadLogoDataUrl()} />, {
    width: OG_W,
    height: OG_H,
    fonts: await loadOgFonts(),
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
