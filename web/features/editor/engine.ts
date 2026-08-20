/**
 * EditorEngine - wraps Fabric.js behind a Scene-document interface.
 * Scene JSON in, Scene JSON out; Fabric's own serialization is never
 * persisted. This is what lets AI patches and manual edits share one
 * document and one undo history.
 */
import {
  Canvas,
  Gradient,
  IText,
  Rect,
  Shadow,
  loadSVGFromString,
  util,
  type FabricObject,
} from "fabric";
import { ASSET_MAP, assetSvg, type AssetDef } from "@/lib/assets";
import { uid, type Scene, type SceneLayer } from "@/lib/scene/types";

const CANVAS_FONTS: Record<string, string> = {
  display: "Clash Display",
  body: "Inter, sans-serif",
  hand: "Snell Roundhand, Segoe Script, cursive",
};
const FONT_KEYS = Object.fromEntries(Object.entries(CANVAS_FONTS).map(([k, v]) => [v, k]));

export interface SelectionInfo {
  count: number;
  layer: SceneLayer | null; // populated for single selection
}

type Meta = {
  layerId: string;
  layerType: "asset" | "text";
  assetId?: string;
  tint?: string | null;
  semantic?: string;
  locked?: boolean;
  isBackground?: boolean;
};

type FObj = FabricObject & { tohfa?: Meta };

function parseBackgroundFill(bg: string, w: number, h: number): string | Gradient<"linear"> {
  if (!bg.startsWith("linear-gradient")) return bg;
  const inner = bg.slice(bg.indexOf("(") + 1, bg.lastIndexOf(")"));
  const parts = inner.split(",").map((p) => p.trim());
  if (parts[0]?.endsWith("deg")) parts.shift();
  const colors = parts.length ? parts : ["#FFF4F8"];
  return new Gradient({
    type: "linear",
    coords: { x1: 0, y1: 0, x2: 0, y2: h },
    colorStops: colors.map((c, i) => ({
      offset: colors.length === 1 ? 0 : i / (colors.length - 1),
      color: c,
    })),
  });
}

/** Fabric's dispose() tears the element down asynchronously; re-initializing a
 *  Canvas on the same element before that finishes throws. Track the pending
 *  teardown per element so init can wait it out (React StrictMode remounts). */
const pendingDispose = new WeakMap<HTMLCanvasElement, Promise<unknown>>();

export class EditorEngine {
  private canvas: Canvas | null = null;
  private scene: Scene | null = null;
  private pageIndex = 0;
  private suppress = false;
  private dead = false;
  onChange: (() => void) | null = null;
  onSelection: ((sel: SelectionInfo) => void) | null = null;

  async init(el: HTMLCanvasElement, scene: Scene, pageIndex: number) {
    await pendingDispose.get(el);
    if (this.dead) return;
    this.canvas = new Canvas(el, {
      preserveObjectStacking: true,
      selectionColor: "rgba(108,74,182,0.08)",
      selectionBorderColor: "#6C4AB6",
    });
    this.wireEvents();
    await this.loadPage(scene, pageIndex);
  }

  private wireEvents() {
    const c = this.canvas!;
    const emit = () => {
      if (!this.suppress) this.commit();
    };
    c.on("object:modified", emit);
    c.on("text:editing:exited" as never, emit);
    const sel = () => this.emitSelection();
    c.on("selection:created", sel);
    c.on("selection:updated", sel);
    c.on("selection:cleared", sel);
    // Center snapping while dragging
    c.on("object:moving", (e) => {
      const obj = e.target as FObj;
      if (!obj || !this.scene) return;
      const { width, height } = this.scene.canvas;
      const threshold = 10;
      if (Math.abs((obj.left ?? 0) - width / 2) < threshold) obj.set({ left: width / 2 });
      if (Math.abs((obj.top ?? 0) - height / 2) < threshold) obj.set({ top: height / 2 });
    });
  }

  private emitSelection() {
    const c = this.canvas!;
    const active = c.getActiveObjects() as FObj[];
    const real = active.filter((o) => !o.tohfa?.isBackground);
    this.onSelection?.({
      count: real.length,
      layer: real.length === 1 ? this.objectToLayer(real[0]) : null,
    });
  }

