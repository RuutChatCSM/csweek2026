import { NextResponse } from "next/server";
import { hideCard } from "@/lib/store";

export const runtime = "nodejs";

/**
 * Moderation: hide a card from the wall and its public page.
 *   curl -X DELETE -H "x-admin-token: $ADMIN_TOKEN" https://<site>/api/cards/<id>
 */
export async function DELETE(req: Request, ctx: RouteContext<"/api/cards/[id]">) {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers.get("x-admin-token") !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  return (await hideCard(id)) ? NextResponse.json({ hidden: id }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
