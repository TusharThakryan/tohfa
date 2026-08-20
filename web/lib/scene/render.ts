import { ASSET_MAP } from "@/lib/assets";
import { ASSET_BASE_SIZE as BASE, type Scene, type SceneLayer } from "./types";

export const FONT_STACKS: Record<string, string> = {
  display: "'Clash Display', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  hand: "'Snell Roundhand', 'Segoe Script', cursive",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layerMarkup(layer: SceneLayer): string {
  const sx = layer.scaleX * (layer.flipX ? -1 : 1);
  const transform = `translate(${layer.x} ${layer.y}) rotate(${layer.rotation}) scale(${sx} ${layer.scaleY})`;

  if (layer.type === "text") {
    const font = FONT_STACKS[layer.fontFamily ?? "body"];
    const size = layer.fontSize ?? 40;
    const lines = (layer.text ?? "").split("\n");
    const tspans = lines
      .map(
        (line, i) =>
          `<tspan x="0" dy="${i === 0 ? ((lines.length - 1) * -0.5 + 0.35) * size * 1.25 : size * 1.25}">${esc(line)}</tspan>`
      )
      .join("");
    const wordSpacing = (layer.fontFamily ?? "body") === "display" ? ` word-spacing="${(size * 0.14).toFixed(1)}"` : "";
    const anchor = layer.align === "left" ? "start" : layer.align === "right" ? "end" : "middle";
    return `<g transform="${transform}" opacity="${layer.opacity}"><text font-family="${font}" font-size="${size}" fill="${layer.color ?? "#18181B"}" text-anchor="${anchor}"${wordSpacing}>${tspans}</text></g>`;
  }

  const asset = ASSET_MAP[layer.assetId ?? ""];
  if (!asset) return "";
  const body = asset.svg.replaceAll("__TINT__", layer.tint || asset.defaultTint);
  return `<g transform="${transform} translate(${-BASE / 2} ${-BASE / 2})" opacity="${layer.opacity}">${body}</g>`;
}

export function backgroundMarkup(background: string, w: number, h: number): string {
  if (background.startsWith("linear-gradient")) {
    // Parse "linear-gradient(<angle>deg, c1, c2, ...)" into an SVG gradient
    const inner = background.slice(background.indexOf("(") + 1, background.lastIndexOf(")"));
    const parts = inner.split(",").map((p) => p.trim());
    let angle = 180;
    if (parts[0]?.endsWith("deg")) angle = parseFloat(parts.shift()!);
    const rad = ((angle - 90) * Math.PI) / 180;
    const x2 = 50 + Math.cos(rad) * 50;
    const y2 = 50 + Math.sin(rad) * 50;
    const stops = parts
      .map((color, i) => `<stop offset="${parts.length === 1 ? 0 : (i / (parts.length - 1)) * 100}%" stop-color="${color}"/>`)
      .join("");
    return `<defs><linearGradient id="bg" x1="${100 - x2}%" y1="${100 - y2}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient></defs><rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  }
  return `<rect width="${w}" height="${h}" fill="${background}"/>`;
}

/** Render one page of a scene to a standalone SVG string. */
export function sceneToSVG(scene: Scene, pageIndex = 0): string {
  const page = scene.pages[pageIndex] ?? scene.pages[0];
  const { width, height } = scene.canvas;
  const layers = page.layers.map(layerMarkup).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${backgroundMarkup(page.background, width, height)}${layers}</svg>`;
}
