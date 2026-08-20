/**
 * The Scene document - Tohfa's core abstraction.
 * AI generates it, the editor edits it, renderers export it.
 * Gift types (bouquet, card, …) are configurations over this one format.
 */

export type GiftType = "bouquet" | "card";

export interface SceneLayer {
  id: string;
  type: "asset" | "text";
  /** Asset layers: id from the asset registry */
  assetId?: string;
  /** Text layers */
  text?: string;
  fontFamily?: "display" | "body" | "hand";
  fontSize?: number;
  color?: string;
  /** Text anchor: x is the left edge, center, or right edge of the block */
  align?: "left" | "center" | "right";
  /** Transform - x/y are the layer's center in canvas coordinates */
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  /** Recolors the asset's tintable regions */
  tint?: string | null;
  flipX?: boolean;
  locked?: boolean;
  /** AI targeting key, e.g. "flower.rose" - lets chat edits find "the roses" */
  semantic?: string;
}

export interface ScenePage {
  id: string;
  name: string;
  /** CSS color or linear-gradient() string */
  background: string;
  layers: SceneLayer[];
}

export interface Scene {
  version: 1;
  giftType: GiftType;
  canvas: { width: number; height: number };
  pages: ScenePage[];
  palette?: string[];
  greeting?: string;
}

export interface Project {
  id: string;
  title: string;
  scene: Scene;
  createdAt: number;
  updatedAt: number;
}

/** All assets are authored in a 100×100 box; transforms assume this base size. */
export const ASSET_BASE_SIZE = 100;

let counter = 0;
export function uid(prefix = "id"): string {
  counter = (counter + 1) % 1000;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export const GIFT_TYPES: Record<
  GiftType,
  { label: string; canvas: { width: number; height: number }; pages: string[] }
> = {
  bouquet: { label: "Bouquet", canvas: { width: 900, height: 1100 }, pages: ["Bouquet"] },
  card: { label: "Greeting Card", canvas: { width: 800, height: 1000 }, pages: ["Front", "Inside", "Back"] },
};

export function createBlankScene(giftType: GiftType): Scene {
  const def = GIFT_TYPES[giftType];
  return {
    version: 1,
    giftType,
    canvas: def.canvas,
    pages: def.pages.map((name) => ({
      id: uid("pg"),
      name,
      background: "#FFF4F8",
      layers: [],
    })),
    palette: ["#6C4AB6", "#C996CC", "#D4AF37"],
  };
}

export function createProject(giftType: GiftType, title?: string): Project {
  return {
    id: uid("prj"),
    title: title ?? `Untitled ${GIFT_TYPES[giftType].label}`,
    scene: createBlankScene(giftType),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
