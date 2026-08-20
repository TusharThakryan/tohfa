/** Client-side exporters - all rendered from the Scene document, not the live canvas. */
import { sceneToSVG } from "@/lib/scene/render";
import type { Project, Scene } from "@/lib/scene/types";

const PANEL_GAP = 24;

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tohfa-gift";
}

/** One SVG holding every page side by side - a foldable card sheet. */
function sceneToFoldableSVG(scene: Scene): string {
  const { width, height } = scene.canvas;
  const n = scene.pages.length;
  const totalW = n * width + (n + 1) * PANEL_GAP;
  const totalH = height + 2 * PANEL_GAP;
  const panels = scene.pages
    .map((_, i) => {
      const inner = sceneToSVG(scene, i).replace(
        /^<svg[^>]*>/,
        `<svg x="${PANEL_GAP + i * (width + PANEL_GAP)}" y="${PANEL_GAP}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
      );
      return inner;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}"><rect width="${totalW}" height="${totalH}" fill="#FFFFFF"/>${panels}</svg>`;
}

/** Multi-page scenes export the whole foldable sheet; single pages export the page. */
function exportSVGString(scene: Scene, pageIndex: number): { svg: string; width: number; height: number; foldable: boolean } {
  if (scene.pages.length > 1) {
    const n = scene.pages.length;
    return {
      svg: sceneToFoldableSVG(scene),
      width: n * scene.canvas.width + (n + 1) * PANEL_GAP,
      height: scene.canvas.height + 2 * PANEL_GAP,
      foldable: true,
    };
  }
  return { svg: sceneToSVG(scene, pageIndex), ...scene.canvas, foldable: false };
}

export function downloadSVG(scene: Scene, pageIndex: number, title: string) {
  const { svg, foldable } = exportSVGString(scene, pageIndex);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(title)}${foldable ? "-foldable" : ""}.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadPNG(scene: Scene, pageIndex: number, title: string, scale = 2): Promise<void> {
  return new Promise((resolve, reject) => {
    const { svg, width, height, foldable } = exportSVGString(scene, pageIndex);
    const img = new Image();
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(svgUrl);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("PNG export failed"));
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `${slugify(title)}${foldable ? "-foldable" : ""}.png`);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        resolve();
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("SVG render failed"));
    };
    img.src = svgUrl;
  });
}

export function downloadJSON(project: Project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(project.title)}.tohfa.json`);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
