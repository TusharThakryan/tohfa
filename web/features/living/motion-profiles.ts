/**
 * Living Bouquet - motion profiles.
 *
 * Maps every scene layer to an idle animation personality. Flowers do not
 * move identically: roses sway, tulips bob, sunflowers slowly face the
 * light, lavender drifts, leaves flutter, the ribbon waves like fabric.
 * Durations are ranges; each layer picks a deterministic point inside the
 * range (hashed from its id) so nothing ever synchronizes.
 */
import { ASSET_MAP } from "@/lib/assets";
import type { SceneLayer } from "@/lib/scene/types";

export interface MotionProfile {
  /** CSS keyframe name from globals.css, or null to stay perfectly still */
  anim: string | null;
  /** [min, max] loop duration in seconds */
  dur: [number, number];
  /** hover response class: bloom (flowers) or soft (ribbon, wrap) */
  hover?: "lv-hover" | "lv-hover-soft";
  /** hovering/clicking this layer releases petals */
  emitsPetals?: boolean;
}

const STILL: MotionProfile = { anim: null, dur: [0, 0] };

/** Deterministic 0..1 from a string - keeps timing stable across renders. */
export function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function profileFor(layer: SceneLayer): MotionProfile {
  if (layer.type === "text") return STILL;
  const id = layer.assetId ?? "";
  const category = ASSET_MAP[id]?.category;

  // The gift tag and its thread stay still so the writing never drifts
  if (id === "note-card" || id === "tag-thread") return STILL;

  if (category === "flower") {
    const bloom = { hover: "lv-hover" as const, emitsPetals: true };
    if (/tulip|iris|poppy/.test(id)) return { anim: "lv-bob", dur: [5, 7.5], ...bloom };
    if (/sunflower|daisy|chrysanthemum/.test(id)) return { anim: "lv-face", dur: [8, 11], ...bloom };
    if (/lavender|gypsophila/.test(id)) return { anim: "lv-drift", dur: [6, 9], hover: "lv-hover" };
    if (/blossom/.test(id)) return { anim: "lv-sway", dur: [5, 7], ...bloom };
    return { anim: "lv-sway", dur: [5.5, 8.5], ...bloom };
  }
  if (category === "leaf") return { anim: "lv-flutter", dur: [4.5, 7] };
  if (category === "ribbon") return { anim: "lv-ribbon", dur: [5, 7], hover: "lv-hover-soft" };
  if (category === "wrapping") return { anim: "lv-breathe", dur: [7, 9.5], hover: "lv-hover-soft" };
  if (category === "sparkle") return { anim: "lv-twinkle", dur: [2.4, 4] };
  if (category === "butterfly") return { anim: "lv-drift", dur: [4, 6] };
  if (category === "balloon") return { anim: "lv-bob", dur: [6, 8.5] };
  if (category === "heart") return { anim: "lv-breathe", dur: [3.5, 5] };
  return { anim: "lv-breathe", dur: [6, 8] };
}

/**
 * Opening choreography: which entrance a layer uses and when it starts.
 * Sequence: greenery/stems appear, wrapping unfolds, ribbon unties,
 * flowers bloom outward-in (the composer paints hero blooms last), then
 * extras sparkle in, and finally the gift tag with its message.
 */
export function entranceFor(
  layer: SceneLayer,
  counters: Record<string, number>
): { anim: string; delay: number } {
  const bump = (k: string) => (counters[k] = (counters[k] ?? 0) + 1) - 1;
  if (layer.type === "text") return { anim: "lv-enter-fade", delay: 2.5 + bump("text") * 0.12 };

  const category = ASSET_MAP[layer.assetId ?? ""]?.category;
  switch (category) {
    case "leaf":
      return { anim: "lv-enter-fade", delay: 0.2 + bump("leaf") * 0.07 };
    case "wrapping":
      return { anim: "lv-enter-unfold", delay: 0.7 };
    case "ribbon":
      return { anim: "lv-enter-untie", delay: 1.05 };
    case "flower":
      return { anim: "lv-enter-bloom", delay: 1.3 + bump("flower") * 0.09 };
    case "sparkle":
    case "butterfly":
    case "balloon":
    case "heart":
      return { anim: "lv-enter-fade", delay: 2 + bump("extra") * 0.12 };
    case "extra":
      return { anim: "lv-enter-fade", delay: 2.35 + bump("tag") * 0.1 };
    default:
      return { anim: "lv-enter-fade", delay: 0.3 };
  }
}
