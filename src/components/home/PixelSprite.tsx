/** Tiny pixel-art stickers (after the MoMoney reference), drawn as crisp SVG rects. */

const SPRITES = {
  headset: [
    "....XXXXXX....",
    "..XX......XX..",
    ".X..........X.",
    "X............X",
    "X............X",
    "XXX........XXX",
    "XXXX......XXXX",
    "XXXX......XXXX",
    "XXXX......XXXX",
    ".XX........XX.",
    "...........X..",
    "..........X...",
    "......XXXX....",
    "......XXX.....",
  ],
  heart: [
    ".XX...XX.",
    "XXXX.XXXX",
    "XXXXXXXXX",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..XXXXX..",
    "...XXX...",
    "....X....",
  ],
  sparkle: ["...X...", "...X...", "..XXX..", "XXXXXXX", "..XXX..", "...X...", "...X..."],
  chat: [
    "XXXXXXXXXXX",
    "X.........X",
    "X.X.X.X.X.X",
    "X.........X",
    "XXXXXXXXXXX",
    "..XX.......",
    ".X.........",
  ],
} as const;

export type SpriteName = keyof typeof SPRITES;

export function PixelSprite({
  name,
  color,
  shadow = "#141414",
  outline = "#FFFFFF",
  className = "",
}: {
  name: SpriteName;
  color: string;
  shadow?: string;
  outline?: string;
  className?: string;
}) {
  const rows = SPRITES[name];
  const cells: [number, number][] = [];
  rows.forEach((row, y) => [...row].forEach((c, x) => c === "X" && cells.push([x, y])));
  const w = rows[0].length + 3;
  const h = rows.length + 3;
  const filled = new Set(cells.map(([x, y]) => `${x},${y}`));
  // Sticker outline: every empty cell touching a filled one
  const ring: [number, number][] = [];
  for (let y = -1; y <= rows.length; y++)
    for (let x = -1; x <= rows[0].length; x++) {
      if (filled.has(`${x},${y}`)) continue;
      const near = [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => filled.has(`${x + dx},${y + dy}`)));
      if (near) ring.push([x, y]);
    }
  return (
    <svg viewBox={`-1 -1 ${w} ${h}`} className={className} shapeRendering="crispEdges" aria-hidden>
      {ring.map(([x, y]) => (
        <rect key={`s${x},${y}`} x={x + 1} y={y + 1} width="1" height="1" fill={shadow} />
      ))}
      {ring.map(([x, y]) => (
        <rect key={`o${x},${y}`} x={x} y={y} width="1" height="1" fill={outline} />
      ))}
      {cells.map(([x, y]) => (
        <rect key={`f${x},${y}`} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  );
}
