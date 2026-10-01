"use client";

import { useEffect, useRef, useState } from "react";
import type { CardData } from "@/lib/types";
import { CARD_H, CARD_W, CardArt, DOM_FONTS } from "./CardArt";

/** Renders the card artwork at full resolution and scales it to fit its container width. */
export function CardPreview({ data, className = "" }: { data: CardData; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / CARD_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-[clamp(14px,3.6%,40px)] ${className}`}
      style={{ aspectRatio: `${CARD_W} / ${CARD_H}` }}
      role="img"
      aria-label={`Card preview for ${data.name || "your celebration"}`}
    >
      {scale > 0 && (
        <div
          aria-hidden
          style={{ width: CARD_W, height: CARD_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <CardArt data={data} fonts={DOM_FONTS} />
        </div>
      )}
    </div>
  );
}
