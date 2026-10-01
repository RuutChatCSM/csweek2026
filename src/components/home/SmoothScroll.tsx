"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Lenis smooth scrolling + Motion config. Both step aside when the OS asks for reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      {reduce ? children : (
        <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, anchors: true }}>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