  /** Serialize the live canvas back into the scene's current page, then notify. */
  private commit() {
    if (!this.canvas || !this.scene) return;
    const layers = (this.canvas.getObjects() as FObj[])
      .filter((o) => o.tohfa && !o.tohfa.isBackground)
      .map((o) => this.objectToLayer(o));
    this.scene.pages[this.pageIndex].layers = layers;
    this.onChange?.();
  }

  getScene(): Scene {
    return structuredClone(this.scene!) as Scene;
  }

  private objectToLayer(o: FObj): SceneLayer {
    const meta = o.tohfa!;
    const base: SceneLayer = {
      id: meta.layerId,
      type: meta.layerType,
      x: o.left ?? 0,
      y: o.top ?? 0,
      scaleX: Math.abs(o.scaleX ?? 1),
      scaleY: o.scaleY ?? 1,
      rotation: o.angle ?? 0,
      opacity: o.opacity ?? 1,
      flipX: o.flipX ?? false,
      locked: meta.locked,
      semantic: meta.semantic,
    };
    if (meta.layerType === "text") {
      const t = o as unknown as IText;
      base.text = t.text ?? "";
      base.fontSize = t.fontSize ?? 40;
      base.color = typeof t.fill === "string" ? t.fill : "#18181B";
      base.fontFamily = (FONT_KEYS[t.fontFamily ?? ""] ?? "display") as SceneLayer["fontFamily"];
      const ta = t.textAlign;
      if (ta === "left" || ta === "right") base.align = ta;
    } else {
      base.assetId = meta.assetId;
      base.tint = meta.tint;
    }
    return base;
  }

  private async buildAssetObject(asset: AssetDef, layer: SceneLayer): Promise<FObj> {
    // Fabric centers a group on the tight bbox of its drawn shapes, but the
    // SVG renderer centers on the full 100×100 asset box - for asymmetric
    // assets (gift tag, thread) the two disagree and the editor drifts from
    // the previews/exports. An invisible full-box rect forces Fabric's
    // bounds to match the asset box exactly.
    const svg = assetSvg(asset, layer.tint).replace(
      /(<svg[^>]*>)/,
      `$1<rect x="0" y="0" width="100" height="100" fill="none" stroke="none"/>`
    );
    const { objects, options } = await loadSVGFromString(svg);
    const group = util.groupSVGElements(
      objects.filter((o): o is FabricObject => !!o),
      options
    ) as FObj;
    this.applyLayerTransform(group, layer);
    group.tohfa = {
      layerId: layer.id,
      layerType: "asset",
      assetId: asset.id,
      tint: layer.tint,
      semantic: layer.semantic,
      locked: layer.locked,
    };
    this.applyLock(group, !!layer.locked);
    return group;
  }

  private buildTextObject(layer: SceneLayer): FObj {
    const text = new IText(layer.text ?? "Your message", {
      fontFamily: CANVAS_FONTS[layer.fontFamily ?? "display"],
      fontSize: layer.fontSize ?? 40,
      fill: layer.color ?? "#18181B",
      textAlign: layer.align ?? "center",
    }) as unknown as FObj;
    this.applyLayerTransform(text, layer);
    text.tohfa = {
      layerId: layer.id,
      layerType: "text",
      semantic: "text",
      locked: layer.locked,
    };
    this.applyLock(text, !!layer.locked);
    return text;
  }

  private applyLayerTransform(o: FabricObject, layer: SceneLayer) {
    // Text anchors match the SVG renderer: align left means layer.x is the
    // block's left edge, right means its right edge. Assets stay centered.
    const originX =
      layer.type === "text" && layer.align === "left"
        ? "left"
        : layer.type === "text" && layer.align === "right"
          ? "right"
          : "center";
    o.set({
      originX,
      originY: "center",
      left: layer.x,
      top: layer.y,
      scaleX: layer.scaleX,
      scaleY: layer.scaleY,
      angle: layer.rotation,
      opacity: layer.opacity,
      flipX: layer.flipX ?? false,
      cornerColor: "#6C4AB6",
      cornerStrokeColor: "#ffffff",
      borderColor: "#6C4AB6",
      cornerSize: 9,
      transparentCorners: false,
    });
  }

