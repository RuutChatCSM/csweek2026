"use client";

import { useEffect, useRef } from "react";

/**
 * Dot-grid background with a coloured "headlight" that follows the pointer —
 * a nod to the road theme. Falls back to a static grid on touch / reduced motion.
 */
export function Spotlight({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    const layer = ref.current;
    if (!el || !layer) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        layer.style.setProperty("--x", `${e.clientX - r.left}px`);
        layer.style.setProperty("--y", `${e.clientY - r.top}px`);
        layer.style.opacity = "1";
      });
    };
    const leave = () => (layer.style.opacity = "0");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <div className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]" />
      <div
        ref={ref}
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0059FF 1.6px, transparent 1.8px), radial-gradient(circle, #FFC629 2px, transparent 2.2px)",
          backgroundSize: "22px 22px, 22px 22px",
          backgroundPosition: "0 0, 11px 11px",
          WebkitMaskImage: "radial-gradient(260px circle at var(--x) var(--y), black, transparent 70%)",
          maskImage: "radial-gradient(260px circle at var(--x) var(--y), black, transparent 70%)",
        }}
      />
    </div>
  );
}
