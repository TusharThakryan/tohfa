/**
 * Local design composer - Tohfa's built-in "designer brain".
 * Powers AI Studio when no ANTHROPIC_API_KEY is configured, the template
 * library, and the offline fallback for chat refinement. Deterministic per
 * prompt (seeded RNG), so the same wish always blooms the same way.
 */
import type { GiftType } from "@/lib/scene/types";
import type { RefineOp, SceneSpec, SpecLayer, SpecPage, SpecText } from "./spec";

function seededRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

interface MessagePool {
  openers: string[];
  middles: string[];
  closers: string[];
}

interface Mood {
  flowers: string[];
  tints: string[];
  wrap: { asset: string; tint: string };
  ribbonAsset: string;
  ribbonTint: string;
  background: string;
  extras: string[];
  greeting: string;
  title: string;
  frontTitle: string;
  signature: string;
  message: MessagePool;
}

const MOODS: Record<string, Partial<Mood> & { keywords: string[] }> = {
  romance: {
    keywords: ["wife", "husband", "love", "romantic", "valentine", "anniversary", "girlfriend", "boyfriend", "partner"],
    flowers: ["flower-rose", "flower-peony", "flower-ranunculus", "flower-orchid"],
    tints: ["#C4455E", "#E8A0BF", "#8E4B93"],
    ribbonAsset: "ribbon-satin",
    extras: ["heart-solid", "balloon-heart"],
    greeting: "Every moment with you is a gift.",
    title: "Velvet Devotion",
    frontTitle: "With All My Love",
    signature: "With all my love,",
    message: {
      openers: [
        "From the moment you came into my life, even the most ordinary days have felt like small celebrations.",
        "Some people search their whole lives for what I found in you.",
        "Every time I think I couldn't possibly love you more, you go and prove me wrong.",
      ],
      middles: [
        "Your laugh is still my favorite sound, and your hand in mine is still my favorite place to be.",
        "Thank you for the thousand little kindnesses you give me without even noticing.",
        "Loving you is the easiest thing I have ever done, and the thing I am proudest of.",
      ],
      closers: [
        "Here's to us - today, tomorrow, and every day after.",
        "Forever isn't nearly long enough, but it's a beautiful place to start.",
        "You are, and will always be, my favorite hello.",
      ],
    },
  },
  birthday: {
    keywords: ["birthday", "bday", "celebrate", "party"],
    flowers: ["flower-daisy", "flower-tulip", "flower-sunflower", "flower-poppy"],
    tints: ["#F2C14E", "#E4737F", "#C996CC"],
    wrap: { asset: "wrap-mesh", tint: "#F7E3ED" },
    ribbonAsset: "ribbon-double-bow",
    extras: ["balloon", "confetti", "sparkle"],
    background: "linear-gradient(170deg, #FFF8EE, #FDEDF3)",
    greeting: "Another year more wonderful. Happy birthday!",
    title: "Confetti Bloom",
    frontTitle: "Happy Birthday!",
    signature: "With love,",
    message: {
      openers: [
        "Another year of you - and honestly, the world is luckier for it.",
        "Today the calendar finally catches up with something everyone already knows: you deserve to be celebrated.",
        "Happy birthday to someone who makes every room brighter just by walking into it.",
      ],
      middles: [
        "May this year bring you mornings that feel soft, plans that actually work out, and cake that never runs out.",
        "I hope every candle you blow out turns into a wish that really does come true.",
        "Don't count the years - count the laughs, the adventures, and the people who adore you.",
      ],
      closers: [
        "Have the happiest of birthdays. You've more than earned it.",
        "Go celebrate - this day belongs entirely to you.",
        "Wishing you your best year yet, from the first slice of cake to the last.",
      ],
    },
  },
  wedding: {
    keywords: ["wedding", "bride", "engagement", "marry", "marriage"],
    flowers: ["flower-lily", "flower-peony", "flower-blossom", "flower-gypsophila"],
    tints: ["#F8F4FF", "#F3E3EC", "#FFFFFF"],
    wrap: { asset: "wrap-lace", tint: "#FBF4F8" },
    ribbonAsset: "ribbon-satin",
    ribbonTint: "#D4AF37",
    background: "linear-gradient(180deg, #FDFBF7, #F4EFF7)",
    extras: ["butterfly-small"],
    greeting: "To a lifetime of beautiful days.",
    title: "Ivory Promise",
    frontTitle: "Congratulations",
    signature: "With love and joy,",
    message: {
      openers: [
        "Today two beautiful stories become one, and everyone who loves you gets to watch it begin.",
        "Some love is quiet and some love is loud - yours is the kind people write about.",
      ],
      middles: [
        "May your home be full of easy laughter, patient hearts, and dances in the kitchen.",
        "May every year together be kinder, deeper, and sweeter than the one before it.",
        "Hold on to each other on the hard days, and celebrate loudly on the good ones.",
      ],
      closers: [
        "Congratulations on your wedding - and on choosing each other so wonderfully.",
        "To a lifetime of beautiful days, starting with this one.",
      ],
    },
  },
  sympathy: {
    keywords: ["sympathy", "sorry", "condolence", "loss", "miss you", "get well", "recover"],
    flowers: ["flower-lily", "flower-chrysanthemum", "flower-lavender"],
    tints: ["#F8F4FF", "#DCD3EE", "#8B6CD1"],
    wrap: { asset: "wrap-classic", tint: "#EFEBF4" },
    ribbonTint: "#C9BCE4",
    background: "#FAF8FD",
    extras: [],
    greeting: "Thinking of you, today and always.",
    title: "Quiet Comfort",
    frontTitle: "Thinking of You",
    signature: "With care,",
    message: {
      openers: [
        "There are no perfect words for a moment like this, so instead I'm sending you all my gentleness.",
        "I've been thinking of you constantly, and I wanted you to have something soft to hold on to.",
      ],
      middles: [
        "Please be patient and tender with yourself - take all the time your heart needs.",
        "You don't have to be strong today, or tomorrow, or any day you don't feel like it.",
        "Whenever things get heavy, remember there are people who love you and are ready to help carry it.",
      ],
      closers: [
        "I'm here - today, next week, and long after. Always.",
        "Sending you comfort, courage, and quiet strength.",
      ],
    },
  },
  friendship: {
    keywords: ["friend", "thank", "congrats", "congratulations", "cheer", "sunshine", "mom", "mother", "dad", "father"],
    flowers: ["flower-sunflower", "flower-daisy", "flower-chrysanthemum"],
    tints: ["#F5B82E", "#FFFFFF", "#E4737F"],
    wrap: { asset: "wrap-kraft", tint: "#E3C293" },
    ribbonAsset: "ribbon-string",
    ribbonTint: "#C8A165",
    background: "linear-gradient(175deg, #FFFDF4, #FFF4F8)",
    extras: ["butterfly", "sparkle-stars"],
    greeting: "You make everything brighter.",
    title: "Golden Hour",
    frontTitle: "For Someone Wonderful",
    signature: "With love,",
    message: {
      openers: [
        "Some people make life easier just by being in it - you're exactly that person for me.",
        "I don't say it nearly enough, so this card is saying it for me: you're wonderful.",
      ],
      middles: [
        "Thank you for every pep talk, every late-night laugh, and every time you showed up without being asked.",
        "The world hands out very few people like you, and somehow I got lucky enough to know one.",
      ],
      closers: [
        "Thank you for being exactly who you are - never, ever change.",
        "Here's to many more years of us.",
      ],
    },
  },
};

