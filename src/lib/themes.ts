export type ThemeId = "signal" | "ruut" | "lime" | "night" | "coral";

export type Theme = {
  id: ThemeId;
  label: string;
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  /** Road-sign colours */
  sign: string;
  signInk: string;
  /** Panel behind the message */
  panel: string;
  panelInk: string;
  /** Oversized quote mark on the message panel */
  quote: string;
  /** Duotone mapping for the photo: shadows -> highlights */
  duo: [string, string];
};

export const THEMES: Record<ThemeId, Theme> = {
  signal: {
    id: "signal",
    label: "Signal",
    bg: "#FFC629",
    ink: "#16161A",
    muted: "rgba(22,22,26,0.62)",
    accent: "#0059FF",
    sign: "#16161A",
    signInk: "#FFC629",
    panel: "#16161A",
    panelInk: "#FFF8E6",
    quote: "#FFC629",
    duo: ["#16161A", "#FFE58A"],
  },
  ruut: {
    id: "ruut",
    label: "Ruut Blue",
    bg: "#0059FF",
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.72)",
    accent: "#CADB8A",
    sign: "#FFC629",
    signInk: "#16161A",
    panel: "#FFFFFF",
    panelInk: "#0B1A3D",
    quote: "#0059FF",
    duo: ["#0A1B4D", "#9CC2FF"],
  },
  lime: {
    id: "lime",
    label: "Lime",
    bg: "#CADB8A",
    ink: "#16161A",
    muted: "rgba(22,22,26,0.6)",
    accent: "#8E55D9",
    sign: "#FFC629",
    signInk: "#16161A",
    panel: "#8E55D9",
    panelInk: "#FFFFFF",
    quote: "#CADB8A",
    duo: ["#2B1650", "#E9F2C4"],
  },
  night: {
    id: "night",
    label: "Night Drive",
    bg: "#121316",
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.62)",
    accent: "#FFC629",
    sign: "#FFC629",
    signInk: "#16161A",
    panel: "#FFC629",
    panelInk: "#16161A",
    quote: "#16161A",
    duo: ["#121316", "#FFD866"],
  },
  coral: {
    id: "coral",
    label: "Coral",
    bg: "#FF6B4A",
    ink: "#16161A",
    muted: "rgba(22,22,26,0.62)",
    accent: "#FFFFFF",
    sign: "#FFC629",
    signInk: "#16161A",
    panel: "#FFF3EC",
    panelInk: "#16161A",
    quote: "#FF6B4A",
    duo: ["#3A0F06", "#FFD3C2"],
  },
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(id: string | undefined | null): Theme {
  return (id && THEMES[id as ThemeId]) || THEMES.signal;
}
