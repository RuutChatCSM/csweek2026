/**
 * Card colourways. Palette is drawn from the official CS Week 2026 "The Extra Mile"
 * highway-shield logo: highway blue, stop red, road yellow, cream and asphalt.
 * (Theme ids are kept stable so previously created cards still render.)
 */
export type ThemeId = "ruut" | "signal" | "coral" | "lime" | "night";

export type Theme = {
  id: ThemeId;
  label: string;
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  /** Panel behind the message */
  panel: string;
  panelInk: string;
  /** Oversized quote mark on the message panel */
  quote: string;
  /** Duotone mapping for the photo: shadows -> highlights */
  duo: [string, string];
};

export const PALETTE = {
  highway: "#1D3F9E",
  highwayDeep: "#0B2A7A",
  highwayGlow: "#7FB0FF",
  stop: "#E23B2E",
  road: "#F6C343",
  cream: "#F6EBD3",
  paper: "#F4F1E9",
  asphalt: "#141414",
} as const;

export const THEMES: Record<ThemeId, Theme> = {
  ruut: {
    id: "ruut",
    label: "Highway",
    bg: PALETTE.highway,
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.74)",
    accent: PALETTE.road,
    panel: PALETTE.cream,
    panelInk: PALETTE.asphalt,
    quote: PALETTE.stop,
    duo: ["#0B1E55", "#A9C6FF"],
  },
  signal: {
    id: "signal",
    label: "Road Yellow",
    bg: PALETTE.road,
    ink: PALETTE.asphalt,
    muted: "rgba(20,20,20,0.64)",
    accent: PALETTE.stop,
    panel: PALETTE.asphalt,
    panelInk: "#FFF6E0",
    quote: PALETTE.road,
    duo: ["#141414", "#FFE7A3"],
  },
  coral: {
    id: "coral",
    label: "Stop Red",
    bg: PALETTE.stop,
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.78)",
    accent: PALETTE.road,
    panel: "#FFFFFF",
    panelInk: PALETTE.asphalt,
    quote: PALETTE.stop,
    duo: ["#4A0B06", "#FFC9C2"],
  },
  lime: {
    id: "lime",
    label: "Cream",
    bg: PALETTE.cream,
    ink: PALETTE.asphalt,
    muted: "rgba(20,20,20,0.6)",
    accent: PALETTE.highway,
    panel: PALETTE.highway,
    panelInk: "#FFFFFF",
    quote: PALETTE.road,
    duo: ["#0B1E55", "#F6EBD3"],
  },
  night: {
    id: "night",
    label: "Asphalt",
    bg: "#151515",
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.62)",
    accent: PALETTE.road,
    panel: PALETTE.road,
    panelInk: PALETTE.asphalt,
    quote: PALETTE.asphalt,
    duo: ["#151515", "#FFD866"],
  },
};

export const THEME_LIST = [THEMES.ruut, THEMES.coral, THEMES.signal, THEMES.lime, THEMES.night];

export function getTheme(id: string | undefined | null): Theme {
  return (id && THEMES[id as ThemeId]) || THEMES.ruut;
}
