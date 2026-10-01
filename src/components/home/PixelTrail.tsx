"use client";

import { useEffect, useRef } from "react";

/**
 * Pixel blocks that light up under the cursor and fade out, snapped to a grid
 * (the MoMoney cursor trail). Canvas-based so it stays cheap.
 */
export function PixelTrail({ cell = 56, color = "rgba(125,180,255,0.22)", life = 900 }: { cell?: number; color?: string; life?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ctx = canvas.getContext("2d")!;
    const cells = new Map<string, number>();
    let raf = 0;
    let running = false;

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const [key, t] of cells) {
        const age = now - t;
        if (age > life) {
          cells.delete(key);
          continue;
        }
        const [cx, cy] = key.split(",").map(Number);
        ctx.globalAlpha = 1 - age / life;
        ctx.fillStyle = color;
        ctx.fillRect(cx * cell, cy * cell, cell, cell);
      }
      ctx.globalAlpha = 1;
      if (cells.size) raf = requestAnimationFrame(draw);
      else running = false;
    };

    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const cx = Math.floor((e.clientX - r.left) / cell);
      const cy = Math.floor((e.clientY - r.top) / cell);
      cells.set(`${cx},${cy}`, performance.now());
      // A neighbour or two for the chunky, staggered look
      if (Math.random() > 0.55) cells.set(`${cx + (Math.random() > 0.5 ? 1 : -1)},${cy + 1}`, performance.now() - 200);
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    host.addEventListener("pointermove", move);
    window.addEventListener("resize", resize);
    return () => {
      host.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [cell, color, life]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />;
}
