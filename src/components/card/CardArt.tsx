/**
 * The CS Week card artwork.
 *
 * This component is rendered in two places:
 *  - in the browser, as the live preview (scaled down with CSS)
 *  - on the server, through next/og (Satori) to produce the shareable PNG
 *
 * Satori only supports a subset of CSS, so keep to: inline styles, flexbox,
 * absolute positioning, transforms, borders, gradients. Every element with more
 * than one child must be `display: flex`.
 *
 * Every card carries the official, unaltered CS Week 2026 logo (see csweek.com logo terms).
 */
import type { CSSProperties } from "react";
import { getTheme, type Theme } from "@/lib/themes";
import { CS_WEEK, type CardData } from "@/lib/types";

export const CARD_W = 1080;
export const CARD_H = 1350;

/** Official logo aspect ratio (300×328) */
export const LOGO_RATIO = 328 / 300;

export type CardFonts = { poster: string; display: string; serif: string; body: string };

/** Font family names registered with Satori (see lib/og-fonts.ts) */
export const OG_FONTS: CardFonts = {
  poster: "Anton",
  display: "Bricolage",
  serif: "Instrument Serif",
  body: "Figtree",
};

/** Font families exposed by next/font in the app layout */
export const DOM_FONTS: CardFonts = {
  poster: "var(--font-poster)",
  display: "var(--font-display)",
  serif: "var(--font-serif)",
  body: "var(--font-body)",
};

const flex = (s: CSSProperties): CSSProperties => ({ display: "flex", ...s });

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "★";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function posterSize(text: string, width: number, max: number, min = 56) {
  const longestWord = Math.max(3, ...text.split(/\s+/).map((w) => w.length));
  // Anton uppercase averages ~0.5em per glyph
  return Math.max(min, Math.min(max, Math.floor(width / (longestWord * 0.5))));
}

function messageSize(message: string) {
  const n = message.length;
  if (n <= 70) return 64;
  if (n <= 120) return 54;
  if (n <= 170) return 48;
  return 42;
}

