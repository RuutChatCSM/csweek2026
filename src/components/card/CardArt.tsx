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
 */
import type { CSSProperties } from "react";
import { getTheme, type Theme } from "@/lib/themes";
import { CS_WEEK, type CardData } from "@/lib/types";

export const CARD_W = 1080;
export const CARD_H = 1350;

export type CardFonts = { display: string; serif: string; body: string };

/** Font family names registered with Satori (see lib/og-fonts.ts) */
export const OG_FONTS: CardFonts = {
  display: "Bricolage",
  serif: "Instrument Serif",
  body: "Figtree",
};

/** Font families exposed by next/font in the app layout */
export const DOM_FONTS: CardFonts = {
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

function nameSize(name: string, columnWidth: number, max: number) {
  const longestWord = Math.max(4, ...name.split(/\s+/).map((w) => w.length));
  // Bricolage 800 averages ~0.6em per glyph
  const byWord = Math.floor(columnWidth / (longestWord * 0.6));
  const byTotal = name.length > 22 ? max * 0.72 : name.length > 14 ? max * 0.86 : max;
  return Math.max(52, Math.min(max, byWord, byTotal));
}

function messageSize(message: string) {
  const n = message.length;
  if (n <= 70) return 66;
  if (n <= 120) return 56;
  if (n <= 170) return 50;
  return 44;
}

export function Photo({
  data,
  theme,
  size,
  fonts,
}: {
  data: CardData;
  theme: Theme;
  size: number;
  fonts: CardFonts;
}) {
  if (data.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={data.photo}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "cover", borderRadius: 30 }}
      />
    );
  }
  return (
    <div
      style={flex({
        width: size,
        height: size,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(140deg, ${theme.duo[0]}, ${theme.duo[1]})`,
        color: "#FFFFFF",
        fontFamily: fonts.display,
        fontWeight: 800,
        fontSize: size * 0.38,
        letterSpacing: -6,
      })}
    >
      {initials(data.name)}
    </div>
  );
}

/** "The Extra Mile" road sign. `size` is the side of the (rotated) square. */
export function RoadSign({ theme, size, fonts }: { theme: Theme; size: number; fonts: CardFonts }) {
  const box = Math.round(size * 1.42);
  const offset = Math.round((box - size) / 2);
  return (
    <div style={flex({ position: "relative", width: box, height: box })}>
      <div
        style={flex({
          position: "absolute",
          left: offset,
          top: offset,
          width: size,
          height: size,
          backgroundColor: theme.sign,
          borderRadius: size * 0.14,
          transform: "rotate(45deg)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <div
          style={{
            display: "flex",
            width: size - size * 0.12,
            height: size - size * 0.12,
            borderRadius: size * 0.1,
            border: `${Math.max(3, Math.round(size * 0.025))}px solid ${theme.signInk}`,
          }}
        />
      </div>
      <div
        style={flex({
          position: "absolute",
          left: 0,
          top: 0,
          width: box,
          height: box,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: theme.signInk,
          fontFamily: fonts.display,
          fontWeight: 800,
          lineHeight: 0.92,
          textTransform: "uppercase",
        })}
      >
        <div style={{ display: "flex", fontSize: size * 0.13, letterSpacing: size * 0.012 }}>The</div>
        <div style={{ display: "flex", fontSize: size * 0.26, letterSpacing: -1 }}>Extra</div>
        <div style={{ display: "flex", fontSize: size * 0.26, letterSpacing: -1 }}>Mile</div>
      </div>
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

export function CardArt({ data, fonts = OG_FONTS }: { data: CardData; fonts?: CardFonts }) {
  const theme = getTheme(data.theme);
  const self = data.mode === "self";
  const pad = 64;
  const inner = CARD_W - pad * 2;
  const photoSize = 452;
  const columnWidth = inner - photoSize - 56;

  const name = data.name.trim() || (self ? "Your name" : "Their name");
  const role = data.role.trim() || "Role";
  const org = data.org.trim() || "Organisation";
  const message =
    data.message.trim() ||
    (self
      ? "Something you're proud of this year…"
      : "Your message of thanks will appear here…");
  const placeholder = (filled: string) => (filled.trim() ? 1 : 0.38);

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
      {/* Top bar */}
      <div style={flex({ justifyContent: "space-between", alignItems: "center", height: 56 })}>
        <div
          style={flex({
            alignItems: "center",
            gap: 14,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: "uppercase",
          })}
        >
          <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, backgroundColor: theme.accent }} />
          Customer Service Week {CS_WEEK.year}
        </div>
        <div
          style={flex({
            alignItems: "center",
            height: 52,
            padding: "0 22px",
            borderRadius: 26,
            border: `3px solid ${theme.ink}`,
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          })}
        >
          Oct 5–9
        </div>
      </div>

      {/* Photo + name */}
      <div style={flex({ marginTop: 44, height: 520, gap: 56 })}>
        <div style={flex({ position: "relative", width: photoSize, height: photoSize + 20 })}>
          <div
            style={flex({
              padding: 12,
              borderRadius: 42,
              backgroundColor: "#FFFFFF",
              transform: "rotate(-3deg)",
              boxShadow: "0 24px 50px rgba(0,0,0,0.22)",
            })}
          >
            <Photo data={data} theme={theme} size={photoSize - 24} fonts={fonts} />
          </div>
          <div style={flex({ position: "absolute", left: -50, bottom: -104 })}>
            <RoadSign theme={theme} size={176} fonts={fonts} />
          </div>
        </div>

        <div style={flex({ flexDirection: "column", width: columnWidth, paddingTop: 6 })}>
          <div
            style={flex({
              fontFamily: fonts.serif,
              fontStyle: "italic",
              fontSize: 58,
              lineHeight: 1,
              color: theme.muted,
            })}
          >
            {self ? "Proudly celebrating" : "Celebrating"}
          </div>
          <div
            style={flex({
              marginTop: 14,
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: nameSize(name, columnWidth, 108),
              lineHeight: 0.94,
              letterSpacing: -3,
              opacity: placeholder(data.name),
              flexWrap: "wrap",
            })}
          >
            {name}
          </div>
          <div style={flex({ marginTop: 28, flexDirection: "column", gap: 6 })}>
            <div
              style={flex({
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1.15,
                opacity: placeholder(data.role),
              })}
            >
              {role}
            </div>
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
          marginTop: 56,
          flexGrow: 1,
          borderRadius: 40,
          backgroundColor: theme.panel,
          color: theme.panelInk,
          padding: "34px 52px 44px",
          flexDirection: "column",
        })}
      >
        <div
          style={flex({
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 140,
            lineHeight: 1,
            height: 76,
            color: theme.quote,
          })}
        >
          “
        </div>
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
      <div style={flex({ marginTop: 34, flexDirection: "column", gap: 26 })}>
        <RoadDashes color={theme.ink} width={inner} count={22} />
        <div style={flex({ justifyContent: "space-between", alignItems: "center", fontSize: 26 })}>
          <div style={flex({ fontWeight: 700 })}>{signoff}</div>
          <div style={flex({ alignItems: "center", gap: 10, fontWeight: 600, color: theme.muted })}>
            <span style={{ fontWeight: 800, color: theme.ink }}>Ruut</span>
            <span>×</span>
            <span style={{ fontWeight: 800, color: theme.ink }}>Customer Support Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
}
