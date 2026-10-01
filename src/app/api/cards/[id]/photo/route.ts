import { getCard } from "@/lib/store";

export const runtime = "nodejs";

/** The card's processed photo as an image, so feeds don't ship base64 blobs. */
export async function GET(_req: Request, ctx: RouteContext<"/api/cards/[id]/photo">) {
  const { id } = await ctx.params;
  const card = await getCard(id);
  const match = card ? /^data:(image\/[a-z]+);base64,(.+)$/.exec(card.photo) : null;
  if (!match) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(match[2], "base64"), {
    headers: { "Content-Type": match[1], "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