const DEFAULT_MOOD: Mood = {
  flowers: ["flower-peony", "flower-rose", "flower-hydrangea"],
  tints: ["#C996CC", "#E8A0BF", "#8B6CD1"],
  wrap: { asset: "wrap-classic", tint: "#F7E2E2" },
  ribbonAsset: "ribbon-bow",
  ribbonTint: "#D4AF37",
  background: "linear-gradient(175deg, #FFF9FB, #F6EEF8)",
  extras: ["butterfly-small"],
  greeting: "Made with love, just for you.",
  title: "Soft Serenade",
  frontTitle: "For You",
  signature: "With love,",
  message: {
    openers: [
      "Some feelings are too big for ordinary words, so I picked flowers to say them instead.",
      "This comes to you with more love than one card can reasonably hold.",
    ],
    middles: [
      "I hope it finds you smiling, and reminds you just how much you're thought of.",
      "You deserve every soft and lovely thing today has to offer.",
    ],
    closers: [
      "Made with love, just for you.",
      "Thinking of you, today and always.",
    ],
  },
};

const FLOWER_WORDS: Record<string, string> = {
  rose: "flower-rose", peony: "flower-peony", peonies: "flower-peony",
  tulip: "flower-tulip", daisy: "flower-daisy", daisies: "flower-daisy",
  sunflower: "flower-sunflower", lily: "flower-lily", lilies: "flower-lily",
  lavender: "flower-lavender", orchid: "flower-orchid",
  carnation: "flower-carnation", hydrangea: "flower-hydrangea",
  ranunculus: "flower-ranunculus", poppy: "flower-poppy", poppies: "flower-poppy",
  blossom: "flower-blossom", sakura: "flower-blossom",
  chrysanthemum: "flower-chrysanthemum", mum: "flower-chrysanthemum", mums: "flower-chrysanthemum",
  iris: "flower-iris",
};

/** Break text into short centered lines; returns the lines. */
function wrapLines(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if (cur && (cur + " " + w).length > maxChars) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Break text into short centered lines that fit a given measure. */
function wrapText(text: string, maxChars: number, maxLines = 4): string {
  const lines: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if (cur && (cur + " " + w).length > maxChars) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines).join("\n");
}

