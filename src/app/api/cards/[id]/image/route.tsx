import { ImageResponse } from "next/og";
import { CARD_H, CARD_W, CardArt } from "@/components/card/CardArt";
import { STORY_H, STORY_W, StoryArt } from "@/components/card/Formats";
import { loadOgFonts } from "@/lib/og-fonts";
import { siteUrl } from "@/lib/site";
import { getCard } from "@/lib/store";

export const runtime = "nodejs";

/** The shareable card PNG. `?format=story` for 9:16, `?download=1` to save as a file. */
export async function GET(req: Request, ctx: RouteContext<"/api/cards/[id]/image">) {
  const { id } = await ctx.params;
  const card = await getCard(id);
  if (!card) return new Response("Not found", { status: 404 });

  const params = new URL(req.url).searchParams;
  const story = params.get("format") === "story";
  const download = params.has("download");
  const slug = card.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "card";
  const filename = `cs-week-2026-${slug}${story ? "-story" : ""}.png`;

  const host = new URL(await siteUrl()).host;

  const fonts = await loadOgFonts();
  let element = <CardArt data={card} />;
  if (story) {
    const png = await new ImageResponse(element, { width: CARD_W, height: CARD_H, fonts }).arrayBuffer();
    const cardPng = `data:image/png;base64,${Buffer.from(png).toString("base64")}`;
    element = <StoryArt data={card} cardPng={cardPng} siteHost={host} />;
  }

  return new ImageResponse(element, {
    width: story ? STORY_W : CARD_W,
    height: story ? STORY_H : CARD_H,
    fonts,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(download ? { "Content-Disposition": `attachment; filename="${filename}"` } : {}),
    },
  });
}
