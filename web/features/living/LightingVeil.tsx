"use client";

/**
 * Living Bouquet - lighting engine.
 *
 * Four time-of-day moods (morning / golden hour / evening / night) chosen
 * from the viewer's local clock and re-checked each minute. Phases are
 * stacked gradient veils that crossfade over four seconds - light never
 * flashes. Each phase also drives the soft shadow color and the sparkle
 * intensity through CSS variables on the container.
 */
import { useEffect, useRef, useState } from "react";

type Phase = "morning" | "golden" | "evening" | "night";

const VEILS: Record<Phase, { veil: string; shadow: string; sparkle: number }> = {
  morning: {
    veil: "linear-gradient(180deg, rgba(255,247,222,0.26), rgba(255,255,255,0) 55%)",
    shadow: "rgba(108,74,182,0.16)",
    sparkle: 0.85,
  },
  golden: {
    veil: "linear-gradient(200deg, rgba(255,199,120,0.24), rgba(255,240,220,0) 60%)",
    shadow: "rgba(150,92,40,0.18)",
    sparkle: 1,
  },
  evening: {
    veil: "linear-gradient(190deg, rgba(168,124,220,0.2), rgba(255,235,240,0) 60%)",
    shadow: "rgba(90,60,140,0.2)",
    sparkle: 1.15,
  },
  night: {
    veil: "linear-gradient(180deg, rgba(38,45,96,0.28), rgba(70,60,120,0.08) 70%)",
    shadow: "rgba(30,30,60,0.28)",
    sparkle: 1.4,
  },
};

export function phaseForHour(hour: number): Phase {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "golden";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
}

export function LightingVeil() {
  const [phase, setPhase] = useState<Phase>(() => phaseForHour(new Date().getHours()));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setPhase(phaseForHour(new Date().getHours()));
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, []);

  // Publish shadow color + sparkle boost to the Living Bouquet container
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    host.style.setProperty("--lv-shadow", VEILS[phase].shadow);
    host.style.setProperty("--lv-sparkle", String(VEILS[phase].sparkle));
  }, [phase]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {(Object.keys(VEILS) as Phase[]).map((p) => (
        <div
          key={p}
          className="absolute inset-0 transition-opacity duration-[4000ms] ease-in-out"
          style={{ background: VEILS[p].veil, opacity: p === phase ? 1 : 0 }}
        />
      ))}
      {/* Cursor light - a soft highlight that follows the pointer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(240px circle at var(--lx, 50%) var(--ly, 30%), rgba(255,255,255,0.22), transparent 65%)",
        }}
      />
    </div>
  );
}