const COLOR_WORDS: Record<string, string[]> = {
  red: ["#C4455E", "#A93546", "#E4737F"],
  pink: ["#E8A0BF", "#F3BCD1", "#DB7A9E"],
  purple: ["#8B6CD1", "#6C4AB6", "#C996CC"],
  white: ["#FFFFFF", "#F6F1FA", "#EFE9F4"],
  yellow: ["#F2C14E", "#F5B82E", "#F7D77E"],
  blue: ["#7C9CD9", "#5B7FC7", "#A9BFE8"],
  gold: ["#D4AF37", "#ECD9A0", "#B8962E"],
  pastel: ["#F3D1DC", "#D9CCEF", "#CBE5D8"],
};

/** Word-prefix match: "rose" hits "roses" but "loss" no longer hits "blossom". */
function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word}`).test(text);
}

const RECIPIENTS: [RegExp, string][] = [
  [/\bwife\b/, "my beautiful wife"],
  [/\bhusband\b/, "my wonderful husband"],
  [/\bgirlfriend\b|\bboyfriend\b|\bpartner\b/, "my love"],
  [/\bmom\b|\bmother\b/, "Mom"],
  [/\bdad\b|\bfather\b/, "Dad"],
  [/\bsister\b/, "my dear sister"],
  [/\bbrother\b/, "my dear brother"],
  [/\bgrandma\b|\bgrandmother\b/, "Grandma"],
  [/\bgrandpa\b|\bgrandfather\b/, "Grandpa"],
  [/\bteacher\b/, "my favorite teacher"],
  [/\bbest friend\b|\bfriend\b/, "my friend"],
];

const TITLE_OVERRIDES: [RegExp, string][] = [
  [/mother'?s day/, "Happy Mother's Day"],
  [/father'?s day/, "Happy Father's Day"],
  [/congrat/, "Congratulations!"],
  [/thank/, "Thank You"],
  [/get well|recover/, "Get Well Soon"],
  [/miss you/, "Missing You"],
  [/valentine/, "Be My Valentine"],
];

const PERSONAL_LINES: ((who: string) => string)[] = [
  (w) => `Truly, ${w}, the world is softer because of people like you.`,
  (w) => `${w[0].toUpperCase()}${w.slice(1)}, I hope you can feel how much love is folded into this little card.`,
  (w) => `Never forget, ${w}, how much you mean to everyone lucky enough to know you.`,
];

/** Compose two heartfelt paragraphs from the wish, naming the recipient. */
function composeMessage(mood: Mood, rng: () => number, who: string | null): { p1: string; p2: string } {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length) % arr.length];
  const mids = mood.message.middles;
  const i1 = Math.floor(rng() * mids.length) % mids.length;
  const i2 = mids.length > 1 ? (i1 + 1 + Math.floor(rng() * (mids.length - 1))) % mids.length : i1;
  const p1 = `${pick(mood.message.openers)} ${mids[i1]}`;
  const personal = who ? `${pick(PERSONAL_LINES)(who)} ` : "";
  const p2 = `${personal}${i2 === i1 ? "" : mids[i2] + " "}${pick(mood.message.closers)}`;
  return { p1, p2 };
}

interface Palette {
  mood: Mood;
  flowers: string[];
  tints: string[];
  wrap: { asset: string; tint: string };
  ribbon: { asset: string; tint: string };
  luxury: boolean;
  moodKey: string | null;
  recipient: string | null;
  rng: () => number;
}

/** Capitalised words that are not people's names. */
const NAME_STOP = new Set([
  "A", "An", "The", "I", "My", "For", "To", "And", "With", "On", "Our", "Her", "His",
  "Mom", "Dad", "Grandma", "Grandpa", "Mother", "Mothers", "Father", "Fathers",
  "Valentine", "Valentines", "Christmas", "Diwali", "Eid", "Easter", "Day",
  "Birthday", "Anniversary", "Wedding", "New", "Year", "Happy", "Get", "Well", "Thank", "You",
]);

/** Find a proper name in the wish, e.g. "a birthday card for Sarah". */
function findName(prompt: string): string | null {
  const words = prompt.match(/\b[A-Z][a-z]{2,}\b/g) ?? [];
  for (const w of words) {
    if (prompt.indexOf(w) === 0) continue;
    if (!NAME_STOP.has(w)) return w;
  }
  return null;
}

function readPrompt(prompt: string): Palette {
  const p = prompt.toLowerCase();
  const rng = seededRng(prompt);

  // Score every mood by keyword hits; occasion moods outrank relationship
  // words so "a birthday card for my mom who loves tulips" reads as birthday,
  // not romance ("loves") or friendship ("mom").
  const OCCASIONS = ["birthday", "wedding", "sympathy"];
  let moodKey: string | undefined;
  let best = 0;
  for (const k of Object.keys(MOODS)) {
    const hits = MOODS[k].keywords.filter((w) => hasWord(p, w)).length;
    const score = hits * (OCCASIONS.includes(k) ? 2 : 1);
    if (score > best) {
      best = score;
      moodKey = k;
    }
  }
  const mood: Mood = { ...DEFAULT_MOOD, ...(moodKey ? MOODS[moodKey] : {}) };

  // Explicitly named flowers override the mood's picks
  const named = Object.keys(FLOWER_WORDS).filter((w) => hasWord(p, w)).map((w) => FLOWER_WORDS[w]);
  const flowers = named.length ? [...new Set(named)] : mood.flowers;

  // Color direction: one named color uses its full range; several named
  // colors blend their leads so "red and white roses" honors both.
  const colorKeys = Object.keys(COLOR_WORDS).filter((k) => hasWord(p, k));
  const tints =
    colorKeys.length === 0
      ? mood.tints
      : colorKeys.length === 1
        ? COLOR_WORDS[colorKeys[0]]
        : colorKeys.map((k) => COLOR_WORDS[k][0]);

  const luxury = /luxur|premium|elegant|royal|extravagant|lavish/.test(p);
  // A mood with its own signature wrap/ribbon (bridal lace, birthday mesh…)
  // keeps it even when the prompt sounds luxurious; explicit words still win.
  const moodStyled = !!(moodKey && (MOODS[moodKey].wrap || MOODS[moodKey].ribbonAsset));

  // Wrapping: explicit style words win, then darkness/luxury/rustic, then mood
  const wrap = /\blace\b/.test(p)
    ? { asset: "wrap-lace", tint: "#FBF3F6" }
    : /\bmesh\b|\bnetting\b/.test(p)
      ? { asset: "wrap-mesh", tint: "#F3E4EF" }
      : /\bvelvet\b|\bplush\b/.test(p)
        ? { asset: "wrap-velvet", tint: "#5A2A4E" }
        : /black|dark|night/.test(p)
          ? { asset: "wrap-silk", tint: "#241C33" }
          : /\bsilk\b/.test(p) || (luxury && !moodStyled)
            ? { asset: "wrap-silk", tint: "#3A2C52" }
            : /rustic|kraft|natural|earthy/.test(p)
              ? { asset: "wrap-kraft", tint: "#D9B382" }
              : mood.wrap;

  // Ribbon: explicit style words win, then luxury, then mood
  const ribbon = /\btwine\b|\bstring\b|rustic|kraft/.test(p)
    ? { asset: "ribbon-string", tint: "#C8A165" }
    : /double\s+(?:gold\s+)?bow|layered bow/.test(p)
      ? { asset: "ribbon-double-bow", tint: /gold/.test(p) ? "#D4AF37" : mood.ribbonTint }
      : /\bsatin\b|\bsash\b|flowing ribbon|trailing/.test(p)
        ? { asset: "ribbon-satin", tint: mood.ribbonTint }
        : luxury && !moodStyled
          ? { asset: "ribbon-double-bow", tint: "#D4AF37" }
          : { asset: mood.ribbonAsset, tint: mood.ribbonTint };

  const relation = RECIPIENTS.find(([re]) => re.test(p))?.[1] ?? null;
  const recipient = findName(prompt) ?? relation;

  const titleOverride = TITLE_OVERRIDES.find(([re]) => re.test(p))?.[1];
  if (titleOverride) mood.frontTitle = titleOverride;

  return { mood, flowers, tints, wrap, ribbon, luxury, moodKey: moodKey ?? null, recipient, rng };
}

// ── Bouquet composition ──────────────────────────────────────

function composeBouquet(ctx: Palette): SceneSpec {
  const { mood, flowers, tints, wrap, ribbon, luxury, recipient, rng } = ctx;
  const layers: SpecLayer[] = [];
  const cx = 0.5;
  const cy = 0.35; // bloom dome center

  // 1. Greenery ring behind the dome - each leaf points outward from the
  // center, so the foliage reads as a tidy collar rather than a scatter.
  const leafAngles = luxury ? [168, 141, 114, 90, 66, 39, 12] : [165, 132, 96, 60, 24];
  const greens = ["leaf-eucalyptus", "leaf-fern", "leaf-classic"];
  leafAngles.forEach((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const dist = 0.2 + (i % 2) * 0.022;
    layers.push({
      asset: greens[i % greens.length],
      x: cx + Math.cos(rad) * dist * 0.95,
      y: cy - Math.sin(rad) * dist * 0.9,
      scale: 1.55 + (i % 2) * 0.25 + rng() * 0.1,
      rotation: 90 - deg + (rng() - 0.5) * 12,
    });
  });

  // 2. Wrapping cone - its mouth sits under the bloom dome
  layers.push({ asset: wrap.asset, x: 0.5, y: 0.63, scale: 5.4, tint: wrap.tint });

  // 3. Outer ring of medium blooms on an even arc across the dome
  const outerCount = luxury ? 8 : 6;
  for (let i = 0; i < outerCount; i++) {
    const deg = 168 - (156 / (outerCount - 1)) * i;
    const rad = (deg * Math.PI) / 180;
    const r = 0.155 + (i % 2) * 0.018;
    layers.push({
      asset: flowers[(i + 1) % flowers.length],
      x: cx + Math.cos(rad) * r + (rng() - 0.5) * 0.014,
      y: cy - Math.sin(rad) * r * 0.92 + (rng() - 0.5) * 0.014,
      scale: 1.35 + (i % 2) * 0.16 + rng() * 0.08,
      rotation: (90 - deg) * 0.45 + (rng() - 0.5) * 14,
      tint: tints[(i + 1) % tints.length],
    });
  }

  // 4. Baby's breath tucked into the gaps between rings
  ([[132, 0.105], [90, 0.125], [48, 0.105]] as const).forEach(([deg, r]) => {
    const rad = (deg * Math.PI) / 180;
    layers.push({
      asset: "flower-gypsophila",
      x: cx + Math.cos(rad) * r,
      y: cy - Math.sin(rad) * r,
      scale: 0.95 + rng() * 0.25,
      rotation: (rng() - 0.5) * 30,
    });
  });

  // 5. Hero trio - two supporting blooms, then the focal bloom on top
  layers.push({
    asset: flowers[1 % flowers.length],
    x: cx - 0.088, y: cy + 0.035, scale: 1.82, rotation: -12,
    tint: tints[1 % tints.length],
  });
  layers.push({
    asset: flowers[2 % flowers.length],
    x: cx + 0.088, y: cy + 0.035, scale: 1.82, rotation: 12,
    tint: tints[2 % tints.length],
  });
  layers.push({
    asset: flowers[0],
    x: cx, y: cy - 0.012, scale: 2.15, rotation: (rng() - 0.5) * 10,
    tint: tints[0],
  });

  // 6. Extras floating symmetrically beside the arrangement
  mood.extras.slice(0, luxury ? 3 : 2).forEach((asset, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    layers.push({
      asset,
      x: cx + side * (0.3 + rng() * 0.03),
      y: 0.11 + i * 0.05 + rng() * 0.03,
      scale: 0.75 + rng() * 0.2,
      rotation: side * 12,
    });
  });
  if (luxury) {
    layers.push({ asset: "sparkle", x: 0.24, y: 0.08, scale: 0.5, tint: "#D4AF37" });
    layers.push({ asset: "sparkle", x: 0.78, y: 0.36, scale: 0.4, tint: "#D4AF37" });
  }

  // 7. Ribbon at the wrap waist - style chosen from the prompt/mood
  layers.push({
    asset: ribbon.asset, x: 0.5, y: 0.645,
    scale: ribbon.asset === "ribbon-string" ? 1.45 : 1.6,
    tint: ribbon.tint,
  });

  // 8. A gift tag hanging beside the bouquet, written like a tiny letter:
  // "Dear <name>," top-left, two sweet lines in the middle, "Sincerely,"
  // bottom-right. The thread passes through the tag's small punched hole
  // (painted over the card so it visibly threads it) and coils around the
  // wrapper's bottom edge. All texts share the tag's rotation so the
  // writing stays aligned inside the card at any tilt.
  const texts: SpecText[] = [];
  const tagRotation = -10;
  const dearLine = `Dear ${recipient && recipient.length <= 8 ? recipient : "Beloved"},`;
  const sweetLine = mood.greeting.split(/(?<=[.!?])\s/)[0];
  layers.push({ asset: "note-card", x: 0.76, y: 0.86, scale: 3.2, rotation: tagRotation });
  layers.push({ asset: "tag-thread", x: 0.63, y: 0.822, scale: 3 });
  texts.push(
    { text: dearLine, x: 0.72, y: 0.842, size: 22, color: "#4A3F33", font: "hand", rotation: tagRotation },
    { text: wrapText(sweetLine, 17, 2), x: 0.759, y: 0.868, size: 21, color: "#6B5B49", font: "hand", rotation: tagRotation },
    { text: "Sincerely,", x: 0.805, y: 0.902, size: 21, color: "#4A3F33", font: "hand", rotation: tagRotation }
  );

  return {
    title: mood.title,
    background: mood.background,
    palette: [...tints.slice(0, 3), wrap.tint, ribbon.tint],
    greeting: mood.greeting,
    layers,
    texts,
  };
}

// ── Greeting card composition (Front / Inside / Back) ────────

function composeCard(ctx: Palette): SceneSpec {
  const { mood, flowers, tints, luxury, moodKey, recipient, rng } = ctx;
  const f = (i: number) => flowers[i % flowers.length];
  const t = (i: number) => tints[i % tints.length];

  // Frame style follows the mood, drawn from a small pool so different
  // wishes get different fronts: center frames (wreath, arch, scallop)
  // hold a tidy posy; border frames wrap the whole card around a garland.
  const FRAME_POOLS: Record<string, { asset: string; tint: string }[]> = {
    wedding: [
      { asset: "frame-wreath", tint: t(1) },
      { asset: "frame-border-floral", tint: t(1) },
    ],
    romance: [
      { asset: "frame-wreath", tint: t(1) },
      { asset: "frame-border-floral", tint: t(0) },
    ],
    birthday: [
      { asset: "frame-border-floral", tint: t(2) },
      { asset: "frame-scallop", tint: t(2) },
    ],
    friendship: [
      { asset: "frame-scallop", tint: t(2) },
      { asset: "frame-border-floral", tint: t(2) },
    ],
    sympathy: [
      { asset: "frame-arch", tint: "#C9BCE4" },
      { asset: "frame-corners", tint: "#C9BCE4" },
    ],
    default: [
      { asset: "frame-border-classic", tint: "#D4AF37" },
      { asset: "frame-arch", tint: "#D4AF37" },
    ],
  };
  const pool = FRAME_POOLS[moodKey ?? "default"] ?? FRAME_POOLS.default;
  const frame = pool[Math.floor(rng() * pool.length) % pool.length];
  const fullBleed = frame.asset.startsWith("frame-border") || frame.asset === "frame-corners";

  const { p1, p2 } = composeMessage(mood, rng, recipient);
  const message = `${p1}\n\n${p2}`;

  // A tidy mirrored posy: focal bloom on top, everything symmetric and fixed
  const posy = (cx: number, cy: number, s: number): SpecLayer[] => [
    { asset: "leaf-classic", x: cx - 0.06 * s, y: cy + 0.048 * s, scale: 1.15 * s, rotation: -38 },
    { asset: "leaf-classic", x: cx + 0.06 * s, y: cy + 0.048 * s, scale: 1.15 * s, rotation: 38, flipX: true },
    { asset: "flower-gypsophila", x: cx - 0.055 * s, y: cy - 0.052 * s, scale: 0.7 * s, rotation: -10 },
    { asset: "flower-gypsophila", x: cx + 0.055 * s, y: cy - 0.052 * s, scale: 0.7 * s, rotation: 10 },
    { asset: f(1), x: cx - 0.072 * s, y: cy + 0.026 * s, scale: 1.15 * s, rotation: -12, tint: t(1) },
    { asset: f(2), x: cx + 0.072 * s, y: cy + 0.026 * s, scale: 1.15 * s, rotation: 12, tint: t(2) },
    { asset: f(0), x: cx, y: cy - 0.006, scale: 1.55 * s, tint: t(0) },
  ];

  // A symmetric swag garland: five blooms on a gentle arc, leaves between
  const garland = (cy: number): SpecLayer[] => {
    const xs = [0.26, 0.38, 0.5, 0.62, 0.74];
    const dy = [0, 0.02, 0.032, 0.02, 0];
    const sc = [0.9, 1.05, 1.3, 1.05, 0.9];
    const rot = [-22, -10, 0, 10, 22];
    const leaves: SpecLayer[] = [0.32, 0.44, 0.56, 0.68].map((x, i) => ({
      asset: "leaf-classic",
      x, y: cy + 0.052,
      scale: 0.95,
      rotation: i < 2 ? -150 + i * 20 : 130 + (i - 2) * 20,
      flipX: i >= 2,
    }));
    const blooms: SpecLayer[] = xs.map((x, i) => ({
      asset: f(i === 2 ? 0 : (i % 2) + 1),
      x, y: cy + dy[i],
      scale: sc[i],
      rotation: rot[i],
      tint: t(i === 2 ? 0 : (i % 2) + 1),
    }));
    return [...leaves, ...blooms];
  };

  const front: SpecPage = fullBleed
    ? {
        // Border layout: framed edge, garland up top, title in the middle
        name: "Front",
        background: mood.background,
        layers: [
          { asset: frame.asset, x: 0.5, y: 0.5, scale: 10, tint: frame.tint },
          ...garland(0.26),
          // quiet mirrored accent at the bottom
          { asset: "leaf-classic", x: 0.462, y: 0.815, scale: 0.9, rotation: -32, opacity: 0.9 },
          { asset: "leaf-classic", x: 0.538, y: 0.815, scale: 0.9, rotation: 32, flipX: true, opacity: 0.9 },
          { asset: f(2), x: 0.5, y: 0.8, scale: 0.95, tint: t(2) },
          ...(luxury || moodKey === "wedding"
            ? [
                { asset: "sparkle", x: 0.3, y: 0.55, scale: 0.4, tint: "#D4AF37" } as SpecLayer,
                { asset: "sparkle", x: 0.7, y: 0.55, scale: 0.4, tint: "#D4AF37" } as SpecLayer,
              ]
            : []),
        ],
        texts: [
          { text: wrapText(mood.frontTitle, 16, 2), x: 0.5, y: 0.55, size: 58, color: "#533694", font: "display" },
          { text: mood.greeting, x: 0.5, y: 0.635, size: 21, color: "#52525B", font: "body" },
        ],
      }
    : {
        // Center-frame layout: posy inside the frame, title well below it
        name: "Front",
        background: mood.background,
        layers: [
          { asset: frame.asset, x: 0.5, y: 0.36, scale: 5.6, tint: frame.tint },
          ...posy(0.5, 0.375, frame.asset === "frame-wreath" ? 0.9 : 1),
          { asset: "flower-blossom", x: 0.07, y: 0.06, scale: 0.65, rotation: -18, opacity: 0.7 },
          { asset: "flower-blossom", x: 0.93, y: 0.06, scale: 0.55, rotation: 22, opacity: 0.6 },
          { asset: "sparkle-stars", x: 0.09, y: 0.93, scale: 0.5, opacity: 0.6 },
          { asset: "sparkle-stars", x: 0.91, y: 0.93, scale: 0.5, opacity: 0.6 },
          ...(luxury || moodKey === "wedding"
            ? [{ asset: "sparkle", x: 0.5, y: 0.105, scale: 0.45, tint: "#D4AF37" } as SpecLayer]
            : []),
        ],
        texts: [
          { text: wrapText(mood.frontTitle, 16, 2), x: 0.5, y: 0.73, size: 56, color: "#533694", font: "display" },
          { text: mood.greeting, x: 0.5, y: 0.81, size: 21, color: "#52525B", font: "body" },
        ],
      };

  // Inside: written like a letter - salutation top-left, left-aligned
  // paragraphs, signature and sender bottom-right.
  const bodyLines = [...wrapLines(p1, 40), " ", ...wrapLines(p2, 40)].slice(0, 15);
  const inside: SpecPage = {
    name: "Inside",
    background: "#FFFDFB",
    layers: [
      { asset: mood.extras.includes("heart-solid") ? "heart-solid" : f(1), x: 0.5, y: 0.08, scale: 0.65, tint: t(0), opacity: 0.9 },
      { asset: "leaf-eucalyptus", x: 0.07, y: 0.92, scale: 1.1, rotation: 42, opacity: 0.7 },
      { asset: "flower-blossom", x: 0.93, y: 0.075, scale: 0.75, rotation: 20, opacity: 0.7 },
    ],
    texts: [
      {
        text: `Dear ${recipient ?? "Beloved"},`,
        x: 0.13, y: 0.17, size: 32, color: "#18181B", font: "hand", align: "left",
      },
      { text: bodyLines.join("\n"), x: 0.13, y: 0.46, size: 25, color: "#3F3F46", font: "body", align: "left" },
      { text: mood.signature, x: 0.87, y: 0.73, size: 30, color: "#533694", font: "hand", align: "right" },
      { text: "Your name", x: 0.87, y: 0.785, size: 23, color: "#A99CC4", font: "hand", align: "right" },
    ],
  };

  // Back: a quiet motif and the maker's mark
  const back: SpecPage = {
    name: "Back",
    background: mood.background,
    layers: [
      { asset: "leaf-classic", x: 0.465, y: 0.46, scale: 1, rotation: -30, opacity: 0.85 },
      { asset: "leaf-classic", x: 0.535, y: 0.46, scale: 1, rotation: 30, opacity: 0.85, flipX: true },
      { asset: f(0), x: 0.5, y: 0.42, scale: 1.2, tint: t(0), opacity: 0.95 },
    ],
    texts: [{ text: "Made with love · Tohfa", x: 0.5, y: 0.9, size: 18, color: "#52525B", font: "body" }],
  };

  return {
    title: mood.title,
    background: mood.background,
    palette: [...tints.slice(0, 3), "#533694"],
    greeting: mood.greeting,
    message,
    layers: front.layers,
    texts: front.texts,
    pages: [front, inside, back],
  };
}

export function composeFromPrompt(prompt: string, giftType: GiftType = "bouquet"): SceneSpec {
  const ctx = readPrompt(prompt);
  return giftType === "card" ? composeCard(ctx) : composeBouquet(ctx);
}

/** Offline chat refinement: parse an instruction into refine ops. */
export function refineFromMessage(message: string): { reply: string; ops: RefineOp[] } {
  const m = message.toLowerCase();
  const ops: RefineOp[] = [];
  const said: string[] = [];

  // A whole new description → recompose the design around it instead of patching
  const wantsRedesign =
    /\b(make|design|redesign|create|compose|redo|rebuild|regenerate|arrange)\b.*\b(bouquet|card|arrangement|something|it)\b/.test(m) ||
    /\bredesign\b/.test(m) ||
    /\bfor (my|our|her|his)\b/.test(m);
  const isTweak = /\b(add|remove|delete|recolor|retint|wrap|background|greeting|say)\b/.test(m);
  if (wantsRedesign && !isTweak) {
    return {
      reply: "I've redesigned the whole arrangement around that - take a look, then tell me what to fine-tune.",
      ops: [{ op: "recompose", prompt: message }],
    };
  }

  // remove <flower/category>
  const removeMatch = m.match(/(?:remove|delete|take (?:out|away)|no more)\s+(?:the\s+)?(\w+)/);
  if (removeMatch) {
    const word = removeMatch[1].replace(/s$/, "");
    const target = FLOWER_WORDS[word] ?? FLOWER_WORDS[word + "y"] ?? word;
    ops.push({ op: "remove", match: target });
    said.push(`removed the ${word}s`);
  }

  // add <flower>
  for (const [word, asset] of Object.entries(FLOWER_WORDS)) {
    if (new RegExp(`(?:add|more|include|put)\\b[^.]*\\b${word}`).test(m)) {
      ops.push({ op: "add", asset, count: 3 });
      said.push(`added ${word}`);
      break;
    }
  }
  if (/add\s+(?:a\s+)?butterfl/.test(m)) {
    ops.push({ op: "add", asset: "butterfly", count: 2 });
    said.push("added butterflies");
  }
  if (/add\s+(?:a\s+)?(balloon|heart|sparkle|teddy|chocolate)/.test(m)) {
    const word = m.match(/add\s+(?:a\s+)?(balloon|heart|sparkle|teddy|chocolate)/)![1];
    const map: Record<string, string> = {
      balloon: "balloon", heart: "heart-solid", sparkle: "sparkle", teddy: "teddy", chocolate: "chocolate",
    };
    ops.push({ op: "add", asset: map[word], count: word === "sparkle" ? 3 : 1 });
    said.push(`added a ${word}`);
  }

  // wrapping color
  const wrapMatch = m.match(/(black|white|gold|pink|purple|dark|kraft|lace|mesh|velvet)\s+wrap/);
  if (wrapMatch) {
    const WRAP_TINTS: Record<string, string> = {
      black: "#241C33", dark: "#241C33", kraft: "#D9B382",
      lace: "#FBF3F6", mesh: "#F3E4EF", velvet: "#5A2A4E",
    };
    const tint = WRAP_TINTS[wrapMatch[1]] ?? COLOR_WORDS[wrapMatch[1]]?.[0] ?? "#F7E2E2";
    ops.push({ op: "retint", match: "wrapping", tint });
    said.push(`recolored the wrapping`);
  }

  // overall color direction
  const colorKey = Object.keys(COLOR_WORDS).find((k) => m.includes(k) && !m.includes(`${k} wrap`));
  if (colorKey && /color|pastel|palette|make|turn|more/.test(m)) {
    const tints = COLOR_WORDS[colorKey];
    ops.push({ op: "retint", match: "flower", tint: tints[0] });
    said.push(`shifted the flowers toward ${colorKey}`);
  }

  // luxury
  if (/luxur|premium|fancier|elegant/.test(m)) {
    ops.push({ op: "retint", match: "ribbon", tint: "#D4AF37" });
    ops.push({ op: "retint", match: "wrapping", tint: "#3A2C52" });
    ops.push({ op: "add", asset: "sparkle", count: 3, tint: "#D4AF37" });
    said.push("dressed it up with silk, gold, and sparkle");
  }

  // greeting
  const greetMatch = message.match(/greeting[^"']*["'“](.+?)["'”]/i) ?? message.match(/say\s+["'“](.+?)["'”]/i);
  if (greetMatch) {
    ops.push({ op: "greeting", text: greetMatch[1] });
    said.push("updated the greeting");
  }

  if (ops.length === 0) {
    // Nothing matched a tweak - if it reads like a description, rebuild from it
    if (m.split(/\s+/).length >= 4) {
      return {
        reply: "I've redesigned the arrangement around that - take a look, then tell me what to fine-tune.",
        ops: [{ op: "recompose", prompt: message }],
      };
    }
    return {
      reply:
        "Describe a whole new design (“a sunflower birthday bouquet”), or ask for tweaks - add or remove flowers, recolor things (“black wrapping”, “pastel colors”), make it more luxurious, or set a greeting (say “…”).",
      ops: [],
    };
  }
  const reply = `Done - ${said.join(", ")}. What else shall we change?`;
  return { reply, ops };
}
