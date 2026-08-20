/**
 * SceneSpec - the compact format the AI produces (and the local composer
 * emits). Positions are relative (0–1) so the model never reasons about
 * pixel math; specToScene maps onto the gift type's canvas.
 */
import { ASSET_IDS, ASSET_MAP } from "@/lib/assets";
// Safe despite the apparent cycle: composer.ts imports only types from here.
import { composeFromPrompt } from "./composer";
import {
  createBlankScene,
  uid,
  type GiftType,
  type Scene,
  type SceneLayer,
} from "@/lib/scene/types";

export interface SpecLayer {
  asset: string;
  x: number; // 0–1 relative to canvas width
  y: number; // 0–1 relative to canvas height
  scale: number; // 1 = 100px base size
  rotation?: number;
  tint?: string;
  opacity?: number;
  flipX?: boolean;
}

export interface SpecText {
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  font?: "display" | "body" | "hand";
  rotation?: number;
  /** left: x is the block's left edge; right: its right edge */
  align?: "left" | "center" | "right";
}

export interface SpecPage {
  name?: string;
  background?: string;
  layers: SpecLayer[];
  texts?: SpecText[];
}

export interface SceneSpec {
  title: string;
  background: string;
  palette: string[];
  greeting?: string;
  /** Cards: the full paragraph written inside */
  message?: string;
  /** Page 0 content (kept for single-page gifts and back-compat) */
  layers: SpecLayer[];
  texts?: SpecText[];
  /** Multi-page gifts (greeting cards): Front / Inside / Back */
  pages?: SpecPage[];
}

/** JSON schema fragments for Claude structured output. Asset ids are an enum,
 *  so the model can only reference assets that actually exist. */
const LAYERS_SCHEMA = {
  type: "array",
  description:
    "Visual layers painted bottom-to-top. For bouquets: stems/greenery first, then wrapping, flowers on top, ribbon bow last at the wrap waist.",
  items: {
    type: "object",
    properties: {
      asset: { type: "string", enum: ASSET_IDS },
      x: { type: "number", description: "Center x, 0-1 relative" },
      y: { type: "number", description: "Center y, 0-1 relative" },
      scale: { type: "number", description: "Size multiplier; flowers ~1.2-2.2, wrap ~4-6" },
      rotation: { type: "number", description: "Degrees" },
      tint: { type: "string", description: "Hex color for the asset's tintable regions" },
      opacity: { type: "number" },
    },
    required: ["asset", "x", "y", "scale"],
    additionalProperties: false,
  },
} as const;

const TEXTS_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      text: { type: "string", description: "May contain \\n for multi-line text" },
      x: { type: "number" },
      y: { type: "number" },
      size: { type: "number", description: "Font size in px, canvas is ~800-900 wide" },
      color: { type: "string" },
      font: { type: "string", enum: ["display", "body", "hand"] },
      rotation: { type: "number", description: "Degrees" },
      align: {
        type: "string",
        enum: ["left", "center", "right"],
        description: "left: x is the block's left edge; right: its right edge; default center",
      },
    },
    required: ["text", "x", "y"],
    additionalProperties: false,
  },
} as const;

export const SCENE_SPEC_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Short evocative title for the design, 2-4 words" },
    background: {
      type: "string",
      description:
        "Canvas background: a hex color or 'linear-gradient(<deg>deg, <hex>, <hex>)'",
    },
    palette: { type: "array", items: { type: "string" }, description: "3-5 hex colors used" },
    greeting: { type: "string", description: "A short heartfelt greeting message" },
    layers: LAYERS_SCHEMA,
    texts: TEXTS_SCHEMA,
  },
  required: ["title", "background", "palette", "layers"],
  additionalProperties: false,
} as const;

/** Card variant: exactly three pages - Front, Inside, Back. */
export const CARD_SPEC_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Short evocative title for the design, 2-4 words" },
    background: {
      type: "string",
      description: "Fallback background: a hex color or 'linear-gradient(<deg>deg, <hex>, <hex>)'",
    },
    palette: { type: "array", items: { type: "string" }, description: "3-5 hex colors used" },
    greeting: { type: "string", description: "The short line printed on the front cover" },
    message: {
      type: "string",
      description:
        "The full heartfelt message written inside the card: TWO substantial paragraphs (5-8 sentences total) personalised to the wish, addressing the recipient by name or relation. It MUST also appear as multi-line text on the Inside page.",
    },
    pages: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      description: "Exactly three pages, in order: Front, Inside, Back.",
      items: {
        type: "object",
        properties: {
          name: { type: "string", enum: ["Front", "Inside", "Back"] },
          background: { type: "string", description: "Hex color or linear-gradient()" },
          layers: LAYERS_SCHEMA,
          texts: TEXTS_SCHEMA,
        },
        required: ["name", "layers"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "background", "palette", "greeting", "message", "pages"],
  additionalProperties: false,
} as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function fillPage(
  page: Scene["pages"][number],
  width: number,
  height: number,
  layers: SpecLayer[],
  texts: SpecText[],
  background?: string
) {
  page.background = background || page.background;

  for (const l of layers) {
    const asset = ASSET_MAP[l.asset];
    if (!asset) continue;
    const scale = clamp(l.scale ?? 1, 0.2, 8);
    page.layers.push({
      id: uid("ly"),
      type: "asset",
      assetId: asset.id,
      x: clamp(l.x, 0, 1) * width,
      y: clamp(l.y, 0, 1) * height,
      scaleX: scale,
      scaleY: scale,
      rotation: l.rotation ?? 0,
      opacity: clamp(l.opacity ?? 1, 0.05, 1),
      tint: l.tint,
      flipX: l.flipX,
      semantic: `${asset.category}.${asset.id.split("-").slice(1).join("-") || asset.id}`,
    } satisfies SceneLayer);
  }

  for (const t of texts) {
    page.layers.push({
      id: uid("ly"),
      type: "text",
      text: t.text,
      fontFamily: t.font ?? "display",
      fontSize: clamp(t.size ?? 44, 12, 160),
      color: t.color ?? "#18181B",
      align: t.align,
      x: clamp(t.x, 0, 1) * width,
      y: clamp(t.y, 0, 1) * height,
      scaleX: 1,
      scaleY: 1,
      rotation: t.rotation ?? 0,
      opacity: 1,
      semantic: "text",
    });
  }
}

