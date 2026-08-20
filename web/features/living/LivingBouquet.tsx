"use client";

/**
 * Living Bouquet - orchestrator.
 *
 * Assembles the engine: the animated scene, petal engine, ambient
 * particles, and lighting veil, and adds the interaction layer -
 * cursor-driven 3D tilt, a light that follows the pointer, and a slow
 * "camera settle" after the opening choreography.
 *
 * Performance & accessibility contract:
 *  - every loop is CSS transform/opacity (GPU-composited)
 *  - all continuous motion pauses when the tab is hidden
 *  - prefers-reduced-motion freezes loops (global CSS) and disables the
 *    tilt, petals, and particles entirely
 *  - tilt is skipped on coarse pointers (touch devices)
 *
 * Ambient audio: intentionally a placeholder - when sound ships, start a
 * soft loop here after the entrance completes (behind a mute toggle).
 */
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useCursorGlide } from "@/lib/hooks/useCursorGlide";
import type { Scene } from "@/lib/scene/types";
import { LivingScene } from "./LivingScene";
import { PetalEngine, type PetalApi } from "./PetalEngine";
import { AmbientParticles } from "./AmbientParticles";
import { LightingVeil } from "./LightingVeil";

export function LivingBouquet({ scene }: { scene: Scene }) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const petalApi = useRef<PetalApi | null>(null);
  const lightFrame = useRef(0);
  const [hidden, setHidden] = useState(false);
  const [coarse, setCoarse] = useState(false);

  // Cursor tilt - restrained 3D depth, spring-smoothed (shared primitive)
  const { smx, smy, mx, my, track, reset } = useCursorGlide(50, 16);
  const rotateY = useTransform(smx, [-1, 1], [-4, 4]);
  const rotateX = useTransform(smy, [-1, 1], [3, -3]);

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const interactive = !reduced && !coarse;

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive || !hostRef.current) return;
    track(e.clientX, e.clientY, hostRef.current);
    // Move the cursor light at most once a frame
    if (!lightFrame.current) {
      lightFrame.current = requestAnimationFrame(() => {
        lightFrame.current = 0;
        const host = hostRef.current;
        if (!host) return;
        host.style.setProperty("--lx", `${(((mx.get() + 1) / 2) * 100).toFixed(1)}%`);
        host.style.setProperty("--ly", `${(((my.get() + 1) / 2) * 100).toFixed(1)}%`);
      });
    }
  };

  const onPointerLeave = () => reset();

  return (
    <div
      ref={hostRef}
      data-lv-paused={hidden ? "" : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative"
      style={{ perspective: 900 }}
    >
      <motion.div style={interactive ? { rotateX, rotateY } : undefined}>
        {/* Camera settle: eases from a slight zoom once the bloom finishes */}
        <div
          className="lv-enter"
          style={
            reduced
              ? undefined
              : { animationName: "lv-settle", animationDuration: "2.6s", animationDelay: "2.2s" }
          }
        >
          <LivingScene
            scene={scene}
            intro={!reduced}
            onInteract={(i) => petalApi.current?.release(i.xPct, i.yPct, i.kind, i.color)}
          />
        </div>

        {/* Soft ground shadow, tinted by the lighting phase */}
        <div
          aria-hidden
          className="absolute inset-x-[14%] bottom-[1.5%] h-6 rounded-full blur-md"
          style={{
            background: "radial-gradient(ellipse, var(--lv-shadow, rgba(108,74,182,0.18)), transparent 70%)",
          }}
        />
      </motion.div>

      <LightingVeil />
      {!reduced && <AmbientParticles />}
      {!reduced && (
        <PetalEngine
          apiRef={petalApi}
          palette={scene.palette ?? []}
          active={!hidden}
        />
      )}
    </div>
  );
}