export function Photo({
  data,
  theme,
  width,
  height,
  fonts,
  radius = 26,
}: {
  data: CardData;
  theme: Theme;
  width: number;
  height: number;
  fonts: CardFonts;
  radius?: number;
}) {
  if (data.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={data.photo}
        alt=""
        width={width}
        height={height}
        style={{ width, height, objectFit: "cover", borderRadius: radius }}
      />
    );
  }
  return (
    <div
      style={flex({
        width,
        height,
        borderRadius: radius,
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(140deg, ${theme.duo[0]}, ${theme.duo[1]})`,
        color: "#FFFFFF",
        fontFamily: fonts.poster,
        fontSize: Math.min(width, height) * 0.42,
      })}
    >
      {initials(data.name)}
    </div>
  );
}

function RoadDashes({ color, width, count = 16 }: { color: string; width: number; count?: number }) {
  const dash = width / (count * 2 - 1);
  return (
    <div style={flex({ width, height: 8, justifyContent: "space-between" })}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: "flex", width: dash, height: 8, borderRadius: 4, backgroundColor: color }} />
      ))}
    </div>
  );
}

export function CardArt({
  data,
  fonts = OG_FONTS,
  logoSrc = CS_WEEK.logo,
  ruutSrc = "/brand/ruut-logo.png",
}: {
  data: CardData;
  fonts?: CardFonts;
  logoSrc?: string;
  ruutSrc?: string;
}) {
  const theme = getTheme(data.theme);
  const self = data.mode === "self";
  const pad = 64;
  const inner = CARD_W - pad * 2;
  const photoW = 432;
  const photoH = 468;
  const columnWidth = inner - photoW - 52;
  const logoW = 196;
  const logoH = Math.round(logoW * LOGO_RATIO);

  const name = data.name.trim() || (self ? "Your name" : "Their name");
  const role = data.role.trim() || "Role / job title";
  const org = data.org.trim() || "Organisation";
  const message =
    data.message.trim() ||
    (self ? "Something you're proud of this year…" : "Your message of thanks will appear here…");
  const placeholder = (filled: string) => (filled.trim() ? 1 : 0.4);

  const signoff = self
    ? "Celebrating myself"
    : data.senderName.trim()
      ? `With gratitude, ${data.senderName.trim()}`
      : "With gratitude";

  return (
    <div
      style={flex({
        width: CARD_W,
        height: CARD_H,
        flexDirection: "column",
        padding: pad,
        backgroundColor: theme.bg,
        color: theme.ink,
        fontFamily: fonts.body,
        position: "relative",
        overflow: "hidden",
      })}
    >
      {/* Header: kicker + official logo */}
      <div style={flex({ justifyContent: "space-between", alignItems: "flex-start", height: 226 })}>
        <div style={flex({ flexDirection: "column", paddingTop: 8 })}>
          <div
            style={flex({
              fontFamily: fonts.poster,
              fontSize: 138,
              lineHeight: 0.9,
              textTransform: "uppercase",
              color: theme.accent,
            })}
          >
            Celebrating
          </div>
          <div
            style={flex({
              marginTop: 20,
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: theme.muted,
            })}
          >
            {self ? "Me · " : ""}Customer Service Week · {CS_WEEK.dates}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Customer Service Week 2026 — The Extra Mile"
          width={logoW}
          height={logoH}
          style={{ width: logoW, height: logoH }}
        />
      </div>

      {/* Photo + name */}
      <div style={flex({ marginTop: 26, height: 492, gap: 52 })}>
        <div
          style={flex({
            padding: 12,
            borderRadius: 38,
            backgroundColor: "#FFFFFF",
            transform: "rotate(-2.5deg)",
            boxShadow: "0 26px 50px rgba(0,0,0,0.28)",
            alignSelf: "flex-start",
          })}
        >
          <Photo data={data} theme={theme} width={photoW - 24} height={photoH - 24} fonts={fonts} />
        </div>

        <div style={flex({ flexDirection: "column", width: columnWidth, justifyContent: "flex-end", paddingBottom: 30 })}>
          <div
            style={flex({
              fontFamily: fonts.poster,
              fontSize: posterSize(name, columnWidth, 132),
              lineHeight: 0.96,
              textTransform: "uppercase",
              opacity: placeholder(data.name),
              flexWrap: "wrap",
            })}
          >
            {name}
          </div>
          <div style={flex({ marginTop: 24, flexDirection: "column", gap: 6 })}>
            <div style={flex({ fontSize: 33, fontWeight: 700, lineHeight: 1.15, opacity: placeholder(data.role) })}>{role}</div>
            <div
              style={flex({
                fontSize: 30,
                fontWeight: 500,
                lineHeight: 1.15,
                color: theme.muted,
                opacity: placeholder(data.org),
              })}
            >
              {org}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div
        style={flex({
          marginTop: 40,
          flexGrow: 1,
          borderRadius: 36,
          backgroundColor: theme.panel,
          color: theme.panelInk,
          padding: "30px 50px 40px",
          flexDirection: "column",
        })}
      >
        <div style={flex({ fontFamily: fonts.poster, fontSize: 130, lineHeight: 1, height: 70, color: theme.quote })}>“</div>
        <div
          style={flex({
            flexGrow: 1,
            alignItems: "center",
            fontFamily: fonts.serif,
            fontStyle: "italic",
            fontSize: messageSize(message),
            lineHeight: 1.12,
            opacity: data.message.trim() ? 1 : 0.5,
          })}
        >
          {message}
        </div>
      </div>

      {/* Footer */}
      <div style={flex({ marginTop: 30, flexDirection: "column", gap: 24 })}>
        <RoadDashes color={theme.accent} width={inner} count={22} />
        <div style={flex({ justifyContent: "space-between", alignItems: "center", fontSize: 26 })}>
          <div style={flex({ fontWeight: 700 })}>{signoff}</div>
          <div style={flex({ alignItems: "center", gap: 10, fontWeight: 600, color: theme.muted })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ruutSrc} alt="" width={34} height={35} style={{ width: 34, height: 35 }} />
            <span style={{ fontWeight: 800, color: theme.ink }}>Ruut</span>
            <span>×</span>
            <span style={{ fontWeight: 800, color: theme.ink }}>Customer Support Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
}
