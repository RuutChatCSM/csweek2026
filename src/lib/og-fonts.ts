import { readFile } from "node:fs/promises";
import { join } from "node:path";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style: "normal" | "italic";
};

const FONT_DIR = join(process.cwd(), "src/assets/fonts");

const SPECS: { file: string; name: string; weight: OgFont["weight"]; style: OgFont["style"] }[] = [
  { file: "bricolage-grotesque-latin-700-normal.woff", name: "Bricolage", weight: 700, style: "normal" },
  { file: "bricolage-grotesque-latin-800-normal.woff", name: "Bricolage", weight: 800, style: "normal" },
  { file: "instrument-serif-latin-400-italic.woff", name: "Instrument Serif", weight: 400, style: "italic" },
  { file: "instrument-serif-latin-400-normal.woff", name: "Instrument Serif", weight: 400, style: "normal" },
  { file: "figtree-latin-500-normal.woff", name: "Figtree", weight: 500, style: "normal" },
  { file: "figtree-latin-600-normal.woff", name: "Figtree", weight: 600, style: "normal" },
  { file: "figtree-latin-700-normal.woff", name: "Figtree", weight: 700, style: "normal" },
];
let cache: Promise<OgFont[]> | null = null;

export function loadOgFonts() {
  cache ??= Promise.all(
    SPECS.map(async ({ file, ...rest }) => {
      const buf = await readFile(join(FONT_DIR, file));
      return { ...rest, data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer };
    }),
  );
  return cache;
}
