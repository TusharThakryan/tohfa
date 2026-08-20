/**
 * Tohfa asset library. Every asset is authored in a 100×100 viewBox.
 * `__TINT__` marks recolorable regions - replaced at render time by the
 * layer's tint (or the asset's defaultTint). The AI can only reference
 * these ids (enforced with an enum in the generation schema).
 */

export type AssetCategory =
  | "flower"
  | "leaf"
  | "wrapping"
  | "ribbon"
  | "heart"
  | "butterfly"
  | "balloon"
  | "sparkle"
  | "extra"
  | "shape"
  | "frame";

export interface AssetDef {
  id: string;
  name: string;
  category: AssetCategory;
  tags: string[];
  defaultTint: string;
  svg: string;
}

const petalRing = (cx: number, cy: number, n: number, rx: number, ry: number, dist: number, fill: string, opacity = 1) =>
  Array.from({ length: n }, (_, i) => {
    const a = (360 / n) * i;
    return `<ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}" transform="rotate(${a} ${cx} ${cy})"/>`;
  }).join("");

export const ASSETS: AssetDef[] = [
  // ── Flowers ────────────────────────────────────────────────
  {
    id: "flower-rose",
    name: "Rose",
    category: "flower",
    tags: ["rose", "romance", "classic"],
    defaultTint: "#C4455E",
    svg: `${petalRing(50, 50, 8, 16, 24, 24, "__TINT__", 0.85)}${petalRing(50, 50, 6, 13, 18, 14, "__TINT__")}<circle cx="50" cy="50" r="15" fill="__TINT__"/><path d="M50 36 a14 14 0 0 1 14 14 a11 11 0 0 1 -11 11 a9 9 0 0 1 -9 -9 a7 7 0 0 1 7 -7 a5 5 0 0 1 5 5" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: "flower-peony",
    name: "Peony",
    category: "flower",
    tags: ["peony", "soft", "luxury"],
    defaultTint: "#E8A0BF",
    svg: `${petalRing(50, 50, 9, 17, 26, 24, "__TINT__", 0.75)}${petalRing(50, 50, 7, 14, 20, 15, "__TINT__", 0.9)}${petalRing(50, 50, 5, 11, 15, 8, "__TINT__")}<circle cx="50" cy="50" r="9" fill="#F7E0A3"/>`,
  },
  {
    id: "flower-tulip",
    name: "Tulip",
    category: "flower",
    tags: ["tulip", "spring"],
    defaultTint: "#E4737F",
    svg: `<path d="M50 92 L50 55" stroke="#7FAF92" stroke-width="5" stroke-linecap="round"/><path d="M30 40 q0 -26 20 -32 q20 6 20 32 q0 22 -20 24 q-20 -2 -20 -24Z" fill="__TINT__"/><path d="M50 8 q-11 10 -11 30 q0 16 11 26 q11 -10 11 -26 q0 -20 -11 -30Z" fill="#ffffff" opacity="0.22"/>`,
  },
  {
    id: "flower-daisy",
    name: "Daisy",
    category: "flower",
    tags: ["daisy", "cheerful"],
    defaultTint: "#FFFFFF",
    svg: `${petalRing(50, 50, 12, 9, 22, 25, "__TINT__")}<circle cx="50" cy="50" r="13" fill="#F2C14E"/><circle cx="50" cy="50" r="13" fill="none" stroke="#D9A431" stroke-width="2"/>`,
  },
  {
    id: "flower-sunflower",
    name: "Sunflower",
    category: "flower",
    tags: ["sunflower", "summer", "friendship"],
    defaultTint: "#F5B82E",
    svg: `${petalRing(50, 50, 14, 8, 24, 26, "__TINT__")}${petalRing(50, 50, 14, 7, 20, 20, "#D99A17")}<circle cx="50" cy="50" r="16" fill="#6B4423"/><circle cx="50" cy="50" r="10" fill="#4F311A"/>`,
  },
  {
    id: "flower-lily",
    name: "Lily",
    category: "flower",
    tags: ["lily", "elegant", "sympathy"],
    defaultTint: "#F8F4FF",
    svg: `${petalRing(50, 52, 6, 12, 30, 24, "__TINT__")}<g stroke="#C4903F" stroke-width="2.5" stroke-linecap="round">${Array.from({ length: 6 }, (_, i) => `<path d="M50 52 L${50 + 14 * Math.cos((i * 60 - 90) * Math.PI / 180)} ${52 + 14 * Math.sin((i * 60 - 90) * Math.PI / 180)}" />`).join("")}</g><circle cx="50" cy="52" r="4" fill="#8FBF6F"/>`,
  },
  {
    id: "flower-lavender",
    name: "Lavender",
    category: "flower",
    tags: ["lavender", "calm", "purple"],
    defaultTint: "#8B6CD1",
    svg: `<path d="M50 95 L50 40" stroke="#7FAF92" stroke-width="4" stroke-linecap="round"/>${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="42" cy="${38 - i * 7}" rx="7" ry="5" fill="__TINT__" transform="rotate(-22 42 ${38 - i * 7})"/><ellipse cx="58" cy="${38 - i * 7}" rx="7" ry="5" fill="__TINT__" transform="rotate(22 58 ${38 - i * 7})"/>`).join("")}<ellipse cx="50" cy="5" rx="6" ry="7" fill="__TINT__"/>`,
  },
  {
    id: "flower-gypsophila",
    name: "Baby's Breath",
    category: "flower",
    tags: ["gypsophila", "filler", "delicate"],
    defaultTint: "#FFFFFF",
    svg: `<g stroke="#A9C9B4" stroke-width="1.6">${[[50, 90, 30, 30], [50, 90, 62, 24], [50, 90, 78, 52], [50, 90, 20, 60], [50, 90, 46, 12]].map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} Q ${(x1 + x2) / 2 + 6} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none"/>`).join("")}</g>${[[30, 30], [62, 24], [78, 52], [20, 60], [46, 12], [38, 42], [66, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="__TINT__" stroke="#E8E0EE" stroke-width="1"/>`).join("")}`,
  },
  {
    id: "flower-orchid",
    name: "Orchid",
    category: "flower",
    tags: ["orchid", "exotic", "luxury"],
    defaultTint: "#C996CC",
    svg: `<ellipse cx="50" cy="26" rx="13" ry="20" fill="__TINT__"/><ellipse cx="28" cy="52" rx="20" ry="13" fill="__TINT__"/><ellipse cx="72" cy="52" rx="20" ry="13" fill="__TINT__"/><ellipse cx="36" cy="74" rx="12" ry="16" fill="__TINT__" opacity="0.85" transform="rotate(24 36 74)"/><ellipse cx="64" cy="74" rx="12" ry="16" fill="__TINT__" opacity="0.85" transform="rotate(-24 64 74)"/><path d="M50 42 q-10 8 -6 18 q6 8 12 0 q4 -10 -6 -18Z" fill="#8E4B93"/><circle cx="50" cy="52" r="5" fill="#F7E0A3"/>`,
  },
  {
    id: "flower-carnation",
    name: "Carnation",
    category: "flower",
    tags: ["carnation", "admiration", "ruffled"],
    defaultTint: "#E4737F",
    svg: `${petalRing(50, 50, 11, 13, 21, 23, "__TINT__", 0.75)}${petalRing(50, 50, 9, 12, 17, 14, "__TINT__", 0.9)}${petalRing(50, 50, 7, 10, 13, 7, "__TINT__")}<circle cx="50" cy="50" r="7" fill="#ffffff" opacity="0.25"/>`,
  },
  {
    id: "flower-hydrangea",
    name: "Hydrangea",
    category: "flower",
    tags: ["hydrangea", "cluster", "cottage"],
    defaultTint: "#A9BFE8",
    svg: `${[[50, 28], [31, 40], [69, 40], [23, 58], [50, 50], [77, 58], [36, 70], [64, 70], [50, 80]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-6" rx="5.5" ry="7" fill="__TINT__"/><ellipse cx="0" cy="6" rx="5.5" ry="7" fill="__TINT__"/><ellipse cx="-6" cy="0" rx="7" ry="5.5" fill="__TINT__"/><ellipse cx="6" cy="0" rx="7" ry="5.5" fill="__TINT__"/><circle r="2.4" fill="#F7E0A3"/></g>`).join("")}`,
  },
  {
    id: "flower-ranunculus",
    name: "Ranunculus",
    category: "flower",
    tags: ["ranunculus", "charm", "layered"],
    defaultTint: "#F0A87E",
    svg: `${petalRing(50, 50, 10, 15, 20, 26, "__TINT__", 0.85)}<circle cx="50" cy="50" r="30" fill="__TINT__"/><circle cx="50" cy="50" r="24" fill="#ffffff" opacity="0.16"/><circle cx="50" cy="50" r="18" fill="__TINT__"/><circle cx="50" cy="50" r="13" fill="#ffffff" opacity="0.2"/><circle cx="50" cy="50" r="8.5" fill="__TINT__"/><circle cx="50" cy="50" r="3.5" fill="#7A5A3A" opacity="0.55"/>`,
  },
  {
    id: "flower-poppy",
    name: "Poppy",
    category: "flower",
    tags: ["poppy", "bold", "wild"],
    defaultTint: "#E25C4A",
    svg: `<ellipse cx="38" cy="40" rx="21" ry="19" fill="__TINT__" transform="rotate(-18 38 40)"/><ellipse cx="62" cy="40" rx="21" ry="19" fill="__TINT__" transform="rotate(18 62 40)"/><ellipse cx="38" cy="61" rx="21" ry="19" fill="__TINT__" opacity="0.9" transform="rotate(16 38 61)"/><ellipse cx="62" cy="61" rx="21" ry="19" fill="__TINT__" opacity="0.9" transform="rotate(-16 62 61)"/><circle cx="50" cy="50" r="10" fill="#2E2440"/>${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<circle cx="${(50 + 14 * Math.cos(a)).toFixed(1)}" cy="${(50 + 14 * Math.sin(a)).toFixed(1)}" r="2" fill="#463554"/>`; }).join("")}`,
  },
  {
    id: "flower-blossom",
    name: "Cherry Blossom",
    category: "flower",
    tags: ["blossom", "sakura", "spring", "delicate"],
    defaultTint: "#F6CFDD",
    svg: `${petalRing(50, 52, 5, 14, 18, 17, "__TINT__")}<g stroke="#D98CA8" stroke-width="1.8" stroke-linecap="round">${Array.from({ length: 5 }, (_, i) => { const a = ((i * 72 - 90) * Math.PI) / 180; return `<path d="M50 52 L${(50 + 11 * Math.cos(a)).toFixed(1)} ${(52 + 11 * Math.sin(a)).toFixed(1)}"/>`; }).join("")}</g><circle cx="50" cy="52" r="4" fill="#F2C14E"/>`,
  },
  {
    id: "flower-chrysanthemum",
    name: "Chrysanthemum",
    category: "flower",
    tags: ["chrysanthemum", "mum", "autumn"],
    defaultTint: "#EDA548",
    svg: `${petalRing(50, 50, 18, 5, 26, 25, "__TINT__", 0.85)}${petalRing(50, 50, 14, 4.5, 20, 16, "__TINT__")}${petalRing(50, 50, 10, 4, 14, 8, "__TINT__")}<circle cx="50" cy="50" r="6" fill="#D99A17"/>`,
  },
  {
    id: "flower-iris",
    name: "Iris",
    category: "flower",
    tags: ["iris", "royal", "purple"],
    defaultTint: "#6C4AB6",
    svg: `<path d="M50 92 L50 56" stroke="#7FAF92" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="50" cy="28" rx="10" ry="20" fill="__TINT__"/><ellipse cx="36" cy="34" rx="9" ry="17" fill="__TINT__" opacity="0.9" transform="rotate(-28 36 34)"/><ellipse cx="64" cy="34" rx="9" ry="17" fill="__TINT__" opacity="0.9" transform="rotate(28 64 34)"/><path d="M50 46 q-15 4 -19 19 q11 3 19 -6Z" fill="__TINT__" opacity="0.85"/><path d="M50 46 q15 4 19 19 q-11 3 -19 -6Z" fill="__TINT__" opacity="0.85"/><path d="M50 42 L50 56" stroke="#F2C14E" stroke-width="3" stroke-linecap="round"/>`,
  },
  // ── Leaves & greenery ─────────────────────────────────────
  {
    id: "leaf-classic",
    name: "Leaf",
    category: "leaf",
    tags: ["leaf", "green"],
    defaultTint: "#8EC5A4",
    svg: `<path d="M50 92 Q12 60 22 20 Q66 22 62 66 Q58 84 50 92Z" fill="__TINT__"/><path d="M50 88 Q42 56 30 30" stroke="#5E9678" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: "leaf-eucalyptus",
    name: "Eucalyptus",
    category: "leaf",
    tags: ["eucalyptus", "greenery", "modern"],
    defaultTint: "#9DBFAF",
    svg: `<path d="M50 96 L50 8" stroke="#7C9C8C" stroke-width="3" stroke-linecap="round"/>${[86, 72, 58, 44, 30, 16].map((y, i) => `<circle cx="${i % 2 === 0 ? 38 : 62}" cy="${y}" r="9" fill="__TINT__"/>`).join("")}`,
  },
  {
    id: "leaf-fern",
    name: "Fern",
    category: "leaf",
    tags: ["fern", "wild"],
    defaultTint: "#7FAF92",
    svg: `<path d="M50 96 Q48 50 54 6" stroke="#5E8E74" stroke-width="3" fill="none" stroke-linecap="round"/>${[88, 76, 64, 52, 40, 28, 16].map((y, i) => { const len = 26 - i * 3; return `<path d="M50 ${y} q-${len} -6 -${len + 6} -14" stroke="__TINT__" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50 ${y} q${len} -6 ${len + 6} -14" stroke="__TINT__" stroke-width="4" fill="none" stroke-linecap="round"/>`; }).join("")}`,
  },
  // ── Wrapping ──────────────────────────────────────────────
  {
    id: "wrap-classic",
    name: "Classic Wrap",
    category: "wrapping",
    tags: ["wrap", "paper", "cone"],
    defaultTint: "#F7E2E2",
    svg: `<path d="M14 6 L50 96 L8 46 Z" fill="__TINT__"/><path d="M86 6 L50 96 L92 46 Z" fill="__TINT__"/><path d="M22 2 L78 2 L50 88 Z" fill="__TINT__" opacity="0.75"/><path d="M14 6 L50 96 L86 6" stroke="#00000022" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`,
  },
  {
    id: "wrap-kraft",
    name: "Kraft Wrap",
    category: "wrapping",
    tags: ["kraft", "rustic", "natural"],
    defaultTint: "#D9B382",
    svg: `<path d="M12 8 L50 96 L88 8 L72 30 L50 10 L28 30 Z" fill="__TINT__"/><path d="M28 30 L50 96 L72 30 L50 44 Z" fill="#00000018"/><path d="M12 8 L50 96 L88 8" stroke="#00000026" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`,
  },
  {
    id: "wrap-silk",
    name: "Silk Wrap",
    category: "wrapping",
    tags: ["silk", "luxury", "elegant"],
    defaultTint: "#2E2440",
    svg: `<path d="M16 4 Q6 50 50 96 Q94 50 84 4 Q66 26 50 12 Q34 26 16 4Z" fill="__TINT__"/><path d="M50 12 Q40 50 50 96 Q60 50 50 12Z" fill="#ffffff" opacity="0.12"/><path d="M16 4 Q6 50 50 96 Q94 50 84 4" stroke="#ffffff33" stroke-width="1.5" fill="none"/>`,
  },
  {
    id: "wrap-lace",
    name: "Lace Wrap",
    category: "wrapping",
    tags: ["lace", "romantic", "delicate", "wedding"],
    defaultTint: "#FBF3F6",
    svg: `<path d="M14 10 L50 96 L8 48 Z" fill="__TINT__"/><path d="M86 10 L50 96 L92 48 Z" fill="__TINT__"/><path d="M20 6 L80 6 L50 90 Z" fill="__TINT__" opacity="0.82"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${22 + i * 8}" cy="7" r="4.2" fill="__TINT__" opacity="0.85"/>`).join("")}<path d="M20 6 L80 6 L50 90 Z" stroke="#D9A8BC" stroke-width="1.4" stroke-dasharray="1.5 4" fill="none" stroke-linejoin="round"/><path d="M14 10 L50 96 L86 10" stroke="#00000018" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`,
  },
  {
    id: "wrap-mesh",
    name: "Mesh Wrap",
    category: "wrapping",
    tags: ["mesh", "net", "korean", "airy"],
    defaultTint: "#F3E4EF",
    svg: `<path d="M16 8 L50 96 L10 46 Z" fill="__TINT__" opacity="0.9"/><path d="M84 8 L50 96 L90 46 Z" fill="__TINT__" opacity="0.9"/><path d="M24 4 L76 4 L50 90 Z" fill="__TINT__" opacity="0.55"/><g stroke="#ffffff9a" stroke-width="1.3">${["M28 8 L58 66", "M40 8 L64 52", "M52 8 L70 40", "M64 8 L74 26", "M72 8 L42 66", "M60 8 L36 52", "M48 8 L30 40", "M36 8 L26 26"].map((d) => `<path d="${d}"/>`).join("")}</g><path d="M24 4 L76 4 L50 90 Z" stroke="#00000015" stroke-width="1.4" fill="none" stroke-linejoin="round"/>`,
  },
  {
    id: "wrap-velvet",
    name: "Velvet Wrap",
    category: "wrapping",
    tags: ["velvet", "plush", "luxury", "deep"],
    defaultTint: "#5A2A4E",
    svg: `<path d="M14 6 Q4 52 50 96 Q96 52 86 6 L66 22 L50 8 L34 22 Z" fill="__TINT__"/><path d="M34 22 Q40 56 50 96" stroke="#00000038" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M66 22 Q60 56 50 96" stroke="#00000038" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M24 12 Q19 50 46 88" stroke="#ffffff2c" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M14 6 Q4 52 50 96 Q96 52 86 6" stroke="#ffffff26" stroke-width="1.5" fill="none"/>`,
  },
  // ── Ribbons ───────────────────────────────────────────────
  {
    id: "ribbon-bow",
    name: "Ribbon Bow",
    category: "ribbon",
    tags: ["bow", "ribbon"],
    defaultTint: "#D4AF37",
    svg: `<path d="M50 46 q-34 -22 -42 2 q-4 20 22 18 q16 -2 20 -20Z" fill="__TINT__"/><path d="M50 46 q34 -22 42 2 q4 20 -22 18 q-16 -2 -20 -20Z" fill="__TINT__"/><path d="M45 54 q-10 26 -20 36 l14 -2 q10 -14 14 -32Z" fill="__TINT__" opacity="0.85"/><path d="M55 54 q10 26 20 36 l-14 -2 q-10 -14 -14 -32Z" fill="__TINT__" opacity="0.85"/><circle cx="50" cy="50" r="8" fill="#00000033"/><circle cx="50" cy="49" r="7" fill="__TINT__"/>`,
  },
  {
    id: "ribbon-banner",
    name: "Banner Ribbon",
    category: "ribbon",
    tags: ["banner", "label"],
    defaultTint: "#C996CC",
    svg: `<path d="M10 38 L90 38 L90 62 L10 62 Z" fill="__TINT__"/><path d="M10 38 L2 50 L10 62 Z" fill="__TINT__" opacity="0.8"/><path d="M90 38 L98 50 L90 62 Z" fill="__TINT__" opacity="0.8"/><path d="M10 40 L90 40" stroke="#ffffff44" stroke-width="2"/>`,
  },
  {
    id: "ribbon-double-bow",
    name: "Double Bow",
    category: "ribbon",
    tags: ["bow", "double", "layered", "luxury"],
    defaultTint: "#D4AF37",
    svg: `<path d="M50 48 q-40 -26 -48 4 q-4 22 24 18 q18 -4 24 -22Z" fill="__TINT__" opacity="0.8"/><path d="M50 48 q40 -26 48 4 q4 22 -24 18 q-18 -4 -24 -22Z" fill="__TINT__" opacity="0.8"/><path d="M50 46 q-26 -16 -32 4 q-2 14 16 12 q12 -2 16 -16Z" fill="__TINT__"/><path d="M50 46 q26 -16 32 4 q2 14 -16 12 q-12 -2 -16 -16Z" fill="__TINT__"/><path d="M45 56 q-10 24 -20 34 l14 -2 q10 -14 14 -30Z" fill="__TINT__" opacity="0.85"/><path d="M55 56 q10 24 20 34 l-14 -2 q-10 -14 -14 -30Z" fill="__TINT__" opacity="0.85"/><circle cx="50" cy="50" r="8.5" fill="#00000033"/><circle cx="50" cy="49" r="7.5" fill="__TINT__"/><circle cx="47.5" cy="46.5" r="2.5" fill="#ffffff" opacity="0.45"/>`,
  },
  {
    id: "ribbon-satin",
    name: "Satin Ribbon",
    category: "ribbon",
    tags: ["satin", "sash", "flowing", "elegant"],
    defaultTint: "#E8A0BF",
    svg: `<path d="M50 42 q-30 -20 -38 2 q-4 18 20 16 q14 -2 18 -18Z" fill="__TINT__"/><path d="M50 42 q30 -20 38 2 q4 18 -20 16 q-14 -2 -18 -18Z" fill="__TINT__"/><path d="M46 52 q-16 22 -8 44 l10 -6 q-6 -18 4 -34Z" fill="__TINT__" opacity="0.9"/><path d="M54 52 q16 22 8 44 l-10 -6 q6 -18 -4 -34Z" fill="__TINT__" opacity="0.9"/><path d="M18 52 q14 4 24 -4" stroke="#ffffff55" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M82 52 q-14 4 -24 -4" stroke="#ffffff55" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="50" cy="46" r="7" fill="__TINT__"/><circle cx="50" cy="46" r="7" fill="#00000022"/><circle cx="48" cy="44" r="2.2" fill="#ffffff" opacity="0.5"/>`,
  },
  {
    id: "ribbon-string",
    name: "Twine Bow",
    category: "ribbon",
    tags: ["twine", "string", "rustic", "kraft"],
    defaultTint: "#C8A165",
    svg: `<g stroke="__TINT__" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M50 50 q-24 -16 -30 -2 q-4 14 14 14 q12 -1 16 -12"/><path d="M50 50 q24 -16 30 -2 q4 14 -14 14 q-12 -1 -16 -12"/><path d="M47 54 q-8 20 -16 30"/><path d="M53 54 q8 20 16 30"/></g><g stroke="#00000022" stroke-width="1.2" fill="none"><path d="M50 50 q-22 -14 -27 -2"/><path d="M50 50 q22 -14 27 -2"/></g><circle cx="50" cy="51" r="5.5" fill="__TINT__"/><circle cx="50" cy="51" r="5.5" fill="none" stroke="#00000026" stroke-width="1.2"/>`,
  },
  // ── Hearts ────────────────────────────────────────────────
  {
    id: "heart-solid",
    name: "Heart",
    category: "heart",
    tags: ["heart", "love"],
    defaultTint: "#E4556E",
    svg: `<path d="M50 88 C20 64 8 44 16 28 C22 14 42 12 50 30 C58 12 78 14 84 28 C92 44 80 64 50 88Z" fill="__TINT__"/><ellipse cx="34" cy="32" rx="7" ry="10" fill="#ffffff" opacity="0.3" transform="rotate(-24 34 32)"/>`,
  },
  {
    id: "heart-outline",
    name: "Heart Outline",
    category: "heart",
    tags: ["heart", "minimal"],
    defaultTint: "#C4455E",
    svg: `<path d="M50 84 C24 62 12 44 19 30 C25 18 42 16 50 32 C58 16 75 18 81 30 C88 44 76 62 50 84Z" fill="none" stroke="__TINT__" stroke-width="6" stroke-linejoin="round"/>`,
  },
  // ── Butterflies ───────────────────────────────────────────
  {
    id: "butterfly",
    name: "Butterfly",
    category: "butterfly",
    tags: ["butterfly", "spring"],
    defaultTint: "#C996CC",
    svg: `<ellipse cx="34" cy="34" rx="20" ry="24" fill="__TINT__" transform="rotate(-18 34 34)"/><ellipse cx="66" cy="34" rx="20" ry="24" fill="__TINT__" transform="rotate(18 66 34)"/><ellipse cx="36" cy="66" rx="14" ry="17" fill="__TINT__" opacity="0.8" transform="rotate(16 36 66)"/><ellipse cx="64" cy="66" rx="14" ry="17" fill="__TINT__" opacity="0.8" transform="rotate(-16 64 66)"/><ellipse cx="50" cy="50" rx="5" ry="22" fill="#463554"/><path d="M46 26 Q40 12 32 8 M54 26 Q60 12 68 8" stroke="#463554" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="34" cy="30" r="5" fill="#ffffff" opacity="0.45"/><circle cx="66" cy="30" r="5" fill="#ffffff" opacity="0.45"/>`,
  },
  {
    id: "butterfly-small",
    name: "Small Butterfly",
    category: "butterfly",
    tags: ["butterfly", "delicate"],
    defaultTint: "#F2C14E",
    svg: `<ellipse cx="38" cy="42" rx="16" ry="18" fill="__TINT__" transform="rotate(-20 38 42)"/><ellipse cx="62" cy="42" rx="16" ry="18" fill="__TINT__" transform="rotate(20 62 42)"/><ellipse cx="50" cy="52" rx="4" ry="16" fill="#5C4620"/><path d="M47 34 Q43 24 37 20 M53 34 Q57 24 63 20" stroke="#5C4620" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  },
  // ── Balloons ──────────────────────────────────────────────
  {
    id: "balloon",
    name: "Balloon",
    category: "balloon",
    tags: ["balloon", "birthday", "party"],
    defaultTint: "#E4737F",
    svg: `<path d="M50 66 Q54 74 50 96" stroke="#9B8FA5" stroke-width="2" fill="none"/><ellipse cx="50" cy="36" rx="26" ry="31" fill="__TINT__"/><path d="M44 62 L50 70 L56 62 Z" fill="__TINT__"/><ellipse cx="40" cy="24" rx="8" ry="12" fill="#ffffff" opacity="0.35" transform="rotate(-18 40 24)"/>`,
  },
  {
    id: "balloon-heart",
    name: "Heart Balloon",
    category: "balloon",
    tags: ["balloon", "love", "valentine"],
    defaultTint: "#D4AF37",
    svg: `<path d="M50 62 Q56 74 48 96" stroke="#9B8FA5" stroke-width="2" fill="none"/><path d="M50 64 C28 48 20 34 26 23 C31 13 45 12 50 25 C55 12 69 13 74 23 C80 34 72 48 50 64Z" fill="__TINT__"/><ellipse cx="38" cy="28" rx="5" ry="8" fill="#ffffff" opacity="0.4" transform="rotate(-20 38 28)"/>`,
  },
  // ── Sparkles & party ──────────────────────────────────────
  {
    id: "sparkle",
    name: "Sparkle",
    category: "sparkle",
    tags: ["sparkle", "magic"],
    defaultTint: "#D4AF37",
    svg: `<path d="M50 6 Q55 40 94 50 Q55 60 50 94 Q45 60 6 50 Q45 40 50 6Z" fill="__TINT__"/><path d="M76 12 Q78 24 90 26 Q78 28 76 40 Q74 28 62 26 Q74 24 76 12Z" fill="__TINT__" opacity="0.75"/>`,
  },
  {
    id: "sparkle-stars",
    name: "Star Cluster",
    category: "sparkle",
    tags: ["stars", "night"],
    defaultTint: "#F2C14E",
    svg: `${[[30, 30, 16], [70, 22, 10], [72, 66, 13], [26, 72, 9]].map(([x, y, s]) => `<path d="M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z" fill="__TINT__"/>`).join("")}`,
  },
  {
    id: "confetti",
    name: "Confetti",
    category: "sparkle",
    tags: ["confetti", "party", "birthday"],
    defaultTint: "#C996CC",
    svg: `${[[18, 22, -20, "__TINT__"], [44, 12, 24, "#F2C14E"], [74, 26, -30, "#8EC5A4"], [26, 56, 30, "#E4737F"], [60, 48, -14, "__TINT__"], [84, 62, 18, "#F2C14E"], [40, 82, -26, "#8EC5A4"], [70, 86, 20, "__TINT__"]].map(([x, y, r, c]) => `<rect x="${Number(x) - 5}" y="${Number(y) - 8}" width="10" height="16" rx="3" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join("")}`,
  },
  // ── Extras ────────────────────────────────────────────────
  {
    id: "teddy",
    name: "Teddy Bear",
    category: "extra",
    tags: ["teddy", "cute", "gift"],
    defaultTint: "#C89A6B",
    svg: `<circle cx="30" cy="24" r="12" fill="__TINT__"/><circle cx="70" cy="24" r="12" fill="__TINT__"/><circle cx="30" cy="24" r="6" fill="#F3DEC5"/><circle cx="70" cy="24" r="6" fill="#F3DEC5"/><circle cx="50" cy="40" r="24" fill="__TINT__"/><ellipse cx="50" cy="76" rx="24" ry="21" fill="__TINT__"/><ellipse cx="50" cy="80" rx="13" ry="12" fill="#F3DEC5"/><ellipse cx="50" cy="47" rx="10" ry="8" fill="#F3DEC5"/><circle cx="42" cy="36" r="3" fill="#3A2A1C"/><circle cx="58" cy="36" r="3" fill="#3A2A1C"/><ellipse cx="50" cy="45" rx="4" ry="3" fill="#3A2A1C"/><circle cx="24" cy="66" r="9" fill="__TINT__"/><circle cx="76" cy="66" r="9" fill="__TINT__"/>`,
  },
  {
    id: "chocolate",
    name: "Chocolate Box",
    category: "extra",
    tags: ["chocolate", "sweet", "gift"],
    defaultTint: "#6B4226",
    svg: `<rect x="14" y="30" width="72" height="50" rx="8" fill="__TINT__"/><rect x="14" y="30" width="72" height="14" rx="7" fill="#00000026"/><rect x="44" y="26" width="12" height="58" fill="#D4AF37"/><rect x="10" y="44" width="80" height="12" rx="6" fill="#D4AF37"/><circle cx="50" cy="50" r="9" fill="#B8962E"/>`,
  },
  {
    id: "gift-tag",
    name: "Gift Tag",
    category: "extra",
    tags: ["tag", "label", "message"],
    defaultTint: "#FBF3E4",
    svg: `<path d="M30 14 L74 14 Q84 14 84 24 L84 78 Q84 88 74 88 L30 88 Q20 88 20 78 L20 40 Z" fill="__TINT__" stroke="#D9C9A8" stroke-width="2" transform="rotate(-8 52 51)"/><circle cx="32" cy="30" r="5" fill="none" stroke="#D9C9A8" stroke-width="2.5" transform="rotate(-8 52 51)"/><path d="M34 48 L72 44 M35 60 L73 56 M36 72 L64 69" stroke="#C9B896" stroke-width="3" stroke-linecap="round" transform="rotate(-8 52 51)"/>`,
  },
  {
    id: "note-card",
    name: "Gift Tag",
    category: "extra",
    tags: ["note", "card", "tag", "message", "letter"],
    defaultTint: "#FFFDF6",
    // Drawn straight (no baked-in rotation) so layer rotation + text
    // rotation line up exactly. Punched hole at the top for the thread.
    svg: `<rect x="18" y="26" width="64" height="56" rx="7" fill="__TINT__" stroke="#E3D3BC" stroke-width="2"/><circle cx="50" cy="33" r="3.2" fill="#F4EFE2" stroke="#D9CBB4" stroke-width="1.4"/><circle cx="50" cy="33" r="1.6" fill="#C9BBA0" opacity="0.55"/>`,
  },
  {
    id: "tag-thread",
    name: "Tag Thread",
    category: "extra",
    tags: ["thread", "string", "twine", "tag"],
    defaultTint: "#C9A24B",
    // Coiled around the wrapper's bottom edge (left end), the thread arcs
    // up and OVER, then drops into the tag's hole from above (right end) -
    // so it never lies across the card's face.
    svg: `<path d="M10 62 q -7 2 -6 8 q 1 6 8 5 q 6 -1 5 -7 q -1 -5 -6 -4" fill="none" stroke="__TINT__" stroke-width="2.4" stroke-linecap="round"/><path d="M10 62 C 28 50 44 32 58 23 C 70 15 80 15 84 26 C 86 32 86 38 86 43" fill="none" stroke="__TINT__" stroke-width="2.6" stroke-linecap="round"/><circle cx="86" cy="47" r="3.2" fill="none" stroke="__TINT__" stroke-width="2"/>`,
  },
  {
    id: "envelope",
    name: "Envelope",
    category: "extra",
    tags: ["envelope", "letter", "message"],
    defaultTint: "#F7E2E2",
    svg: `<rect x="10" y="26" width="80" height="52" rx="6" fill="__TINT__" stroke="#D9B8B8" stroke-width="2"/><path d="M10 32 L50 60 L90 32" stroke="#D9B8B8" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="50" cy="58" r="7" fill="#D4AF37"/>`,
  },
  // ── Shapes ────────────────────────────────────────────────
  {
    id: "shape-circle",
    name: "Circle",
    category: "shape",
    tags: ["circle", "shape"],
    defaultTint: "#C996CC",
    svg: `<circle cx="50" cy="50" r="42" fill="__TINT__"/>`,
  },
  {
    id: "shape-blob",
    name: "Blob",
    category: "shape",
    tags: ["blob", "organic"],
    defaultTint: "#F7E2E2",
    svg: `<path d="M50 6 Q84 10 90 44 Q94 76 62 90 Q28 98 14 68 Q4 38 26 18 Q38 8 50 6Z" fill="__TINT__"/>`,
  },
  {
    id: "shape-star",
    name: "Star",
    category: "shape",
    tags: ["star", "shape"],
    defaultTint: "#F2C14E",
    svg: `<path d="M50 6 L61 36 L94 38 L68 58 L77 90 L50 71 L23 90 L32 58 L6 38 L39 36 Z" fill="__TINT__"/>`,
  },
  // ── Frames ────────────────────────────────────────────────
  {
    id: "frame-arch",
    name: "Arch Frame",
    category: "frame",
    tags: ["frame", "arch", "elegant"],
    defaultTint: "#D4AF37",
    svg: `<path d="M17 94 L17 44 Q17 8 50 8 Q83 8 83 44 L83 94" fill="none" stroke="__TINT__" stroke-width="3.5" stroke-linecap="round"/><path d="M23 94 L23 46 Q23 15 50 15 Q77 15 77 46 L77 94" fill="none" stroke="__TINT__" stroke-width="1.6" opacity="0.55" stroke-linecap="round"/><rect x="46.5" y="1" width="7" height="7" rx="1" transform="rotate(45 50 4.5)" fill="__TINT__"/><g fill="__TINT__"><circle cx="17" cy="94" r="3.2"/><circle cx="83" cy="94" r="3.2"/><circle cx="23" cy="94" r="2" opacity="0.6"/><circle cx="77" cy="94" r="2" opacity="0.6"/></g><g stroke="__TINT__" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"><path d="M17 62 q-7 -3 -9 -10"/><path d="M83 62 q7 -3 9 -10"/></g><circle cx="8" cy="50" r="1.8" fill="__TINT__" opacity="0.7"/><circle cx="92" cy="50" r="1.8" fill="__TINT__" opacity="0.7"/>`,
  },
  {
    id: "frame-scallop",
    name: "Scallop Frame",
    category: "frame",
    tags: ["frame", "circle", "cute", "petal"],
    defaultTint: "#C996CC",
    svg: `${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const x = 50 + 41 * Math.cos(a); const y = 50 + 41 * Math.sin(a); const deg = (a * 180) / Math.PI + 90; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5.5" ry="8" fill="__TINT__" opacity="${i % 2 === 0 ? 1 : 0.75}" transform="rotate(${deg.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join("")}${Array.from({ length: 16 }, (_, i) => { const a = ((i + 0.5) / 16) * Math.PI * 2; const x = 50 + 48 * Math.cos(a); const y = 50 + 48 * Math.sin(a); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="__TINT__" opacity="0.65"/>`; }).join("")}<circle cx="50" cy="50" r="35" fill="#ffffff" opacity="0.92"/><circle cx="50" cy="50" r="31" fill="none" stroke="__TINT__" stroke-width="1.2" stroke-dasharray="0.5 5" stroke-linecap="round" opacity="0.7"/>`,
  },
  {
    id: "frame-wreath",
    name: "Wreath Frame",
    category: "frame",
    tags: ["frame", "wreath", "botanical", "wedding"],
    defaultTint: "#E8A0BF",
    svg: `${Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2 + 0.22; const x = 50 + 40 * Math.cos(a); const y = 50 + 40 * Math.sin(a); const deg = (a * 180) / Math.PI + 64; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="9" fill="${i % 2 === 0 ? "#8EC5A4" : "#A8D4B8"}" transform="rotate(${deg.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join("")}<circle cx="50" cy="50" r="40" fill="none" stroke="#7C9C8C" stroke-width="1.4" opacity="0.55"/>${[90, 210, 330].map((deg) => { const a = (deg * Math.PI) / 180; const x = 50 + 40 * Math.cos(a); const y = 50 + 40 * Math.sin(a); return `${Array.from({ length: 5 }, (_, j) => { const pa = (j / 5) * Math.PI * 2; return `<circle cx="${(x + 4.6 * Math.cos(pa)).toFixed(1)}" cy="${(y + 4.6 * Math.sin(pa)).toFixed(1)}" r="3" fill="__TINT__"/>`; }).join("")}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#F7E0A3"/>`; }).join("")}${[30, 150, 270].map((deg) => { const a = (deg * Math.PI) / 180; return `<circle cx="${(50 + 40 * Math.cos(a)).toFixed(1)}" cy="${(50 + 40 * Math.sin(a)).toFixed(1)}" r="2.2" fill="#ffffff" stroke="#F0E2EE" stroke-width="0.8"/>`; }).join("")}`,
  },
  // Border frames are authored 4:5 inside the box (x 12-88, y 4-96) so at
  // scale 10 on an 800×1000 card they wrap the whole page like a real border.
  {
    id: "frame-border-classic",
    name: "Classic Border",
    category: "frame",
    tags: ["frame", "border", "card", "elegant"],
    defaultTint: "#D4AF37",
    svg: `<rect x="12" y="4" width="76" height="92" rx="2.5" fill="none" stroke="__TINT__" stroke-width="1.8"/><rect x="15" y="7" width="70" height="86" rx="1.5" fill="none" stroke="__TINT__" stroke-width="0.7" opacity="0.6"/>${[[12, 4], [88, 4], [12, 96], [88, 96]].map(([x, y]) => `<rect x="${x - 2.2}" y="${y - 2.2}" width="4.4" height="4.4" transform="rotate(45 ${x} ${y})" fill="__TINT__"/>`).join("")}<path d="M44 4 L50 2 L56 4 L50 6 Z" fill="__TINT__"/><path d="M44 96 L50 94 L56 96 L50 98 Z" fill="__TINT__"/><circle cx="12" cy="50" r="1.4" fill="__TINT__" opacity="0.8"/><circle cx="88" cy="50" r="1.4" fill="__TINT__" opacity="0.8"/>`,
  },
  {
    id: "frame-border-floral",
    name: "Floral Border",
    category: "frame",
    tags: ["frame", "border", "card", "floral", "blossom"],
    defaultTint: "#E8A0BF",
    svg: `<rect x="12" y="4" width="76" height="92" rx="4" fill="none" stroke="__TINT__" stroke-width="1.2" opacity="0.75"/>${[[12, 4], [88, 4], [12, 96], [88, 96]].map(([x, y]) => `${Array.from({ length: 5 }, (_, j) => { const pa = (j / 5) * Math.PI * 2 + 0.4; return `<circle cx="${(x + 3.4 * Math.cos(pa)).toFixed(1)}" cy="${(y + 3.4 * Math.sin(pa)).toFixed(1)}" r="2.2" fill="__TINT__"/>`; }).join("")}<circle cx="${x}" cy="${y}" r="1.9" fill="#F7E0A3"/><ellipse cx="${x + (x < 50 ? 6.5 : -6.5)}" cy="${y}" rx="3.4" ry="1.7" fill="#8EC5A4" opacity="0.9"/><ellipse cx="${x}" cy="${y + (y < 50 ? 6.5 : -6.5)}" rx="1.7" ry="3.4" fill="#8EC5A4" opacity="0.9"/>`).join("")}${[30, 50, 70].map((x) => `<circle cx="${x}" cy="4" r="1.1" fill="__TINT__" opacity="0.7"/><circle cx="${x}" cy="96" r="1.1" fill="__TINT__" opacity="0.7"/>`).join("")}${[27, 50, 73].map((y) => `<circle cx="12" cy="${y}" r="1.1" fill="__TINT__" opacity="0.7"/><circle cx="88" cy="${y}" r="1.1" fill="__TINT__" opacity="0.7"/>`).join("")}`,
  },
  {
    id: "frame-corners",
    name: "Corner Flourish",
    category: "frame",
    tags: ["frame", "corners", "flourish", "minimal"],
    defaultTint: "#C996CC",
    svg: `${[[14, 6, 1, 1], [86, 6, -1, 1], [14, 94, 1, -1], [86, 94, -1, -1]].map(([x, y, sx, sy]) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})"><path d="M0 12 L0 0 L12 0" fill="none" stroke="__TINT__" stroke-width="1.8" stroke-linecap="round"/><path d="M2.5 8 Q2.5 2.5 8 2.5" fill="none" stroke="__TINT__" stroke-width="1" opacity="0.65"/><circle cx="14.5" cy="0" r="1.5" fill="__TINT__"/><circle cx="0" cy="14.5" r="1.5" fill="__TINT__"/><path d="M5 5 q3 -3 6 0" fill="none" stroke="__TINT__" stroke-width="0.9" opacity="0.5"/></g>`).join("")}`,
  },
];

export const ASSET_MAP: Record<string, AssetDef> = Object.fromEntries(
  ASSETS.map((a) => [a.id, a])
);

export const ASSET_IDS = ASSETS.map((a) => a.id);

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  flower: "Flowers",
  leaf: "Greenery",
  wrapping: "Wrapping",
  ribbon: "Ribbons",
  heart: "Hearts",
  butterfly: "Butterflies",
  balloon: "Balloons",
  sparkle: "Sparkles",
  extra: "Extras",
  shape: "Shapes",
  frame: "Frames",
};

/** Full standalone SVG markup for an asset, with tint applied. */
export function assetSvg(asset: AssetDef, tint?: string | null): string {
  const body = asset.svg.replaceAll("__TINT__", tint || asset.defaultTint);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;
}
