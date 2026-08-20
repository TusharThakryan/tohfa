"use client";

/**
 * Living Bouquet - petal engine.
 *
 * Three sources of petals, all capped for performance:
 *  - ambient: one petal drifts loose every few seconds
 *  - hover:   brushing a flower releases a couple of petals (throttled)
 *  - click:   tapping a flower produces a small radial burst
 * Petals are absolutely-positioned SVG scraps animated purely in CSS
 * (transform/opacity) and removed on animationend.
 */
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

export interface PetalApi {
  release: (xPct: number, yPct: number, kind: "hover" | "click", color?: string) => void;
}

interface Petal {
  id: number;
  xPct: number;
  yPct: number;
  color: string;
  mode: "fall" | "burst";
  vars: Record<string, string>;
  size: number;
}

const MAX_PETALS = 24;
const AMBIENT_EVERY_MS = 2600;
const HOVER_THROTTLE_MS = 900;

let nextId = 1;

export function PetalEngine({
  apiRef,
  palette,
  active,
}: {
  apiRef: MutableRefObject<PetalApi | null>;
  palette: string[];
  active: boolean;
}) {
  const [petals, setPetals] = useState<Petal[]>([]);
  const hostRef = useRef<HTMLDivElement>(null);
  const lastHover = useRef(0);

  const colors = palette.length ? palette : ["#E8A0BF", "#C996CC", "#F7E2E2"];

  const spawn = useCallback(
    (list: Petal[]) =>
      setPetals((cur) => (cur.length >= MAX_PETALS ? cur : [...cur, ...list].slice(0, MAX_PETALS + 6))),
    []
  );

  const makeFall = useCallback(
    (xPct: number, yPct: number, color: string): Petal => {
      const h = hostRef.current?.clientHeight ?? 420;
      const travel = h * (1.02 - yPct / 100);
      return {
        id: nextId++,
        xPct,
        yPct,
        color,
        mode: "fall",
        size: 8 + Math.random() * 6,
        vars: {
          "--dx": `${(Math.random() - 0.5) * 70}px`,
          "--dy": `${travel}px`,
          "--dr": `${140 + Math.random() * 220}deg`,
          "--po": `${0.65 + Math.random() * 0.3}`,
          animationDuration: `${3.2 + Math.random() * 2.2}s`,
        },
      };
    },
    []
  );

  // Public API: hover releases and click bursts from LivingScene
  useEffect(() => {
    apiRef.current = {
      release: (xPct, yPct, kind, color) => {
        if (!active) return;
        const c = color ?? colors[Math.floor(Math.random() * colors.length)];
        if (kind === "hover") {
          const now = performance.now();
          if (now - lastHover.current < HOVER_THROTTLE_MS) return;
          lastHover.current = now;
          spawn([makeFall(xPct, yPct, c), makeFall(xPct + 2, yPct + 1, c)]);
        } else {
          spawn(
            Array.from({ length: 6 }, (_, i): Petal => {
              const a = (i / 6) * Math.PI * 2 + Math.random() * 0.6;
              const d = 26 + Math.random() * 34;
              return {
                id: nextId++,
                xPct,
                yPct,
                color: c,
                mode: "burst",
                size: 7 + Math.random() * 4,
                vars: {
                  "--bx": `${Math.cos(a) * d}px`,
                  "--by": `${Math.sin(a) * d - 14}px`,
                  "--br": `${(Math.random() - 0.5) * 300}deg`,
                  animationDuration: `${0.7 + Math.random() * 0.3}s`,
                },
              };
            })
          );
        }
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [active, apiRef, colors, makeFall, spawn]);

  // Ambient drips - one loose petal every few seconds
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      spawn([
        makeFall(
          18 + Math.random() * 64,
          12 + Math.random() * 26,
          colors[Math.floor(Math.random() * colors.length)]
        ),
      ]);
    }, AMBIENT_EVERY_MS);
    return () => clearInterval(timer);
  }, [active, colors, makeFall, spawn]);

  return (
    <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 24 24"
          className="lv-petal absolute"
          style={{
            left: `${p.xPct}%`,
            top: `${p.yPct}%`,
            width: p.size,
            height: p.size,
            animationName: p.mode === "fall" ? "lv-petal-fall" : "lv-petal-burst",
            animationTimingFunction: p.mode === "fall" ? "ease-in" : "ease-out",
            animationFillMode: "forwards",
            ...(p.vars as React.CSSProperties),
          }}
          onAnimationEnd={() => setPetals((cur) => cur.filter((x) => x.id !== p.id))}
        >
          <path d="M12 2 C18 6 20 13 12 22 C4 13 6 6 12 2Z" fill={p.color} />
        </svg>
      ))}
    </div>
  );
}
