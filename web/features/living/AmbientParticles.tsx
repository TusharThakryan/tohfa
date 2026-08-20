"use client";

/**
 * Living Bouquet - ambient particles.
 *
 * A fixed, deterministic set of twelve slow motes: soft dust, warm pollen,
 * and tiny gold sparkles. Pure CSS loops (transform/opacity only), tuned
 * to be felt rather than noticed. Counts are intentionally small.
 */

interface Mote {
  left: number;
  top: number;
  size: number;
  delay: number;
  dur: number;
  kind: "dust" | "pollen" | "sparkle";
  drift: number;
  opacity: number;
}

const MOTES: Mote[] = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 83 + 11) % 94,
  top: 24 + ((i * 37) % 58),
  size: i % 4 === 3 ? 7 : 2.5 + (i % 3) * 1.5,
  delay: (i * 1.9) % 9,
  dur: 8 + (i % 5) * 2.4,
  kind: i % 4 === 3 ? "sparkle" : i % 4 === 2 ? "pollen" : "dust",
  drift: ((i % 5) - 2) * 6,
  opacity: 0.3 + ((i * 7) % 4) * 0.1,
}));

export function AmbientParticles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {MOTES.map((m, i) =>
        m.kind === "sparkle" ? (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className="lv-mote absolute"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              animationName: "lv-mote",
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
              "--mx": `${m.drift}px`,
              "--mo": `calc(${m.opacity + 0.25} * var(--lv-sparkle, 1))`,
            } as React.CSSProperties}
          >
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#D4AF37" />
          </svg>
        ) : (
          <span
            key={i}
            className="lv-mote absolute rounded-full"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              background: m.kind === "pollen" ? "#ECD9A0" : "#FFFFFF",
              filter: m.kind === "dust" ? "blur(1px)" : undefined,
              animationName: "lv-mote",
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
              "--mx": `${m.drift}px`,
              "--mo": `${m.opacity}`,
            } as React.CSSProperties}
          />
        )
      )}
    </div>
  );
}