export function specToScene(spec: SceneSpec, giftType: GiftType): Scene {
  const scene = createBlankScene(giftType);
  const { width, height } = scene.canvas;
  scene.palette = spec.palette?.length ? spec.palette : scene.palette;
  scene.greeting = spec.greeting;

  if (spec.pages?.length) {
    // Multi-page specs (cards) fill each scene page in order
    spec.pages.slice(0, scene.pages.length).forEach((sp, i) => {
      fillPage(scene.pages[i], width, height, sp.layers ?? [], sp.texts ?? [], sp.background ?? spec.background);
    });
  } else {
    fillPage(scene.pages[0], width, height, spec.layers ?? [], spec.texts ?? [], spec.background);
  }

  return scene;
}

// ── Refine ops (AI chat edits - patches, never regeneration) ──

export type RefineOp =
  | { op: "remove"; match: string }
  | { op: "add"; asset: string; count?: number; tint?: string }
  | { op: "retint"; match: string; tint: string }
  | { op: "background"; value: string }
  | { op: "greeting"; text: string }
  | { op: "recompose"; prompt: string };

export const REFINE_OPS_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "One warm sentence telling the user what you changed" },
    ops: {
      type: "array",
      items: {
        type: "object",
        properties: {
          op: { type: "string", enum: ["remove", "add", "retint", "background", "greeting", "recompose"] },
          match: {
            type: "string",
            description:
              "For remove/retint: asset id (e.g. flower-rose), category (e.g. flower), or 'all'",
          },
          asset: { type: "string", enum: ASSET_IDS },
          count: { type: "number" },
          tint: { type: "string" },
          value: { type: "string", description: "For background: hex or linear-gradient" },
          text: { type: "string", description: "For greeting" },
          prompt: {
            type: "string",
            description:
              "For recompose: the user's full design description. Use recompose ALONE when they describe a new theme/occasion/arrangement rather than a small tweak.",
          },
        },
        required: ["op"],
        additionalProperties: false,
      },
    },
  },
  required: ["reply", "ops"],
  additionalProperties: false,
} as const;

function layerMatches(layer: SceneLayer, match: string): boolean {
  if (match === "all") return layer.type === "asset";
  if (layer.type !== "asset" || !layer.assetId) return match === "text" && layer.type === "text";
  const asset = ASSET_MAP[layer.assetId];
  return (
    layer.assetId === match ||
    asset?.category === match ||
    layer.assetId.includes(match) ||
    (layer.semantic ?? "").includes(match)
  );
}

/** Apply refine ops to a scene - pure, returns a new scene. */
export function applyRefineOps(scene: Scene, ops: RefineOp[], pageIndex = 0): Scene {
  // Recompose rebuilds the whole design from a description, then any
  // remaining ops fine-tune the fresh scene.
  const rc = ops.find((o) => o.op === "recompose");
  if (rc && rc.op === "recompose") {
    const rebuilt = specToScene(composeFromPrompt(rc.prompt, scene.giftType), scene.giftType);
    return applyRefineOps(rebuilt, ops.filter((o) => o !== rc), pageIndex);
  }

  const next: Scene = structuredClone(scene);
  const page = next.pages[pageIndex] ?? next.pages[0];
  const { width, height } = next.canvas;

  for (const op of ops) {
    switch (op.op) {
      case "remove":
        page.layers = page.layers.filter((l) => !layerMatches(l, op.match));
        break;
      case "retint":
        for (const l of page.layers) if (layerMatches(l, op.match)) l.tint = op.tint;
        break;
      case "background":
        page.background = op.value;
        break;
      case "greeting":
        next.greeting = op.text;
        break;
      case "add": {
        const asset = ASSET_MAP[op.asset];
        if (!asset) break;
        const count = Math.min(op.count ?? 1, 12);
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + 0.7;
          page.layers.push({
            id: uid("ly"),
            type: "asset",
            assetId: asset.id,
            x: width * (0.5 + 0.22 * Math.cos(angle)),
            y: height * (0.34 + 0.14 * Math.sin(angle)),
            scaleX: 1.3,
            scaleY: 1.3,
            rotation: (i * 47) % 40 - 20,
            opacity: 1,
            tint: op.tint,
            semantic: `${asset.category}.${asset.id.split("-").slice(1).join("-")}`,
          });
        }
        break;
      }
    }
  }
  return next;
}