  private applyLock(o: FabricObject, locked: boolean) {
    o.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockScalingX: locked,
      lockScalingY: locked,
      lockRotation: locked,
      hasControls: !locked,
    });
  }

  /** Rebuild the canvas from a scene page. Used on load, page switch, undo/redo, AI patches. */
  async loadPage(scene: Scene, pageIndex: number) {
    if (!this.canvas) return;
    this.suppress = true;
    this.scene = structuredClone(scene) as Scene;
    this.pageIndex = pageIndex;
    const c = this.canvas;
    c.clear();

    const { width, height } = this.scene.canvas;
    const page = this.scene.pages[pageIndex];

    const bg = new Rect({
      left: width / 2,
      top: height / 2,
      originX: "center",
      originY: "center",
      width,
      height,
      selectable: false,
      evented: false,
      fill: parseBackgroundFill(page.background, width, height),
      shadow: new Shadow({ color: "rgba(46,36,64,0.22)", blur: 42, offsetY: 10 }),
    }) as FObj;
    bg.tohfa = { layerId: "bg", layerType: "asset", isBackground: true };
    c.add(bg);

    for (const layer of page.layers) {
      if (layer.type === "text") {
        c.add(this.buildTextObject(layer));
      } else {
        const asset = ASSET_MAP[layer.assetId ?? ""];
        if (asset) c.add(await this.buildAssetObject(asset, layer));
      }
    }
    c.discardActiveObject();
    c.renderAll();
    this.suppress = false;
    this.emitSelection();
  }

  setViewport(containerW: number, containerH: number, zoom: number) {
    if (!this.canvas || !this.scene) return;
    const { width, height } = this.scene.canvas;
    const fit = Math.min(containerW / width, containerH / height) * 0.92;
    const z = fit * zoom;
    this.canvas.setDimensions({ width: containerW, height: containerH });
    this.canvas.setViewportTransform([
      z, 0, 0, z,
      (containerW - width * z) / 2,
      (containerH - height * z) / 2,
    ]);
    this.canvas.renderAll();
  }

  // ── Commands ────────────────────────────────────────────────

  async addAsset(assetId: string, tint?: string) {
    const asset = ASSET_MAP[assetId];
    if (!asset || !this.canvas || !this.scene) return;
    const { width, height } = this.scene.canvas;
    const layer: SceneLayer = {
      id: uid("ly"),
      type: "asset",
      assetId,
      x: width / 2 + (Math.random() - 0.5) * 60,
      y: height * 0.4 + (Math.random() - 0.5) * 60,
      scaleX: 1.4,
      scaleY: 1.4,
      rotation: 0,
      opacity: 1,
      tint,
      semantic: `${asset.category}.${assetId.split("-").slice(1).join("-")}`,
    };
    const obj = await this.buildAssetObject(asset, layer);
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
    this.commit();
  }

  addText(text = "Your message") {
    if (!this.canvas || !this.scene) return;
    const { width, height } = this.scene.canvas;
    const layer: SceneLayer = {
      id: uid("ly"),
      type: "text",
      text,
      fontFamily: "display",
      fontSize: 48,
      color: "#18181B",
      x: width / 2,
      y: height / 2,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      semantic: "text",
    };
    const obj = this.buildTextObject(layer);
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
    this.commit();
  }

  private activeObjects(): FObj[] {
    return ((this.canvas?.getActiveObjects() ?? []) as FObj[]).filter(
      (o) => !o.tohfa?.isBackground
    );
  }

  async updateSelected(patch: Partial<SceneLayer>) {
    if (!this.canvas) return;
    for (const o of this.activeObjects()) {
      if (patch.opacity !== undefined) o.set({ opacity: patch.opacity });
      if (patch.rotation !== undefined) o.set({ angle: patch.rotation });
      if (patch.flipX !== undefined) o.set({ flipX: patch.flipX });
      if (patch.scaleX !== undefined) o.set({ scaleX: patch.scaleX, scaleY: patch.scaleX });
      if (patch.locked !== undefined && o.tohfa) {
        o.tohfa.locked = patch.locked;
        this.applyLock(o, patch.locked);
      }
      if (o.tohfa?.layerType === "text") {
        const t = o as unknown as IText;
        if (patch.text !== undefined) t.set({ text: patch.text });
        if (patch.fontSize !== undefined) t.set({ fontSize: patch.fontSize });
        if (patch.color !== undefined) t.set({ fill: patch.color });
        if (patch.fontFamily !== undefined)
          t.set({ fontFamily: CANVAS_FONTS[patch.fontFamily] });
      }
      if (patch.tint !== undefined && o.tohfa?.layerType === "asset") {
        await this.retintObject(o, patch.tint ?? undefined);
      }
      o.setCoords();
    }
    this.canvas.renderAll();
    this.commit();
    this.emitSelection();
  }

  private async retintObject(o: FObj, tint?: string) {
    const c = this.canvas!;
    const layer = this.objectToLayer(o);
    layer.tint = tint;
    const asset = ASSET_MAP[layer.assetId ?? ""];
    if (!asset) return;
    const index = c.getObjects().indexOf(o);
    const fresh = await this.buildAssetObject(asset, layer);
    c.remove(o);
    c.insertAt(index, fresh);
    c.setActiveObject(fresh);
  }

  deleteSelected() {
    const c = this.canvas;
    if (!c) return;
    for (const o of this.activeObjects()) c.remove(o);
    c.discardActiveObject();
    c.renderAll();
    this.commit();
  }

  async duplicateSelected() {
    const c = this.canvas;
    if (!c) return;
    const clones: FObj[] = [];
    for (const o of this.activeObjects()) {
      const layer = this.objectToLayer(o);
      layer.id = uid("ly");
      layer.x += 36;
      layer.y += 36;
      const clone =
        layer.type === "text"
          ? this.buildTextObject(layer)
          : await this.buildAssetObject(ASSET_MAP[layer.assetId!], layer);
      c.add(clone);
      clones.push(clone);
    }
    if (clones.length === 1) c.setActiveObject(clones[0]);
    c.renderAll();
    this.commit();
  }

  reorderSelected(dir: "up" | "down" | "front" | "back") {
    const c = this.canvas;
    if (!c) return;
    for (const o of this.activeObjects()) {
      if (dir === "up") c.bringObjectForward(o);
      else if (dir === "down") {
        // never sink below the background rect
        const idx = c.getObjects().indexOf(o);
        if (idx > 1) c.sendObjectBackwards(o);
      } else if (dir === "front") c.bringObjectToFront(o);
      else {
        c.sendObjectToBack(o);
        const bg = (c.getObjects() as FObj[]).find((x) => x.tohfa?.isBackground);
        if (bg) c.sendObjectToBack(bg);
      }
    }
    c.renderAll();
    this.commit();
  }

  nudgeSelected(dx: number, dy: number) {
    const c = this.canvas;
    if (!c) return;
    for (const o of this.activeObjects()) {
      o.set({ left: (o.left ?? 0) + dx, top: (o.top ?? 0) + dy });
      o.setCoords();
    }
    c.renderAll();
    this.commit();
  }

  setBackground(bg: string) {
    if (!this.canvas || !this.scene) return;
    this.scene.pages[this.pageIndex].background = bg;
    const { width, height } = this.scene.canvas;
    const bgObj = (this.canvas.getObjects() as FObj[]).find((o) => o.tohfa?.isBackground);
    bgObj?.set({ fill: parseBackgroundFill(bg, width, height) });
    this.canvas.renderAll();
    this.onChange?.();
  }

  deselect() {
    this.canvas?.discardActiveObject();
    this.canvas?.renderAll();
    this.emitSelection();
  }

  isEditingText(): boolean {
    const active = this.canvas?.getActiveObject() as IText | undefined;
    return !!active && "isEditing" in active && !!active.isEditing;
  }

  dispose() {
    this.dead = true;
    const c = this.canvas;
    if (c) {
      const el = c.getElement() as HTMLCanvasElement;
      pendingDispose.set(el, c.dispose().catch(() => {}));
    }
    this.canvas = null;
  }
}
