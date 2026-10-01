/** Alternate compositions of the card for Stories (9:16) and link previews (1.91:1). Satori-safe. */
import { getTheme } from "@/lib/themes";
import { CS_WEEK, type CardData } from "@/lib/types";
import { CARD_H, CARD_W, LOGO_RATIO, OG_FONTS, Photo } from "./CardArt";

export const STORY_W = 1080;
export const STORY_H = 1920;
export const OG_W = 1200;
export const OG_H = 630;

/** `cardPng` is the already-rendered card as a data URL (Satori clips scaled subtrees, so we embed an image). */
export function StoryArt({ cardPng, siteHost }: { data: CardData; cardPng: string; siteHost: string }) {
  const w = Math.round(CARD_W * 0.86);
  const h = Math.round(CARD_H * 0.86);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: STORY_W,
        height: STORY_H,
        backgroundColor: "#0B2A7A",
        color: "#FFFFFF",
        fontFamily: OG_FONTS.body,
        paddingTop: 110,
      }}
    >
      <div style={{ display: "flex", fontFamily: OG_FONTS.poster, fontSize: 92, lineHeight: 0.9, textTransform: "uppercase", color: "#7DB4FF" }}>
        Happy CS Week
      </div>
      <div style={{ display: "flex", marginTop: 10, fontSize: 30, fontWeight: 700, letterSpacing: 4, color: "#F6C343", textTransform: "uppercase" }}>
        {CS_WEEK.theme} · {CS_WEEK.dates}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cardPng}
        alt=""
        width={w}
        height={h}
        style={{
          marginTop: 70,
          width: w,
          height: h,
          borderRadius: 40,
        }}
      />
      <div style={{ display: "flex", marginTop: 80, fontSize: 34, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
        Celebrate someone at {siteHost}
      </div>
    </div>
  );
}

export function OgArt({ data, logoSrc }: { data: CardData; logoSrc: string }) {
  const theme = getTheme(data.theme);
  const name = data.name.trim() || "Someone special";
  const sub = [data.role.trim(), data.org.trim()].filter(Boolean).join(" · ");
  return (
    <div
      style={{
        display: "flex",
        width: OG_W,
        height: OG_H,
        backgroundColor: theme.bg,
        color: theme.ink,
        fontFamily: OG_FONTS.body,
        padding: 56,
        gap: 56,
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          padding: 10,
          backgroundColor: "#FFFFFF",
          borderRadius: 34,
          transform: "rotate(-3deg)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.22)",
        }}
      >
        <Photo data={data} theme={theme} width={420} height={460} fonts={OG_FONTS} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", fontFamily: OG_FONTS.serif, fontStyle: "italic", fontSize: 48, color: theme.muted }}>
          {data.mode === "self" ? "Proudly celebrating" : "Celebrating"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontFamily: OG_FONTS.poster,
            fontSize: name.length > 16 ? 82 : 104,
            lineHeight: 0.92,
            textTransform: "uppercase",
            paddingRight: 120,
          }}
        >
          {name}
        </div>
        {sub ? (
          <div style={{ display: "flex", marginTop: 18, fontSize: 28, fontWeight: 600, color: theme.muted }}>{sub}</div>
        ) : null}
        <div style={{ display: "flex", marginTop: 40, fontSize: 22, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" }}>
          CS Week {CS_WEEK.year} · {CS_WEEK.theme}
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt=""
        width={130}
        height={Math.round(130 * LOGO_RATIO)}
        style={{ position: "absolute", right: 44, top: 40, width: 130, height: Math.round(130 * LOGO_RATIO) }}
      />
    </div>
  );
}
