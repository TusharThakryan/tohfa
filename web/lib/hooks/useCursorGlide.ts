"use client";

/**
 * Shared cursor-glide primitive: tracks the pointer inside an element as a
 * normalized (-1..1) position, spring-smoothed. Consumers derive their own
 * transforms from the returned motion values - the hero tilts its bouquet
 * illustration with it, the Living Bouquet drives its 3D tilt.
 */
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

export interface CursorGlide {
  /** spring-smoothed normalized x/y in [-1, 1] */
  smx: MotionValue<number>;
  smy: MotionValue<number>;
  /** raw normalized x/y (set instantly; read for non-spring uses) */
  mx: MotionValue<number>;
  my: MotionValue<number>;
  /** feed a pointer event relative to `el` */
  track: (clientX: number, clientY: number, el: HTMLElement | null) => void;
  /** ease back to rest */
  reset: () => void;
}

export function useCursorGlide(stiffness = 55, damping = 17): CursorGlide {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness, damping });
  const smy = useSpring(my, { stiffness, damping });

  const track = (clientX: number, clientY: number, el: HTMLElement | null) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(Math.max(-1, Math.min(1, ((clientX - r.left) / r.width) * 2 - 1)));
    my.set(Math.max(-1, Math.min(1, ((clientY - r.top) / r.height) * 2 - 1)));
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return { smx, smy, mx, my, track, reset };
}
